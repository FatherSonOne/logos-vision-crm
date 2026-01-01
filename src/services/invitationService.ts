// Invitation Service - Handles team invitations via Resend email
import { supabase } from './supabaseClient';

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface InviteTeamMemberParams {
  email: string;
  role?: 'admin' | 'editor' | 'viewer';
  invitedByName: string;
  invitedById: string;
  personalMessage?: string;
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export const invitationService = {
  // Send team invitation email
  async sendInvitation(params: InviteTeamMemberParams): Promise<{ success: boolean; error?: string; invitation?: Invitation }> {
    const { email, role = 'viewer', invitedByName, invitedById, personalMessage } = params;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('team_members')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return { success: false, error: 'This person is already a team member' };
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return { success: false, error: 'An invitation has already been sent to this email' };
    }

    // Generate invitation token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Create invitation record
    const invitation: Omit<Invitation, 'id'> = {
      email: email.toLowerCase(),
      role,
      invitedBy: invitedById,
      invitedByName,
      status: 'pending',
      token,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    const { data: savedInvitation, error: dbError } = await supabase
      .from('invitations')
      .insert(invitation)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving invitation:', dbError);
      // Continue anyway - we'll send the email even if DB save fails in dev
    }

    // Send invitation email via Resend
    const inviteUrl = `${APP_URL}/invite/${token}`;

    try {
      const emailResult = await this.sendInvitationEmail({
        to: email,
        invitedByName,
        inviteUrl,
        role,
        personalMessage
      });

      if (!emailResult.success) {
        // If email fails, mark invitation as failed or delete it
        if (savedInvitation?.id) {
          await supabase.from('invitations').delete().eq('id', savedInvitation.id);
        }
        return { success: false, error: emailResult.error || 'Failed to send invitation email' };
      }

      return {
        success: true,
        invitation: savedInvitation as Invitation
      };
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      return { success: false, error: error.message || 'Failed to send invitation' };
    }
  },

  // Send the actual email via Resend API
  async sendInvitationEmail(params: {
    to: string;
    invitedByName: string;
    inviteUrl: string;
    role: string;
    personalMessage?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { to, invitedByName, inviteUrl, role, personalMessage } = params;

    if (!RESEND_API_KEY) {
      console.warn('Resend API key not configured - invitation email not sent');
      // In development, we'll just log the invitation
      console.log('=== INVITATION EMAIL (DEV MODE) ===');
      console.log('To:', to);
      console.log('Invite URL:', inviteUrl);
      console.log('Role:', role);
      console.log('From:', invitedByName);
      console.log('=====================================');
      return { success: true }; // Return success in dev mode
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>You're Invited to Logos Vision CRM</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 40px 30px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Logos Vision CRM</h1>
                      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Nonprofit Relationship Management</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">You're Invited!</h2>

                      <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                        <strong>${invitedByName}</strong> has invited you to join their team on Logos Vision CRM as a <strong>${role}</strong>.
                      </p>

                      ${personalMessage ? `
                      <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px 0;">
                        <p style="color: #475569; font-size: 14px; line-height: 22px; margin: 0; font-style: italic;">"${personalMessage}"</p>
                      </div>
                      ` : ''}

                      <p style="color: #475569; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Click the button below to accept your invitation and create your account.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                              Accept Invitation
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #94a3b8; font-size: 14px; line-height: 22px; margin: 30px 0 0 0; text-align: center;">
                        This invitation expires in 7 days.
                      </p>

                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

                      <p style="color: #94a3b8; font-size: 12px; line-height: 20px; margin: 0;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${inviteUrl}" style="color: #4f46e5; word-break: break-all;">${inviteUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                        This email was sent by Logos Vision CRM<br>
                        If you didn't expect this invitation, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Logos Vision CRM <noreply@logosvision.org>',
          to: [to],
          subject: `${invitedByName} invited you to Logos Vision CRM`,
          html: emailHtml
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API error:', errorData);
        return { success: false, error: errorData.message || 'Failed to send email' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error calling Resend API:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  },

  // Accept an invitation
  async acceptInvitation(token: string, userId: string): Promise<{ success: boolean; error?: string }> {
    // Find the invitation
    const { data: invitation, error: findError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      return { success: false, error: 'This invitation has expired' };
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return { success: false, error: 'Failed to accept invitation' };
    }

    // Add user to team_members with the invited role
    const { error: teamError } = await supabase
      .from('team_members')
      .insert({
        user_id: userId,
        email: invitation.email,
        role: invitation.role,
        invited_by: invitation.invitedBy,
        created_at: new Date().toISOString()
      });

    if (teamError) {
      console.error('Error adding team member:', teamError);
      // Don't fail - the user is still authenticated
    }

    return { success: true };
  },

  // Get pending invitations (for admin view)
  async getPendingInvitations(): Promise<{ invitations: Invitation[]; error?: string }> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('status', 'pending')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return { invitations: [], error: error.message };
    }

    return { invitations: data as Invitation[] };
  },

  // Resend an invitation
  async resendInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    const { data: invitation, error: findError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (findError || !invitation) {
      return { success: false, error: 'Invitation not found' };
    }

    // Generate new token and expiry
    const newToken = generateToken();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Update invitation
    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        token: newToken,
        expiresAt: newExpiry,
        status: 'pending'
      })
      .eq('id', invitationId);

    if (updateError) {
      return { success: false, error: 'Failed to update invitation' };
    }

    // Send new email
    const inviteUrl = `${APP_URL}/invite/${newToken}`;
    return this.sendInvitationEmail({
      to: invitation.email,
      invitedByName: invitation.invitedByName,
      inviteUrl,
      role: invitation.role
    });
  },

  // Cancel/delete an invitation
  async cancelInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
};
