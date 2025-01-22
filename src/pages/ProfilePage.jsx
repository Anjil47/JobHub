import { useAuth } from '../contexts/auth/useAuth';

const ProfilePage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 text-sm">Email</label>
            <p className="text-gray-900 font-medium">{currentUser?.email}</p>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
            <p className="text-gray-600">
              Joined: {currentUser?.metadata.creationTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 