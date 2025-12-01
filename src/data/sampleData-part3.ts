// Part 3: Documents, Events, Webpages, Email Campaigns, Chat, Portal (continued from sampleData.ts)

import { Document, DocumentCategory, Event, Webpage, WebpageStatus, EmailCampaign, ChatRoom, ChatMessage, PortalLayout } from '../types';

// ============================================================================
// DOCUMENTS - Files and attachments
// ============================================================================
export const sampleDocuments: Document[] = [
  { 
    id: 'doc1', 
    name: 'Hope_Harbor_Strategic_Plan_2025-2030_Draft.pdf', 
    category: DocumentCategory.Client, 
    relatedId: 'cl1', 
    fileType: 'pdf', 
    size: '2.4 MB', 
    lastModified: '2024-11-26T14:00:00Z', 
    uploadedById: 'tm1' 
  },
  { 
    id: 'doc2', 
    name: 'Gala_Sponsorship_Packages_2025.pdf', 
    category: DocumentCategory.Project, 
    relatedId: 'p1', 
    fileType: 'pdf', 
    size: '1.2 MB', 
    lastModified: '2024-11-18T10:30:00Z', 
    uploadedById: 'tm6' 
  },
  { 
    id: 'doc3', 
    name: 'DOE_Grant_Application_Budget.xlsx', 
    category: DocumentCategory.Project, 
    relatedId: 'p2', 
    fileType: 'xlsx', 
    size: '245 KB', 
    lastModified: '2024-11-27T11:00:00Z', 
    uploadedById: 'tm9' 
  },
  { 
    id: 'doc4', 
    name: 'Youth_Futures_Network_Contract.pdf', 
    category: DocumentCategory.Client, 
    relatedId: 'cl3', 
    fileType: 'pdf', 
    size: '680 KB', 
    lastModified: '2023-09-01T09:00:00Z', 
    uploadedById: 'tm11' 
  },
  { 
    id: 'doc5', 
    name: 'Q4_Team_Performance_Review.pptx', 
    category: DocumentCategory.Internal, 
    relatedId: 'internal', 
    fileType: 'pptx', 
    size: '8.3 MB', 
    lastModified: '2024-11-29T16:00:00Z', 
    uploadedById: 'tm1' 
  },
  { 
    id: 'doc6', 
    name: 'Grant_Proposal_Template_2024.docx', 
    category: DocumentCategory.Template, 
    relatedId: 'internal', 
    fileType: 'docx', 
    size: '156 KB', 
    lastModified: '2024-01-10T12:00:00Z', 
    uploadedById: 'tm3' 
  },
  { 
    id: 'doc7', 
    name: 'Gala_Guest_List_Tracker.xlsx', 
    category: DocumentCategory.Project, 
    relatedId: 'p1', 
    fileType: 'xlsx', 
    size: '89 KB', 
    lastModified: '2024-11-25T18:00:00Z', 
    uploadedById: 'tm2' 
  },
  { 
    id: 'doc8', 
    name: 'Youth_Program_Impact_Data_2021-2024.csv', 
    category: DocumentCategory.Project, 
    relatedId: 'p2', 
    fileType: 'other', 
    size: '3.2 MB', 
    lastModified: '2024-09-28T09:00:00Z', 
    uploadedById: 'tm4' 
  },
  { 
    id: 'doc9', 
    name: 'Website_Wireframes_SecondChance.pdf', 
    category: DocumentCategory.Project, 
    relatedId: 'p6', 
    fileType: 'pdf', 
    size: '5.7 MB', 
    lastModified: '2024-10-15T15:00:00Z', 
    uploadedById: 'tm10' 
  },
  { 
    id: 'doc10', 
    name: 'Mobile_Literacy_Curriculum.docx', 
    category: DocumentCategory.Project, 
    relatedId: 'p5', 
    fileType: 'docx', 
    size: '890 KB', 
    lastModified: '2024-11-10T11:00:00Z', 
    uploadedById: 'tm8' 
  },
  { 
    id: 'doc11', 
    name: 'Coding_Bootcamp_Full_Curriculum.pdf', 
    category: DocumentCategory.Project, 
    relatedId: 'p9', 
    fileType: 'pdf', 
    size: '12.4 MB', 
    lastModified: '2024-08-28T10:00:00Z', 
    uploadedById: 'tm1' 
  },
  { 
    id: 'doc12', 
    name: 'Volunteer_Handbook_Template.docx', 
    category: DocumentCategory.Template, 
    relatedId: 'internal', 
    fileType: 'docx', 
    size: '234 KB', 
    lastModified: '2024-07-01T11:00:00Z', 
    uploadedById: 'tm12' 
  },
  { 
    id: 'doc13', 
    name: 'Garden_Site_Permits_All_Locations.pdf', 
    category: DocumentCategory.Project, 
    relatedId: 'p10', 
    fileType: 'pdf', 
    size: '1.8 MB', 
    lastModified: '2024-06-25T13:00:00Z', 
    uploadedById: 'tm11' 
  },
  { 
    id: 'doc14', 
    name: 'Brand_Guidelines_LogosVision.pdf', 
    category: DocumentCategory.Internal, 
    relatedId: 'internal', 
    fileType: 'pdf', 
    size: '4.2 MB', 
    lastModified: '2024-03-15T10:00:00Z', 
    uploadedById: 'tm10' 
  },
  { 
    id: 'doc15', 
    name: 'Insurance_Quotes_Mobile_Lab.xlsx', 
    category: DocumentCategory.Project, 
    relatedId: 'p5', 
    fileType: 'xlsx', 
    size: '67 KB', 
    lastModified: '2024-11-28T14:00:00Z', 
    uploadedById: 'tm11' 
  },
];

