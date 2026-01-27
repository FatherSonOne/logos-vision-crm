/**
 * Mention Parsing Utilities
 * =========================
 * Utilities for parsing @mentions in text and rendering them as interactive elements.
 */

import type { TeamMember, ParsedMention } from '../types';

/**
 * Regex pattern for @mentions
 * Matches @username patterns (alphanumeric, underscores, dots, hyphens)
 */
export const MENTION_REGEX = /@([a-zA-Z0-9_.\-]+)/g;

/**
 * Regex pattern for @mentions with word boundary
 */
export const MENTION_REGEX_STRICT = /(?:^|\s)@([a-zA-Z0-9_.\-]+)(?=\s|$|[.,!?;:])/g;

/**
 * Parse @mentions from text content
 * @param text - The text to parse
 * @param teamMembers - Optional team members to match against
 * @returns Array of parsed mentions with positions
 */
export function parseMentions(
  text: string,
  teamMembers?: TeamMember[]
): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  const regex = new RegExp(MENTION_REGEX.source, 'g');
  let match;

  while ((match = regex.exec(text)) !== null) {
    const username = match[1];
    const startIndex = match.index;
    const endIndex = match.index + match[0].length;

    // Try to match with team members if provided
    let matchedMember: TeamMember | undefined;
    if (teamMembers) {
      matchedMember = findTeamMemberByMention(username, teamMembers);
    }

    mentions.push({
      username,
      userId: matchedMember?.id,
      startIndex,
      endIndex,
      matched: !!matchedMember,
    });
  }

  return mentions;
}

/**
 * Find a team member by mention text
 * Matches against name, email username, or custom username field
 */
export function findTeamMemberByMention(
  mention: string,
  teamMembers: TeamMember[]
): TeamMember | undefined {
  const mentionLower = mention.toLowerCase();

  return teamMembers.find((member) => {
    // Match by name (case-insensitive)
    const nameParts = member.name.toLowerCase().split(/\s+/);
    if (nameParts.some(part => part === mentionLower)) return true;

    // Match by full name without spaces
    const fullNameNoSpaces = member.name.toLowerCase().replace(/\s+/g, '');
    if (fullNameNoSpaces === mentionLower) return true;

    // Match by email username (before @)
    const emailUsername = member.email?.split('@')[0]?.toLowerCase();
    if (emailUsername === mentionLower) return true;

    // Match by first.last pattern from name
    const firstLastPattern = member.name.toLowerCase().replace(/\s+/g, '.');
    if (firstLastPattern === mentionLower) return true;

    return false;
  });
}

/**
 * Convert text with @mentions to HTML with highlighted mentions
 */
export function renderMentionsAsHtml(
  text: string,
  teamMembers: TeamMember[],
  options?: {
    mentionClass?: string;
    unmatchedClass?: string;
    linkMentions?: boolean;
    baseUrl?: string;
  }
): string {
  const {
    mentionClass = 'mention mention-matched',
    unmatchedClass = 'mention mention-unmatched',
    linkMentions = true,
    baseUrl = '/team/',
  } = options || {};

  // Escape HTML first
  let html = escapeHtml(text);

  // Replace mentions with styled spans/links
  html = html.replace(MENTION_REGEX, (match, username) => {
    const member = findTeamMemberByMention(username, teamMembers);
    
    if (member && linkMentions) {
      return `<a href="${baseUrl}${member.id}" class="${mentionClass}" data-user-id="${member.id}">@${escapeHtml(member.name)}</a>`;
    } else if (member) {
      return `<span class="${mentionClass}" data-user-id="${member.id}">@${escapeHtml(member.name)}</span>`;
    } else {
      return `<span class="${unmatchedClass}">@${escapeHtml(username)}</span>`;
    }
  });

  // Convert newlines to <br>
  html = html.replace(/\n/g, '<br>');

  return html;
}

/**
 * Extract unique user IDs from mentions in text
 */
export function extractMentionedUserIds(
  text: string,
  teamMembers: TeamMember[]
): string[] {
  const mentions = parseMentions(text, teamMembers);
  const userIds = mentions
    .filter(m => m.matched && m.userId)
    .map(m => m.userId as string);
  
  return [...new Set(userIds)]; // Unique IDs
}

/**
 * Get mention suggestions based on partial input
 */
