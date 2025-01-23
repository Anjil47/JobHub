import { useEffect, useState } from 'react';
import { useSearch } from '../contexts/search/useSearch';
import { useAuth } from '../contexts/auth/useAuth';
import { fetchSalaryStats } from '../services/adzunaService';
import SearchBar from '../components/SearchBar';
import JobList from '../components/JobList';
import SalaryChart from '../components/SalaryChart';
import { BuildingOffice2Icon as OfficeBuildingIcon, MapPinIcon as LocationMarkerIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/solid';

const HomePage = () => {
  const { searchResults, loading, error, totalJobs, searchJobs } = useSearch();
  const { currentUser } = useAuth();
  const [salaryData, setSalaryData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);

  const handleSearch = async (searchParams) => {
    await searchJobs(searchParams);
    if (searchParams.what) {
      setLoadingChart(true);
      try {
        const stats = await fetchSalaryStats(searchParams.what);
        setSalaryData(stats);
      } catch (err) {
        console.error('Failed to fetch salary stats:', err);
      } finally {
        setLoadingChart(false);
      }
    }
  };

  useEffect(() => {
    handleSearch({});
  }, []);

  const featuredCategories = [
    { icon: OfficeBuildingIcon, name: 'Technology', count: '2.5k+' },
    { icon: LocationMarkerIcon, name: 'Remote', count: '1.8k+' },
    { icon: CurrencyDollarIcon, name: 'Finance', count: '1.2k+' },
    { icon: ChartBarIcon, name: 'Marketing', count: '900+' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              Find Your Dream Job Today
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Search through thousands of job listings to find your perfect match. 
              {!currentUser && " Join now to unlock personalized job recommendations."}
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-50">
        {/* Featured Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {featuredCategories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleSearch({ what: category.name })}
                >
                  <category.icon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Job Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <div className="w-12 h-12 border-l-2 border-r-2 border-blue-300 rounded-full animate-spin absolute top-0 left-0" 
                  style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {totalJobs > 0 && (
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Positions
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {totalJobs.toLocaleString()} jobs found
                  </span>
                </div>
              )}

              {salaryData && !loadingChart && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Salary Trends</h2>
                  <SalaryChart data={salaryData} />
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm">
                <JobList jobs={searchResults} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Leading Companies
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of companies that trust us to find their next great hire
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 