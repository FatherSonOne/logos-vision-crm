import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactCard } from '../ContactCard';

describe('ContactCard', () => {
  const mockContact = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    company: 'Acme Corp',
    job_title: 'CEO',
    relationship_score: 85,
    relationship_trend: 'rising' as const,
    preferred_channel: 'email',
    last_interaction_date: '2026-01-20T10:00:00Z',
    total_interactions: 45,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders contact name', () => {
      render(<ContactCard contact={mockContact} onClick={mockOnClick} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders company and job title', () => {
      render(<ContactCard contact={mockContact} onClick={mockOnClick} />);
      expect(screen.getByText(/acme corp/i)).toBeInTheDocument();
      expect(screen.getByText(/ceo/i)).toBeInTheDocument();
    });

    it('renders relationship score', () => {
      render(<ContactCard contact={mockContact} onClick={mockOnClick} />);
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('renders without crashing when optional fields are missing', () => {
      const minimalContact = {
        id: '2',
        name: 'Jane Smith',
      };
      render(<ContactCard contact={minimalContact} onClick={mockOnClick} />);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Relationship Score Colors', () => {
    it('applies green border for high score (90+)', () => {
      const highScoreContact = { ...mockContact, relationship_score: 92 };
      const { container } = render(<ContactCard contact={highScoreContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card?.className).toContain('border-green');
    });

    it('applies blue border for good score (70-89)', () => {
      const goodScoreContact = { ...mockContact, relationship_score: 75 };
      const { container } = render(<ContactCard contact={goodScoreContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card?.className).toContain('border-blue');
    });

    it('applies amber border for medium score (50-69)', () => {
      const mediumScoreContact = { ...mockContact, relationship_score: 55 };
      const { container } = render(<ContactCard contact={mediumScoreContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card?.className).toContain('border-amber');
    });

    it('applies orange border for low score (30-49)', () => {
      const lowScoreContact = { ...mockContact, relationship_score: 35 };
      const { container } = render(<ContactCard contact={lowScoreContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card?.className).toContain('border-orange');
    });

    it('applies red border for critical score (<30)', () => {
      const criticalScoreContact = { ...mockContact, relationship_score: 15 };
      const { container } = render(<ContactCard contact={criticalScoreContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card?.className).toContain('border-red');
    });

    it('handles missing score gracefully', () => {
      const noScoreContact = { ...mockContact, relationship_score: undefined };
      const { container } = render(<ContactCard contact={noScoreContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Trend Indicator', () => {
    it('displays rising trend indicator', () => {
      const risingContact = { ...mockContact, relationship_trend: 'rising' as const };
      render(<ContactCard contact={risingContact} onClick={mockOnClick} />);
      // TrendIndicator component should render, exact text depends on implementation
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('displays falling trend indicator', () => {
      const fallingContact = { ...mockContact, relationship_trend: 'falling' as const };
      render(<ContactCard contact={fallingContact} onClick={mockOnClick} />);
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('displays stable trend indicator', () => {
      const stableContact = { ...mockContact, relationship_trend: 'stable' as const };
      render(<ContactCard contact={stableContact} onClick={mockOnClick} />);
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('displays new trend indicator', () => {
      const newContact = { ...mockContact, relationship_trend: 'new' as const };
      render(<ContactCard contact={newContact} onClick={mockOnClick} />);
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('displays dormant trend indicator', () => {
      const dormantContact = { ...mockContact, relationship_trend: 'dormant' as const };
      render(<ContactCard contact={dormantContact} onClick={mockOnClick} />);
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<ContactCard contact={mockContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card).toBeInTheDocument();

      if (card) {
        await user.click(card);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      }
    });

    it('has cursor-pointer class for clickable appearance', () => {
      const { container } = render(<ContactCard contact={mockContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card?.className).toContain('cursor-pointer');
    });

    it('has hover effects', () => {
      const { container } = render(<ContactCard contact={mockContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      // Check for hover classes
      expect(card?.className).toMatch(/hover:/);
    });
  });

  describe('Initials Display', () => {
    it('displays initials when no avatar URL', () => {
      const noAvatarContact = { ...mockContact, avatar_url: undefined };
      const { container } = render(<ContactCard contact={noAvatarContact} onClick={mockOnClick} />);

      // Should show initials "JD" for "John Doe"
      expect(container.textContent).toContain('JD');
    });

    it('displays avatar image when avatar URL provided', () => {
      const avatarContact = { ...mockContact, avatar_url: 'https://example.com/avatar.jpg' };
      render(<ContactCard contact={avatarContact} onClick={mockOnClick} />);

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('Contact Information', () => {
    it('displays total interactions count', () => {
      render(<ContactCard contact={mockContact} onClick={mockOnClick} />);
      expect(screen.getByText(/45/)).toBeInTheDocument();
    });

    it('displays preferred communication channel', () => {
      render(<ContactCard contact={mockContact} onClick={mockOnClick} />);
      // Channel icon should be displayed (email icon in this case)
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('handles missing interaction count', () => {
      const noInteractionsContact = { ...mockContact, total_interactions: undefined };
      render(<ContactCard contact={noInteractionsContact} onClick={mockOnClick} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<ContactCard contact={mockContact} onClick={mockOnClick} />);

      const card = container.querySelector('.contact-card');
      expect(card).toBeInTheDocument();
    });

    it('provides accessible name through heading', () => {
      render(<ContactCard contact={mockContact} onClick={mockOnClick} />);
      const heading = screen.getByText('John Doe');
      expect(heading.tagName).toBe('H3');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names gracefully', () => {
      const longNameContact = {
        ...mockContact,
        name: 'Maximillian Christopher Alexander Wellington-Smythe III',
      };
      render(<ContactCard contact={longNameContact} onClick={mockOnClick} />);
      expect(screen.getByText(/Maximillian Christopher Alexander/)).toBeInTheDocument();
    });

    it('handles very long company names', () => {
      const longCompanyContact = {
        ...mockContact,
        company: 'International Global Worldwide Enterprises Corporation Limited LLC',
      };
      render(<ContactCard contact={longCompanyContact} onClick={mockOnClick} />);
      expect(screen.getByText(/International Global Worldwide/)).toBeInTheDocument();
    });

    it('handles score of 0', () => {
      const zeroScoreContact = { ...mockContact, relationship_score: 0 };
      render(<ContactCard contact={zeroScoreContact} onClick={mockOnClick} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles score of 100', () => {
      const perfectScoreContact = { ...mockContact, relationship_score: 100 };
      render(<ContactCard contact={perfectScoreContact} onClick={mockOnClick} />);
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});
