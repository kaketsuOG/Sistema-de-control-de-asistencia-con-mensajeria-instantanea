import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

jest.mock('../../services/auth', () => ({
  isAuthenticated: () => true
}));

describe('ProtectedRoute Component', () => {
  test('renders protected content when authenticated', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});