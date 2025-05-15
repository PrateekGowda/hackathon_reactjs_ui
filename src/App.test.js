import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock the child components to simplify testing
jest.mock('./components/RVToolsParser', () => () => <div data-testid="rv-tools-parser">RVTools Parser Component</div>);
jest.mock('./components/InfraProvision', () => () => <div data-testid="infra-provision">Infrastructure Provision Component</div>);

describe('App Component', () => {
  test('renders the app with header, navigation, and cost estimation view by default', () => {
    render(<App />);
    
    // Check if the header is rendered
    expect(screen.getByText('MetaPort: VMWare to Multi-Cloud AI-Powered Migration')).toBeInTheDocument();
    
    // Check if both navigation buttons are rendered
    expect(screen.getByText('Cost Estimation & Instance Type Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure Provisioning')).toBeInTheDocument();
    
    // Check if RVTools Parser component is rendered by default
    expect(screen.getByTestId('rv-tools-parser')).toBeInTheDocument();
    
    // Infrastructure Provision component should not be visible initially
    expect(screen.queryByTestId('infra-provision')).not.toBeInTheDocument();
  });

  test('switches to infrastructure provisioning view when the button is clicked', () => {
    render(<App />);
    
    // Click on the Infrastructure Provisioning button
    fireEvent.click(screen.getByText('Infrastructure Provisioning'));
    
    // RVTools Parser component should not be visible
    expect(screen.queryByTestId('rv-tools-parser')).not.toBeInTheDocument();
    
    // Infrastructure Provision component should be visible
    expect(screen.getByTestId('infra-provision')).toBeInTheDocument();
  });

  test('switches back to cost estimation view when the button is clicked', () => {
    render(<App />);
    
    // First switch to infrastructure provisioning view
    fireEvent.click(screen.getByText('Infrastructure Provisioning'));
    
    // Then switch back to cost estimation view
    fireEvent.click(screen.getByText('Cost Estimation & Instance Type Suggestion'));
    
    // RVTools Parser component should be visible again
    expect(screen.getByTestId('rv-tools-parser')).toBeInTheDocument();
    
    // Infrastructure Provision component should not be visible
    expect(screen.queryByTestId('infra-provision')).not.toBeInTheDocument();
  });
});