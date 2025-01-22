const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api';
const ADZUNA_APP_ID = '199bf17b';
const ADZUNA_API_KEY = '994af7bef1f3efc6adc02595efea37d9';

export const searchJobs = async (query, location, page = 1) => {
  try {
    const response = await fetch(
      `${ADZUNA_BASE_URL}/jobs/gb/search/${page}?` +
      `app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&` +
      `what=${encodeURIComponent(query)}&` +
      `where=${encodeURIComponent(location)}&` +
      'content-type=application/json'
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export default {
  searchJobs,
  ADZUNA_BASE_URL,
  ADZUNA_APP_ID,
  ADZUNA_API_KEY,
}; 