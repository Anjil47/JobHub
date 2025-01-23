import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth/useAuth';
import { acceptChatRequest, rejectChatRequest } from '../utils/chatUtils';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebaseConfig';
import { CheckIcon, XMarkIcon as XIcon } from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

export default function ChatRequests({ onAccept }) {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for chat requests in real-time
    const requestsRef = ref(realtimeDb, `chatRequests/${currentUser.uid}`);
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsList = Object.entries(data).map(([fromUserId, request]) => ({
          fromUserId,
          ...request
        }));
        setRequests(requestsList);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAccept = async (request) => {
    try {
      if (!request.from || !request.from.uid) {
        throw new Error('Invalid request data');
      }

      const chatId = await acceptChatRequest(currentUser, request.from);
      if (!chatId) {
        throw new Error('Failed to create chat');
      }

      toast.success(`Chat request accepted from ${request.from.displayName || 'Anonymous'}`);
      onAccept(chatId, request.from);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(`Failed to accept chat request: ${error.message}`);
    }
  };

  const handleReject = async (fromUserId) => {
    try {
      await rejectChatRequest(currentUser.uid, fromUserId);
      toast.success('Chat request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject chat request');
    }
  };

  if (loading) {
    return (
      <div className="border-b bg-blue-50 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-blue-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-blue-50">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-blue-800 flex items-center">
          <span className="relative">
            Chat Requests
            <span className="absolute -right-6 -top-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {requests.length}
            </span>
          </span>
        </h3>
      </div>
      <div className="space-y-2 pb-2">
        {requests.map((request) => (
          <div
            key={request.fromUserId}
            className="mx-2 p-3 bg-white rounded-lg shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {request.from.photoURL ? (
                <img
                  src={request.from.photoURL}
                  alt={request.from.displayName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-lg font-medium">
                    {(request.from.displayName || 'A')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">
                  {request.from.displayName || 'Anonymous'}
                </div>
                <div className="text-sm text-gray-500">
                  wants to chat with you
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(request.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAccept(request)}
                className="p-2 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                title="Accept"
              >
                <CheckIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleReject(request.fromUserId)}
                className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                title="Reject"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ChatRequests.propTypes = {
  onAccept: PropTypes.func.isRequired
}; 