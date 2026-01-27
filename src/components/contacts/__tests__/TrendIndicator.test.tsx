import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrendIndicator } from '../TrendIndicator';

describe('TrendIndicator', () => {
  describe('Rendering', () => {
    it('renders nothing when no trend provided', () => {
      const { container } = render(<TrendIndicator />);
      expect(container.firstChild).toBeNull();
    });

    it('renders rising trend with correct icon and label', () => {
      render(<TrendIndicator trend="rising" />);
      expect(screen.getByText('↗')).toBeInTheDocument();
      expect(screen.getByText('Rising')).toBeInTheDocument();
    });

    it('renders stable trend with correct icon and label', () => {
      render(<TrendIndicator trend="stable" />);
      expect(screen.getByText('━')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('renders falling trend with correct icon and label', () => {
      render(<TrendIndicator trend="falling" />);
      expect(screen.getByText('↘')).toBeInTheDocument();
      expect(screen.getByText('Falling')).toBeInTheDocument();
    });

    it('renders new trend with correct icon and label', () => {
      render(<TrendIndicator trend="new" />);
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders dormant trend with correct icon and label', () => {
      render(<TrendIndicator trend="dormant" />);
      expect(screen.getByText('💤')).toBeInTheDocument();
      expect(screen.getByText('Dormant')).toBeInTheDocument();
    });
  });

  describe('Rising Trend Styling', () => {
    it('applies green text color for rising trend', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const icon = screen.getByText('↗');
      expect(icon.className).toContain('text-green-600');
    });

    it('applies green background for rising trend', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-green-200/60');
    });

    it('applies dark mode green styles for rising trend', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const icon = screen.getByText('↗');
      expect(icon.className).toContain('dark:text-green-400');
    });

    it('applies dark mode green background for rising trend', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-green-400/20');
    });
  });

  describe('Stable Trend Styling', () => {
    it('applies blue text color for stable trend', () => {
      const { container } = render(<TrendIndicator trend="stable" />);
      const icon = screen.getByText('━');
      expect(icon.className).toContain('text-blue-600');
    });

    it('applies blue background for stable trend', () => {
      const { container } = render(<TrendIndicator trend="stable" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-blue-200/60');
    });

    it('applies dark mode blue styles for stable trend', () => {
      const { container } = render(<TrendIndicator trend="stable" />);
      const icon = screen.getByText('━');
      expect(icon.className).toContain('dark:text-blue-400');
    });

    it('applies dark mode blue background for stable trend', () => {
      const { container } = render(<TrendIndicator trend="stable" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-blue-400/20');
    });
  });

  describe('Falling Trend Styling', () => {
    it('applies orange text color for falling trend', () => {
      const { container } = render(<TrendIndicator trend="falling" />);
      const icon = screen.getByText('↘');
      expect(icon.className).toContain('text-orange-600');
    });

    it('applies orange background for falling trend', () => {
      const { container } = render(<TrendIndicator trend="falling" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-orange-200/60');
    });

    it('applies dark mode orange styles for falling trend', () => {
      const { container } = render(<TrendIndicator trend="falling" />);
      const icon = screen.getByText('↘');
      expect(icon.className).toContain('dark:text-orange-400');
    });

    it('applies dark mode orange background for falling trend', () => {
      const { container } = render(<TrendIndicator trend="falling" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-orange-400/20');
    });
  });

  describe('New Trend Styling', () => {
    it('applies purple text color for new trend', () => {
      const { container } = render(<TrendIndicator trend="new" />);
      const icon = screen.getByText('✨');
      expect(icon.className).toContain('text-purple-600');
    });

    it('applies purple background for new trend', () => {
      const { container } = render(<TrendIndicator trend="new" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-purple-200/60');
    });

    it('applies dark mode purple styles for new trend', () => {
      const { container } = render(<TrendIndicator trend="new" />);
      const icon = screen.getByText('✨');
      expect(icon.className).toContain('dark:text-purple-400');
    });

    it('applies dark mode purple background for new trend', () => {
      const { container } = render(<TrendIndicator trend="new" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-purple-400/20');
    });
  });

  describe('Dormant Trend Styling', () => {
    it('applies gray text color for dormant trend', () => {
      const { container } = render(<TrendIndicator trend="dormant" />);
      const icon = screen.getByText('💤');
      expect(icon.className).toContain('text-gray-600');
    });

    it('applies gray background for dormant trend', () => {
      const { container } = render(<TrendIndicator trend="dormant" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-gray-200/60');
    });

    it('applies dark mode gray styles for dormant trend', () => {
      const { container } = render(<TrendIndicator trend="dormant" />);
      const icon = screen.getByText('💤');
      expect(icon.className).toContain('dark:text-gray-400');
    });

    it('applies dark mode gray background for dormant trend', () => {
      const { container } = render(<TrendIndicator trend="dormant" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-gray-400/20');
    });
  });

  describe('Custom className', () => {
    it('applies custom className prop', () => {
      const { container } = render(<TrendIndicator trend="rising" className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });

    it('preserves default classes when custom className added', () => {
      const { container } = render(<TrendIndicator trend="rising" className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('inline-flex');
      expect(wrapper.className).toContain('bg-green-200/60');
      expect(wrapper.className).toContain('custom-class');
    });

    it('applies empty className by default', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).not.toContain('undefined');
    });
  });

  describe('Layout and Structure', () => {
    it('applies inline-flex display', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('inline-flex');
    });

    it('applies items-center alignment', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('items-center');
    });

    it('applies gap between icon and label', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('gap-1.5');
    });

    it('applies horizontal padding', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('px-3');
    });

    it('applies vertical padding', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('py-1');
    });

    it('applies rounded-full border radius', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('rounded-full');
    });
  });

  describe('Icon Styling', () => {
    it('applies large text size to icon', () => {
      render(<TrendIndicator trend="rising" />);
      const icon = screen.getByText('↗');
      expect(icon.className).toContain('text-lg');
    });

    it('applies color class to icon', () => {
      render(<TrendIndicator trend="rising" />);
      const icon = screen.getByText('↗');
      expect(icon.className).toContain('text-green-600');
    });
  });

  describe('Label Styling', () => {
    it('applies small text size to label', () => {
      render(<TrendIndicator trend="rising" />);
      const label = screen.getByText('Rising');
      expect(label.className).toContain('text-sm');
    });

    it('applies font-medium to label', () => {
      render(<TrendIndicator trend="rising" />);
      const label = screen.getByText('Rising');
      expect(label.className).toContain('font-medium');
    });

    it('applies color class to label', () => {
      render(<TrendIndicator trend="rising" />);
      const label = screen.getByText('Rising');
      expect(label.className).toContain('text-green-600');
    });
  });

  describe('Accessibility', () => {
    it('renders icon and label in semantic structure', () => {
      const { container } = render(<TrendIndicator trend="rising" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
    });

    it('provides text content for screen readers', () => {
      render(<TrendIndicator trend="rising" />);
      expect(screen.getByText('Rising')).toBeInTheDocument();
    });

    it('combines icon and label for complete meaning', () => {
      render(<TrendIndicator trend="rising" />);
      expect(screen.getByText('↗')).toBeInTheDocument();
      expect(screen.getByText('Rising')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined trend gracefully', () => {
      const { container } = render(<TrendIndicator trend={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('handles null className gracefully', () => {
      const { container } = render(<TrendIndicator trend="rising" className="" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it('renders correctly when trend changes', () => {
      const { rerender } = render(<TrendIndicator trend="rising" />);
      expect(screen.getByText('Rising')).toBeInTheDocument();

      rerender(<TrendIndicator trend="falling" />);
      expect(screen.getByText('Falling')).toBeInTheDocument();
      expect(screen.queryByText('Rising')).not.toBeInTheDocument();
    });

    it('renders correctly when trend is removed', () => {
      const { rerender } = render(<TrendIndicator trend="rising" />);
      expect(screen.getByText('Rising')).toBeInTheDocument();

      rerender(<TrendIndicator />);
      expect(screen.queryByText('Rising')).not.toBeInTheDocument();
    });
  });
});
