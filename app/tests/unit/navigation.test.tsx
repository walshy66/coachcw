import { render, screen } from '@testing-library/react';
import NavLinks from '../../src/components/navigation/NavLinks';

describe('Navigation links', () => {
  it('shows nav targets and badge', () => {
    render(<NavLinks badges={{ messages: 1 }} />);
    expect(screen.getByText(/Program/i)).toBeInTheDocument();
    expect(screen.getByText(/Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/Messages/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toHaveClass('nav__badge');
  });
});
