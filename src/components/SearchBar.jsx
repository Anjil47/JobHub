import { useState, useEffect } from 'react';
import { useSearch } from '../contexts/search/useSearch';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
  const { searchJobs, filters, loadCategories } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchJobs(localFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="what"
              value={localFilters.what}
              onChange={handleFilterChange}
              placeholder="Job title, keywords, or company"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              name="where"
              value={localFilters.where}
              onChange={handleFilterChange}
              placeholder="City or postcode"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Search
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="number"
                    name="salary_min"
                    value={localFilters.salary_min}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    name="salary_max"
                    value={localFilters.salary_max}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="full_time"
                      checked={localFilters.full_time}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Full Time</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="permanent"
                      checked={localFilters.permanent}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Permanent</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  name="sort_by"
                  value={localFilters.sort_by}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Exclude Keywords</label>
              <input
                type="text"
                name="what_exclude"
                value={localFilters.what_exclude}
                onChange={handleFilterChange}
                placeholder="Keywords to exclude"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 