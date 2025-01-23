import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { toast } from 'react-hot-toast';
import { UserCircleIcon, PencilIcon, BuildingOffice2Icon as OfficeBuildingIcon, AcademicCapIcon, MapPinIcon as LocationMarkerIcon, PhoneIcon, EnvelopeIcon as MailIcon } from '@heroicons/react/24/solid';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    title: '',
    location: '',
    phone: '',
    bio: '',
    skills: '',
    experience: [],
    education: [],
    linkedin: '',
    connections: 0,
    profileViews: 0,
    searchAppearances: 0,
    languages: '',
    certifications: '',
    projects: '',
    volunteering: '',
    recommendations: []
  });

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'userProfiles', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(prev => ({
            ...prev,
            ...docSnap.data(),
            connections: docSnap.data().connections || 0,
            profileViews: docSnap.data().profileViews || 0,
            searchAppearances: docSnap.data().searchAppearances || 0
          }));
        }
      } catch (err) {
        toast.error('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, 'userProfiles', currentUser.uid);
      await setDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
        email: currentUser.email
      }, { merge: true });

      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-l-2 border-r-2 border-blue-300 rounded-full animate-spin absolute top-0 left-0" 
            style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <div className="px-6 py-4 relative">
            <div className="absolute -top-12 left-6">
              <div className="bg-white p-1 rounded-full">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-1">
                  <UserCircleIcon className="h-24 w-24 text-white" />
                </div>
              </div>
            </div>
            <div className="ml-32">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Add your name'}</h1>
                  <p className="text-lg text-gray-600">{profile.title || 'Add your professional title'}</p>
                  <div className="flex items-center mt-2 text-gray-500">
                    <LocationMarkerIcon className="h-5 w-5 mr-2" />
                    <span>{profile.location || 'Add location'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {editMode ? 'View Profile' : 'Edit Profile'}
                </button>
              </div>
              
              {/* Contact Info */}
              <div className="mt-4 flex items-center space-x-4 text-gray-500">
                <div className="flex items-center">
                  <MailIcon className="h-5 w-5 mr-2" />
                  <span>{currentUser.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Stats */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">{profile.connections}</div>
                <div className="text-sm text-gray-500">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">{profile.profileViews}</div>
                <div className="text-sm text-gray-500">Profile views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">{profile.searchAppearances}</div>
                <div className="text-sm text-gray-500">Search appearances</div>
              </div>
            </div>
          </div>
        </div>

        {editMode ? (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={profile.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    About
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                    Languages
                  </label>
                  <input
                    type="text"
                    id="languages"
                    name="languages"
                    value={profile.languages}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., English (Native), Spanish (Professional)"
                  />
                </div>

                <div>
                  <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                    Certifications
                  </label>
                  <textarea
                    id="certifications"
                    name="certifications"
                    rows={3}
                    value={profile.certifications}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="List your certifications..."
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Work Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={4}
                    value={profile.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe your work experience..."
                  />
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                    Education
                  </label>
                  <textarea
                    id="education"
                    name="education"
                    rows={4}
                    value={profile.education}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="List your educational background..."
                  />
                </div>

                <div>
                  <label htmlFor="projects" className="block text-sm font-medium text-gray-700">
                    Projects
                  </label>
                  <textarea
                    id="projects"
                    name="projects"
                    rows={4}
                    value={profile.projects}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe your notable projects..."
                  />
                </div>

                <div>
                  <label htmlFor="volunteering" className="block text-sm font-medium text-gray-700">
                    Volunteering
                  </label>
                  <textarea
                    id="volunteering"
                    name="volunteering"
                    rows={4}
                    value={profile.volunteering}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Share your volunteering experience..."
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio || 'Add a bio to tell others about yourself'}</p>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <OfficeBuildingIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
              </div>
              <div className="prose max-w-none text-gray-700">
                {profile.experience ? (
                  <pre className="whitespace-pre-wrap font-sans">{profile.experience}</pre>
                ) : (
                  <p className="text-gray-500">Add your work experience</p>
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              </div>
              <div className="prose max-w-none text-gray-700">
                {profile.education ? (
                  <pre className="whitespace-pre-wrap font-sans">{profile.education}</pre>
                ) : (
                  <p className="text-gray-500">Add your education</p>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
              {profile.skills ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Add your skills</p>
              )}
            </div>

            {/* Languages Section */}
            {profile.languages && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Languages</h2>
                <p className="text-gray-700">{profile.languages}</p>
              </div>
            )}

            {/* Certifications Section */}
            {profile.certifications && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                <pre className="whitespace-pre-wrap font-sans text-gray-700">{profile.certifications}</pre>
              </div>
            )}

            {/* Projects Section */}
            {profile.projects && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects</h2>
                <pre className="whitespace-pre-wrap font-sans text-gray-700">{profile.projects}</pre>
              </div>
            )}

            {/* Volunteering Section */}
            {profile.volunteering && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Volunteering</h2>
                <pre className="whitespace-pre-wrap font-sans text-gray-700">{profile.volunteering}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 