// ============================================================================
// EVENTS - Fundraisers, workshops, community events
// ============================================================================
export const sampleEvents: Event[] = [
  { 
    id: 'evt1', 
    title: 'Annual Impact Gala 2025', 
    clientId: 'cl2', 
    eventDate: '2025-03-15T18:00:00Z', 
    location: 'The Peace Center, Greenville, SC', 
    description: 'Join us for an elegant evening celebrating the arts and community impact. Featuring live performances, silent auction, and keynote from local philanthropist Margaret Chen. All proceeds support arts education programs.', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', 
    isPublished: true, 
    schedule: [
      { id: 's1-1', time: '06:00 PM', title: 'Cocktail Reception & Silent Auction Opens' },
      { id: 's1-2', time: '07:00 PM', title: 'Dinner Service & Welcome Remarks' },
      { id: 's1-3', time: '08:00 PM', title: 'Keynote: Margaret Chen' },
      { id: 's1-4', time: '08:30 PM', title: 'Live Auction' },
      { id: 's1-5', time: '09:30 PM', title: 'Dancing & Entertainment' },
    ], 
    ticketTypes: [
      { id: 't1-1', name: 'Individual Ticket', price: 150 },
      { id: 't1-2', name: 'VIP Table (8 guests)', price: 2000 },
      { id: 't1-3', name: 'Patron Table (10 guests)', price: 3500 },
    ], 
    volunteerIds: ['v1', 'v2', 'v4'] 
  },
  { 
    id: 'evt2', 
    title: 'Youth Leadership Summit', 
    clientId: 'cl3', 
    eventDate: '2025-02-20T09:00:00Z', 
    location: 'Columbia Convention Center, Columbia, SC', 
    description: 'Full-day leadership development workshop for high school students. Interactive sessions on public speaking, community organizing, and college prep.', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 
    isPublished: true, 
    schedule: [
      { id: 's2-1', time: '09:00 AM', title: 'Registration & Continental Breakfast' },
      { id: 's2-2', time: '10:00 AM', title: 'Keynote: Leading with Purpose' },
      { id: 's2-3', time: '11:00 AM', title: 'Breakout Sessions' },
      { id: 's2-4', time: '12:00 PM', title: 'Lunch & Networking' },
      { id: 's2-5', time: '01:00 PM', title: 'Afternoon Workshops' },
      { id: 's2-6', time: '03:00 PM', title: 'Closing Circle' },
    ], 
    ticketTypes: [
      { id: 't2-1', name: 'Student Ticket', price: 15 },
      { id: 't2-2', name: 'Sponsored (Free)', price: 0 },
    ], 
    volunteerIds: ['v3', 'v4'] 
  },
  { 
    id: 'evt3', 
    title: 'Earth Month Volunteer Day', 
    clientId: 'cl4', 
    eventDate: '2025-04-12T10:00:00Z', 
    location: 'Paris Mountain State Park, Greenville, SC', 
    description: 'Join us for trail maintenance, invasive species removal, and native plant restoration. All tools provided. Family-friendly!', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', 
    isPublished: true, 
    schedule: [
      { id: 's3-1', time: '10:00 AM', title: 'Check-in & Orientation' },
      { id: 's3-2', time: '10:30 AM', title: 'Volunteer Work Begins' },
      { id: 's3-3', time: '12:30 PM', title: 'Lunch & Celebration' },
    ], 
    ticketTypes: [
      { id: 't3-1', name: 'Volunteer RSVP (Free)', price: 0 },
    ], 
    volunteerIds: ['v2'] 
  },
  { 
    id: 'evt4', 
    title: 'Adoption Day Celebration', 
    clientId: 'cl7', 
    eventDate: '2025-06-07T11:00:00Z', 
    location: 'Paws & Hearts Sanctuary, Clemson, SC', 
    description: 'Meet adoptable dogs and cats! Reduced adoption fees, free pet photos, training demonstrations, and kids activities.', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800', 
    isPublished: false, 
    schedule: [
      { id: 's4-1', time: '11:00 AM', title: 'Gates Open' },
      { id: 's4-2', time: '12:00 PM', title: 'Training Demo' },
      { id: 's4-3', time: '02:00 PM', title: 'Pet Parade' },
    ], 
    ticketTypes: [], 
    volunteerIds: ['v7'] 
  },
  { 
    id: 'evt5', 
    title: 'Tech Bootcamp Demo Day', 
    clientId: 'cl8', 
    eventDate: '2025-01-25T17:00:00Z', 
    location: 'NEXT Innovation Center, Greenville, SC', 
    description: 'First cohort of coding bootcamp students present their capstone projects. Local tech employers invited for networking.', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 
    isPublished: true, 
    schedule: [
      { id: 's5-1', time: '05:00 PM', title: 'Networking Reception' },
      { id: 's5-2', time: '06:00 PM', title: 'Student Presentations' },
      { id: 's5-3', time: '07:30 PM', title: 'Awards & Certificates' },
    ], 
    ticketTypes: [
      { id: 't5-1', name: 'RSVP (Free)', price: 0 },
    ], 
    volunteerIds: ['v8'] 
  },
  { 
    id: 'evt6', 
    title: 'Community Garden Harvest Festival', 
    clientId: 'cl9', 
    eventDate: '2024-10-19T12:00:00Z', 
    location: 'Upstate Urban Gardens, Greenville, SC', 
    description: 'Celebrate our first harvest! Live music, garden tours, kids activities, and fresh produce for sale.', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', 
    isPublished: true, 
    schedule: [
      { id: 's6-1', time: '12:00 PM', title: 'Festival Opens' },
      { id: 's6-2', time: '01:00 PM', title: 'Live Music Begins' },
      { id: 's6-3', time: '03:00 PM', title: 'Garden Tours' },
    ], 
    ticketTypes: [
      { id: 't6-1', name: 'General Admission', price: 5 },
      { id: 't6-2', name: 'Family Pass (4)', price: 15 },
    ], 
    volunteerIds: ['v9'] 
  },
  { 
    id: 'evt7', 
    title: 'Senior Tech Workshop: Smartphones 101', 
    clientId: 'cl10', 
    eventDate: '2025-01-15T10:00:00Z', 
    location: 'Easley Public Library, Easley, SC', 
    description: 'Learn to use your smartphone with confidence. Topics: calls, texts, photos, apps, and staying safe online.', 
    bannerImageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 
    isPublished: true, 
    schedule: [
      { id: 's7-1', time: '10:00 AM', title: 'Welcome & Overview' },
      { id: 's7-2', time: '10:30 AM', title: 'Hands-on Practice' },
      { id: 's7-3', time: '12:00 PM', title: 'Q&A' },
    ], 
    ticketTypes: [
      { id: 't7-1', name: 'Free Registration', price: 0 },
    ], 
    volunteerIds: ['v12'] 
  },
];

