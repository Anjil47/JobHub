import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/useAuth';
import { db } from '../../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const userChatsRef = ref(db, `userChats/${currentUser.uid}`);

    const unsubscribe = onValue(userChatsRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChats([]);
        setLoading(false);
        return;
      }

      try {
        const chatsWithProfiles = await Promise.all(
          Object.entries(data).map(async ([chatId, chat]) => {
            const otherUserId = chat.participants.find(id => id !== currentUser.uid);
            const userDocRef = doc(db, 'userProfiles', otherUserId);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();

            return {
              id: chatId,
              ...chat,
              otherUser: {
                id: otherUserId,
                ...userData
              },
              lastMessage: chat.lastMessage || {}
            };
          })
        );

        setChats(chatsWithProfiles.sort((a, b) => 
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
        ));
      } catch (error) {
        console.error('Error fetching chat profiles:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    }
    return format(date, 'MM/dd/yy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors duration-150 flex items-start space-x-3"
            >
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {chat.otherUser?.fullName?.[0] || '?'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {chat.otherUser?.fullName || 'Unknown User'}
                  </p>
                  {chat.lastMessage?.timestamp && (
                    <p className="text-xs text-gray-500">
                      {formatLastMessageTime(chat.lastMessage.timestamp)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage?.text || 'No messages yet'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                {chat.otherUser?.isOnline && (
                  <div className="flex items-center mt-1">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="ml-1 text-xs text-gray-500">Online</span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

ChatList.propTypes = {
  onSelectChat: PropTypes.func.isRequired
};

export default ChatList; 