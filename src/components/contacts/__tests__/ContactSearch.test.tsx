import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactSearch } from '../ContactSearch';

describe('ContactSearch', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('Search by name, email, or company...')).toBeInTheDocument();
    });

    it('displays search icon', () => {
      const { container } = render(<ContactSearch value="" onChange={mockOnChange} />);
      const searchIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it('does not show clear button when value is empty', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('shows clear button when value is not empty', () => {
      render(<ContactSearch value="John" onChange={mockOnChange} />);
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Search Input Handling', () => {
    it('calls onChange when typing in search input', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'John');

      expect(mockOnChange).toHaveBeenCalledTimes(4); // Once per character
      // Each character is typed sequentially: J, o, h, n
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'J');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'o');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'h');
      expect(mockOnChange).toHaveBeenNthCalledWith(4, 'n');
    });

    it('displays the provided value', () => {
      render(<ContactSearch value="Jane Doe" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('Jane Doe');
    });

    it('updates value when typing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Test');

      // Simulate parent component updating the value
      rerender(<ContactSearch value="Test" onChange={mockOnChange} />);

      expect((input as HTMLInputElement).value).toBe('Test');
    });

    it('handles rapid typing correctly', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Quick search test');

      expect(mockOnChange).toHaveBeenCalled();
      // userEvent.type() types one character at a time
      // Verify it was called for each character
      expect(mockOnChange.mock.calls.length).toBe('Quick search test'.length);
    });
  });

  describe('Clear Button Functionality', () => {
    it('calls onChange with empty string when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="Search term" onChange={mockOnChange} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('clears the input field when clear button is clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContactSearch value="Search term" onChange={mockOnChange} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      // Simulate parent clearing the value
      rerender(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('hides clear button after clearing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContactSearch value="Test" onChange={mockOnChange} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      rerender(<ContactSearch value="" onChange={mockOnChange} />);

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('shows clear button with X icon', () => {
      const { container } = render(<ContactSearch value="Test" onChange={mockOnChange} />);
      const clearButton = screen.getByLabelText('Clear search');
      const icon = clearButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible label for search input', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      expect(screen.getByLabelText('Search contacts by name, email, or company')).toBeInTheDocument();
    });

    it('has sr-only label for screen readers', () => {
      const { container } = render(<ContactSearch value="" onChange={mockOnChange} />);
      const label = container.querySelector('.sr-only');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Search contacts by name, email, or company');
    });

    it('search icon has aria-hidden attribute', () => {
      const { container } = render(<ContactSearch value="" onChange={mockOnChange} />);
      const searchIcon = container.querySelector('svg[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it('clear button has accessible label', () => {
      render(<ContactSearch value="Test" onChange={mockOnChange} />);
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });

    it('input has correct type attribute', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('input has autocomplete off', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('autoComplete', 'off');
    });

    it('input has proper id attribute', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('id', 'contact-search');
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct base styling classes', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveClass('pl-10', 'pr-4', 'py-2');
    });

    it('search icon is positioned on the left', () => {
      const { container } = render(<ContactSearch value="" onChange={mockOnChange} />);
      const iconWrapper = container.querySelector('.absolute.inset-y-0.left-0');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('clear button is positioned on the right', () => {
      const { container } = render(<ContactSearch value="Test" onChange={mockOnChange} />);
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveClass('absolute', 'inset-y-0', 'right-0');
    });

    it('has focus styling classes', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox');
      expect(input.className).toContain('focus:outline-none');
      expect(input.className).toContain('focus:ring-2');
      expect(input.className).toContain('focus:ring-blue-500');
    });

    it('has dark mode styling classes', () => {
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const input = screen.getByRole('searchbox');
      expect(input.className).toContain('dark:bg-gray-800');
      expect(input.className).toContain('dark:text-white');
    });
  });

  describe('User Interactions', () => {
    it('focuses input when clicked', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.click(input);

      expect(input).toHaveFocus();
    });

    it('allows tabbing to the input', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('allows tabbing to clear button when present', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ContactSearch value="Test" onChange={mockOnChange} />
          <button>Next Element</button>
        </div>
      );

      const input = screen.getByRole('searchbox');
      await user.click(input);
      await user.tab();

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveFocus();
    });

    it('shows hover effect on clear button', () => {
      render(<ContactSearch value="Test" onChange={mockOnChange} />);
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton.className).toContain('hover:text-gray-600');
      expect(clearButton.className).toContain('dark:hover:text-gray-300');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long search terms', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(200);
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, longText);

      expect(mockOnChange).toHaveBeenCalled();
      // Verify onChange was called for each character
      expect(mockOnChange).toHaveBeenCalledTimes(200);
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '@#$%^&*()');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles emoji in search', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '😀');

      // Emoji may be typed as multiple events in userEvent
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('handles whitespace-only search', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '   ');

      expect(mockOnChange).toHaveBeenCalled();

      // Simulate parent component updating with whitespace value
      rerender(<ContactSearch value="   " onChange={mockOnChange} />);
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('handles rapid clear button clicks', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="Test" onChange={mockOnChange} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);
      await user.click(clearButton);
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('maintains cursor position during typing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox') as HTMLInputElement;
      await user.type(input, 'Hello');

      rerender(<ContactSearch value="Hello" onChange={mockOnChange} />);

      expect(input.value).toBe('Hello');
      expect(input.selectionStart).toBe(5);
    });

    it('handles paste events', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.click(input);
      await user.paste('Pasted content');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Query Handling', () => {
    it('accepts single character search', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'J');

      expect(mockOnChange).toHaveBeenCalledWith('J');
    });

    it('accepts multi-word search', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'John Doe Company');

      expect(mockOnChange).toHaveBeenCalled();
      // userEvent.type() calls onChange for each character
      // Last call should be 'y' (last character of 'Company')
      // To verify the full string was typed, check number of calls
      expect(mockOnChange).toHaveBeenCalledTimes('John Doe Company'.length);
    });

    it('accepts email-like patterns', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'john@example.com');

      expect(mockOnChange).toHaveBeenCalled();
      // Verify all characters were typed
      expect(mockOnChange).toHaveBeenCalledTimes('john@example.com'.length);
    });

    it('accepts phone number patterns', async () => {
      const user = userEvent.setup();
      render(<ContactSearch value="" onChange={mockOnChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '(555) 123-4567');

      expect(mockOnChange).toHaveBeenCalled();
      // Verify all characters were typed
      expect(mockOnChange).toHaveBeenCalledTimes('(555) 123-4567'.length);
    });
  });

  describe('Performance', () => {
    it('renders quickly with empty value', () => {
      const startTime = performance.now();
      render(<ContactSearch value="" onChange={mockOnChange} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('renders quickly with populated value', () => {
      const startTime = performance.now();
      render(<ContactSearch value="Long search term with multiple words" onChange={mockOnChange} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