// ============================================================================
// WEBPAGES - Client website content
// ============================================================================
export const sampleWebpages: Webpage[] = [
  { 
    id: 'wp1', 
    relatedId: 'cl1', 
    title: 'Hope Harbor Foundation - Home', 
    status: WebpageStatus.Published, 
    lastUpdated: '2024-11-15T14:00:00Z', 
    visits: 8420, 
    engagementScore: 87, 
    content: [] 
  },
  { 
    id: 'wp2', 
    relatedId: 'cl2', 
    title: 'UCAA - Annual Gala 2025', 
    status: WebpageStatus.Published, 
    lastUpdated: '2024-11-20T10:00:00Z', 
    visits: 5230, 
    engagementScore: 92, 
    content: [] 
  },
  { 
    id: 'wp3', 
    relatedId: 'cl3', 
    title: 'Youth Futures - Programs', 
    status: WebpageStatus.Draft, 
    lastUpdated: '2024-11-28T16:00:00Z', 
    visits: 0, 
    engagementScore: 0, 
    content: [] 
  },
  { 
    id: 'wp4', 
    relatedId: 'cl4', 
    title: 'Blue Ridge Trust - Get Involved', 
    status: WebpageStatus.Published, 
    lastUpdated: '2024-10-30T11:00:00Z', 
    visits: 3180, 
    engagementScore: 84, 
    content: [] 
  },
  { 
    id: 'wp5', 
    relatedId: 'cl6', 
    title: 'Second Chance - Adopt a Pet', 
    status: WebpageStatus.Published, 
    lastUpdated: '2024-11-01T15:00:00Z', 
    visits: 12450, 
    engagementScore: 89, 
    content: [] 
  },
  { 
    id: 'wp6', 
    relatedId: 'cl8', 
    title: 'Tech Tomorrow - Apply Now', 
    status: WebpageStatus.Published, 
    lastUpdated: '2024-09-15T10:00:00Z', 
    visits: 6780, 
    engagementScore: 91, 
    content: [] 
  },
];

