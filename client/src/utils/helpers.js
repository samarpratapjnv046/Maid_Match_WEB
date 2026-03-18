export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const map = {
    offer_pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    pending_payment: 'bg-purple-100 text-purple-800',
    paid: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-700',
    refunded: 'bg-orange-100 text-orange-800',
    pending: 'bg-amber-100 text-amber-800',
    verified: 'bg-green-100 text-green-800',
    under_review: 'bg-blue-100 text-blue-800',
    captured: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const getStatusLabel = (status) => {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
};

export const serviceIcons = {
  house_cleaning: '🧹',
  deep_cleaning: '✨',
  cooking: '🍳',
  babysitting: '👶',
  elder_care: '🏥',
  laundry: '👕',
  gardening: '🌿',
  driver: '🚗',
  security_guard: '🛡️',
};

export const serviceLabels = {
  house_cleaning: 'House Cleaning',
  deep_cleaning: 'Deep Cleaning',
  cooking: 'Cooking',
  babysitting: 'Babysitting',
  elder_care: 'Elder Care',
  laundry: 'Laundry',
  gardening: 'Gardening',
  driver: 'Driver',
  security_guard: 'Security Guard',
};
