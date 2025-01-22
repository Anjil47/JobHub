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

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <JobProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navigation />
              <main className="flex-grow">
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
                </Routes>
              </main>
            </div>
            <Toaster position="top-right" />
          </JobProvider>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;