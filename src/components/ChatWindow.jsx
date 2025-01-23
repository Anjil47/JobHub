import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/auth/useAuth';
import { realtimeDb } from '../config/firebaseConfig';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { PaperAirplaneIcon, FaceSmileIcon as EmojiHappyIcon } from '@heroicons/react/24/solid';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function ChatWindow({ chatId, otherUser }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser || !chatId) return;

    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const typingRef = ref(realtimeDb, `chats/${chatId}/typing/${otherUser?.uid}`);

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg,
        }));
        setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
        scrollToBottom();
      } else {
        setMessages([]);
      }
    });

    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val() || false);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [currentUser, chatId, otherUser]);

  const handleTyping = () => {
    if (!chatId) return;

    const typingRef = ref(realtimeDb, `chats/${chatId}/typing/${currentUser.uid}`);
    set(typingRef, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (chatId) {
        const typingRef = ref(realtimeDb, `chats/${chatId}/typing/${currentUser.uid}`);
        set(typingRef, false);
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId) return;

    const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
    const chatRef = ref(realtimeDb, `userChats/${currentUser.uid}/${chatId}`);
    const otherUserChatRef = ref(realtimeDb, `userChats/${otherUser.uid}/${chatId}`);

    const messageData = {
      text: newMessage,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      senderName: currentUser.displayName || 'Anonymous',
      senderPhoto: currentUser.photoURL
    };

    const lastMessageData = {
      text: newMessage,
      timestamp: Date.now()
    };

    await Promise.all([
      push(messagesRef, messageData),
      set(ref(realtimeDb, `chats/${chatId}/lastMessage`), lastMessageData),
      set(ref(chatRef, 'lastMessage'), lastMessageData),
      set(ref(otherUserChatRef, 'lastMessage'), lastMessageData)
    ]);

    setNewMessage('');
    setShowEmoji(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-gray-600 mb-4">Please log in to access messages</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Log In
        </button>
      </div>
    );
  }

  if (!chatId || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
        <p>Select a chat or start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center">
        {otherUser.photoURL ? (
          <img
            src={otherUser.photoURL}
            alt={otherUser.displayName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg">
              {(otherUser.displayName || 'A')[0].toUpperCase()}
            </span>
          </div>
        )}
        <div className="ml-3">
          <h3 className="font-medium">{otherUser.displayName || 'Anonymous'}</h3>
          {isTyping && (
            <p className="text-sm text-gray-500">Typing...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.senderId === currentUser.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {message.senderName}
              </div>
              <div>{message.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t relative">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="absolute left-2 text-gray-500 hover:text-gray-700"
          >
            <EmojiHappyIcon className="h-6 w-6" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="w-full pl-10 pr-12 py-2 border rounded-full focus:outline-none focus:border-blue-500"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-6 w-6 transform rotate-90" />
          </button>
        </div>
        
        {showEmoji && (
          <div className="absolute bottom-full right-0 mb-2">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
      </form>
    </div>
  );
}

ChatWindow.propTypes = {
  chatId: PropTypes.string,
  otherUser: PropTypes.shape({
    uid: PropTypes.string,
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  })
}; 