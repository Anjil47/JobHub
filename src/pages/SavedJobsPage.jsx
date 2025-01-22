import { useJobs } from '../contexts/jobs/useJobs';
import JobCard from '../components/JobCard';

const SavedJobsPage = () => {
  const { savedJobs } = useJobs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
      
      {savedJobs.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>You haven&apos;t saved any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage; 