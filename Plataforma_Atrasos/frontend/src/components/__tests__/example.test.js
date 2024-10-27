// frontend/src/components/__tests__/example.test.js
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

test('example test', () => {
  render(<div>Test</div>);
  expect(screen.getByText('Test')).toBeInTheDocument();
});