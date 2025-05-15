import React, { useState } from 'react';
import axios from 'axios';
import './Provision.css';

const DBProvision = () => {
  const [formData, setFormData] = useState({
    engine: '',
    db_interface: '',
    identifier: '',
    storage: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lambdaUrl, setLambdaUrl] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!lambdaUrl) {
      setError('Please enter the AWS Lambda function URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Extract the path from the full URL to use with the local proxy
      let path;
      try {
        const urlObj = new URL(lambdaUrl);
        path = urlObj.pathname;
      } catch (e) {
        // If URL parsing fails, use the input as is
        path = lambdaUrl;
      }
      
      // Use relative URL which will be proxied through the development server
      const response = await axios.post(path, formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data) {
        setSuccess('Database provisioning initiated successfully!');
      } else {
        setError('Lambda function returned an error: Unknown error');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error submitting to Lambda:', err);
      let errorMsg = 'Failed to submit data to AWS Lambda. ';
      if (err.code === 'ECONNABORTED') {
        errorMsg += 'Request timed out. Please check your network connection.';
      } else if (err.message === 'Network Error') {
        errorMsg += 'Network error. Please check if the Lambda URL is correct.';
      } else {
        errorMsg += (err.response?.data?.message || err.message);
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="provision-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="engine">Database Engine:</label>
          <select
            id="engine"
            name="engine"
            value={formData.engine}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="">Select Engine</option>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mariadb">MariaDB</option>
            <option value="oracle">Oracle</option>
            <option value="sqlserver">SQL Server</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="db_interface">DB Interface Class:</label>
          <select
            id="db_interface"
            name="db_interface"
            value={formData.db_interface}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="">Select Interface Class</option>
            <option value="db.t3.micro">db.t3.micro</option>
            <option value="db.t3.small">db.t3.small</option>
            <option value="db.t3.medium">db.t3.medium</option>
            <option value="db.m5.large">db.m5.large</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="identifier">DB Identifier:</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="storage">Storage (GB):</label>
          <input
            type="number"
            id="storage"
            name="storage"
            value={formData.storage}
            onChange={handleInputChange}
            required
            className="form-control"
            min="5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Database Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lambda-url">AWS Lambda API Gateway Endpoint:</label>
          <input
            type="text"
            id="lambda-url"
            value={lambdaUrl}
            onChange={(e) => setLambdaUrl(e.target.value)}
            placeholder="https://your-api-gateway-endpoint.amazonaws.com/stage/function"
            className="form-control"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Provisioning...' : 'Provision Database'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default DBProvision;