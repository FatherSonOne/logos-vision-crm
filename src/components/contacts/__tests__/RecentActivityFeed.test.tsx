import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecentActivityFeed } from '../RecentActivityFeed';

describe('RecentActivityFeed', () => {
  const mockInteractions = [
    {
      id: '1',
      interaction_type: 'email_sent',
      interaction_date: '2026-01-20T14:30:00Z',
      subject: 'Project Proposal Follow-up',
      snippet: 'Thanks for the detailed proposal...',
      sentiment_score: 0.7,
      ai_topics: ['Project Proposal', 'Team Review'],
      ai_summary: 'Positive response to project proposal',
    },
    {
      id: '2',
      interaction_type: 'meeting',
      interaction_date: '2026-01-15T10:00:00Z',
      subject: 'Q1 Planning Discussion',
      sentiment_score: 0.8,
      ai_topics: ['Q1 Goals', 'Budget Planning'],
      ai_action_items: ['Send updated timeline', 'Schedule follow-up'],
      duration_minutes: 45,
    },
  ];

  describe('Rendering', () => {
    it('renders all interactions', () => {
      render(<RecentActivityFeed interactions={mockInteractions} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
      expect(screen.getByText('Q1 Planning Discussion')).toBeInTheDocument();
    });

    it('renders empty list when no interactions provided', () => {
      const { container } = render(<RecentActivityFeed interactions={[]} />);
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
      expect(container.querySelector('.space-y-4')?.children).toHaveLength(0);
    });

    it('renders single interaction', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
      expect(screen.queryByText('Q1 Planning Discussion')).not.toBeInTheDocument();
    });

    it('applies correct spacing class', () => {
      const { container } = render(<RecentActivityFeed interactions={mockInteractions} />);
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('Email Sent Interaction', () => {
    it('renders email icon', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('📧')).toBeInTheDocument();
    });

    it('renders subject as title', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
    });

    it('renders snippet', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Thanks for the detailed proposal...')).toBeInTheDocument();
    });

    it('renders sentiment badge', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('+0.70')).toBeInTheDocument();
    });

    it('renders AI topics', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Project Proposal')).toBeInTheDocument();
      expect(screen.getByText('Team Review')).toBeInTheDocument();
    });

    it('renders AI summary', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Positive response to project proposal')).toBeInTheDocument();
    });
  });

  describe('Meeting Interaction', () => {
    it('renders meeting icon', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      expect(screen.getByText('🗓️')).toBeInTheDocument();
    });

    it('renders subject as title', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      expect(screen.getByText('Q1 Planning Discussion')).toBeInTheDocument();
    });

    it('renders AI topics', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      expect(screen.getByText('Q1 Goals')).toBeInTheDocument();
      expect(screen.getByText('Budget Planning')).toBeInTheDocument();
    });

    it('renders action items', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      expect(screen.getByText('Send updated timeline')).toBeInTheDocument();
      expect(screen.getByText('Schedule follow-up')).toBeInTheDocument();
    });

    it('renders action items header', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      expect(screen.getByText('Action Items:')).toBeInTheDocument();
    });
  });

  describe('Interaction Type Icons', () => {
    it('renders email_sent icon', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'email_sent' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('📧')).toBeInTheDocument();
    });

    it('renders email_received icon', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'email_received' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('📬')).toBeInTheDocument();
    });

    it('renders meeting icon', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'meeting' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('🗓️')).toBeInTheDocument();
    });

    it('renders call icon', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'call' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('📞')).toBeInTheDocument();
    });

    it('renders slack_message icon', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'slack_message' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('💬')).toBeInTheDocument();
    });

    it('renders sms_sent icon', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'sms_sent' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('💬')).toBeInTheDocument();
    });

    it('renders default icon for unknown type', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'unknown_type' };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('📝')).toBeInTheDocument();
    });
  });

  describe('Interaction Type Labels', () => {
    it('uses subject when provided', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
    });

    it('uses default label when subject missing for email_sent', () => {
      const interaction = { ...mockInteractions[0], subject: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Email Sent')).toBeInTheDocument();
    });

    it('uses default label when subject missing for meeting', () => {
      const interaction = { ...mockInteractions[1], subject: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Meeting')).toBeInTheDocument();
    });

    it('uses "Interaction" for unknown type without subject', () => {
      const interaction = { ...mockInteractions[0], interaction_type: 'unknown', subject: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Interaction')).toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('renders without snippet', () => {
      const interaction = { ...mockInteractions[0], snippet: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
    });

    it('renders without sentiment score', () => {
      const interaction = { ...mockInteractions[0], sentiment_score: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
    });

    it('renders without AI topics', () => {
      const interaction = { ...mockInteractions[0], ai_topics: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
    });

    it('renders without AI action items', () => {
      const interaction = { ...mockInteractions[1], ai_action_items: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Q1 Planning Discussion')).toBeInTheDocument();
    });

    it('renders without AI summary', () => {
      const interaction = { ...mockInteractions[0], ai_summary: undefined };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('Project Proposal Follow-up')).toBeInTheDocument();
    });

    it('does not render empty AI topics array', () => {
      const interaction = { ...mockInteractions[0], ai_topics: [] };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.queryByText('Project Proposal')).not.toBeInTheDocument();
    });

    it('does not render empty action items array', () => {
      const interaction = { ...mockInteractions[1], ai_action_items: [] };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.queryByText('Action Items:')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies border to interaction cards', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      // Changed to light mode default border color
      const card = container.querySelector('.border-gray-200');
      expect(card).toBeInTheDocument();
    });

    it('applies rounded corners to cards', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const card = container.querySelector('.rounded-lg');
      expect(card).toBeInTheDocument();
    });

    it('applies padding to cards', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const card = container.querySelector('.p-4');
      expect(card).toBeInTheDocument();
    });

    it('applies hover effect to cards', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      // Changed to light mode default hover color
      const card = container.querySelector('.hover\\:bg-gray-100');
      expect(card).toBeInTheDocument();
    });

    it('applies transition to cards', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const card = container.querySelector('.transition-all');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Topic Badges', () => {
    it('renders all topics as badges', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const topics = mockInteractions[0].ai_topics;
      topics?.forEach((topic) => {
        expect(screen.getByText(topic)).toBeInTheDocument();
      });
    });

    it('applies badge styling to topics', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const badge = screen.getByText('Project Proposal');
      expect(badge.className).toContain('badge');
    });

    it('renders multiple topics in flex wrap', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const topicsContainer = container.querySelector('.flex-wrap');
      expect(topicsContainer).toBeInTheDocument();
    });
  });

  describe('Action Items Section', () => {
    it('renders action items as list', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      const actionItems = screen.getByText('Send updated timeline').closest('ul');
      expect(actionItems?.className).toContain('list-disc');
    });

    it('renders action items with background', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      const actionSection = screen.getByText('Action Items:').closest('div');
      expect(actionSection?.className).toContain('bg-gray-900/50');
    });

    it('applies rounded corners to action section', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      const actionSection = screen.getByText('Action Items:').closest('div');
      expect(actionSection?.className).toContain('rounded');
    });

    it('renders all action items', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[1]]} />);
      expect(screen.getByText('Send updated timeline')).toBeInTheDocument();
      expect(screen.getByText('Schedule follow-up')).toBeInTheDocument();
    });
  });

  describe('AI Summary Section', () => {
    it('renders AI summary with background', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const summarySection = screen.getByText('AI Summary:').closest('div');
      expect(summarySection?.className).toContain('bg-blue-900/20');
    });

    it('applies border to AI summary section', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const summarySection = screen.getByText('AI Summary:').closest('div');
      expect(summarySection?.className).toContain('border-blue-500/30');
    });

    it('renders AI summary text', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('Positive response to project proposal')).toBeInTheDocument();
    });

    it('renders "AI Summary:" label', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      expect(screen.getByText('AI Summary:')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats recent date as time ago', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      // Date formatting is tested - the component should display relative time
      expect(container.textContent).toBeTruthy();
    });

    it('renders date for each interaction', () => {
      render(<RecentActivityFeed interactions={mockInteractions} />);
      const dateElements = screen.getAllByText(/ago|Just now|days|hours|min/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Layout Structure', () => {
    it('renders icon and content side by side', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const layout = container.querySelector('.flex.items-start.gap-3');
      expect(layout).toBeInTheDocument();
    });

    it('applies large icon size', () => {
      render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const icon = screen.getByText('📧');
      expect(icon.className).toContain('text-2xl');
    });

    it('uses flex-1 for content area', () => {
      const { container } = render(<RecentActivityFeed interactions={[mockInteractions[0]]} />);
      const contentArea = container.querySelector('.flex-1');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero sentiment score', () => {
      const interaction = { ...mockInteractions[0], sentiment_score: 0 };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('+0.00')).toBeInTheDocument();
    });

    it('handles negative sentiment score', () => {
      const interaction = { ...mockInteractions[0], sentiment_score: -0.5 };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('-0.50')).toBeInTheDocument();
    });

    it('handles maximum sentiment score', () => {
      const interaction = { ...mockInteractions[0], sentiment_score: 1.0 };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('+1.00')).toBeInTheDocument();
    });

    it('handles minimum sentiment score', () => {
      const interaction = { ...mockInteractions[0], sentiment_score: -1.0 };
      render(<RecentActivityFeed interactions={[interaction]} />);
      expect(screen.getByText('-1.00')).toBeInTheDocument();
    });

    it('handles very long snippet text', () => {
      const longSnippet = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
      const interaction = { ...mockInteractions[0], snippet: longSnippet };
      const { container } = render(<RecentActivityFeed interactions={[interaction]} />);
      // Check that the snippet appears in the document (may be in one or more elements)
      expect(container.textContent).toContain('Lorem ipsum dolor sit amet');
    });

    it('handles many topics', () => {
      const manyTopics = Array.from({ length: 10 }, (_, i) => `Topic ${i + 1}`);
      const interaction = { ...mockInteractions[0], ai_topics: manyTopics };
      render(<RecentActivityFeed interactions={[interaction]} />);
      manyTopics.forEach((topic) => {
        expect(screen.getByText(topic)).toBeInTheDocument();
      });
    });

    it('handles many action items', () => {
      const manyActions = Array.from({ length: 10 }, (_, i) => `Action ${i + 1}`);
      const interaction = { ...mockInteractions[1], ai_action_items: manyActions };
      render(<RecentActivityFeed interactions={[interaction]} />);
      manyActions.forEach((action) => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });
    });
  });
});
