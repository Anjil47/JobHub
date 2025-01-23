import { useState } from 'react';
import { useSearch } from '../contexts/search/useSearch';
import { MagnifyingGlassIcon as SearchIcon, AdjustmentsHorizontalIcon as AdjustmentsIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

export default function SearchBar() {
  const { searchJobs } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    what: '',
    where: '',
    salary_min: '',
    salary_max: '',
    full_time: false,
    permanent: false,
    sort_by: 'relevance'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate search parameters
    if (!searchParams.what && !searchParams.where) {
      toast.error('Please enter a job title, keyword, or location');
      return;
    }

    // Clean up parameters before sending
    const cleanParams = Object.entries(searchParams).reduce((acc, [key, value]) => {
      if (value !== '' && value !== false) {
        acc[key] = value;
      }
      return acc;
    }, {});

    try {
      await searchJobs(cleanParams);
    } catch (err) {
      toast.error(`Failed to search jobs: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="what"
              value={searchParams.what}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 text-base border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Job title, keywords, or company"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="where"
              value={searchParams.where}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 text-base border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="City or postcode"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <AdjustmentsIcon className="h-5 w-5" />
          </button>

          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search Jobs
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="absolute mt-4 w-full bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  name="salary_min"
                  value={searchParams.salary_min}
                  onChange={handleChange}
                  placeholder="Min"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="salary_max"
                  value={searchParams.salary_max}
                  onChange={handleChange}
                  placeholder="Max"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="full_time"
                  checked={searchParams.full_time}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Full Time</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="permanent"
                  checked={searchParams.permanent}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Permanent</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              name="sort_by"
              value={searchParams.sort_by}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        </div>
      )}
    </form>
  );
} 