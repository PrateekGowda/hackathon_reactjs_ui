import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InfraProvision from './InfraProvision';

// Mock the child components to simplify testing
jest.mock('./EC2Provision', () => () => <div data-testid="ec2-provision">EC2 Provision Component</div>);
jest.mock('./DBProvision', () => () => <div data-testid="db-provision">DB Provision Component</div>);

describe('InfraProvision Component', () => {
  test('renders the component with EC2 tab active by default', () => {
    render(<InfraProvision />);
    
    // Check if the title is rendered
    expect(screen.getByText('Infrastructure Provisioning')).toBeInTheDocument();
    
    // Check if both tab buttons are rendered
    expect(screen.getByText('EC2 Provision')).toBeInTheDocument();
    expect(screen.getByText('DB Provision')).toBeInTheDocument();
    
    // Check if EC2 provision component is rendered by default
    expect(screen.getByTestId('ec2-provision')).toBeInTheDocument();
    
    // DB provision component should not be visible initially
    expect(screen.queryByTestId('db-provision')).not.toBeInTheDocument();
  });

  test('switches to DB tab when DB Provision button is clicked', () => {
    render(<InfraProvision />);
    
    // Click on the DB Provision tab
    fireEvent.click(screen.getByText('DB Provision'));
    
    // EC2 provision component should not be visible
    expect(screen.queryByTestId('ec2-provision')).not.toBeInTheDocument();
    
    // DB provision component should be visible
    expect(screen.getByTestId('db-provision')).toBeInTheDocument();
  });

  test('switches back to EC2 tab when EC2 Provision button is clicked', () => {
    render(<InfraProvision />);
    
    // First switch to DB tab
    fireEvent.click(screen.getByText('DB Provision'));
    
    // Then switch back to EC2 tab
    fireEvent.click(screen.getByText('EC2 Provision'));
    
    // EC2 provision component should be visible again
    expect(screen.getByTestId('ec2-provision')).toBeInTheDocument();
    
    // DB provision component should not be visible
    expect(screen.queryByTestId('db-provision')).not.toBeInTheDocument();
  });
});