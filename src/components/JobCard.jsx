import PropTypes from 'prop-types';
import { useJobs } from '../contexts/jobs/useJobs';
import { useAuth } from '../contexts/auth/useAuth';

const JobCard = ({ job }) => {
  const { saveJob, removeJob, savedJobs } = useJobs();
  const { currentUser } = useAuth();
  
  const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);

  const handleSaveToggle = async () => {
    if (!currentUser) {
      // You might want to show a login prompt here
      return;
    }

    try {
      if (isSaved) {
        await removeJob(job.id);
      } else {
        await saveJob(job);
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
          <p className="text-gray-600 mt-1">{job.company.display_name}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{job.location.display_name}</span>
          </div>
        </div>
        <button
          onClick={handleSaveToggle}
          className={`p-2 rounded-full ${
            isSaved
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-600 text-sm line-clamp-3">{job.description}</p>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          {job.category && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {job.category.label}
            </span>
          )}
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
            {job.contract_time || 'Full Time'}
          </span>
        </div>
        <a
          href={job.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.shape({
      display_name: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      display_name: PropTypes.string.isRequired,
    }).isRequired,
    description: PropTypes.string.isRequired,
    redirect_url: PropTypes.string.isRequired,
    category: PropTypes.shape({
      label: PropTypes.string.isRequired,
    }),
    contract_time: PropTypes.string,
  }).isRequired,
};

export default JobCard; 