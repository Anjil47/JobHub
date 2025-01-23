import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth/useAuth';
import { searchUsers, sendChatRequest } from '../utils/chatUtils';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebaseConfig';
import { MagnifyingGlassIcon as SearchIcon, XMarkIcon as XIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import ChatRequests from './ChatRequests';
import PropTypes from 'prop-types';

export default function ChatList({ onChatSelect, isSearchOpen, setIsSearchOpen }) {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestSent, setRequestSent] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const userChatsRef = ref(realtimeDb, `userChats/${currentUser.uid}`);
    const unsubscribe = onValue(userChatsRef, (snapshot) => {
      const chats = snapshot.val() || {};
      const chatList = Object.entries(chats).map(([chatId, chat]) => ({
        id: chatId,
        ...chat,
        otherUser: Object.values(chat.users || {})[0]
      }));

      chatList.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp || 0;
        const timeB = b.lastMessage?.timestamp || 0;
        return timeB - timeA;
      });

      setRecentChats(chatList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim() || !currentUser) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm, currentUser.uid);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSendRequest = async (otherUser) => {
    try {
      await sendChatRequest(currentUser, otherUser);
      setRequestSent(prev => ({ ...prev, [otherUser.uid]: true }));
      setTimeout(() => {
        setRequestSent(prev => ({ ...prev, [otherUser.uid]: false }));
      }, 3000);
    } catch (error) {
      console.error('Error sending chat request:', error);
    }
  };

  const handleAcceptRequest = (chatId, otherUser) => {
    onChatSelect(chatId, otherUser);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const formatLastMessage = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    return chat.lastMessage.text.length > 30
      ? chat.lastMessage.text.substring(0, 27) + '...'
      : chat.lastMessage.text;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please log in to view chats
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Section */}
      {isSearchOpen ? (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Search Users</h3>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <div className="mt-4">
            {isSearching ? (
              <div className="text-center py-4">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.uid}
                    className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-lg font-medium">
                          {(user.displayName || 'A')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.displayName || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user)}
                      disabled={requestSent[user.uid]}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        requestSent[user.uid]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {requestSent[user.uid] ? 'Request Sent' : 'Send Request'}
                    </button>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-4 text-gray-500">
                No users found. Try a different username.
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsSearchOpen(true)}
          className="mx-4 mt-2 mb-4 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SearchIcon className="w-5 h-5" />
          <span>Search Users</span>
        </button>
      )}

      {/* Chat Requests */}
      <ChatRequests onAccept={handleAcceptRequest} />

      {/* Recent Chats */}
      {!isSearchOpen && (
        <div className="flex-1 overflow-y-auto">
          {recentChats.length > 0 ? (
            <div className="space-y-1">
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id, chat.otherUser)}
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                >
                  {chat.otherUser.photoURL ? (
                    <img
                      src={chat.otherUser.photoURL}
                      alt={chat.otherUser.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-lg font-medium">
                        {(chat.otherUser.displayName || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <div className="font-medium text-gray-900 truncate">
                        {chat.otherUser.displayName || 'Anonymous'}
                      </div>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTimestamp(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {formatLastMessage(chat)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mb-2" />
              <p className="mb-4">No conversations yet</p>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ChatList.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
  isSearchOpen: PropTypes.bool.isRequired,
  setIsSearchOpen: PropTypes.func.isRequired
}; 