// Part 2: Activities, Cases, Volunteers, Donations (continued from sampleData.ts)

import { Activity, ActivityType, ActivityStatus, Case, CaseStatus, CasePriority, Volunteer, Donation } from '../types';

// ============================================================================
// ACTIVITIES - Calls, emails, meetings, notes
// ============================================================================
export const sampleActivities: Activity[] = [
  { 
    id: 'act1', 
    type: ActivityType.Call, 
    title: 'Follow-up call with Dr. Morrison on strategic plan', 
    clientId: 'cl1', 
    projectId: 'p3', 
    caseId: null,
    activityDate: '2024-11-15', 
    activityTime: '14:30', 
    status: ActivityStatus.Completed, 
    notes: 'Dr. Morrison loved the draft strategic priorities. Minor edits requested on goal #3. Board meeting scheduled for Dec 10th.', 
    createdById: 'tm1', 
    sharedWithClient: true 
  },
  { 
    id: 'act2', 
    type: ActivityType.Meeting, 
    title: 'Gala planning session with UCAA team', 
    clientId: 'cl2', 
    projectId: 'p1', 
    caseId: null,
    activityDate: '2024-11-20', 
    activityTime: '10:00', 
    status: ActivityStatus.Completed, 
    notes: 'Finalized theme: "Art Transforms Lives". Confirmed March 15th date. Sponsorship packets ready to send.', 
    createdById: 'tm2', 
    sharedWithClient: true 
  },
  { 
    id: 'act3', 
    type: ActivityType.Email, 
    title: 'Sent grant narrative draft to Maria Gonzalez', 
    clientId: 'cl3', 
    projectId: 'p2', 
    caseId: null,
    activityDate: '2024-11-18', 
    status: ActivityStatus.Completed, 
    notes: 'Emailed 15-page narrative draft. Requested feedback by Nov 25th. Emphasized the evaluation section improvements.', 
    createdById: 'tm3', 
    sharedWithClient: true 
  },
  { 
    id: 'act4', 
    type: ActivityType.Note, 
    title: 'Internal - Sponsorship strategy discussion', 
    projectId: 'p1', 
    caseId: null,
    clientId: null,
    activityDate: '2024-11-22', 
    status: ActivityStatus.Completed, 
    notes: 'Team brainstormed sponsor tiers: Platinum ($25K), Gold ($15K), Silver ($7.5K). Lisa to create sponsor benefit packages.', 
    createdById: 'tm1', 
    sharedWithClient: false 
  },
  { 
    id: 'act5', 
    type: ActivityType.Meeting, 
    title: 'Earth Month Campaign kickoff meeting', 
    clientId: 'cl4', 
    projectId: 'p4', 
    caseId: null,
    activityDate: '2025-02-05', 
    activityTime: '11:00', 
    status: ActivityStatus.Scheduled, 
    notes: 'Agenda: Campaign goals, timeline review, content strategy, volunteer recruitment targets.', 
    createdById: 'tm5', 
    sharedWithClient: true 
  },
  { 
    id: 'act6', 
    type: ActivityType.Call, 
    title: 'Check-in with Patricia Chen about mobile lab', 
    clientId: 'cl5', 
    projectId: 'p5', 
    caseId: 'case5',
    activityDate: '2024-11-28', 
    activityTime: '15:00', 
    status: ActivityStatus.Completed, 
    notes: 'Good news! Local dealership willing to donate a van. Need to finalize paperwork by Dec 15th.', 
    createdById: 'tm2', 
    sharedWithClient: true 
  },
  { 
    id: 'act7', 
    type: ActivityType.Email, 
    title: 'Sent website wireframes to Second Chance', 
    clientId: 'cl6', 
    projectId: 'p6', 
    caseId: null,
    activityDate: '2024-10-20', 
    status: ActivityStatus.Completed, 
    notes: 'Emailed complete wireframes with navigation flow. Scheduled review meeting for Oct 28th.', 
    createdById: 'tm10', 
    sharedWithClient: true 
  },
  { 
    id: 'act8', 
    type: ActivityType.Note, 
    title: 'Website migration technical notes', 
    projectId: 'p6', 
    caseId: null,
    clientId: null,
    activityDate: '2024-11-05', 
    status: ActivityStatus.Completed, 
    notes: 'Migration plan: Phase 1 - Static pages, Phase 2 - Pet database, Phase 3 - Donation system. Timeline: 3 weeks total.', 
    createdById: 'tm7', 
    sharedWithClient: false 
  },
  { 
    id: 'act9', 
    type: ActivityType.Meeting, 
    title: 'Volunteer Program retrospective', 
    clientId: 'cl9', 
    projectId: 'p7', 
    caseId: null,
    activityDate: '2024-12-05', 
    activityTime: '13:00', 
    status: ActivityStatus.Completed, 
    notes: 'Exceeded goal! Recruited 127 volunteers. Retention rate 89%. Keys to success: personal outreach and flexible schedules.', 
    createdById: 'tm5', 
    sharedWithClient: true 
  },
  { 
    id: 'act10', 
    type: ActivityType.Call, 
    title: 'Technical support call for adoption portal', 
    clientId: 'cl7', 
    projectId: 'p8', 
    caseId: 'case8',
    activityDate: '2024-11-25', 
    activityTime: '10:30', 
    status: ActivityStatus.Completed, 
    notes: 'Resolved image upload issue. Was a file size limit problem. Increased to 5MB per photo.', 
    createdById: 'tm7', 
    sharedWithClient: false 
  },
  { 
    id: 'act11', 
    type: ActivityType.Email, 
    title: 'Bootcamp curriculum delivery - all modules', 
    clientId: 'cl8', 
    projectId: 'p9', 
    caseId: null,
    activityDate: '2024-08-30', 
    status: ActivityStatus.Completed, 
    notes: 'Delivered complete 12-week curriculum with instructor guides, student materials, and project templates.', 
    createdById: 'tm1', 
    sharedWithClient: true 
  },
  { 
    id: 'act12', 
    type: ActivityType.Meeting, 
    title: 'Garden site inspection - Parker Rd location', 
    clientId: 'cl9', 
    projectId: 'p10', 
    caseId: null,
    activityDate: '2024-09-15', 
    activityTime: '09:00', 
    status: ActivityStatus.Completed, 
    notes: 'Site looks perfect. Good soil quality, water access confirmed. Ready for build day on Oct 5th.', 
    createdById: 'tm12', 
    sharedWithClient: true 
  },
  { 
    id: 'act13', 
    type: ActivityType.Note, 
    title: 'Lake conservation grant opportunity identified', 
    clientId: 'cl11', 
    projectId: null, 
    caseId: null,
    activityDate: '2024-11-29', 
    status: ActivityStatus.Completed, 
    notes: 'NOAA Coastal Program grant up to $500K. Deadline Feb 15th. Excellent fit for water quality monitoring expansion.', 
    createdById: 'tm3', 
    sharedWithClient: false 
  },
  { 
    id: 'act14', 
    type: ActivityType.Call, 
    title: 'Heritage tourism program discussion', 
    clientId: 'cl12', 
    projectId: null, 
    caseId: null,
    activityDate: '2024-11-27', 
    activityTime: '14:00', 
    status: ActivityStatus.Completed, 
    notes: 'Robert interested in heritage tourism program development. Scheduled proposal meeting for Dec 10th.', 
    createdById: 'tm1', 
    sharedWithClient: true 
  },
  { 
    id: 'act15', 
    type: ActivityType.Meeting, 
    title: 'Senior tech workshop planning', 
    clientId: 'cl10', 
    projectId: null, 
    caseId: null,
    activityDate: '2024-11-30', 
    activityTime: '11:00', 
    status: ActivityStatus.Scheduled, 
    notes: 'Plan Q1 2025 workshop series: smartphones, social media, online safety, video calls with family.', 
    createdById: 'tm8', 
    sharedWithClient: true 
  },
];

