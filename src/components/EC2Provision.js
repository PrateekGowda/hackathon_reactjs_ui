import React, { useState } from 'react';
import axios from 'axios';
import './Provision.css';

const EC2Provision = () => {
  const [formData, setFormData] = useState({
    name: '',
    instanceType: '',
    storageSize: 30,
    osType: 'linux'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  // const [apiUrl, setApiUrl] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'storageSize' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiUrl) {
      setError('Please enter the AWS API Gateway endpoint');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setApiResponse(null);

    try {
      // Extract the path from the full URL to use with the local proxy
      const path = "https://ln43fib1z6.execute-api.us-east-1.amazonaws.com/default/EC2-Generation-testnew";

      
      // Prepare the payload in the expected format
      const payload = {
        osType: formData.osType,
        instanceType: formData.instanceType,
        name: formData.name,
        storageSize: formData.storageSize
      };
      
      console.log('Sending payload to API:', payload);
      
      // Use relative URL which will be proxied through the development server
      const response = await axios.post(path, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data) {
        setSuccess('EC2 instance provisioning initiated successfully!');
        setApiResponse(response.data);
        console.log('API Response:', response.data);
      } else {
        setError('API Gateway returned an error: Unknown error');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error submitting to API Gateway:', err);
      let errorMsg = 'Failed to submit data to AWS API Gateway. ';
      if (err.code === 'ECONNABORTED') {
        errorMsg += 'Request timed out. Please check your network connection.';
      } else if (err.message === 'Network Error') {
        errorMsg += 'Network error. Please check if the API URL is correct.';
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
          <label htmlFor="name">Instance Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="MyLinuxInstance-test"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="instanceType">Instance Type:</label>
          <select
            id="instanceType"
            name="instanceType"
            value={formData.instanceType}
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
          <label htmlFor="storageSize">Storage Size (GB):</label>
          <input
            type="number"
            id="storageSize"
            name="storageSize"
            value={formData.storageSize}
            onChange={handleInputChange}
            required
            className="form-control"
            min="1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="osType">OS Type:</label>
          <select
            id="osType"
            name="osType"
            value={formData.osType}
            onChange={handleInputChange}
            required
            className="form-control"
          >
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
          </select>
        </div>
        
        {/* <div className="form-group">
          <label htmlFor="api-url">AWS API Gateway Endpoint:</label>
          <input
            type="text"
            id="api-url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://ln43fib1z6.execute-api.us-east-1.amazonaws.com/default/EC2-Generation-testnew"
            className="form-control"
            required
          />
        </div> */}
        
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
      
      {apiResponse && (
        <div className="response-container">
          <h4>API Response:</h4>
          <pre className="response-data">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EC2Provision;
