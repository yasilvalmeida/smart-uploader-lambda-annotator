import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock the components to avoid complex dependencies
jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <div data-testid='header'>Header</div>;
  };
});

jest.mock('../pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid='dashboard'>Dashboard</div>;
  };
});

jest.mock('../pages/UploadPage', () => {
  return function MockUploadPage() {
    return <div data-testid='upload-page'>Upload Page</div>;
  };
});

jest.mock('../pages/ImageViewer', () => {
  return function MockImageViewer() {
    return <div data-testid='image-viewer'>Image Viewer</div>;
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('App Component', () => {
  test('renders header and main content', () => {
    renderWithRouter(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
