import { render, screen } from '@testing-library/react';
import App from './App';

test('shows generated client id', () => {
  render(<App />);
  const idElement = screen.getByText(/Client ID:/i);
  expect(idElement).toBeInTheDocument();
});
