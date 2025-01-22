import { useEffect } from 'react';
import { useSearch } from '../contexts/search/useSearch';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';

const HomePage = () => {
  const { searchResults, loading, error, totalJobs, searchJobs } = useSearch();

  useEffect(() => {
    // Initial search with default filters
    searchJobs();
  }, [searchJobs]);

  return (
    <div className="container mx-auto px-4">
      <SearchBar />
      
      {error && (
        <div className="text-center text-red-600 py-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {totalJobs > 0 && (
            <div className="text-gray-600 mb-4">
              Found {totalJobs} jobs
            </div>
          )}
          <JobList jobs={searchResults} />
        </>
      )}
    </div>
  );
};

export default HomePage; 