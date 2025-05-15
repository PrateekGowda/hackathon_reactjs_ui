import React, { useState } from 'react';
import EC2Provision from './EC2Provision';
import DBProvision from './DBProvision';
import './Provision.css';

const InfraProvision = () => {
  const [activeTab, setActiveTab] = useState('ec2');

  return (
    <div className="provision-container">
      <h2>Infrastructure Provisioning</h2>
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'ec2' ? 'active' : ''}`}
          onClick={() => setActiveTab('ec2')}
        >
          EC2 Provision
        </button>
        <button 
          className={`tab-button ${activeTab === 'db' ? 'active' : ''}`}
          onClick={() => setActiveTab('db')}
        >
          DB Provision
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'ec2' && (
          <div>
            <h3>EC2 Instance Provisioning</h3>
            <p>Provision a new EC2 instance with the following parameters:</p>
            <EC2Provision />
          </div>
        )}
        {activeTab === 'db' && (
          <div>
            <h3>Database Provisioning</h3>
            <p>Provision a new database with the following parameters:</p>
            <DBProvision />
          </div>
        )}
      </div>
    </div>
  );
};

export default InfraProvision;