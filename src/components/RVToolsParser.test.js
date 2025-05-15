import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RVToolsParser from './RVToolsParser';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock xlsx module
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1', 'Sheet2'],
    Sheets: {
      Sheet1: {},
      Sheet2: {}
    }
  })),
  utils: {
    sheet_to_json: jest.fn(() => [{ name: 'test', value: 'data' }])
  }
}));

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.onload = jest.fn();
    this.onerror = jest.fn();
  }
  readAsArrayBuffer() {
    this.onload({ target: { result: new ArrayBuffer(8) } });
  }
};

describe('RVToolsParser Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload section', () => {
    render(<RVToolsParser />);
    expect(screen.getByText('Upload RVTools Excel Export')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });

  test('handles file selection', () => {
    render(<RVToolsParser />);
    
    const file = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileInput = screen.getByLabelText('Choose File');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  });

  test('shows error for invalid file type', () => {
    render(<RVToolsParser />);
    
    const file = new File(['dummy content'], 'test.txt', {
      type: 'text/plain'
    });
    
    const fileInput = screen.getByLabelText('Choose File');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    expect(screen.getByText('Please select a valid Excel file (.xls or .xlsx)')).toBeInTheDocument();
  });

  test('parses Excel file to JSON', async () => {
    render(<RVToolsParser />);
    
    // Set up a valid file
    const file = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileInput = screen.getByLabelText('Choose File');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Click parse button
    fireEvent.click(screen.getByText('Parse Excel to JSON'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Excel file successfully parsed to JSON')).toBeInTheDocument();
    });
    
    // Check if JSON preview is shown
    expect(screen.getByText('JSON Preview')).toBeInTheDocument();
  });

  test('submits data to Lambda function', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    
    render(<RVToolsParser />);
    
    // Set up a valid file and parse it
    const file = new File(['dummy content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileInput = screen.getByLabelText('Choose File');
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    fireEvent.click(screen.getByText('Parse Excel to JSON'));
    
    // Wait for parsing to complete
    await waitFor(() => {
      expect(screen.getByText('Excel file successfully parsed to JSON')).toBeInTheDocument();
    });
    
    // Enter Lambda URL
    const urlInput = screen.getByLabelText('AWS Lambda Function URL:');
    fireEvent.change(urlInput, { target: { value: 'https://test-lambda.amazonaws.com' } });
    
    // Submit to Lambda
    fireEvent.click(screen.getByText('Submit to AWS Lambda'));
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Data successfully submitted to AWS Lambda')).toBeInTheDocument();
    });
    
    // Check if axios was called with correct URL
    expect(axios.post).toHaveBeenCalledWith(
      'https://test-lambda.amazonaws.com',
      expect.any(Object),
      expect.any(Object)
    );
  });
});