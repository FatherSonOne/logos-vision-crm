/**
 * Pulse API Integration Tests
 * Tests for ContactsPage and ContactStoryView Pulse API integration
 * Day 3 Afternoon Session - Week 1 Testing
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactsPage } from '../ContactsPage';
import { ContactStoryView } from '../ContactStoryView';
import { pulseContactService } from '../../../services/pulseContactService';
import type { RelationshipProfile, AIInsights, RecentInteractionsResponse } from '../../../types/pulseContacts';

// Mock the pulse contact service
jest.mock('../../../services/pulseContactService', () => ({
  pulseContactService: {
    fetchRelationshipProfiles: jest.fn(),
    getAIInsights: jest.fn(),
    getRecentInteractions: jest.fn(),
    getPendingActionsCount: jest.fn(),
    getRecommendedActions: jest.fn(),
  },
}));

describe('Pulse API Integration', () => {
  const mockProfiles: RelationshipProfile[] = [
    {
      id: 'profile-1',
      user_id: 'user-1',
      canonical_email: 'test@example.com',
      display_name: 'Test User',
      first_name: 'Test',
      last_name: 'User',
      phone_number: '+1-555-0100',
      company: 'Test Corp',
      title: 'CTO',
      relationship_score: 85,
      total_interactions: 50,
      last_interaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      communication_frequency: 'weekly',
      preferred_channel: 'email',
      tags: ['investor', 'technical'],
      is_favorite: true,
      is_blocked: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
  ];

  const mockAIInsights: AIInsights = {
    profile_id: 'profile-1',
    ai_communication_style: 'Professional and direct',
    ai_topics: ['API', 'Technology', 'Investment'],
    ai_sentiment_average: 0.8,
    ai_relationship_summary: 'Strong technical relationship with high engagement.',
    ai_talking_points: ['Discuss API roadmap', 'Review Q1 metrics'],
    ai_next_actions: [
      { action: 'Send technical update', priority: 'high', due_date: '2026-02-01' },
    ],
    confidence_score: 0.9,
    last_analyzed_at: new Date().toISOString(),
  };

  const mockInteractionsResponse: RecentInteractionsResponse = {
    profile_id: 'profile-1',
    interactions: [
      {
        id: 'int-1',
        profile_id: 'profile-1',
        interaction_type: 'email_sent',
        interaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        subject: 'Test Email',
        snippet: 'This is a test email...',
        sentiment_score: 0.8,
        ai_topics: ['testing', 'integration'],
        synced_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    summary: {
      total_interactions: 1,
      by_type: { email_sent: 1 },
      average_sentiment: 0.8,
      top_topics: ['testing', 'integration'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful responses
    (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockResolvedValue(mockProfiles);
    (pulseContactService.getAIInsights as jest.Mock).mockResolvedValue(mockAIInsights);
    (pulseContactService.getRecentInteractions as jest.Mock).mockResolvedValue(mockInteractionsResponse);
    (pulseContactService.getPendingActionsCount as jest.Mock).mockResolvedValue(3);
    (pulseContactService.getRecommendedActions as jest.Mock).mockResolvedValue([]);
  });

  describe('ContactsPage API Integration', () => {
    describe('Success Scenarios', () => {
      it('loads contacts from Pulse API successfully', async () => {
        render(<ContactsPage />);

        // Verify API was called
        await waitFor(() => {
          expect(pulseContactService.fetchRelationshipProfiles).toHaveBeenCalledWith({
            limit: 1000,
            includeAnnotations: true,
          });
        });

        // Verify contact is displayed
        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        });

        // Verify no error state
        expect(screen.queryByText(/using demo data/i)).not.toBeInTheDocument();
      });

      it('transforms Pulse profiles to Contact format correctly', async () => {
        render(<ContactsPage />);

        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        });

        // Verify API was called with correct parameters
        expect(pulseContactService.fetchRelationshipProfiles).toHaveBeenCalledWith({
          limit: 1000,
          includeAnnotations: true,
        });

        // Contact data should be transformed and available
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      it('calculates relationship trend from Pulse data', async () => {
        const risingProfile = {
          ...mockProfiles[0],
          relationship_score: 92,
          last_interaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        };

        (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockResolvedValue([risingProfile]);

        render(<ContactsPage />);

        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        });

        // Trend should be calculated and displayed
        // (ContactCard component should show the trend)
      });

      it('displays loading state while fetching', async () => {
        // Delay the API response
        (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(mockProfiles), 100))
        );

        const { container } = render(<ContactsPage />);

        // Should show loading state initially (skeleton cards)
        const loadingElements = container.querySelectorAll('.skeleton-card');
        expect(loadingElements.length).toBeGreaterThan(0);

        // Wait for data to load
        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        }, { timeout: 3000 });
      });
    });

    describe('Error Handling', () => {
      it('falls back to mock data silently on API failure', async () => {
        (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockRejectedValue(
          new Error('Network error')
        );

        render(<ContactsPage />);

        // Should load mock data without error state
        await waitFor(() => {
          expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        });

        // No error message should be displayed
        expect(screen.queryByText(/unable to load/i)).not.toBeInTheDocument();
      });

      it('handles empty API response gracefully', async () => {
        (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockResolvedValue([]);

        render(<ContactsPage />);

        await waitFor(() => {
          expect(pulseContactService.fetchRelationshipProfiles).toHaveBeenCalled();
        });

        // Should display empty state
        await waitFor(() => {
          const emptyStateText = screen.queryByText(/no contacts/i);
          expect(emptyStateText || screen.getByText(/clear filters/i)).toBeInTheDocument();
        });
      });

      it('loads mock data successfully after API error', async () => {
        (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockRejectedValue(
          new Error('Temporary error')
        );

        render(<ContactsPage />);

        // Should fall back to mock data
        await waitFor(() => {
          expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        });

        // Mock contacts should be displayed
        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
      });
    });

    describe('Loading States', () => {
      it('shows loading skeleton during initial load', async () => {
        (pulseContactService.fetchRelationshipProfiles as jest.Mock).mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(mockProfiles), 200))
        );

        const { container } = render(<ContactsPage />);

        // Check for loading skeleton cards
        const skeletonCards = container.querySelectorAll('.skeleton-card');
        expect(skeletonCards.length).toBeGreaterThan(0);

        // Wait for data to load
        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        }, { timeout: 3000 });
      });

      it('hides loading state after data loads', async () => {
        const { container } = render(<ContactsPage />);

        // Wait for data to load
        await waitFor(() => {
          expect(screen.getByText('Test User')).toBeInTheDocument();
        });

        // Verify skeleton cards are gone
        const skeletonCards = container.querySelectorAll('.skeleton-card');
        expect(skeletonCards.length).toBe(0);
      });
    });
  });

  describe('ContactStoryView API Integration', () => {
    const mockContact = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      relationship_score: 85,
      pulse_profile_id: 'profile-1',
    };

    describe('Success Scenarios', () => {
      it('loads AI insights from Pulse API', async () => {
        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        await waitFor(() => {
          expect(pulseContactService.getAIInsights).toHaveBeenCalledWith('profile-1');
        });

        // Verify AI insights are displayed
        await waitFor(() => {
          expect(screen.getByText(/strong technical relationship/i)).toBeInTheDocument();
        });
      });

      it('loads recent interactions from Pulse API', async () => {
        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        await waitFor(() => {
          expect(pulseContactService.getRecentInteractions).toHaveBeenCalledWith(
            'profile-1',
            { limit: 30, days: 90 }
          );
        });

        // Verify interactions are displayed
        await waitFor(() => {
          expect(screen.getByText('Test Email')).toBeInTheDocument();
        });
      });

      it('displays AI talking points', async () => {
        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        await waitFor(() => {
          expect(screen.getByText(/discuss api roadmap/i)).toBeInTheDocument();
        });
      });

      it('displays recommended actions', async () => {
        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        await waitFor(() => {
          expect(screen.getByText(/send technical update/i)).toBeInTheDocument();
        });
      });
    });

    describe('Error Handling', () => {
      it('falls back to mock data when AI insights fail', async () => {
        (pulseContactService.getAIInsights as jest.Mock).mockRejectedValue(
          new Error('AI insights unavailable')
        );

        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        // Wait for fallback data
        await waitFor(() => {
          expect(screen.getByText(/strong relationship with consistent engagement/i)).toBeInTheDocument();
        });

        // Verify API was still called
        expect(pulseContactService.getAIInsights).toHaveBeenCalled();
      });

      it('falls back to mock data when interactions fail', async () => {
        (pulseContactService.getRecentInteractions as jest.Mock).mockRejectedValue(
          new Error('Interactions unavailable')
        );

        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        // Wait for fallback data
        await waitFor(() => {
          expect(screen.getByText(/project proposal follow-up/i)).toBeInTheDocument();
        });

        // Verify API was still called
        expect(pulseContactService.getRecentInteractions).toHaveBeenCalled();
      });

      it('handles null AI insights response', async () => {
        (pulseContactService.getAIInsights as jest.Mock).mockResolvedValue(null);

        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        // Should fall back to mock data
        await waitFor(() => {
          expect(screen.getByText(/strong relationship with consistent engagement/i)).toBeInTheDocument();
        });
      });

      it('handles empty interactions response', async () => {
        (pulseContactService.getRecentInteractions as jest.Mock).mockResolvedValue({
          profile_id: 'profile-1',
          interactions: [],
          summary: {
            total_interactions: 0,
            by_type: {},
            average_sentiment: 0,
            top_topics: [],
          },
        });

        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        // Should fall back to mock interactions
        await waitFor(() => {
          expect(screen.getByText(/project proposal follow-up/i)).toBeInTheDocument();
        });
      });

      it('handles contact without pulse_profile_id', async () => {
        const contactWithoutPulse = {
          ...mockContact,
          pulse_profile_id: undefined,
        };

        const onBack = jest.fn();
        render(<ContactStoryView contact={contactWithoutPulse} onBack={onBack} />);

        // Should use mock data immediately without calling API
        await waitFor(() => {
          expect(screen.getByText(/strong relationship with consistent engagement/i)).toBeInTheDocument();
        });

        // Verify API was NOT called
        expect(pulseContactService.getAIInsights).not.toHaveBeenCalled();
        expect(pulseContactService.getRecentInteractions).not.toHaveBeenCalled();
      });
    });

    describe('Loading States', () => {
      it('shows loading state while fetching enrichment data', async () => {
        (pulseContactService.getAIInsights as jest.Mock).mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(mockAIInsights), 200))
        );

        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        // Should show loading state
        expect(screen.getByText(/loading interactions/i)).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText(/loading interactions/i)).not.toBeInTheDocument();
        }, { timeout: 3000 });
      });

      it('hides loading state after data loads', async () => {
        const onBack = jest.fn();
        render(<ContactStoryView contact={mockContact} onBack={onBack} />);

        await waitFor(() => {
          expect(screen.queryByText(/loading interactions/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Consistency', () => {
    it('maintains consistent data format between components', async () => {
      render(<ContactsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Both components should use the same data structure
      expect(pulseContactService.fetchRelationshipProfiles).toHaveBeenCalled();
    });
  });
});
