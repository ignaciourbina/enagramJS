import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import EngramApp from '../src/EngramApp';

describe('EngramApp UI Flows', () => {
  it('renders dashboard and stats', async () => {
    await act(async () => {
      render(<EngramApp />);
    });
    // Wait for dashboard to appear
    await screen.findByText(/Continue Learning/i);
    expect(screen.getByText(/XP/i)).toBeInTheDocument();
    expect(screen.getByText(/Streak/i)).toBeInTheDocument();
    expect(screen.getByText(/Mastery/i)).toBeInTheDocument();
  });

  it('navigates to map view', async () => {
    await act(async () => {
      render(<EngramApp />);
    });
    // Select the correct 'map' button by role and name
    const mapBtn = await screen.getByRole('button', { name: /map/i });
    await act(async () => {
      fireEvent.click(mapBtn);
    });
    expect(await screen.findByText(/Knowledge Graph/i)).toBeInTheDocument();
  });
});
