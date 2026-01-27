import React from 'react';
import { render, screen } from '@testing-library/react';
import { RelationshipScoreCircle } from '../RelationshipScoreCircle';

describe('RelationshipScoreCircle', () => {
  describe('Rendering', () => {
    it('renders score number', () => {
      render(<RelationshipScoreCircle score={75} />);
      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('renders score label for strong score', () => {
      render(<RelationshipScoreCircle score={90} />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('renders score label for good score', () => {
      render(<RelationshipScoreCircle score={75} />);
      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('renders score label for moderate score', () => {
      render(<RelationshipScoreCircle score={55} />);
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('renders score label for at-risk score', () => {
      render(<RelationshipScoreCircle score={35} />);
      expect(screen.getByText('At-risk')).toBeInTheDocument();
    });

    it('renders score label for dormant score', () => {
      render(<RelationshipScoreCircle score={15} />);
      expect(screen.getByText('Dormant')).toBeInTheDocument();
    });

    it('renders SVG elements', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders two circles (background and progress)', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });
  });

  describe('Score Color Mapping', () => {
    it('applies green color for score >= 85', () => {
      const { container } = render(<RelationshipScoreCircle score={85} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-green-500');
    });

    it('applies green color for score 100', () => {
      const { container } = render(<RelationshipScoreCircle score={100} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-green-500');
    });

    it('applies blue color for score >= 70 and < 85', () => {
      const { container } = render(<RelationshipScoreCircle score={70} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-blue-500');
    });

    it('applies blue color for score 80', () => {
      const { container } = render(<RelationshipScoreCircle score={80} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-blue-500');
    });

    it('applies amber color for score >= 50 and < 70', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-amber-500');
    });

    it('applies amber color for score 60', () => {
      const { container } = render(<RelationshipScoreCircle score={60} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-amber-500');
    });

    it('applies orange color for score >= 30 and < 50', () => {
      const { container } = render(<RelationshipScoreCircle score={30} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-orange-500');
    });

    it('applies orange color for score 40', () => {
      const { container } = render(<RelationshipScoreCircle score={40} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-orange-500');
    });

    it('applies red color for score < 30', () => {
      const { container } = render(<RelationshipScoreCircle score={20} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-red-500');
    });

    it('applies red color for score 0', () => {
      const { container } = render(<RelationshipScoreCircle score={0} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('text-red-500');
    });
  });

  describe('Size Variants', () => {
    it('renders small size by default when size prop omitted', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '80');
      expect(svg).toHaveAttribute('height', '80');
    });

    it('renders small size variant', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '60');
      expect(svg).toHaveAttribute('height', '60');
    });

    it('renders medium size variant', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="md" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '80');
      expect(svg).toHaveAttribute('height', '80');
    });

    it('renders large size variant', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });

    it('applies correct font size for small variant', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="sm" />);
      const scoreText = container.querySelector('.text-lg');
      expect(scoreText).toBeInTheDocument();
    });

    it('applies correct font size for medium variant', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="md" />);
      const scoreText = container.querySelector('.text-2xl');
      expect(scoreText).toBeInTheDocument();
    });

    it('applies correct font size for large variant', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="lg" />);
      const scoreText = container.querySelector('.text-4xl');
      expect(scoreText).toBeInTheDocument();
    });
  });

  describe('SVG Properties', () => {
    it('applies transform rotation to SVG', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const svg = container.querySelector('svg');
      const classAttr = svg?.getAttribute('class') || '';
      expect(classAttr).toContain('-rotate-90');
    });

    it('applies transition to progress circle', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const classAttr = progressCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('transition-all');
    });

    it('applies rounded line cap to progress circle', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveAttribute('stroke-linecap', 'round');
    });

    it('sets correct stroke width for small size', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="sm" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '4');
    });

    it('sets correct stroke width for medium size', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="md" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '6');
    });

    it('sets correct stroke width for large size', () => {
      const { container } = render(<RelationshipScoreCircle score={50} size="lg" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('stroke-width', '8');
    });
  });

  describe('Score Label Boundary Tests', () => {
    it('shows "Strong" for boundary score 85', () => {
      render(<RelationshipScoreCircle score={85} />);
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('shows "Good" for boundary score 70', () => {
      render(<RelationshipScoreCircle score={70} />);
      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('shows "Good" for score 84', () => {
      render(<RelationshipScoreCircle score={84} />);
      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('shows "Moderate" for boundary score 50', () => {
      render(<RelationshipScoreCircle score={50} />);
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('shows "Moderate" for score 69', () => {
      render(<RelationshipScoreCircle score={69} />);
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('shows "At-risk" for boundary score 30', () => {
      render(<RelationshipScoreCircle score={30} />);
      expect(screen.getByText('At-risk')).toBeInTheDocument();
    });

    it('shows "At-risk" for score 49', () => {
      render(<RelationshipScoreCircle score={49} />);
      expect(screen.getByText('At-risk')).toBeInTheDocument();
    });

    it('shows "Dormant" for score 29', () => {
      render(<RelationshipScoreCircle score={29} />);
      expect(screen.getByText('Dormant')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles score of 0 correctly', () => {
      render(<RelationshipScoreCircle score={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Dormant')).toBeInTheDocument();
    });

    it('handles score of 100 correctly', () => {
      render(<RelationshipScoreCircle score={100} />);
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('handles very low negative score', () => {
      render(<RelationshipScoreCircle score={-10} />);
      expect(screen.getByText('-10')).toBeInTheDocument();
    });

    it('handles score above 100', () => {
      render(<RelationshipScoreCircle score={150} />);
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies relative positioning to container', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('relative');
    });

    it('applies inline-flex to container', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('inline-flex');
    });

    it('centers content in container', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('items-center');
      expect(wrapper.className).toContain('justify-center');
    });

    it('applies absolute positioning to score text overlay', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const textOverlay = container.querySelector('.absolute');
      expect(textOverlay).toBeInTheDocument();
    });

    it('applies bold font weight to score number', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const scoreNumber = screen.getByText('50');
      expect(scoreNumber.className).toContain('font-bold');
    });

    it('applies dark mode classes to background circle', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const backgroundCircle = container.querySelectorAll('circle')[0];
      const classAttr = backgroundCircle?.getAttribute('class') || '';
      expect(classAttr).toContain('dark:text-gray-700');
    });

    it('applies dark mode classes to score text', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const scoreText = screen.getByText('50');
      expect(scoreText.className).toContain('dark:text-white');
    });

    it('applies dark mode classes to label text', () => {
      const { container } = render(<RelationshipScoreCircle score={50} />);
      const label = screen.getByText('Moderate');
      expect(label.className).toContain('dark:text-gray-400');
    });
  });
});
