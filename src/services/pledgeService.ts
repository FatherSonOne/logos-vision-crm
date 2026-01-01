import { supabase } from './supabaseClient';
import type { Pledge, PledgeSummary, PledgePayment, PledgeFrequency, PledgeStatus } from '../types';

// Helper to map database row to Pledge type
const mapPledgeRow = (row: any): Pledge => ({
  id: row.id,
  clientId: row.client_id,
  pledgeAmount: parseFloat(row.pledge_amount) || 0,
  frequency: row.frequency as PledgeFrequency,
  startDate: row.start_date,
  endDate: row.end_date,
  totalPledged: parseFloat(row.total_pledged) || 0,
  totalFulfilled: parseFloat(row.total_fulfilled) || 0,
  status: row.status as PledgeStatus,
  campaign: row.campaign,
  fund: row.fund,
  notes: row.notes,
  reminderEnabled: row.reminder_enabled ?? true,
  reminderDaysBefore: row.reminder_days_before ?? 7,
  lastReminderSent: row.last_reminder_sent,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Helper to map pledge_summary view row
const mapPledgeSummaryRow = (row: any): PledgeSummary => ({
  ...mapPledgeRow(row),
  clientName: row.client_name || 'Unknown',
  clientEmail: row.client_email,
  fulfillmentPercentage: parseFloat(row.fulfillment_percentage) || 0,
  remainingAmount: parseFloat(row.remaining_amount) || 0,
  nextPaymentDue: row.next_payment_due,
  paymentCount: row.payment_count || 0,
});

// Helper to map payment row
const mapPaymentRow = (row: any): PledgePayment => ({
  id: row.id,
  pledgeId: row.pledge_id,
  donationId: row.donation_id,
  amount: parseFloat(row.amount) || 0,
  paymentDate: row.payment_date,
  createdAt: row.created_at,
});

// Calculate total pledged based on frequency and duration
const calculateTotalPledged = (
  amount: number,
  frequency: PledgeFrequency,
  startDate: string,
  endDate: string | null
): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  switch (frequency) {
    case 'monthly':
      return amount * Math.max(monthsDiff, 1);
    case 'quarterly':
      return amount * Math.max(Math.ceil(monthsDiff / 3), 1);
    case 'annually':
      return amount * Math.max(Math.ceil(monthsDiff / 12), 1);
    case 'one-time':
      return amount;
    default:
      return amount;
  }
};

export const pledgeService = {
  // Get all pledges with summary data
  async getAll(filters?: {
    status?: PledgeStatus;
    clientId?: string;
    campaign?: string;
  }): Promise<PledgeSummary[]> {
    let query = supabase
      .from('pledge_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters?.campaign) {
      query = query.eq('campaign', filters.campaign);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapPledgeSummaryRow);
  },

  // Get single pledge by ID
  async getById(id: string): Promise<PledgeSummary | null> {
    const { data, error } = await supabase
      .from('pledge_summary')
      .select('*')
      .eq('pledge_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return mapPledgeSummaryRow(data);
  },

  // Create new pledge
  async create(pledge: Omit<Pledge, 'id' | 'totalFulfilled' | 'createdAt' | 'updatedAt'>): Promise<Pledge> {
    const totalPledged = calculateTotalPledged(
      pledge.pledgeAmount,
      pledge.frequency,
      pledge.startDate,
      pledge.endDate || null
    );

    const { data, error } = await supabase
      .from('pledges')
      .insert({
        client_id: pledge.clientId,
        pledge_amount: pledge.pledgeAmount,
        frequency: pledge.frequency,
        start_date: pledge.startDate,
        end_date: pledge.endDate || null,
        total_pledged: totalPledged,
        status: pledge.status,
        campaign: pledge.campaign || null,
        fund: pledge.fund || null,
        notes: pledge.notes || null,
        reminder_enabled: pledge.reminderEnabled,
        reminder_days_before: pledge.reminderDaysBefore,
      })
      .select()
      .single();

    if (error) throw error;
    return mapPledgeRow(data);
  },

  // Update pledge
  async update(id: string, updates: Partial<Pledge>): Promise<Pledge> {
    const updateData: any = {};

    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.pledgeAmount !== undefined) updateData.pledge_amount = updates.pledgeAmount;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.campaign !== undefined) updateData.campaign = updates.campaign;
    if (updates.fund !== undefined) updateData.fund = updates.fund;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.reminderEnabled !== undefined) updateData.reminder_enabled = updates.reminderEnabled;
    if (updates.reminderDaysBefore !== undefined) updateData.reminder_days_before = updates.reminderDaysBefore;

    // Recalculate total pledged if amount, frequency, or dates changed
    if (updates.pledgeAmount || updates.frequency || updates.startDate || updates.endDate) {
      // Fetch current pledge to get missing values
      const { data: current } = await supabase
        .from('pledges')
        .select('*')
        .eq('id', id)
        .single();

      if (current) {
        const amount = updates.pledgeAmount ?? parseFloat(current.pledge_amount);
        const frequency = updates.frequency ?? current.frequency;
        const startDate = updates.startDate ?? current.start_date;
        const endDate = updates.endDate ?? current.end_date;

        updateData.total_pledged = calculateTotalPledged(amount, frequency, startDate, endDate);
      }
    }

    const { data, error } = await supabase
      .from('pledges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapPledgeRow(data);
  },

  // Delete pledge
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pledges')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get payments for a pledge
  async getPayments(pledgeId: string): Promise<PledgePayment[]> {
    const { data, error } = await supabase
      .from('pledge_payments')
      .select('*')
      .eq('pledge_id', pledgeId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapPaymentRow);
  },

  // Record a payment against a pledge
  async recordPayment(pledgeId: string, donationId: string, amount: number, paymentDate: string): Promise<PledgePayment> {
    const { data, error } = await supabase
      .from('pledge_payments')
      .insert({
        pledge_id: pledgeId,
        donation_id: donationId,
        amount,
        payment_date: paymentDate,
      })
      .select()
      .single();

    if (error) throw error;
    return mapPaymentRow(data);
  },

  // Remove a payment
  async removePayment(paymentId: string): Promise<void> {
    const { error } = await supabase
      .from('pledge_payments')
      .delete()
      .eq('id', paymentId);

    if (error) throw error;
  },

  // Get pledge statistics
  async getStats(): Promise<{
    totalPledges: number;
    activePledges: number;
    totalPledgedAmount: number;
    totalFulfilledAmount: number;
    overallFulfillmentRate: number;
  }> {
    const { data, error } = await supabase
      .from('pledges')
      .select('status, total_pledged, total_fulfilled');

    if (error) throw error;

    const pledges = data || [];
    const activePledges = pledges.filter(p => p.status === 'active');
    const totalPledgedAmount = pledges.reduce((sum, p) => sum + (parseFloat(p.total_pledged) || 0), 0);
    const totalFulfilledAmount = pledges.reduce((sum, p) => sum + (parseFloat(p.total_fulfilled) || 0), 0);

    return {
      totalPledges: pledges.length,
      activePledges: activePledges.length,
      totalPledgedAmount,
      totalFulfilledAmount,
      overallFulfillmentRate: totalPledgedAmount > 0 ? (totalFulfilledAmount / totalPledgedAmount) * 100 : 0,
    };
  },

  // Get pledges due for reminder
  async getPledgesDueForReminder(): Promise<PledgeSummary[]> {
    const { data, error } = await supabase
      .from('pledge_summary')
      .select('*')
      .eq('status', 'active')
      .eq('reminder_enabled', true);

    if (error) throw error;

    // Filter pledges where next_payment_due is within reminder_days_before days
    const today = new Date();
    return (data || [])
      .map(mapPledgeSummaryRow)
      .filter(pledge => {
        if (!pledge.nextPaymentDue) return false;
        const dueDate = new Date(pledge.nextPaymentDue);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0 && daysUntilDue <= pledge.reminderDaysBefore;
      });
  },

  // Get unique campaigns from pledges
  async getCampaigns(): Promise<string[]> {
    const { data, error } = await supabase
      .from('pledges')
      .select('campaign')
      .not('campaign', 'is', null);

    if (error) throw error;
    const campaigns = [...new Set((data || []).map(d => d.campaign).filter(Boolean))];
    return campaigns.sort();
  },
};
