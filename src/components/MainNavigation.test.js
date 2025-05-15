import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainNavigation from './MainNavigation';

describe('MainNavigation Component', () => {
  test('renders both navigation buttons', () => {
    const mockSetActiveView = jest.fn();
    render(<MainNavigation activeView="costEstimation" setActiveView={mockSetActiveView} />);
    
    expect(screen.getByText('Cost Estimation & Instance Type Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure Provisioning')).toBeInTheDocument();
  });

  test('applies active class to the active view button', () => {
    const mockSetActiveView = jest.fn();
    render(<MainNavigation activeView="costEstimation" setActiveView={mockSetActiveView} />);
    
    const costButton = screen.getByText('Cost Estimation & Instance Type Suggestion');
    const infraButton = screen.getByText('Infrastructure Provisioning');
    
    expect(costButton.className).toContain('active');
    expect(infraButton.className).not.toContain('active');
  });

  test('calls setActiveView with correct value when buttons are clicked', () => {
    const mockSetActiveView = jest.fn();
    render(<MainNavigation activeView="costEstimation" setActiveView={mockSetActiveView} />);
    
    // Click on Infrastructure Provisioning button
    fireEvent.click(screen.getByText('Infrastructure Provisioning'));
    expect(mockSetActiveView).toHaveBeenCalledWith('infraProvision');
    
    // Reset mock and change active view
    mockSetActiveView.mockReset();
    render(<MainNavigation activeView="infraProvision" setActiveView={mockSetActiveView} />);
    
    // Click on Cost Estimation button
    fireEvent.click(screen.getByText('Cost Estimation & Instance Type Suggestion'));
    expect(mockSetActiveView).toHaveBeenCalledWith('costEstimation');
  });
});