// ============================================================================
// EMAIL CAMPAIGNS - Newsletter and outreach
// ============================================================================
export const sampleEmailCampaigns: EmailCampaign[] = [
  {
    id: 'ec1',
    name: 'November Newsletter',
    status: 'Sent',
    subject: '🍂 November Update: Amazing Progress This Fall!',
    body: `Dear Friends,\n\nWhat an incredible autumn it's been! We're excited to share some highlights:\n\n✅ Launched 3 new community gardens\n✅ 127 new volunteers trained\n✅ $85K raised for programs\n✅ Completed strategic planning process\n\nThank you for your continued support. Together, we're making real impact!\n\nWarm regards,\nThe Logos Vision Team`,
    recipientSegment: 'All Contacts',
    sentDate: '2024-11-05T10:00:00Z',
    stats: { sent: 850, opened: 425, clicked: 102, unsubscribes: 8 },
  },
  {
    id: 'ec2',
    name: 'Gala Early Bird Invitation',
    status: 'Sent',
    subject: '✨ You Are Invited: Early Access to Gala Tickets!',
    subjectLineB: 'Save Your Spot: March 15th Gala - Early Bird Pricing',
    body: 'As a valued supporter, you have exclusive early access to tickets for our Annual Impact Gala. Purchase by December 1st for special pricing!',
    ctaButtonText: 'Get Tickets Now',
    ctaButtonUrl: '#',
    recipientSegment: 'Major Donors',
    sentDate: '2024-11-10T14:00:00Z',
    stats: { sent: 125, opened: 98, clicked: 47, unsubscribes: 2 },
  },
  {
    id: 'ec3',
    name: 'Volunteer Call - Earth Month',
    status: 'Sent',
    subject: '🌍 April Earth Month: We Need Your Help!',
    body: 'Join us for trail restoration, native plantings, and community cleanups throughout April. All skill levels welcome!',
    ctaButtonText: 'Sign Up to Volunteer',
    ctaButtonUrl: '#',
    recipientSegment: 'Past Volunteers',
    sentDate: '2024-11-22T09:00:00Z',
    stats: { sent: 340, opened: 185, clicked: 76, unsubscribes: 5 },
  },
  {
    id: 'ec4',
    name: 'Year-End Appeal',
    status: 'Scheduled',
    subject: '2024: A Year of Impact (And How You Can Help)',
    body: 'As the year closes, we reflect on what we\'ve accomplished together and look ahead to 2025. Your year-end gift helps us continue this vital work.',
    ctaButtonText: 'Make a Gift',
    ctaButtonUrl: '#',
    recipientSegment: 'All Contacts',
    scheduleDate: '2024-12-15T10:00:00Z',
    stats: { sent: 0, opened: 0, clicked: 0, unsubscribes: 0 },
  },
  {
    id: 'ec5',
    name: 'Bootcamp Applications Open',
    status: 'Draft',
    subject: 'Start Your Tech Career: Coding Bootcamp Now Enrolling',
    body: '',
    recipientSegment: 'Tech Tomorrow Subscribers',
    stats: { sent: 0, opened: 0, clicked: 0, unsubscribes: 0 },
  },
];

