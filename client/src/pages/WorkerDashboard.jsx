import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Check, X, Clock } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/bookings');
        setRequests(response.data?.bookings || response.data || []);
      } catch (error) {
        console.error('Failed to fetch requests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      // Update local state
      setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
    } catch (error) {
       console.error('Failed to update status', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Worker Dashboard - {user?.data?.user?.name || 'Worker'}
          </h2>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Booking Requests</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {loading ? (
             <li className="px-4 py-8 text-center text-gray-500">Loading...</li>
          ) : requests.length === 0 ? (
             <li className="px-4 py-8 text-center text-gray-500">No booking requests found.</li>
          ) : (
            requests.map((request) => (
              <li key={request._id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-900">Customer: {request.customer?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-primary-600 mt-1">₹{request.totalAmount}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {request.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(request._id, 'confirmed')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </button>
                      <button 
                        onClick={() => handleStatusChange(request._id, 'cancelled')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </>
                  )}
                  {request.status !== 'pending' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
                      {request.status}
                    </span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default WorkerDashboard;
