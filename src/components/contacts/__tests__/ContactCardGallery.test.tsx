import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactCardGallery } from '../ContactCardGallery';

describe('ContactCardGallery', () => {
  const mockContacts = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Corp',
      relationship_score: 85,
      relationship_trend: 'rising' as const,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Inc',
      relationship_score: 72,
      relationship_trend: 'stable' as const,
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      company: 'Startup LLC',
      relationship_score: 45,
      relationship_trend: 'falling' as const,
    },
  ];

  const mockOnSelectContact = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering with Contacts', () => {
    it('renders all contacts', () => {
      render(<ContactCardGallery contacts={mockContacts} onSelectContact={mockOnSelectContact} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders correct number of contact cards', () => {
      const { container } = render(
        <ContactCardGallery contacts={mockContacts} onSelectContact={mockOnSelectContact} />
      );

      const cards = container.querySelectorAll('.contact-card');
      expect(cards.length).toBe(3);
    });

    it('passes onSelectContact to each card', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ContactCardGallery contacts={mockContacts} onSelectContact={mockOnSelectContact} />
      );

      const firstCard = container.querySelector('.contact-card');
      expect(firstCard).toBeInTheDocument();

      if (firstCard) {
        await user.click(firstCard);
        expect(mockOnSelectContact).toHaveBeenCalledTimes(1);
        expect(mockOnSelectContact).toHaveBeenCalledWith(mockContacts[0]);
      }
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no contacts', () => {
      render(<ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />);

      expect(screen.getByText(/no contacts found/i)).toBeInTheDocument();
      expect(screen.getByText(/couldn't find any contacts/i)).toBeInTheDocument();
    });

    it('shows clear filters button in empty state', () => {
      render(<ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />);

      const clearFiltersButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearFiltersButton).toBeInTheDocument();
    });

    it('shows add contact button in empty state', () => {
      render(<ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />);

      const addButton = screen.getByRole('button', { name: /add new contact/i });
      expect(addButton).toBeInTheDocument();
    });

    it('displays empty state icon', () => {
      render(<ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />);

      // Check for search/magnifying glass emoji
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    it('does not show contact cards in empty state', () => {
      const { container } = render(
        <ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />
      );

      const cards = container.querySelectorAll('.contact-card');
      expect(cards.length).toBe(0);
    });
  });

  describe('Grid Layout', () => {
    it('uses grid layout for contacts', () => {
      const { container } = render(
        <ContactCardGallery contacts={mockContacts} onSelectContact={mockOnSelectContact} />
      );

      // Check for grid classes in the container
      const gridContainer = container.firstChild;
      expect(gridContainer).toBeInTheDocument();
    });

    it('handles single contact', () => {
      const singleContact = [mockContacts[0]];
      render(<ContactCardGallery contacts={singleContact} onSelectContact={mockOnSelectContact} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('handles many contacts', () => {
      const manyContacts = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        relationship_score: Math.floor(Math.random() * 100),
      }));

      const { container } = render(
        <ContactCardGallery contacts={manyContacts} onSelectContact={mockOnSelectContact} />
      );

      const cards = container.querySelectorAll('.contact-card');
      expect(cards.length).toBe(20);
    });
  });

  describe('Contact Selection', () => {
    it('calls onSelectContact with correct contact when clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ContactCardGallery contacts={mockContacts} onSelectContact={mockOnSelectContact} />
      );

      const cards = container.querySelectorAll('.contact-card');

      // Click second card
      await user.click(cards[1]);

      expect(mockOnSelectContact).toHaveBeenCalledWith(mockContacts[1]);
      expect(mockOnSelectContact).toHaveBeenCalledTimes(1);
    });

    it('can select multiple contacts sequentially', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ContactCardGallery contacts={mockContacts} onSelectContact={mockOnSelectContact} />
      );

      const cards = container.querySelectorAll('.contact-card');

      await user.click(cards[0]);
      await user.click(cards[2]);

      expect(mockOnSelectContact).toHaveBeenCalledTimes(2);
      expect(mockOnSelectContact).toHaveBeenNthCalledWith(1, mockContacts[0]);
      expect(mockOnSelectContact).toHaveBeenNthCalledWith(2, mockContacts[2]);
    });
  });

  describe('Accessibility', () => {
    it('has semantic empty state structure', () => {
      render(<ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />);

      // Empty state should have a heading
      const heading = screen.getByRole('heading', { name: /no contacts found/i });
      expect(heading).toBeInTheDocument();
    });

    it('buttons in empty state have accessible labels', () => {
      render(<ContactCardGallery contacts={[]} onSelectContact={mockOnSelectContact} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      const addButton = screen.getByRole('button', { name: /add new contact/i });

      expect(clearButton).toHaveAttribute('aria-label');
      expect(addButton).toHaveAttribute('aria-label');
    });
  });

  describe('Edge Cases', () => {
    it('handles contacts with minimal data', () => {
      const minimalContacts = [
        { id: '1', name: 'Minimal Contact' },
      ];

      render(
        <ContactCardGallery contacts={minimalContacts} onSelectContact={mockOnSelectContact} />
      );

      expect(screen.getByText('Minimal Contact')).toBeInTheDocument();
    });

    it('handles contacts with all data fields', () => {
      const completeContacts = [
        {
          id: '1',
          name: 'Complete Contact',
          email: 'complete@example.com',
          phone: '(555) 123-4567',
          company: 'Full Corp',
          job_title: 'Director',
          avatar_url: 'https://example.com/avatar.jpg',
          relationship_score: 95,
          relationship_trend: 'rising' as const,
          preferred_channel: 'email',
          last_interaction_date: '2026-01-20T10:00:00Z',
          total_interactions: 100,
        },
      ];

      render(
        <ContactCardGallery contacts={completeContacts} onSelectContact={mockOnSelectContact} />
      );

      expect(screen.getByText('Complete Contact')).toBeInTheDocument();
    });

    it('handles null onSelectContact gracefully', () => {
      const { container } = render(
        <ContactCardGallery contacts={mockContacts} onSelectContact={() => {}} />
      );

      const cards = container.querySelectorAll('.contact-card');
      expect(cards.length).toBe(3);
    });
  });

  describe('Performance', () => {
    it('renders large lists efficiently', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Contact ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        relationship_score: i,
      }));

      const { container } = render(
        <ContactCardGallery contacts={largeList} onSelectContact={mockOnSelectContact} />
      );

      const cards = container.querySelectorAll('.contact-card');
      expect(cards.length).toBe(100);
    });
  });
});
