import PropTypes from 'prop-types';
import { useJobs } from '../contexts/jobs/useJobs';
import { useAuth } from '../contexts/auth/useAuth';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { MapPinIcon as LocationMarkerIcon, BuildingOffice2Icon as OfficeBuildingIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

const JobList = ({ jobs }) => {
  const { savedJobs, saveJob, unsaveJob } = useJobs();
  const { currentUser } = useAuth();

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (!min) return `Up to £${max.toLocaleString()}`;
    if (!max) return `From £${min.toLocaleString()}`;
    return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
  };

  const handleSaveToggle = async (job) => {
    if (!currentUser) {
      toast.error('Please sign in to save jobs');
      return;
    }

    try {
      const isSaved = savedJobs.some(saved => saved.id === job.id);
      if (isSaved) {
        await unsaveJob(job.id);
        toast.success('Job removed from saved jobs');
      } else {
        await saveJob(job);
        toast.success('Job saved successfully');
      }
    } catch (err) {
      toast.error(`Failed to ${savedJobs.some(saved => saved.id === job.id) ? 'remove' : 'save'} job: ${err.message}`);
    }
  };

  if (!jobs?.length) {
    return (
      <div className="text-center py-16">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
        <p className="text-gray-500">Try adjusting your search criteria or try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {jobs.map((job) => (
        <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group">
                    <a 
                      href={job.redirect_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {job.title}
                      <span className="absolute inset-0" aria-hidden="true" />
                    </a>
                  </h3>
                  <p className="text-base text-gray-600 mt-1">{job.company.display_name}</p>
                </div>
                {currentUser && (
                  <button
                    onClick={() => handleSaveToggle(job)}
                    className="ml-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label={savedJobs.some(saved => saved.id === job.id) ? 'Unsave job' : 'Save job'}
                  >
                    {savedJobs.some(saved => saved.id === job.id) ? (
                      <BookmarkSolid className="h-6 w-6 text-blue-600" />
                    ) : (
                      <BookmarkOutline className="h-6 w-6 text-gray-400 hover:text-blue-600" />
                    )}
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {job.location.display_name && (
                  <div className="flex items-center">
                    <LocationMarkerIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                    {job.location.display_name}
                  </div>
                )}
                {job.contract_type && (
                  <div className="flex items-center">
                    <OfficeBuildingIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                    {job.contract_type}
                  </div>
                )}
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </div>
                {job.created && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                    {new Date(job.created).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{job.description}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.category?.label && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {job.category.label}
                  </span>
                )}
                {job.contract_time && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {job.contract_time}
                  </span>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <a
                  href={job.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply Now
                  <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

JobList.propTypes = {
  jobs: PropTypes.arrayOf(PropTypes.object),
};

export default JobList; 