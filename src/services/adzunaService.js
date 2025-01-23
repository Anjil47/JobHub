const API_KEY = import.meta.env.VITE_ADZUNA_API_KEY;
const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/gb/search/1';

// Add delay between requests to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
 */
export async function fetchJobs(params = {}, page = 1) {
  try {
    const queryParams = new URLSearchParams({
      app_id: APP_ID,
      app_key: API_KEY,
      results_per_page: 10,
      page,
      what: params.what || '',
      where: params.where || '',
      salary_min: params.salary_min || '',
      salary_max: params.salary_max || '',
      full_time: params.full_time ? '1' : '0',
      permanent: params.permanent ? '1' : '0',
      sort_by: params.sort_by || 'relevance'
    });

    // Use a CORS proxy if needed
    const proxyUrl = import.meta.env.VITE_USE_PROXY === 'true' 
      ? 'https://cors-anywhere.herokuapp.com/'
      : '';
    
    const response = await fetch(`${proxyUrl}${BASE_URL}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    await delay(1000); // Add delay between requests
    
    const data = await response.json();
    return {
      results: data.results || [],
      count: data.count || 0,
      totalPages: Math.ceil((data.count || 0) / 10)
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error(error.message || 'Failed to fetch jobs. Please try again later.');
  }
}

/**
 * Get job categories from Adzuna
 */
export async function fetchJobCategories() {
  try {
    await delay(300);
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/gb/categories?app_id=${APP_ID}&app_key=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch job categories');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching job categories:', error);
    throw new Error('Failed to fetch job categories. Please try again later.');
  }
}

/**
 * Get salary statistics for a job search
 * @param {string} what - Job title or keyword
 */
export async function fetchSalaryStats(what) {
  try {
    await delay(300);
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/gb/history?app_id=${APP_ID}&app_key=${API_KEY}&what=${encodeURIComponent(what)}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch salary statistics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching salary statistics:', error);
    throw new Error('Failed to fetch salary statistics. Please try again later.');
  }
} 