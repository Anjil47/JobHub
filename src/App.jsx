import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './contexts/auth/AuthProvider';
import JobProvider from './contexts/jobs/JobProvider';
import SearchProvider from './contexts/search/SearchProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Home from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './pages/ProfilePage';
import SavedJobs from './pages/SavedJobsPage';
import ChatPage from './pages/ChatPage';
import MessageButton from './components/MessageButton';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <JobProvider>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/saved-jobs"
                    element={
                      <ProtectedRoute>
                        <SavedJobs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
              <MessageButton />
              <Toaster position="top-right" />
            </div>
          </JobProvider>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;