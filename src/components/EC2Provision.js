import React, { useState } from 'react';
import axios from 'axios';
import './Provision.css';

const EC2Provision = () => {
  const [formData, setFormData] = useState({
    instance_name: '',
    instance_type: '',
    storage: '',
    os_type: ''
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
        setSuccess('EC2 instance provisioning initiated successfully!');
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
          <label htmlFor="instance_name">Instance Name:</label>
          <input
            type="text"
            id="instance_name"
            name="instance_name"
            value={formData.instance_name}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="instance_type">Instance Type:</label>
          <select
            id="instance_type"
            name="instance_type"
            value={formData.instance_type}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="">Select Instance Type</option>
            <option value="t2.micro">t2.micro</option>
            <option value="t2.small">t2.small</option>
            <option value="t2.medium">t2.medium</option>
            <option value="m5.large">m5.large</option>
            <option value="c5.large">c5.large</option>
          </select>
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
            min="1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="os_type">OS Type:</label>
          <select
            id="os_type"
            name="os_type"
            value={formData.os_type}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="">Select OS</option>
            <option value="Amazon Linux 2">Amazon Linux 2</option>
            <option value="Ubuntu">Ubuntu</option>
            <option value="Windows">Windows</option>
            <option value="RHEL">RHEL</option>
          </select>
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
          {isLoading ? 'Provisioning...' : 'Provision EC2 Instance'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default EC2Provision;