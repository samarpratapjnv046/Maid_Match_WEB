import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Clock, CheckCircle } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings');
        setBookings(response.data?.bookings || response.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.data?.user?.name || 'Customer'}
          </h2>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-8 text-center text-gray-500">Loading...</li>
          ) : bookings.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">No bookings found.</li>
          ) : (
            bookings.map((booking) => (
              <li key={booking._id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {booking.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-600 truncate">{booking.worker?.user?.name || 'Worker'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default CustomerDashboard;
