import PropTypes from 'prop-types';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import { useState, useEffect } from 'react';
import { fetchJobs } from '../services/adzunaService';

const JobList = ({ jobs, onSaveJob, savedJobs }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await fetchJobs();
        setJobs(jobsData);
      } catch (err) {
        setError('Failed to load jobs');
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some(savedJob => savedJob.id === jobId);
  };

  if (loading) {
    return <div className="text-center py-4">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  if (!jobs.length) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search filters or try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          onClick={() => handleJobClick(job)}
          className="cursor-pointer"
        >
          <JobCard
            job={job}
            isSaved={isJobSaved(job.id)}
            onSave={(e) => {
              e.stopPropagation();
              onSaveJob(job);
            }}
          />
        </div>
      ))}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={handleCloseModal}
          onSave={onSaveJob}
          isSaved={isJobSaved(selectedJob.id)}
        />
      )}
    </div>
  );
};

JobList.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
  onSaveJob: PropTypes.func.isRequired,
  savedJobs: PropTypes.array.isRequired,
};

export default JobList; 