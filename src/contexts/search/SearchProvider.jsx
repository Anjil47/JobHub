import { useState } from 'react';
import PropTypes from 'prop-types';
import { SearchContext } from './SearchContext';
import { fetchJobs, fetchJobCategories, fetchSalaryStats } from '../../services/adzunaService';

export default function SearchProvider({ children }) {
  const [searchResults, setSearchResults] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    what: '',
    what_exclude: '',
    where: '',
    distance: 0,
    salary_min: 0,
    salary_max: 0,
    full_time: false,
    permanent: false,
    sort_by: 'relevance'
  });

  const searchJobs = async (newFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      const { results, count, totalPages: pages } = await fetchJobs(
        updatedFilters,
        currentPage
      );

      setSearchResults(results);
      setTotalJobs(count);
      setTotalPages(pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
      setSearchResults([]);
      setTotalJobs(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryData = await fetchJobCategories();
      setCategories(categoryData);
    } catch (err) {
      console.error('Failed to load job categories:', err);
    }
  };

  const getSalaryStats = async (jobTitle) => {
    try {
      return await fetchSalaryStats(jobTitle);
    } catch (err) {
      console.error('Failed to fetch salary statistics:', err);
      return null;
    }
  };

  const changePage = async (page) => {
    setCurrentPage(page);
    await searchJobs({ page });
  };

  const value = {
    searchResults,
    totalJobs,
    totalPages,
    currentPage,
    loading,
    error,
    categories,
    filters,
    searchJobs,
    loadCategories,
    getSalaryStats,
    changePage,
    setFilters
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 