import { z } from 'zod';
import { ProjectStatus, TaskStatus, CaseStatus, CasePriority, ActivityType, ActivityStatus, UserRole } from '../types';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal(''));
export const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));
export const dateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format'
);

// Team Member Validation
export const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  role: z.string().min(2, 'Role is required'),
  phone: phoneSchema,
  userRole: z.nativeEnum(UserRole).optional(),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

// Client/Organization Validation
export const clientSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: emailSchema,
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  website: urlSchema,
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Project Validation
export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  clientId: z.string().min(1, 'Client is required'),
  status: z.nativeEnum(ProjectStatus),
  startDate: dateSchema,
  endDate: dateSchema,
  budget: z.number().positive('Budget must be a positive number').optional(),
  notes: z.string().optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type ProjectFormData = z.infer<typeof projectSchema>;

// Task Validation
export const taskSchema = z.object({
  description: z.string().min(3, 'Task description must be at least 3 characters'),
  teamMemberId: z.string().min(1, 'Assignee is required'),
  dueDate: dateSchema,
  status: z.nativeEnum(TaskStatus),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  phase: z.string().optional(),
  notes: z.string().optional(),
  sharedWithClient: z.boolean().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Case Validation
export const caseSchema = z.object({
  title: z.string().min(3, 'Case title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  clientId: z.string().min(1, 'Client is required'),
  assignedToId: z.string().min(1, 'Assignee is required'),
  status: z.nativeEnum(CaseStatus),
  priority: z.nativeEnum(CasePriority),
  category: z.string().optional(),
});

export type CaseFormData = z.infer<typeof caseSchema>;

// Activity Validation
export const activitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  title: z.string().min(3, 'Activity title must be at least 3 characters'),
  projectId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  activityDate: dateSchema,
  activityTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  status: z.nativeEnum(ActivityStatus),
  notes: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().positive('Duration must be positive').optional(),
  sharedWithClient: z.boolean().optional(),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

// Volunteer Validation
export const volunteerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  location: z.string().min(2, 'Location is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  availability: z.string().min(2, 'Availability information is required'),
});

export type VolunteerFormData = z.infer<typeof volunteerSchema>;

// Donation Validation
export const donationSchema = z.object({
  donorName: z.string().min(2, 'Donor name is required'),
  clientId: z.string().optional().nullable(),
  amount: z.number().positive('Amount must be a positive number'),
  donationDate: dateSchema,
  campaign: z.string().min(2, 'Campaign name is required'),
  notes: z.string().optional(),
});

export type DonationFormData = z.infer<typeof donationSchema>;

// Event Validation
export const eventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters'),
  clientId: z.string().optional().nullable(),
  eventDate: dateSchema,
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  bannerImageUrl: urlSchema,
  isPublished: z.boolean().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

// Document Validation
export const documentSchema = z.object({
  name: z.string().min(2, 'Document name is required'),
  category: z.enum(['Client', 'Project', 'Internal', 'Template']),
  relatedId: z.string().min(1, 'Related entity is required'),
  fileType: z.enum(['pdf', 'docx', 'xlsx', 'pptx', 'other']),
  size: z.string(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// Email Campaign Validation
export const emailCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  subject: z.string().min(5, 'Subject line must be at least 5 characters'),
  subjectLineB: z.string().optional(),
  body: z.string().min(20, 'Email body must be at least 20 characters'),
  headerImageUrl: urlSchema,
  ctaButtonText: z.string().optional(),
  ctaButtonUrl: urlSchema,
  recipientSegment: z.string().min(2, 'Recipient segment is required'),
  scheduleDate: dateSchema.optional(),
});

export type EmailCampaignFormData = z.infer<typeof emailCampaignSchema>;

// Auth/Login Validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name is required'),
  role: z.nativeEnum(UserRole).optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
);

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Password Reset Validation
export const passwordResetSchema = z.object({
  email: emailSchema,
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

// Helper function to format Zod errors for display
export const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
};

// Helper hook for form validation
export const useFormValidation = <T extends z.ZodType>(schema: T) => {
  const validate = (data: unknown): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } => {
    try {
      const validData = schema.parse(data);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: formatZodErrors(error) };
      }
      return { success: false, errors: { _general: 'Validation failed' } };
    }
  };

  return { validate };
};
