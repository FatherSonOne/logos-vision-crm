/**
 * Tests for Pulse Contact Service Mock Data
 *
 * Note: Direct testing of pulseContactService requires refactoring to handle import.meta.env.
 * For now, we test the mock data structures and types that the service uses.
 *
 * TODO: Refactor pulseContactService to extract env vars for better testability (Day 4)
 */

import {
  MOCK_RELATIONSHIP_PROFILES,
  MOCK_AI_INSIGHTS,
  MOCK_RECENT_INTERACTIONS,
} from '../../types/pulseContacts';

import { MOCK_RECOMMENDED_ACTIONS } from '../mockPulseData';

describe('Pulse Contact Service - Mock Data', () => {
  describe('MOCK_RELATIONSHIP_PROFILES', () => {
    it('contains valid relationship profiles', () => {
      expect(Array.isArray(MOCK_RELATIONSHIP_PROFILES)).toBe(true);
      expect(MOCK_RELATIONSHIP_PROFILES.length).toBeGreaterThan(0);
    });

    it('each profile has required fields', () => {
      MOCK_RELATIONSHIP_PROFILES.forEach(profile => {
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('canonical_email');
        expect(profile).toHaveProperty('display_name');
        expect(profile).toHaveProperty('communication_frequency');
        expect(profile).toHaveProperty('last_interaction_date');
        expect(typeof profile.id).toBe('string');
        expect(typeof profile.canonical_email).toBe('string');
        expect(typeof profile.display_name).toBe('string');
      });
    });

    it('profiles have valid relationship scores', () => {
      MOCK_RELATIONSHIP_PROFILES.forEach(profile => {
        // relationship_score should exist and be a number
        if (profile.relationship_score !== undefined) {
          expect(typeof profile.relationship_score).toBe('number');
          expect(profile.relationship_score).toBeGreaterThanOrEqual(0);
          expect(profile.relationship_score).toBeLessThanOrEqual(100);
        }
      });
    });

    it('profiles have valid trend values', () => {
      const validTrends = ['rising', 'stable', 'falling', 'new', 'dormant'];

      MOCK_RELATIONSHIP_PROFILES.forEach(profile => {
        if (profile.relationship_trend) {
          expect(validTrends).toContain(profile.relationship_trend);
        }
      });
    });
  });

  describe('MOCK_AI_INSIGHTS', () => {
    it('has required AI insight fields', () => {
      expect(MOCK_AI_INSIGHTS).toHaveProperty('ai_relationship_summary');
      expect(MOCK_AI_INSIGHTS).toHaveProperty('ai_talking_points');
      expect(MOCK_AI_INSIGHTS).toHaveProperty('ai_next_actions');
      expect(MOCK_AI_INSIGHTS).toHaveProperty('ai_communication_style');
      expect(MOCK_AI_INSIGHTS).toHaveProperty('ai_topics');
      expect(MOCK_AI_INSIGHTS).toHaveProperty('last_analyzed_at');
    });

    it('talking points is an array', () => {
      expect(Array.isArray(MOCK_AI_INSIGHTS.ai_talking_points)).toBe(true);
    });

    it('next actions is an array', () => {
      expect(Array.isArray(MOCK_AI_INSIGHTS.ai_next_actions)).toBe(true);
    });

    it('topics is an array', () => {
      expect(Array.isArray(MOCK_AI_INSIGHTS.ai_topics)).toBe(true);
    });

    it('each next action has required fields', () => {
      MOCK_AI_INSIGHTS.ai_next_actions.forEach(action => {
        expect(action).toHaveProperty('action');
        expect(action).toHaveProperty('priority');
        expect(typeof action.action).toBe('string');
        expect(['high', 'medium', 'low']).toContain(action.priority);
      });
    });
  });

  describe('MOCK_RECENT_INTERACTIONS', () => {
    it('is an array of interactions', () => {
      expect(Array.isArray(MOCK_RECENT_INTERACTIONS)).toBe(true);
      expect(MOCK_RECENT_INTERACTIONS.length).toBeGreaterThan(0);
    });

    it('each interaction has required fields', () => {
      MOCK_RECENT_INTERACTIONS.forEach(interaction => {
        expect(interaction).toHaveProperty('id');
        expect(interaction).toHaveProperty('profile_id');
        expect(interaction).toHaveProperty('interaction_type');
        expect(interaction).toHaveProperty('interaction_date');
        expect(typeof interaction.id).toBe('string');
        expect(typeof interaction.profile_id).toBe('string');
        expect(typeof interaction.interaction_type).toBe('string');
        expect(typeof interaction.interaction_date).toBe('string');
      });
    });

    it('interactions have valid types', () => {
      const validTypes = [
        'email_sent',
        'email_received',
        'meeting',
        'call',
        'slack_message',
        'slack_received',
        'sms_sent',
        'sms_received',
        'linkedin',
        'other',
      ];

      MOCK_RECENT_INTERACTIONS.forEach(interaction => {
        expect(validTypes).toContain(interaction.interaction_type);
      });
    });

    it('interactions have valid date format', () => {
      MOCK_RECENT_INTERACTIONS.forEach(interaction => {
        const date = new Date(interaction.interaction_date);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });
  });

  describe('MOCK_RECOMMENDED_ACTIONS', () => {
    it('is an array of recommended actions', () => {
      expect(Array.isArray(MOCK_RECOMMENDED_ACTIONS)).toBe(true);
      expect(MOCK_RECOMMENDED_ACTIONS.length).toBeGreaterThan(0);
    });

    it('each action has required fields', () => {
      MOCK_RECOMMENDED_ACTIONS.forEach(action => {
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('contact_id');
        expect(action).toHaveProperty('contact_name');
        expect(action).toHaveProperty('contact_score');
        expect(action).toHaveProperty('priority');
        expect(action).toHaveProperty('reason');
        expect(action).toHaveProperty('suggested_actions');
        expect(typeof action.id).toBe('string');
        expect(typeof action.contact_name).toBe('string');
        expect(Array.isArray(action.suggested_actions)).toBe(true);
      });
    });

    it('actions have valid priority levels', () => {
      const validPriorities = ['high', 'medium', 'low', 'opportunity'];

      MOCK_RECOMMENDED_ACTIONS.forEach(action => {
        expect(validPriorities).toContain(action.priority);
      });
    });

    it('each action has suggested actions', () => {
      MOCK_RECOMMENDED_ACTIONS.forEach(action => {
        expect(Array.isArray(action.suggested_actions)).toBe(true);
        expect(action.suggested_actions.length).toBeGreaterThan(0);

        // Each suggested action should be a non-empty string
        action.suggested_actions.forEach(suggestedAction => {
          expect(typeof suggestedAction).toBe('string');
          expect(suggestedAction.length).toBeGreaterThan(0);
        });
      });
    });

    it('high priority actions come first', () => {
      const priorities = MOCK_RECOMMENDED_ACTIONS.map(a => a.priority);
      const firstHighIndex = priorities.indexOf('high');
      const firstMediumIndex = priorities.indexOf('medium');

      if (firstHighIndex !== -1 && firstMediumIndex !== -1) {
        expect(firstHighIndex).toBeLessThan(firstMediumIndex);
      }
    });
  });

  describe('Data Consistency', () => {
    it('recommended actions have contact names', () => {
      // Verify each action references a contact
      MOCK_RECOMMENDED_ACTIONS.forEach(action => {
        expect(typeof action.contact_name).toBe('string');
        expect(action.contact_name.length).toBeGreaterThan(0);
      });
    });

    it('mock data is suitable for development and testing', () => {
      // Verify we have enough data for meaningful testing
      expect(MOCK_RELATIONSHIP_PROFILES.length).toBeGreaterThan(0);
      expect(MOCK_RECOMMENDED_ACTIONS.length).toBeGreaterThan(0);
      expect(MOCK_RECENT_INTERACTIONS.length).toBeGreaterThan(0);
    });
  });
});