// ============================================================================
// CASES - Client support tickets and issues
// ============================================================================
export const sampleCases: Case[] = [
  { 
    id: 'case1', 
    title: 'Grant application additional documentation needed', 
    description: 'Department of Education requested supplementary materials: detailed budget narrative, 3 more partner letters, and program evaluation methodology.', 
    clientId: 'cl3', 
    assignedToId: 'tm3', 
    status: CaseStatus.InProgress, 
    priority: CasePriority.High, 
    createdAt: '2024-11-20T10:00:00Z', 
    lastUpdatedAt: '2024-11-28T14:30:00Z', 
    activityIds: [], 
    documentIds: [], 
    comments: [
      { id: 'com1-1', authorId: 'tm3', text: 'Gathered 2 of 3 partner letters. Waiting on Greenville County Schools.', timestamp: '2024-11-25T15:00:00Z' },
      { id: 'com1-2', authorId: 'tm4', text: 'Budget narrative 80% complete. Should finish by Friday.', timestamp: '2024-11-27T10:30:00Z' },
    ] 
  },
  { 
    id: 'case2', 
    title: 'Gala venue double-booking concern', 
    description: 'Received notice that venue has another inquiry for same date. Need to finalize contract ASAP and confirm deposit payment.', 
    clientId: 'cl2', 
    assignedToId: 'tm2', 
    status: CaseStatus.Resolved, 
    priority: CasePriority.High, 
    createdAt: '2024-10-15T09:00:00Z', 
    lastUpdatedAt: '2024-10-18T16:00:00Z', 
    activityIds: ['act2'], 
    documentIds: [], 
    comments: [
      { id: 'com2-1', authorId: 'tm2', text: 'Contract signed and deposit paid. March 15th date is secured!', timestamp: '2024-10-18T16:00:00Z' },
    ] 
  },
  { 
    id: 'case3', 
    title: 'Strategic plan board feedback compilation', 
    description: 'Need to compile and incorporate feedback from 12 board members on draft strategic plan before final version.', 
    clientId: 'cl1', 
    assignedToId: 'tm1', 
    status: CaseStatus.InProgress, 
    priority: CasePriority.Medium, 
    createdAt: '2024-11-18T11:00:00Z', 
    lastUpdatedAt: '2024-11-28T09:00:00Z', 
    activityIds: ['act1'], 
    documentIds: [], 
    comments: [
      { id: 'com3-1', authorId: 'tm1', text: 'Received feedback from 9 of 12 board members. Mostly minor edits and enthusiasm!', timestamp: '2024-11-26T13:00:00Z' },
    ] 
  },
  { 
    id: 'case4', 
    title: 'New volunteer orientation materials update', 
    description: 'Client requested updated orientation materials reflecting new safety protocols and expanded program offerings.', 
    clientId: 'cl9', 
    assignedToId: 'tm12', 
    status: CaseStatus.New, 
    priority: CasePriority.Low, 
    createdAt: '2024-11-29T14:00:00Z', 
    lastUpdatedAt: '2024-11-29T14:00:00Z', 
    activityIds: [], 
    documentIds: [], 
    comments: [] 
  },
  { 
    id: 'case5', 
    title: 'Mobile lab vehicle insurance requirements', 
    description: 'Need to research commercial vehicle insurance requirements for mobile literacy program van.', 
    clientId: 'cl5', 
    assignedToId: 'tm11', 
    status: CaseStatus.InProgress, 
    priority: CasePriority.Medium, 
    createdAt: '2024-11-25T10:00:00Z', 
    lastUpdatedAt: '2024-11-28T11:00:00Z', 
    activityIds: ['act6'], 
    documentIds: [], 
    comments: [
      { id: 'com5-1', authorId: 'tm11', text: 'Spoke with 3 insurance providers. Getting quotes this week.', timestamp: '2024-11-28T11:00:00Z' },
    ] 
  },
  { 
    id: 'case6', 
    title: 'Website broken donation link', 
    description: 'Major donor reported that the main "Donate Now" button leads to 404 error. Critical issue affecting fundraising.', 
    clientId: 'cl6', 
    assignedToId: 'tm7', 
    status: CaseStatus.Resolved, 
    priority: CasePriority.High, 
    createdAt: '2024-11-20T16:00:00Z', 
    lastUpdatedAt: '2024-11-20T17:30:00Z', 
    activityIds: [], 
    documentIds: [], 
    comments: [
      { id: 'com6-1', authorId: 'tm7', text: 'Fixed! Was a typo in the URL. Tested all donation links - working perfectly now.', timestamp: '2024-11-20T17:30:00Z' },
    ] 
  },
  { 
    id: 'case7', 
    title: 'Campaign volunteer coordinator needed', 
    description: 'Earth Month campaign needs dedicated volunteer coordinator. Must recruit by end of February.', 
    clientId: 'cl4', 
    assignedToId: 'tm5', 
    status: CaseStatus.New, 
    priority: CasePriority.Medium, 
    createdAt: '2024-11-29T09:00:00Z', 
    lastUpdatedAt: '2024-11-29T09:00:00Z', 
    activityIds: [], 
    documentIds: [], 
    comments: [] 
  },
  { 
    id: 'case8', 
    title: 'Adoption portal image upload bug', 
    description: 'Staff reporting errors when uploading pet photos. Multiple formats affected (JPG, PNG, HEIC).', 
    clientId: 'cl7', 
    assignedToId: 'tm7', 
    status: CaseStatus.Resolved, 
    priority: CasePriority.High, 
    createdAt: '2024-11-24T10:00:00Z', 
    lastUpdatedAt: '2024-11-25T11:00:00Z', 
    activityIds: ['act10'], 
    documentIds: [], 
    comments: [
      { id: 'com8-1', authorId: 'tm7', text: 'Issue resolved. Increased file size limit and added HEIC format support.', timestamp: '2024-11-25T11:00:00Z' },
    ] 
  },
  { 
    id: 'case9', 
    title: 'Bootcamp graduate job placement support', 
    description: 'Request for assistance connecting bootcamp graduates with local tech employers for internships.', 
    clientId: 'cl8', 
    assignedToId: 'tm1', 
    status: CaseStatus.InProgress, 
    priority: CasePriority.Medium, 
    createdAt: '2024-09-15T13:00:00Z', 
    lastUpdatedAt: '2024-11-20T10:00:00Z', 
    activityIds: [], 
    documentIds: [], 
    comments: [
      { id: 'com9-1', authorId: 'tm1', text: 'Connected with 5 local tech companies. Setting up info sessions in December.', timestamp: '2024-11-20T10:00:00Z' },
    ] 
  },
  { 
    id: 'case10', 
    title: 'Garden site permit delay - Parker Rd', 
    description: 'City permit for second garden site delayed due to zoning questions. Need to follow up with planning department.', 
    clientId: 'cl9', 
    assignedToId: 'tm11', 
    status: CaseStatus.InProgress, 
    priority: CasePriority.High, 
    createdAt: '2024-10-20T14:00:00Z', 
    lastUpdatedAt: '2024-11-15T16:00:00Z', 
    activityIds: [], 
    documentIds: [], 
    comments: [
      { id: 'com10-1', authorId: 'tm11', text: 'Meeting with city planner scheduled for Nov 30th. Should get clarity then.', timestamp: '2024-11-15T16:00:00Z' },
    ] 
  },
];

