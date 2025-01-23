import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/auth/useAuth';
import { db } from '../../config/firebaseConfig';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { EmojiHappyIcon, PaperAirplaneIcon, PhotographIcon } from '@heroicons/react/solid';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import PropTypes from 'prop-types';

const ChatWindow = ({ chatId, recipientId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientProfile, setRecipientProfile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchRecipientProfile = async () => {
      try {
        const docRef = doc(db, 'userProfiles', recipientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRecipientProfile(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching recipient profile:', error);
      }
    };

    fetchRecipientProfile();
  }, [recipientId]);

  useEffect(() => {
    const chatRef = ref(db, `chats/${chatId}/messages`);
    const typingRef = ref(db, `chats/${chatId}/typing/${recipientId}`);

    // Listen for new messages
    const unsubscribeMessages = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setMessages(messageList);
        scrollToBottom();
      }
    });

    // Listen for typing status
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val()?.isTyping || false);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    const typingRef = ref(db, `chats/${chatId}/typing/${currentUser.uid}`);
    set(typingRef, { isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      set(typingRef, { isTyping: false });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageRef = ref(db, `chats/${chatId}/messages`);
    const newMessageRef = push(messageRef);

    await set(newMessageRef, {
      text: newMessage,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      read: false
    });

    setNewMessage('');
    setShowEmoji(false);
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji.native);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {recipientProfile?.fullName?.[0] || '?'}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">
            {recipientProfile?.fullName || 'Loading...'}
          </p>
          {isTyping && (
            <p className="text-xs text-gray-500">typing...</p>
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
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <EmojiHappyIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <PhotographIcon className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 ml-2 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="ml-2 p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
          </button>
        </div>
        
        {/* Emoji Picker */}
        {showEmoji && (
          <div className="absolute bottom-full mb-2">
            <Picker
              data={data}
              onEmojiSelect={addEmoji}
              theme="light"
              set="apple"
            />
          </div>
        )}
      </form>
    </div>
  );
};

ChatWindow.propTypes = {
  chatId: PropTypes.string.isRequired,
  recipientId: PropTypes.string.isRequired
};

export default ChatWindow; 