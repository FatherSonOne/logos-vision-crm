import { Client, TeamMember, Project, ProjectStatus, TaskStatus } from '../types';

export const sampleTeamMembers: TeamMember[] = [
  { id: 'tm1', name: 'Frankie Merritt', email: 'frankie@logosvision.com', role: 'Founder & Lead Consultant' },
  { id: 'tm2', name: 'Sarah Thompson', email: 'sarah@logosvision.com', role: 'Senior Project Manager' },
  { id: 'tm3', name: 'Marcus Chen', email: 'marcus@logosvision.com', role: 'Grant Writing Specialist' },
  { id: 'tm4', name: 'Emily Rodriguez', email: 'emily@logosvision.com', role: 'Data Analytics Lead' },
  { id: 'tm5', name: 'James Patterson', email: 'james@logosvision.com', role: 'Community Outreach Coordinator' },
  { id: 'tm6', name: 'Lisa Anderson', email: 'lisa@logosvision.com', role: 'Marketing & Communications' },
  { id: 'tm7', name: 'David Kim', email: 'david@logosvision.com', role: 'Technology Director' },
  { id: 'tm8', name: 'Rachel Green', email: 'rachel@logosvision.com', role: 'Junior Consultant' },
  { id: 'tm9', name: 'Michael Scott', email: 'michael@logosvision.com', role: 'Financial Advisor' },
  { id: 'tm10', name: 'Jennifer Lee', email: 'jennifer@logosvision.com', role: 'UX/UI Designer' },
  { id: 'tm11', name: 'Robert Taylor', email: 'robert@logosvision.com', role: 'Legal Counsel' },
  { id: 'tm12', name: 'Amanda Wilson', email: 'amanda@logosvision.com', role: 'Operations Manager' },
];

export const sampleClients: Client[] = [
  { id: 'cl1', name: 'Hope Harbor Foundation', contactPerson: 'Dr. Elizabeth Morrison', email: 'e.morrison@hopeharbor.org', phone: '(864) 234-5678', location: 'Charleston, SC', createdAt: '2023-03-15T10:00:00Z' },
  { id: 'cl2', name: 'Upstate Community Arts Alliance', contactPerson: 'Thomas Reynolds', email: 't.reynolds@ucaa.org', phone: '(864) 345-6789', location: 'Greenville, SC', createdAt: '2023-06-20T14:30:00Z' },
  { id: 'cl3', name: 'Youth Futures Network', contactPerson: 'Maria Gonzalez', email: 'm.gonzalez@youthfutures.org', phone: '(803) 456-7890', location: 'Columbia, SC', createdAt: '2023-09-10T09:00:00Z' },
  { id: 'cl4', name: 'Blue Ridge Environmental Trust', contactPerson: 'Jonathan Baker', email: 'j.baker@blueridgetrust.org', phone: '(828) 567-8901', location: 'Asheville, NC', createdAt: '2024-01-22T11:00:00Z' },
  { id: 'cl5', name: 'Literacy Champions SC', contactPerson: 'Patricia Chen', email: 'p.chen@literacychampions.org', phone: '(864) 678-9012', location: 'Spartanburg, SC', createdAt: '2024-02-05T16:20:00Z' },
  { id: 'cl6', name: 'Second Chance Animal Rescue', contactPerson: 'Richard Martinez', email: 'r.martinez@secondchancear.org', phone: '(864) 789-0123', location: 'Anderson, SC', createdAt: '2024-03-12T08:45:00Z' },
  { id: 'cl7', name: 'Paws & Hearts Sanctuary', contactPerson: 'Jennifer Davis', email: 'j.davis@pawsandhearts.org', phone: '(864) 890-1234', location: 'Clemson, SC', createdAt: '2024-04-01T10:00:00Z' },
  { id: 'cl8', name: 'Tech Tomorrow Initiative', contactPerson: 'William Foster', email: 'w.foster@techtomorrow.org', phone: '(864) 901-2345', location: 'Greenville, SC', createdAt: '2024-02-18T11:30:00Z' },
  { id: 'cl9', name: 'Upstate Urban Gardens', contactPerson: 'Nicole Murphy', email: 'n.murphy@upstategardens.org', phone: '(864) 012-3456', location: 'Greenville, SC', createdAt: '2023-12-01T09:00:00Z' },
  { id: 'cl10', name: 'Senior Connect Services', contactPerson: 'Charles Anderson', email: 'c.anderson@seniorconnect.org', phone: '(864) 123-4567', location: 'Easley, SC', createdAt: '2024-05-20T14:00:00Z' },
  { id: 'cl11', name: 'Lake Keowee Conservation', contactPerson: 'Patricia Wilson', email: 'p.wilson@lakekeowee.org', phone: '(864) 234-5679', location: 'Seneca, SC', createdAt: '2024-06-11T13:00:00Z' },
  { id: 'cl12', name: 'Mountain Heritage Foundation', contactPerson: 'Robert Jackson', email: 'r.jackson@mountainheritage.org', phone: '(864) 345-6780', location: 'Walhalla, SC', createdAt: '2024-07-01T15:00:00Z' },
];

export const sampleProjects: Project[] = [
  {
    id: 'p1',
    name: 'Annual Impact Gala 2025',
    description: 'Plan and execute comprehensive fundraising gala.',
    clientId: 'cl2',
    teamMemberIds: ['tm1', 'tm2', 'tm6'],
    startDate: '2024-08-01',
    endDate: '2025-03-15',
    status: ProjectStatus.InProgress,
    pinned: true,
    tasks: [
      { id: 't1_1', description: 'Secure venue', teamMemberId: 'tm2', dueDate: '2024-09-15', status: TaskStatus.Done, sharedWithClient: true },
      { id: 't1_2', description: 'Book keynote speaker', teamMemberId: 'tm1', dueDate: '2024-10-30', status: TaskStatus.Done, sharedWithClient: true },
      { id: 't1_3', description: 'Launch sponsorship campaign', teamMemberId: 'tm6', dueDate: '2024-11-15', status: TaskStatus.InProgress },
    ],
  },
  {
    id: 'p2',
    name: 'Federal Grant Application',
    description: '$250K grant for youth programs.',
    clientId: 'cl3',
    teamMemberIds: ['tm3', 'tm4'],
    startDate: '2024-09-01',
    endDate: '2025-01-31',
    status: ProjectStatus.InProgress,
    starred: true,
    tasks: [
      { id: 't2_1', description: 'Gather statistics', teamMemberId: 'tm4', dueDate: '2024-09-30', status: TaskStatus.Done },
      { id: 't2_2', description: 'Draft narrative', teamMemberId: 'tm3', dueDate: '2024-11-15', status: TaskStatus.InProgress },
    ],
  },
  {
    id: 'p3',
    name: 'Strategic Plan 2025-2030',
    description: '5-year strategic planning.',
    clientId: 'cl1',
    teamMemberIds: ['tm1', 'tm2'],
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    status: ProjectStatus.InProgress,
    tasks: [
      { id: 't3_1', description: 'Stakeholder interviews', teamMemberId: 'tm2', dueDate: '2024-07-31', status: TaskStatus.Done },
    ],
  },
];
