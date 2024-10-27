// frontend/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock del react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock de las imágenes
jest.mock('./assets/icons/control.png', () => 'control-icon-mock');
jest.mock('./assets/icons/report.png', () => 'report-icon-mock');
jest.mock('./assets/icons/message.png', () => 'message-icon-mock');
jest.mock('./assets/icons/agregar-usuario.png', () => 'agregar-usuario-icon-mock');

test('renders App component', () => {
  render(<App />);
  // Tus assertions aquí
});