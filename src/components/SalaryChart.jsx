import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import PropTypes from 'prop-types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SalaryChart({ data }) {
  const chartData = {
    labels: Object.keys(data?.histogram || {}),
    datasets: [
      {
        label: 'Average Salary',
        data: Object.values(data?.histogram || {}),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Salary Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Salary (£)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
}

SalaryChart.propTypes = {
  data: PropTypes.shape({
    histogram: PropTypes.object
  })
}; 