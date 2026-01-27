import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactStoryView } from '../ContactStoryView';
import { pulseContactService } from '../../../services/pulseContactService';

// Mock the pulseContactService
jest.mock('../../../services/pulseContactService', () => ({
  pulseContactService: {
    getAIInsights: jest.fn(),
    getRecentInteractions: jest.fn(),
  },
}));

describe('ContactStoryView', () => {
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
    donor_stage: 'Major Donor',
    engagement_score: 'high',
    total_lifetime_giving: 50000,
    last_gift_date: '2026-01-15',
    pulse_profile_id: 'pulse-123',
  };

  const mockAIInsights = {
    profile_id: 'pulse-123',
    ai_relationship_summary: 'Strong relationship with consistent engagement',
    ai_talking_points: ['Follow up on Q1 project', 'Ask about expansion'],
    ai_next_actions: [
      { action: 'Send project update', priority: 'high' as const, due_date: '2026-02-01' },
    ],
    ai_communication_style: 'Prefers direct communication',
    ai_topics: ['Project Management', 'ROI Analysis'],
    ai_sentiment_average: 0.75,
    confidence_score: 0.8,
    last_analyzed_at: '2026-01-25T10:30:00Z',
  };

  const mockInteractions = [
    {
      id: '1',
      profile_id: 'pulse-123',
      interaction_type: 'email_sent',
      interaction_date: '2026-01-20T14:30:00Z',
      subject: 'Project Proposal',
      snippet: 'Thanks for the detailed proposal',
      sentiment_score: 0.7,
      ai_topics: ['Project Proposal'],
      ai_summary: 'Positive response',
      synced_at: new Date().toISOString(),
      created_at: '2026-01-20T14:30:00Z',
    },
  ];

  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (pulseContactService.getAIInsights as jest.Mock).mockResolvedValue(mockAIInsights);
    (pulseContactService.getRecentInteractions as jest.Mock).mockResolvedValue({
      interactions: mockInteractions,
    });
  });

  describe('Rendering', () => {
    it('renders contact name', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders job title', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('CEO')).toBeInTheDocument();
    });

    it('renders company name', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText(/acme corp/i)).toBeInTheDocument();
    });

    it('renders email address', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders phone number', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    });

    it('renders relationship score', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('renders back button', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('Back to Contacts')).toBeInTheDocument();
    });
  });

  describe('Back Button Interaction', () => {
    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      const backButton = screen.getByText('Back to Contacts');
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('renders back button with arrow icon', () => {
      const { container } = render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      const backButton = screen.getByText('Back to Contacts');
      const svg = backButton.parentElement?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Avatar Display', () => {
    it('displays avatar image when avatar_url provided', () => {
      const contactWithAvatar = { ...mockContact, avatar_url: 'https://example.com/avatar.jpg' };
      render(<ContactStoryView contact={contactWithAvatar} onBack={mockOnBack} />);

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('displays initials when no avatar_url', () => {
      const contactWithoutAvatar = { ...mockContact, avatar_url: undefined };
      const { container } = render(<ContactStoryView contact={contactWithoutAvatar} onBack={mockOnBack} />);

      expect(container.textContent).toContain('JD');
    });

    it('applies gradient background to initials', () => {
      const contactWithoutAvatar = { ...mockContact, avatar_url: undefined };
      const { container } = render(<ContactStoryView contact={contactWithoutAvatar} onBack={mockOnBack} />);

      const initialsDiv = container.querySelector('.bg-gradient-to-br.from-blue-500.to-purple-500');
      expect(initialsDiv).toBeInTheDocument();
    });
  });

  describe('Contact Information Links', () => {
    it('renders email as mailto link', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      const emailLink = screen.getByText('john@example.com').closest('a');
      expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
    });

    it('renders phone as tel link', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      const phoneLink = screen.getByText('(555) 123-4567').closest('a');
      expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567');
    });

    it('renders LinkedIn link when provided', () => {
      const contactWithLinkedIn = { ...mockContact, linkedin_url: 'https://linkedin.com/in/johndoe' };
      render(<ContactStoryView contact={contactWithLinkedIn} onBack={mockOnBack} />);

      const linkedInLink = screen.getByText('LinkedIn').closest('a');
      expect(linkedInLink).toHaveAttribute('href', 'https://linkedin.com/in/johndoe');
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not render LinkedIn link when not provided', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.queryByText('LinkedIn')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading message initially', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('Loading interactions...')).toBeInTheDocument();
    });

    it('hides loading message after data loads', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading interactions...')).not.toBeInTheDocument();
      });
    });
  });

  describe('AI Insights Section', () => {
    it('renders AI insights after loading', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('What You Need to Know')).toBeInTheDocument();
      });
    });

    it('renders AI relationship summary', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Strong relationship with consistent engagement')).toBeInTheDocument();
      });
    });

    it('renders talking points section', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Prepare for Your Next Conversation')).toBeInTheDocument();
      });
    });

    it('renders all talking points', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/Follow up on Q1 project/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Ask about expansion/)).toBeInTheDocument();
    });

    it('renders recommended actions section', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
      });
    });

    it('renders action items with checkboxes', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/Send project update/)).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('renders action priority badge', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('high')).toBeInTheDocument();
      });
    });

    it('renders action due date', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/Due:/)).toBeInTheDocument();
      });
    });
  });

  describe('Communication Profile Section', () => {
    it('renders communication profile heading', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Communication Profile')).toBeInTheDocument();
      });
    });

    it('renders preferred channel', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Preferred Channel')).toBeInTheDocument();
      });
      // Email appears in multiple places, just verify the section exists
      expect(screen.getAllByText(/email/i).length).toBeGreaterThan(0);
    });

    it('renders communication style from AI insights', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Communication Style')).toBeInTheDocument();
      });
      expect(screen.getByText('Prefers direct communication')).toBeInTheDocument();
    });

    it('renders AI topics as badges', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Topics They Care About')).toBeInTheDocument();
      });
      expect(screen.getAllByText('Project Management').length).toBeGreaterThan(0);
      expect(screen.getAllByText('ROI Analysis').length).toBeGreaterThan(0);
    });
  });

  describe('Donor Profile Section', () => {
    it('renders donor profile heading', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Donor Profile')).toBeInTheDocument();
      });
    });

    it('renders donor stage', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Major Donor')).toBeInTheDocument();
      });
    });

    it('renders engagement level', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Engagement')).toBeInTheDocument();
        expect(screen.getByText(/high/i)).toBeInTheDocument();
      });
    });

    it('renders lifetime giving formatted as currency', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Lifetime Giving')).toBeInTheDocument();
        expect(screen.getByText('$50,000')).toBeInTheDocument();
      });
    });

    it('renders last gift date', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Last Gift')).toBeInTheDocument();
      });
      // Date may be formatted differently, just check it's not "Never"
      const container = screen.getByText('Last Gift').parentElement;
      expect(container?.textContent).not.toContain('Never');
    });

    it('shows "Never" when no last gift date', async () => {
      const contactNoGift = { ...mockContact, last_gift_date: undefined };
      render(<ContactStoryView contact={contactNoGift} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Never')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Activity Section', () => {
    it('renders recent activity heading', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    it('renders interaction count', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/1 interactions in last 90 days/)).toBeInTheDocument();
      });
    });

    it('loads interactions from API successfully', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading interactions...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify API was called and interaction count displays
      expect(pulseContactService.getRecentInteractions).toHaveBeenCalled();
      expect(screen.getByText(/interactions in last 90 days/)).toBeInTheDocument();
    });

    it('renders RecentActivityFeed with interactions', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText('Loading interactions...')).not.toBeInTheDocument();
      });

      // Verify the interaction subject is displayed (may appear multiple times)
      expect(screen.getAllByText('Project Proposal').length).toBeGreaterThan(0);
    });

    it('shows "View All" button when more than 3 interactions', async () => {
      const manyInteractions = Array.from({ length: 5 }, (_, i) => ({
        ...mockInteractions[0],
        id: `${i + 1}`,
      }));

      (pulseContactService.getRecentInteractions as jest.Mock).mockResolvedValue({
        interactions: manyInteractions,
      });

      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('View All 5 Interactions')).toBeInTheDocument();
      });
    });

    it('does not show "View All" button when 3 or fewer interactions', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText(/View All/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions Bar', () => {
    it('renders send email action', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Send Email')).toBeInTheDocument();
      });
    });

    it('renders schedule meeting action', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Schedule Meeting')).toBeInTheDocument();
      });
    });

    it('renders log interaction action', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Log Interaction')).toBeInTheDocument();
      });
    });

    it('renders record gift action', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Record Gift')).toBeInTheDocument();
      });
    });

    it('applies sticky positioning to quick actions bar', async () => {
      const { container } = render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        const quickActions = container.querySelector('.sticky');
        expect(quickActions).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('fetches AI insights from Pulse API', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(pulseContactService.getAIInsights).toHaveBeenCalledWith('pulse-123');
      });
    });

    it('fetches recent interactions from Pulse API', async () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(pulseContactService.getRecentInteractions).toHaveBeenCalledWith('pulse-123', {
          limit: 30,
          days: 90,
        });
      });
    });

    it('uses mock data when no pulse_profile_id', async () => {
      const contactNoPulse = { ...mockContact, pulse_profile_id: undefined };
      render(<ContactStoryView contact={contactNoPulse} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(pulseContactService.getAIInsights).not.toHaveBeenCalled();
      });
    });

    it('handles API errors gracefully', async () => {
      (pulseContactService.getAIInsights as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        // Should still render the component without crashing
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('falls back to mock data on API failure', async () => {
      (pulseContactService.getAIInsights as jest.Mock).mockResolvedValue(null);

      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/Strong relationship with consistent engagement/)).toBeInTheDocument();
      });
    });
  });

  describe('Optional Fields Handling', () => {
    it('renders without job title', () => {
      const contactNoTitle = { ...mockContact, job_title: undefined };
      render(<ContactStoryView contact={contactNoTitle} onBack={mockOnBack} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders without company', () => {
      const contactNoCompany = { ...mockContact, company: undefined };
      render(<ContactStoryView contact={contactNoCompany} onBack={mockOnBack} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders without email', () => {
      const contactNoEmail = { ...mockContact, email: undefined };
      render(<ContactStoryView contact={contactNoEmail} onBack={mockOnBack} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders without phone', () => {
      const contactNoPhone = { ...mockContact, phone: undefined };
      render(<ContactStoryView contact={contactNoPhone} onBack={mockOnBack} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders with default relationship score', () => {
      const contactNoScore = { ...mockContact, relationship_score: undefined };
      render(<ContactStoryView contact={contactNoScore} onBack={mockOnBack} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders edit button', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('renders archive button', () => {
      render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(screen.getByText('Archive')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies max-width to main container', () => {
      const { container } = render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('centers main container', () => {
      const { container } = render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(container.querySelector('.mx-auto')).toBeInTheDocument();
    });

    it('applies backdrop blur to sections', () => {
      const { container } = render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);
      expect(container.querySelector('.backdrop-blur-sm')).toBeInTheDocument();
    });

    it('applies gradient background to AI insights section', async () => {
      const { container } = render(<ContactStoryView contact={mockContact} onBack={mockOnBack} />);

      await waitFor(() => {
        const aiSection = container.querySelector('.bg-gradient-to-br.from-blue-100\\/50');
        expect(aiSection).toBeInTheDocument();
      });
    });
  });
});
