import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import ChatInterface from '../components/ChatInterface';

export default function ChatPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <ChatInterface />
      </div>
    </div>
  );
} 