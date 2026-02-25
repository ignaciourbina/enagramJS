import React from 'react';
import { render } from '@testing-library/react';
import EngramApp from './EngramApp';

describe('EngramApp', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<EngramApp />);
    // Basic smoke test: check for a known element or text
    // Adjust the text below to match something visible in your app
    expect(getByText(/enagram|engram|app/i)).toBeInTheDocument();
  });
});
