/**
 * COMPREHENSIVE SAMPLE DATA - MAIN EXPORT
 * This file combines all sample data parts and exports them for use throughout the CRM
 */

// Import team members, clients, and projects from part 1
export { 
  sampleTeamMembers as mockTeamMembers,
  sampleClients as mockClients,
  sampleProjects as mockProjects
} from './sampleData';

// Import activities, cases, volunteers, and donations from part 2
export {
  sampleActivities as mockActivities,
  sampleCases as mockCases,
  sampleVolunteers as mockVolunteers,
  sampleDonations as mockDonations
} from './sampleData-part2';

// Import documents, events, webpages, campaigns, chat, and portals from part 3
export {
  sampleDocuments as mockDocuments,
  sampleEvents as mockEvents,
  sampleWebpages as mockWebpages,
  sampleEmailCampaigns as mockEmailCampaigns,
  sampleChatRooms as mockChatRooms,
  sampleChatMessages as mockChatMessages,
  samplePortalLayouts as mockPortalLayouts
} from './sampleData-part3';
