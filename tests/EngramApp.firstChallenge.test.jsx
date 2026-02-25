import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import EngramApp from '../src/EngramApp';

describe('EngramApp First Challenge Evaluation', () => {
  it('accepts correct code for the first challenge', async () => {
    await act(async () => {
      render(<EngramApp />);
    });
    // Wait for dashboard
    await screen.findByText(/Continue Learning/i);
    // Click continue to go to first challenge
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });
    // Wait for challenge view
    await screen.findByText(/YOUR CODE/i);
    // Enter correct code for first challenge
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Write your solution/i), { target: { value: 'const greeting = "hello world";' } });
      fireEvent.click(screen.getByText(/Run/i));
    });
    // Wait for success feedback
    await waitFor(() => expect(screen.getByText(/Nailed it|Reinforced/i)).toBeInTheDocument());
  });
});