// ============================================================================
// VOLUNTEERS - Community volunteers
// ============================================================================
export const sampleVolunteers: Volunteer[] = [
  { 
    id: 'v1', 
    name: 'Emma Williams', 
    email: 'emma.w@email.com', 
    phone: '(864) 555-0101', 
    location: 'Greenville, SC', 
    skills: ['Event Planning', 'Public Speaking', 'Social Media'], 
    availability: 'Weekends', 
    assignedProjectIds: ['p1'], 
    assignedClientIds: ['cl2'] 
  },
  { 
    id: 'v2', 
    name: 'James Rodriguez', 
    email: 'j.rodriguez@email.com', 
    phone: '(864) 555-0102', 
    location: 'Greenville, SC', 
    skills: ['Graphic Design', 'Photography', 'Video Editing'], 
    availability: 'Mon, Wed, Fri afternoons', 
    assignedProjectIds: ['p1', 'p4'], 
    assignedClientIds: ['cl2', 'cl4'] 
  },
  { 
    id: 'v3', 
    name: 'Sarah Martinez', 
    email: 's.martinez@email.com', 
    phone: '(803) 555-0103', 
    location: 'Columbia, SC', 
    skills: ['Data Entry', 'Research', 'Microsoft Excel'], 
    availability: 'Weekday mornings', 
    assignedProjectIds: ['p2', 'p3'], 
    assignedClientIds: ['cl3', 'cl1'] 
  },
  { 
    id: 'v4', 
    name: 'Michael Chen', 
    email: 'm.chen@email.com', 
    phone: '(864) 555-0104', 
    location: 'Anderson, SC', 
    skills: ['Fundraising', 'Community Outreach', 'Bilingual (English/Mandarin)'], 
    availability: 'Flexible', 
    assignedProjectIds: ['p1', 'p7'], 
    assignedClientIds: ['cl2', 'cl9'] 
  },
  { 
    id: 'v5', 
    name: 'Jennifer Taylor', 
    email: 'j.taylor@email.com', 
    phone: '(864) 555-0105', 
    location: 'Spartanburg, SC', 
    skills: ['Teaching', 'Curriculum Development', 'Reading Specialist'], 
    availability: 'Tues, Thurs afternoons', 
    assignedProjectIds: ['p5'], 
    assignedClientIds: ['cl5'] 
  },
  { 
    id: 'v6', 
    name: 'David Anderson', 
    email: 'd.anderson@email.com', 
    phone: '(864) 555-0106', 
    location: 'Easley, SC', 
    skills: ['IT Support', 'Website Maintenance', 'Training'], 
    availability: 'Evenings', 
    assignedProjectIds: ['p6'], 
    assignedClientIds: ['cl6'] 
  },
  { 
    id: 'v7', 
    name: 'Lisa Thompson', 
    email: 'l.thompson@email.com', 
    phone: '(864) 555-0107', 
    location: 'Clemson, SC', 
    skills: ['Animal Care', 'Photography', 'Social Media'], 
    availability: 'Weekends', 
    assignedProjectIds: ['p8'], 
    assignedClientIds: ['cl7'] 
  },
  { 
    id: 'v8', 
    name: 'Robert Wilson', 
    email: 'r.wilson@email.com', 
    phone: '(864) 555-0108', 
    location: 'Greenville, SC', 
    skills: ['Web Development', 'Mentoring', 'Career Coaching'], 
    availability: 'Tuesday evenings', 
    assignedProjectIds: ['p9'], 
    assignedClientIds: ['cl8'] 
  },
  { 
    id: 'v9', 
    name: 'Maria Garcia', 
    email: 'm.garcia@email.com', 
    phone: '(864) 555-0109', 
    location: 'Greenville, SC', 
    skills: ['Gardening', 'Community Organizing', 'Bilingual (English/Spanish)'], 
    availability: 'Saturdays', 
    assignedProjectIds: ['p10'], 
    assignedClientIds: ['cl9'] 
  },
  { 
    id: 'v10', 
    name: 'Christopher Lee', 
    email: 'c.lee@email.com', 
    phone: '(864) 555-0110', 
    location: 'Seneca, SC', 
    skills: ['Environmental Science', 'Data Analysis', 'Report Writing'], 
    availability: 'Flexible weekdays', 
    assignedProjectIds: [], 
    assignedClientIds: ['cl11'] 
  },
  { 
    id: 'v11', 
    name: 'Amanda Brown', 
    email: 'a.brown@email.com', 
    phone: '(864) 555-0111', 
    location: 'Walhalla, SC', 
    skills: ['History Research', 'Tour Guide', 'Event Coordination'], 
    availability: 'Weekends', 
    assignedProjectIds: [], 
    assignedClientIds: ['cl12'] 
  },
  { 
    id: 'v12', 
    name: 'Daniel Murphy', 
    email: 'd.murphy@email.com', 
    phone: '(864) 555-0112', 
    location: 'Easley, SC', 
    skills: ['Senior Care', 'Technology Training', 'Patience'], 
    availability: 'Monday/Wednesday mornings', 
    assignedProjectIds: [], 
    assignedClientIds: ['cl10'] 
  },
];

