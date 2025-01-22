const API_KEY = import.meta.env.VITE_ADZUNA_API_KEY;
const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/gb/search/1';

/**
 * @typedef {Object} SearchParams
 * @property {string} [what] - Search term
 * @property {string} [what_exclude] - Terms to exclude
 * @property {string} [where] - Location
 * @property {number} [distance] - Distance from location in km
 * @property {number} [salary_min] - Minimum salary
 * @property {number} [salary_max] - Maximum salary
 * @property {boolean} [full_time] - Full time jobs only
 * @property {boolean} [part_time] - Part time jobs only
 * @property {boolean} [permanent] - Permanent jobs only
 * @property {boolean} [contract] - Contract jobs only
 * @property {string} [sort_by] - Sort results by (date, salary, relevance)
 */

/**
 * Fetch jobs from Adzuna API with advanced filtering
 * @param {SearchParams} params - Search parameters
 * @param {number} [page=1] - Page number
 * @param {number} [resultsPerPage=20] - Results per page
 */
export async function fetchJobs(params = {}, page = 1, resultsPerPage = 20) {
  try {
    const queryParams = new URLSearchParams({
      app_id: APP_ID,
      app_key: API_KEY,
      results_per_page: resultsPerPage,
      'content-type': 'application/json',
      page,
      ...params
    });

    // Convert boolean parameters to 1 or 0
    ['full_time', 'part_time', 'permanent', 'contract'].forEach(param => {
      if (params[param] !== undefined) {
        queryParams.set(param, params[param] ? '1' : '0');
      }
    });

    const response = await fetch(`${BASE_URL}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return {
      results: data.results || [],
      count: data.count || 0,
      totalPages: Math.ceil((data.count || 0) / resultsPerPage)
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

/**
 * Get job categories from Adzuna
 */
export async function fetchJobCategories() {
  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/gb/categories?app_id=${APP_ID}&app_key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch job categories');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching job categories:', error);
    throw error;
  }
}

/**
 * Get salary statistics for a job search
 * @param {string} what - Job title or keyword
 */
export async function fetchSalaryStats(what) {
  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/gb/history?app_id=${APP_ID}&app_key=${API_KEY}&what=${what}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch salary statistics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching salary statistics:', error);
    throw error;
  }
} 