import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import EC2Provision from './EC2Provision';

// Mock axios
jest.mock('axios');

describe('EC2Provision Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders the EC2 provision form', () => {
    render(<EC2Provision />);
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/Instance Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instance Type:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Storage Size \(GB\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/OS Type:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/AWS API Gateway Endpoint:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Provision EC2 Instance/i })).toBeInTheDocument();
  });

  test('validates form input and shows error when API URL is missing', async () => {
    render(<EC2Provision />);
    
    // Fill out the form but leave API URL empty
    fireEvent.change(screen.getByLabelText(/Instance Name:/i), { target: { value: 'test-instance' } });
    fireEvent.change(screen.getByLabelText(/Instance Type:/i), { target: { value: 't2.micro' } });
    fireEvent.change(screen.getByLabelText(/Storage Size \(GB\):/i), { target: { value: '30' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Provision EC2 Instance/i }));
    
    // Check if error message is displayed
    expect(await screen.findByText(/Please enter the AWS API Gateway endpoint/i)).toBeInTheDocument();
  });

  test('submits form data in the correct format and displays success message', async () => {
    // Mock successful API response
    const mockResponse = { 
      success: true, 
      message: 'EC2 instance provisioning initiated',
      instanceId: 'i-12345678'
    };
    axios.post.mockResolvedValueOnce({ data: mockResponse });
    
    render(<EC2Provision />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Instance Name:/i), { target: { value: 'MyLinuxInstance-test' } });
    fireEvent.change(screen.getByLabelText(/Instance Type:/i), { target: { value: 't2.micro' } });
    fireEvent.change(screen.getByLabelText(/Storage Size \(GB\):/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/OS Type:/i), { target: { value: 'linux' } });
    fireEvent.change(screen.getByLabelText(/AWS API Gateway Endpoint:/i), { 
      target: { value: 'https://api.example.com/provision' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Provision EC2 Instance/i }));
    
    // Check if the API was called with the correct payload format
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          osType: 'linux',
          instanceType: 't2.micro',
          name: 'MyLinuxInstance-test',
          storageSize: 30
        },
        expect.any(Object)
      );
    });
    
    // Check if success message is displayed
    expect(await screen.findByText(/EC2 instance provisioning initiated successfully!/i)).toBeInTheDocument();
    
    // Check if the response is displayed
    expect(await screen.findByText(/API Response:/i)).toBeInTheDocument();
    expect(await screen.findByText(/EC2 instance provisioning initiated/i)).toBeInTheDocument();
  });

  test('handles API errors correctly', async () => {
    // Mock API error
    axios.post.mockRejectedValueOnce({ 
      response: { data: { message: 'Invalid parameters' } } 
    });
    
    render(<EC2Provision />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Instance Name:/i), { target: { value: 'MyLinuxInstance-test' } });
    fireEvent.change(screen.getByLabelText(/Instance Type:/i), { target: { value: 't2.micro' } });
    fireEvent.change(screen.getByLabelText(/Storage Size \(GB\):/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/OS Type:/i), { target: { value: 'linux' } });
    fireEvent.change(screen.getByLabelText(/AWS API Gateway Endpoint:/i), { 
      target: { value: 'https://api.example.com/provision' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Provision EC2 Instance/i }));
    
    // Check if error message is displayed
    expect(await screen.findByText(/Failed to submit data to AWS API Gateway/i)).toBeInTheDocument();
    expect(await screen.findByText(/Invalid parameters/i)).toBeInTheDocument();
  });
});
