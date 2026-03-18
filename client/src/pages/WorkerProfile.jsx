import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Star, MapPin, CheckCircle, Clock, Calendar, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookingData, setBookingData] = useState({
    service_type: '',
    duration_type: 'hourly',
    start_time: '',
    end_time: '',
    address: '',
    special_instructions: ''
  });

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await api.get(`/workers/${id}`);
        setWorker(response.data?.data || response.data || null);
        if (response.data?.data?.services?.length > 0) {
          setBookingData(prev => ({ ...prev, service_type: response.data.data.services[0] }));
        }
      } catch (err) {
        setError('Failed to load worker profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id]);

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    setError('');
    
    try {
      await api.post('/bookings', {
        worker_id: id,
        ...bookingData
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!worker) {
    return <div className="min-h-screen pt-24 text-center text-xl text-gray-500">Worker not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Profile Info */}
        <div className="lg:w-2/3 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600"></div>
            <div className="px-6 sm:px-10 pb-8">
              <div className="relative flex justify-between items-end -mt-16 mb-6">
                <img 
                  src={worker.user_id?.profilePhoto || 'https://via.placeholder.com/200'}
                  alt={worker.user_id?.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white"
                />
                <div className="flex items-center space-x-2 pb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">{worker.user_id?.name || 'Worker Name'}</h1>
              <div className="mt-2 flex items-center text-gray-500 space-x-4">
                 <span className="flex items-center">
                   <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                   <span className="font-medium text-gray-900 mr-1">{worker.rating?.average || 0}</span>
                   ({worker.rating?.count || 0} reviews)
                 </span>
                 <span className="flex items-center">
                   <MapPin className="w-4 h-4 mr-1" />
                   Available Locally
                 </span>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">About Me</h3>
                <p className="text-gray-600 leading-relaxed">
                  {worker.bio || 'I am a dedicated professional providing excellent home services. Customer satisfaction is my top priority.'}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.services?.map(service => (
                    <span key={service} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium capitalize border border-primary-100">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Experience & Skills</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                  <li className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {worker.experience_years || 0} Years Experience</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Book this Maid
            </h3>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded flex items-start text-sm">
                 <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                 <span>{error}</span>
              </div>
            )}

            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
               <span className="text-gray-600 font-medium">Hourly Rate</span>
               <span className="text-2xl font-bold text-gray-900">₹{worker.pricing?.hourly || 0}</span>
            </div>

            <form onSubmit={handleBookNow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select 
                  name="service_type" 
                  value={bookingData.service_type}
                  onChange={handleBookingChange}
                  className="input-field capitalize"
                  required
                >
                  <option value="" disabled>Select a service</option>
                  {worker.services?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input 
                    type="datetime-local" 
                    name="start_time"
                    value={bookingData.start_time}
                    onChange={handleBookingChange}
                    className="input-field px-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input 
                    type="datetime-local" 
                    name="end_time"
                    value={bookingData.end_time}
                    onChange={handleBookingChange}
                    className="input-field px-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  name="address"
                  value={bookingData.address}
                  onChange={handleBookingChange}
                  className="input-field py-2"
                  rows="2"
                  placeholder="Full service address"
                  required
                ></textarea>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full btn-primary py-3 text-lg flex justify-center items-center"
                >
                  {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Booking'}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  You won't be charged until the worker accepts.
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkerProfile;
