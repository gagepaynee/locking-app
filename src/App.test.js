import { render, screen } from '@testing-library/react';
import App from './App';

test('renders lock icon', () => {
  render(<App />);
  const icon = screen.getByLabelText('locked');
  expect(icon).toBeInTheDocument();
});
