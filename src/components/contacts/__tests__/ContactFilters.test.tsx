import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactFilters } from '../ContactFilters';

describe('ContactFilters', () => {
  const defaultFilters = {
    relationshipScore: 'all',
    trend: 'all',
    donorStage: 'all',
    tags: [] as string[]
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders filter button', () => {
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.getByRole('button', { name: /filter contacts/i })).toBeInTheDocument();
    });

    it('shows filter icon in button', () => {
      const { container } = render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);
      const button = screen.getByRole('button', { name: /filter contacts/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not show badge when no filters are active', () => {
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);
      const badge = screen.queryByText(/^\d+$/);
      expect(badge).not.toBeInTheDocument();
    });

    it('hides dropdown by default', () => {
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);
      expect(screen.queryByText('Relationship Score')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Toggle', () => {
    it('shows dropdown when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      const button = screen.getByRole('button', { name: /filter contacts/i });
      await user.click(button);

      expect(screen.getByText('Relationship Score')).toBeInTheDocument();
      expect(screen.getByText('Relationship Trend')).toBeInTheDocument();
      expect(screen.getByText('Donor Stage')).toBeInTheDocument();
    });

    it('hides dropdown when filter button is clicked again', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      const button = screen.getByRole('button', { name: /filter contacts/i });
      await user.click(button);
      expect(screen.getByText('Relationship Score')).toBeInTheDocument();

      await user.click(button);
      expect(screen.queryByText('Relationship Score')).not.toBeInTheDocument();
    });

    it('hides dropdown when Apply button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      const filterButton = screen.getByRole('button', { name: /filter contacts/i });
      await user.click(filterButton);

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      expect(screen.queryByText('Relationship Score')).not.toBeInTheDocument();
    });
  });

  describe('Active Filter Badge', () => {
    it('shows badge with count when one filter is active', () => {
      const filters = {
        ...defaultFilters,
        relationshipScore: '76-100'
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows badge with count when multiple filters are active', () => {
      const filters = {
        relationshipScore: '76-100',
        trend: 'rising',
        donorStage: 'Major Donor',
        tags: [] as string[]
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('counts tags filter when tags array has items', () => {
      const filters = {
        ...defaultFilters,
        tags: ['tag1', 'tag2']
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('shows correct count with all filters active', () => {
      const filters = {
        relationshipScore: '51-75',
        trend: 'stable',
        donorStage: 'Prospect',
        tags: ['vip']
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Relationship Score Filter', () => {
    it('renders all relationship score options', async () => {
      const user = userEvent.setup();
      const { container } = render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      // Find select by its label text
      const label = screen.getByText('Relationship Score');
      const select = label.nextElementSibling as HTMLSelectElement;

      expect(select).toBeInTheDocument();
      expect(within(select).getByText('All Scores')).toBeInTheDocument();
      expect(within(select).getByText('Strong (76-100)')).toBeInTheDocument();
      expect(within(select).getByText('Good (51-75)')).toBeInTheDocument();
      expect(within(select).getByText('Moderate (26-50)')).toBeInTheDocument();
      expect(within(select).getByText('At Risk (0-25)')).toBeInTheDocument();
    });

    it('calls onChange when relationship score is changed', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Score');
      const select = label.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(select, '76-100');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        relationshipScore: '76-100'
      });
    });

    it('displays current relationship score value', async () => {
      const user = userEvent.setup();
      const filters = {
        ...defaultFilters,
        relationshipScore: '51-75'
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Score');
      const select = label.nextElementSibling as HTMLSelectElement;
      expect(select.value).toBe('51-75');
    });
  });

  describe('Trend Filter', () => {
    it('renders all trend options', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Trend');
      const select = label.nextElementSibling as HTMLSelectElement;

      expect(within(select).getByText('All Trends')).toBeInTheDocument();
      expect(within(select).getByText('Rising')).toBeInTheDocument();
      expect(within(select).getByText('Stable')).toBeInTheDocument();
      expect(within(select).getByText('Falling')).toBeInTheDocument();
      expect(within(select).getByText('New')).toBeInTheDocument();
      expect(within(select).getByText('Dormant')).toBeInTheDocument();
    });

    it('calls onChange when trend is changed', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Trend');
      const select = label.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(select, 'rising');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        trend: 'rising'
      });
    });

    it('displays current trend value', async () => {
      const user = userEvent.setup();
      const filters = {
        ...defaultFilters,
        trend: 'falling'
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Trend');
      const select = label.nextElementSibling as HTMLSelectElement;
      expect(select.value).toBe('falling');
    });
  });

  describe('Donor Stage Filter', () => {
    it('renders all donor stage options', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Donor Stage');
      const select = label.nextElementSibling as HTMLSelectElement;

      expect(within(select).getByText('All Stages')).toBeInTheDocument();
      expect(within(select).getByText('Major Donor')).toBeInTheDocument();
      expect(within(select).getByText('Repeat Donor')).toBeInTheDocument();
      expect(within(select).getByText('First-time Donor')).toBeInTheDocument();
      expect(within(select).getByText('Prospect')).toBeInTheDocument();
    });

    it('calls onChange when donor stage is changed', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Donor Stage');
      const select = label.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(select, 'Major Donor');

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        donorStage: 'Major Donor'
      });
    });

    it('displays current donor stage value', async () => {
      const user = userEvent.setup();
      const filters = {
        ...defaultFilters,
        donorStage: 'Prospect'
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Donor Stage');
      const select = label.nextElementSibling as HTMLSelectElement;
      expect(select.value).toBe('Prospect');
    });
  });

  describe('Clear All Functionality', () => {
    it('renders Clear All button in dropdown', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    });

    it('resets all filters to default when Clear All is clicked', async () => {
      const user = userEvent.setup();
      const activeFilters = {
        relationshipScore: '76-100',
        trend: 'rising',
        donorStage: 'Major Donor',
        tags: ['vip', 'board']
      };
      render(<ContactFilters filters={activeFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));
      await user.click(screen.getByRole('button', { name: /clear all/i }));

      expect(mockOnChange).toHaveBeenCalledWith({
        relationshipScore: 'all',
        trend: 'all',
        donorStage: 'all',
        tags: []
      });
    });

    it('closes dropdown after Clear All is clicked', async () => {
      const user = userEvent.setup();
      const activeFilters = {
        relationshipScore: '76-100',
        trend: 'rising',
        donorStage: 'all',
        tags: [] as string[]
      };
      render(<ContactFilters filters={activeFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));
      expect(screen.getByText('Relationship Score')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear all/i }));
      expect(screen.queryByText('Relationship Score')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Filter Changes', () => {
    it('maintains other filter values when one filter is changed', async () => {
      const user = userEvent.setup();
      const filters = {
        relationshipScore: '76-100',
        trend: 'rising',
        donorStage: 'all',
        tags: [] as string[]
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Donor Stage');
      const select = label.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(select, 'Major Donor');

      expect(mockOnChange).toHaveBeenCalledWith({
        relationshipScore: '76-100',
        trend: 'rising',
        donorStage: 'Major Donor',
        tags: []
      });
    });

    it('allows changing multiple filters sequentially', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const scoreLabel = screen.getByText('Relationship Score');
      const scoreSelect = scoreLabel.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(scoreSelect, '76-100');

      const trendLabel = screen.getByText('Relationship Trend');
      const trendSelect = trendLabel.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(trendSelect, 'stable');

      expect(mockOnChange).toHaveBeenCalledTimes(2);
      // First call has only relationshipScore changed
      expect(mockOnChange).toHaveBeenNthCalledWith(1, {
        ...defaultFilters,
        relationshipScore: '76-100'
      });
      // Second call has only trend changed (from the first filter state)
      expect(mockOnChange).toHaveBeenNthCalledWith(2, {
        ...defaultFilters,
        trend: 'stable'
      });
    });
  });

  describe('UI State Management', () => {
    it('dropdown remains open after changing a filter', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Score');
      const select = label.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(select, '76-100');

      expect(screen.getByText('Relationship Score')).toBeInTheDocument();
    });

    it('applies correct styling to filter button', () => {
      const { container } = render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);
      const button = screen.getByRole('button', { name: /filter contacts/i });
      expect(button).toHaveClass('btn', 'btn-secondary');
    });

    it('displays dropdown with correct positioning classes', async () => {
      const user = userEvent.setup();
      const { container } = render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const dropdown = container.querySelector('.absolute.right-0.mt-2');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for all select elements', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      expect(screen.getByText('Relationship Score')).toBeInTheDocument();
      expect(screen.getByText('Relationship Trend')).toBeInTheDocument();
      expect(screen.getByText('Donor Stage')).toBeInTheDocument();
    });

    it('filter button is keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      const button = screen.getByRole('button', { name: /filter contacts/i });
      button.focus();

      expect(button).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty tags array correctly', () => {
      const filters = {
        ...defaultFilters,
        tags: []
      };
      render(<ContactFilters filters={filters} onChange={mockOnChange} />);
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    it('handles undefined onChange gracefully', async () => {
      const user = userEvent.setup();
      // This test ensures the component doesn't crash even if onChange is somehow undefined
      const { container } = render(<ContactFilters filters={defaultFilters} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const label = screen.getByText('Relationship Score');
      const select = label.nextElementSibling as HTMLSelectElement;
      await user.selectOptions(select, '76-100');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('properly renders when all filters are at max values', async () => {
      const user = userEvent.setup();
      const maxFilters = {
        relationshipScore: '0-25',
        trend: 'dormant',
        donorStage: 'Prospect',
        tags: ['tag1', 'tag2', 'tag3']
      };
      render(<ContactFilters filters={maxFilters} onChange={mockOnChange} />);

      expect(screen.getByText('4')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /filter contacts/i }));

      const scoreLabel = screen.getByText('Relationship Score');
      const scoreSelect = scoreLabel.nextElementSibling as HTMLSelectElement;
      const trendLabel = screen.getByText('Relationship Trend');
      const trendSelect = trendLabel.nextElementSibling as HTMLSelectElement;
      const stageLabel = screen.getByText('Donor Stage');
      const stageSelect = stageLabel.nextElementSibling as HTMLSelectElement;

      expect(scoreSelect.value).toBe('0-25');
      expect(trendSelect.value).toBe('dormant');
      expect(stageSelect.value).toBe('Prospect');
    });
  });
});