// ============================================================================
// CHAT - Team collaboration
// ============================================================================
export const sampleChatRooms: ChatRoom[] = [
  { id: 'room-1', name: '#general' },
  { id: 'room-2', name: '#gala-planning' },
  { id: 'room-3', name: '#grants-and-funding' },
  { id: 'room-4', name: '#tech-projects' },
  { id: 'room-5', name: '#random' },
];

export const sampleChatMessages: ChatMessage[] = [
  { 
    id: 'msg-1', 
    roomId: 'room-1', 
    senderId: 'tm1', 
    text: 'Great work everyone on wrapping up Q4 projects! 🎉', 
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() 
  },
  { 
    id: 'msg-2', 
    roomId: 'room-1', 
    senderId: 'tm2', 
    text: 'Thanks Frankie! The team really pulled together.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 118).toISOString() 
  },
  { 
    id: 'msg-3', 
    roomId: 'room-2', 
    senderId: 'tm2', 
    text: 'Gala update: We are at $45K in sponsorships! Halfway to our $90K sponsor goal.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() 
  },
  { 
    id: 'msg-4', 
    roomId: 'room-2', 
    senderId: 'tm6', 
    text: 'Amazing! I have 3 more sponsor meetings this week. 🤞', 
    timestamp: new Date(Date.now() - 1000 * 60 * 88).toISOString() 
  },
  { 
    id: 'msg-5', 
    roomId: 'room-3', 
    senderId: 'tm3', 
    text: 'Just submitted the Youth Futures DOE grant. Fingers crossed! 🤞', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() 
  },
  { 
    id: 'msg-6', 
    roomId: 'room-3', 
    senderId: 'tm1', 
    text: 'Excellent work Marcus! That was a massive application.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString() 
  },
  { 
    id: 'msg-7', 
    roomId: 'room-4', 
    senderId: 'tm7', 
    text: 'Fixed the adoption portal image upload bug. Should be good now!', 
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() 
  },
  { 
    id: 'msg-8', 
    roomId: 'room-4', 
    senderId: 'tm10', 
    text: 'Thanks David! Testing it now.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 44).toISOString() 
  },
  { 
    id: 'msg-9', 
    roomId: 'room-5', 
    senderId: 'tm8', 
    text: 'Who wants to grab lunch? Paesanos? 🍝', 
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() 
  },
  { 
    id: 'msg-10', 
    roomId: 'room-5', 
    senderId: 'tm6', 
    text: 'I am in! Best Italian in town.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString() 
  },
  { 
    id: 'msg-11', 
    roomId: 'room-1', 
    senderId: 'tm12', 
    text: 'Reminder: Team meeting tomorrow at 10am. I will bring donuts!', 
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() 
  },
  { 
    id: 'msg-12', 
    roomId: 'room-2', 
    senderId: 'tm10', 
    text: 'Just sent over the gala invitation design mockups. Let me know your thoughts!', 
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() 
  },
];

// ============================================================================
// PORTAL LAYOUTS - Client portal configurations
// ============================================================================
export const samplePortalLayouts: PortalLayout[] = [
  {
    clientId: 'cl1',
    components: [
      {
        id: 'portal-comp-1',
        type: 'welcome',
        settings: {
          title: 'Welcome, Hope Harbor Foundation!',
          message: 'Your centralized hub for strategic planning, project updates, and team collaboration.',
        },
      },
      {
        id: 'portal-comp-2',
        type: 'projects',
        settings: {
          title: 'Your Active Projects',
          itemLimit: 5,
        }
      },
      {
        id: 'portal-comp-3',
        type: 'calendar',
        settings: {
          title: 'Upcoming Meetings & Deadlines',
        }
      },
      {
        id: 'portal-comp-4',
        type: 'live-chat',
        settings: {
          title: 'Connect with Your Team',
        }
      },
    ],
  },
];
