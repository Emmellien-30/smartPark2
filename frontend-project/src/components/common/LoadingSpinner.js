import React from 'react';
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
    <p className="text-sm text-gray-500">{text}</p>
  </div>
);
export const FullPageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-600 font-medium">Loading CRPMS...</p>
    </div>
  </div>
);
export default LoadingSpinner;
