import { useState } from 'react';
import { ChatBubbleLeftIcon as ChatIcon, XMarkIcon as XIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow';

export default function MessageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-96 h-[500px] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-gray-700">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <ChatWindow />
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center space-x-2 transition-colors"
        >
          <ChatIcon className="h-6 w-6" />
          <span className="pr-2">Messages</span>
        </button>
      )}
    </div>
  );
} 