export function getMentionSuggestions(
  query: string,
  teamMembers: TeamMember[],
  limit: number = 5,
  excludeIds?: string[]
): TeamMember[] {
  const queryLower = query.toLowerCase().replace('@', '');
  
  const filtered = teamMembers.filter((member) => {
    // Exclude specified IDs
    if (excludeIds?.includes(member.id)) return false;

    // Match by name
    if (member.name.toLowerCase().includes(queryLower)) return true;

    // Match by email
    if (member.email?.toLowerCase().includes(queryLower)) return true;

    // Match by role
    if (member.role?.toLowerCase().includes(queryLower)) return true;

    return false;
  });

  // Sort by relevance (name starts with query first)
  filtered.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(queryLower) ? 0 : 1;
    const bStartsWith = b.name.toLowerCase().startsWith(queryLower) ? 0 : 1;
    return aStartsWith - bStartsWith || a.name.localeCompare(b.name);
  });

  return filtered.slice(0, limit);
}

/**
 * Insert a mention at cursor position in text
 */
export function insertMention(
  text: string,
  cursorPosition: number,
  member: TeamMember,
  mentionStart: number
): { newText: string; newCursorPosition: number } {
  // Create mention text using first name or full name
  const mentionText = `@${member.name.split(' ')[0]} `;
  
  // Replace from mention start to cursor with the mention
  const before = text.substring(0, mentionStart);
  const after = text.substring(cursorPosition);
  const newText = before + mentionText + after;
  const newCursorPosition = mentionStart + mentionText.length;

  return { newText, newCursorPosition };
}

/**
 * Find mention trigger position (where @ was typed)
 */
export function findMentionTriggerPosition(
  text: string,
  cursorPosition: number
): { start: number; query: string } | null {
  // Look backwards from cursor for @
  const textBeforeCursor = text.substring(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex === -1) return null;

  // Check if there's a space or start of text before @
  const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
  if (!/[\s\n]/.test(charBeforeAt) && lastAtIndex > 0) return null;

  // Get the query after @
  const query = textBeforeCursor.substring(lastAtIndex + 1);

  // Check if query is valid (no spaces)
  if (/\s/.test(query)) return null;

  return {
    start: lastAtIndex,
    query,
  };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Strip mentions from text (for preview/notification text)
 */
export function stripMentions(text: string): string {
  return text.replace(MENTION_REGEX, (match, username) => username);
}

/**
 * Count mentions in text
 */
export function countMentions(text: string): number {
  const matches = text.match(MENTION_REGEX);
  return matches ? matches.length : 0;
}

/**
 * Get context around a mention for notification display
 */
export function getMentionContext(
  text: string,
  mentionIndex: number,
  contextLength: number = 50
): string {
  const start = Math.max(0, mentionIndex - contextLength);
  const end = Math.min(text.length, mentionIndex + contextLength);
  
  let context = text.substring(start, end);
  
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';
  
  return context.trim();
}

/**
 * Format mention for display (e.g., in notification)
 */
export function formatMentionDisplay(
  member: TeamMember,
  format: 'full' | 'first' | 'username' = 'full'
): string {
  switch (format) {
    case 'first':
      return member.name.split(' ')[0];
    case 'username':
      return member.email?.split('@')[0] || member.name.split(' ')[0].toLowerCase();
    default:
      return member.name;
  }
}

/**
 * CSS styles for mention highlights (can be included in stylesheets)
 */
export const MENTION_STYLES = `
  .mention {
    display: inline;
    font-weight: 500;
    cursor: pointer;
    border-radius: 4px;
    padding: 1px 4px;
    transition: all 0.15s ease;
  }
  
  .mention-matched {
    color: var(--aurora-teal, #14b8a6);
    background-color: rgba(20, 184, 166, 0.1);
  }
  
  .mention-matched:hover {
    background-color: rgba(20, 184, 166, 0.2);
    text-decoration: none;
  }
  
  .mention-unmatched {
    color: var(--cmf-text-muted, #94a3b8);
    background-color: rgba(148, 163, 184, 0.1);
  }
  
  .mention-self {
    color: var(--aurora-pink, #ec4899);
    background-color: rgba(236, 72, 153, 0.1);
  }
`;

export default {
  parseMentions,
  findTeamMemberByMention,
  renderMentionsAsHtml,
  extractMentionedUserIds,
  getMentionSuggestions,
  insertMention,
  findMentionTriggerPosition,
  stripMentions,
  countMentions,
  getMentionContext,
  formatMentionDisplay,
  MENTION_REGEX,
  MENTION_STYLES,
};
