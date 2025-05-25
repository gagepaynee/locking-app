import { render, screen } from '@testing-library/react';
import App from './App';

test('renders lock icon', () => {
  render(<App />);
  const icon = screen.getByLabelText('locked');
  expect(icon).toBeInTheDocument();
  const idElement = screen.getByText(/Client ID:/i);
  expect(idElement).toBeInTheDocument();
});
test('shows generated client id', () => {
  render(<App />);
  const idElement = screen.getByText(/Client ID:/i);
  expect(idElement).toBeInTheDocument();
});
