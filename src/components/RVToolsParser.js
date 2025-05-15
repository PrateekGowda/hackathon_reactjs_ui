import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './RVToolsParser.css';

const RVToolsParser = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lambdaUrl, setLambdaUrl] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if file is an Excel file
      if (
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
        setSuccess('');
        setJsonData(null);
      } else {
        setError('Please select a valid Excel file (.xls or .xlsx)');
        setFile(null);
        setFileName('');
      }
    }
  };

  // Parse Excel file to JSON in the format { "prompt": "VCPU:2,Memory(GB):8,Disk(GB):40,OperatingSystem:RHEL9" }
  const parseExcel = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assuming the first sheet contains the VM data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        
        if (sheetData && sheetData.length > 0) {
          // Map of common field names to standardized names
          const fieldMappings = {
            'NumCPU': 'VCPU',
            'VCPU': 'VCPU',
            'MemoryGB': 'Memory(GB)',
            'Memory': 'Memory(GB)',
            'DiskGB': 'Disk(GB)',
            'Capacity': 'Disk(GB)',
            'OS': 'OperatingSystem',
            'GuestOS': 'OperatingSystem'
          };
          
          // Process all VMs in the sheet
          const allVMs = sheetData.map(vm => {
            const promptParts = [];
            
            // Process all fields in the VM data
            Object.keys(vm).forEach(key => {
              if (vm[key] !== null && vm[key] !== undefined && vm[key] !== '') {
                // Use mapped field name if available, otherwise use original
                const fieldName = fieldMappings[key] || key;
                promptParts.push(`${fieldName}:${vm[key]}`);
              }
            });
            
            return promptParts.join(',');
          });
          
          // Set the formatted JSON data with all VMs
          setJsonData({ prompts: allVMs });
          setSuccess('Excel file successfully parsed to required format');
        } else {
          setError('No data found in the Excel file');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        setError('Failed to parse Excel file. Please make sure it is a valid RVTools export.');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading the file');
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Submit JSON data to AWS Lambda using POST request with local proxy
  const submitToLambda = async () => {
    if (!jsonData) {
      setError('Please parse the Excel file first');
      return;
    }

    // if (!lambdaUrl) {
    //   setError('Please enter the AWS Lambda function URL');
    //   return;
    // }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the full Lambda URL instead of just the path
      // const path = lambdaUrl;
      const path = "https://oizh1vz6i4.execute-api.us-east-1.amazonaws.com/default/test-Cost-estimation-pricing-bedrock";
      
      // Process all VMs at once in a single request
      const response = await axios.post(path, { prompts: jsonData.prompts }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // Handle the response format from the Lambda function
      if (response.data && response.data.success) {
        console.log('Lambda response:', response.data);
        
        let content = '';
        
        // Extract content from the specific response structure
        if (response.data.data && 
            response.data.data.output && 
            response.data.data.output.message && 
            response.data.data.output.message.content && 
            response.data.data.output.message.content[0] && 
            response.data.data.output.message.content[0].text) {
          
          content = response.data.data.output.message.content[0].text;
          setSuccess('Data successfully processed. Response:\n\n' + content);
        } else {
          // Fallback: just stringify the entire response
          content = JSON.stringify(response.data);
          setSuccess('Data successfully processed. Raw response: ' + content);
        }
      } else {
        setError('Lambda function returned an error: ' + (response.data?.message || 'Unknown error'));
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error submitting to Lambda:', err);
      // More detailed error message
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
    <div className="rvtools-parser">
      <div className="upload-section">
        <h2>Upload RVTools Excel Export</h2>
        <div className="file-input-container">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".xls,.xlsx"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            Choose File
          </label>
          <span className="file-name">{fileName || 'No file selected'}</span>
        </div>
        <button 
          onClick={parseExcel} 
          disabled={!file || isLoading}
          className="action-button"
        >
          {isLoading ? 'Processing...' : 'Parse Excel to JSON'}
        </button>
      </div>

      {jsonData && (
        <div className="json-preview">
          <h3>JSON Preview</h3>
          <div className="json-container">
            <pre>{JSON.stringify(jsonData, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="submit-section">
        <h2>Submit to AWS Lambda</h2>
        {/* <div className="input-group">
          <label htmlFor="lambda-url">AWS Lambda API Gateway Endpoint:</label>
          <input
            type="text"
            id="lambda-url"
            value={lambdaUrl}
            onChange={(e) => setLambdaUrl(e.target.value)}
            placeholder="https://pq1khgwtxa.execute-api.us-east-1.amazonaws.com/default/Cost-estimation-pricing-bedrock"
            className="text-input"
          />
        </div> */}
        <button 
          onClick={submitToLambda} 
          disabled={!jsonData || isLoading}
          className="action-button submit-button"
        >
          {isLoading ? 'Submitting...' : 'Submit to AWS Lambda'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message" style={{ whiteSpace: 'pre-line' }}>{success}</div>}
    </div>
  );
};

export default RVToolsParser;
