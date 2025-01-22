import { useState } from 'react';
import FilterBar from '../components/FilterBar';
import JobCard from '../components/JobCard';
import { searchJobs } from '../config/adzunaConfig';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchJobs = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchJobs(
        filters.query,
        filters.location,
        page
      );
      setJobs(response.results || []);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    setPage(1);
    fetchJobs(filters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Dream Job
        </h1>
        <p className="text-xl text-gray-600">
          Search through thousands of job listings to find your perfect match
        </p>
      </div>

      <FilterBar onFilter={handleFilter} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-600 p-4">
          No jobs found. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 