// ============================================================================
// DONATIONS - Financial contributions
// ============================================================================
export const sampleDonations: Donation[] = [
  { 
    id: 'd1', 
    donorName: 'Thomas Reynolds', 
    clientId: 'cl2', 
    amount: 2500, 
    donationDate: '2024-11-25T10:00:00Z', 
    campaign: 'Annual Impact Gala 2025 - Early Sponsorship' 
  },
  { 
    id: 'd2', 
    donorName: 'Greenville Tech Partners', 
    clientId: 'cl8', 
    amount: 15000, 
    donationDate: '2024-10-15T14:00:00Z', 
    campaign: 'Coding Bootcamp Scholarship Fund' 
  },
  { 
    id: 'd3', 
    donorName: 'Anonymous Donor', 
    clientId: null, 
    amount: 5000, 
    donationDate: '2024-11-20T09:00:00Z', 
    campaign: 'General Operating Fund' 
  },
  { 
    id: 'd4', 
    donorName: 'Upstate Foundation', 
    clientId: 'cl1', 
    amount: 25000, 
    donationDate: '2024-09-30T11:00:00Z', 
    campaign: 'Strategic Planning Support' 
  },
  { 
    id: 'd5', 
    donorName: 'Maria Gonzalez', 
    clientId: 'cl3', 
    amount: 500, 
    donationDate: '2024-11-28T16:00:00Z', 
    campaign: 'Youth Programs - Personal Contribution' 
  },
  { 
    id: 'd6', 
    donorName: 'Blue Ridge Conservation Society', 
    clientId: 'cl4', 
    amount: 10000, 
    donationDate: '2024-08-15T10:00:00Z', 
    campaign: 'Earth Month Campaign Seed Funding' 
  },
  { 
    id: 'd7', 
    donorName: 'Books & Beyond Foundation', 
    clientId: 'cl5', 
    amount: 7500, 
    donationDate: '2024-10-01T14:00:00Z', 
    campaign: 'Mobile Literacy Lab - Vehicle Fund' 
  },
  { 
    id: 'd8', 
    donorName: 'Pet Lovers Anonymous', 
    clientId: 'cl6', 
    amount: 3000, 
    donationDate: '2024-09-20T11:00:00Z', 
    campaign: 'Website Redesign Project' 
  },
  { 
    id: 'd9', 
    donorName: 'Clemson Animal Advocates', 
    clientId: 'cl7', 
    amount: 5000, 
    donationDate: '2024-11-10T15:00:00Z', 
    campaign: 'Adoption Portal Development' 
  },
  { 
    id: 'd10', 
    donorName: 'Local Food Co-op', 
    clientId: 'cl9', 
    amount: 2000, 
    donationDate: '2024-08-25T10:00:00Z', 
    campaign: 'Community Garden Network - Supplies' 
  },
  { 
    id: 'd11', 
    donorName: 'Keowee Key HOA', 
    clientId: 'cl11', 
    amount: 8500, 
    donationDate: '2024-07-15T09:00:00Z', 
    campaign: 'Lake Conservation General Fund' 
  },
  { 
    id: 'd12', 
    donorName: 'Heritage SC Grant', 
    clientId: 'cl12', 
    amount: 12000, 
    donationDate: '2024-08-01T13:00:00Z', 
    campaign: 'Mountain Heritage Foundation - Operations' 
  },
  { 
    id: 'd13', 
    donorName: 'John & Mary Smith', 
    clientId: 'cl10', 
    amount: 1000, 
    donationDate: '2024-11-15T14:00:00Z', 
    campaign: 'Senior Tech Programs' 
  },
  { 
    id: 'd14', 
    donorName: 'Community First Bank', 
    clientId: 'cl2', 
    amount: 10000, 
    donationDate: '2024-11-01T10:00:00Z', 
    campaign: 'Annual Gala - Gold Sponsor' 
  },
  { 
    id: 'd15', 
    donorName: 'Tech Tomorrow Alumni', 
    clientId: 'cl8', 
    amount: 2500, 
    donationDate: '2024-11-20T16:00:00Z', 
    campaign: 'Student Support Fund' 
  },
];
