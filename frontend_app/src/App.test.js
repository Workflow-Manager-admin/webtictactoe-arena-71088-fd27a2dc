import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Kid$mart business game title', () => {
  render(<App />);
  const title = screen.getByText(/Kid\$mart/i);
  expect(title).toBeInTheDocument();
});
