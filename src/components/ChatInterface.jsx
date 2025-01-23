import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import ChatRequests from './ChatRequests';
import { useAuth } from '../contexts/auth/useAuth';
import { MagnifyingGlassIcon as SearchIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { listenToNotifications } from '../utils/notificationUtils';

export default function ChatInterface() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const unsubscribe = listenToNotifications(currentUser.uid, (action) => {
      if (action === 'accept') {
        setShowRequests(true);
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleChatSelect = (chatId, otherUser) => {
    setSelectedChat(chatId);
    setSelectedUser(otherUser);
    setShowRequests(false);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-center">
        <div>
          <p className="text-gray-600 mb-4">Please log in to access the chat</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">Connect and chat with other users</p>
        </div>

        {/* Chat Requests Section - Always visible */}
        <ChatRequests 
          onAccept={handleChatSelect}
          onClose={() => setShowRequests(false)}
          isVisible={true}
        />

        {/* Chat List */}
        <ChatList 
          onChatSelect={handleChatSelect}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />
      </div>

      {/* Chat Window or Empty State */}
      <div className="flex-1">
        {selectedChat && selectedUser ? (
          <ChatWindow chatId={selectedChat} otherUser={selectedUser} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Start Connecting
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Search for other users by their username or email to start a conversation.
            </p>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              Search Users
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 