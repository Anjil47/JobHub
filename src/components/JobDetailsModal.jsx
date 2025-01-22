import PropTypes from 'prop-types';
import { useAuth } from '../contexts/auth/useAuth';

const JobDetailsModal = ({ job, onClose, onSave, isSaved }) => {
  const { currentUser } = useAuth();

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {job.title}
                  </h3>
                  {currentUser && (
                    <button
                      onClick={() => onSave(job)}
                      className={`${
                        isSaved
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-gray-500'
                      } transition-colors duration-200`}
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Company</h4>
                    <p className="mt-1 text-sm text-gray-900">{job.company.display_name}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="mt-1 text-sm text-gray-900">{job.location.display_name}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Job Description</h4>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>

                  {job.salary_min && job.salary_max && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Salary Range</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} per year
                      </p>
                    </div>
                  )}

                  {job.category && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="mt-1 text-sm text-gray-900">{job.category.label}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <a
              href={job.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Apply Now
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

JobDetailsModal.propTypes = {
  job: PropTypes.shape({
    title: PropTypes.string.isRequired,
    company: PropTypes.shape({
      display_name: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      display_name: PropTypes.string.isRequired,
    }).isRequired,
    description: PropTypes.string.isRequired,
    redirect_url: PropTypes.string.isRequired,
    salary_min: PropTypes.number,
    salary_max: PropTypes.number,
    category: PropTypes.shape({
      label: PropTypes.string.isRequired,
    }),
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaved: PropTypes.bool.isRequired,
};

export default JobDetailsModal; 