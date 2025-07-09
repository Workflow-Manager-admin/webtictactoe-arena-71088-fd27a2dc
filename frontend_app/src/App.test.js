import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Snake and Dice title', () => {
  render(<App />);
  const title = screen.getByText(/Snake and Dice/i);
  expect(title).toBeInTheDocument();
});
