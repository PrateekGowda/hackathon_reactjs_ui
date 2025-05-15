import React from 'react';
import './MainNavigation.css';

const MainNavigation = ({ activeView, setActiveView }) => {
  return (
    <div className="main-nav">
      <button
        className={`main-nav-button ${activeView === 'costEstimation' ? 'active' : ''}`}
        onClick={() => setActiveView('costEstimation')}
      >
        Cost Estimation & Instance Type Suggestion
      </button>
      <button
        className={`main-nav-button ${activeView === 'infraProvision' ? 'active' : ''}`}
        onClick={() => setActiveView('infraProvision')}
      >
        Infrastructure Provisioning
      </button>
    </div>
  );
};

export default MainNavigation;