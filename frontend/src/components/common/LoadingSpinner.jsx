import React from 'react';
import './LoadingSpinner.css'; // You'll need to create this CSS file

const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div className={`spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;