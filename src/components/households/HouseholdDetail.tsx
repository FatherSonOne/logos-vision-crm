import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { Household, Client, RelationshipType } from '../../types';
import { Button, IconButton } from '../ui/Button';
import { Modal } from '../Modal';
import { Select } from '../ui/Select';
import {
  Users,
  ArrowLeft,
  Edit2,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  UserMinus,
} from 'lucide-react';

interface HouseholdMemberWithDetails extends Client {
  relationshipType: RelationshipType;
  isPrimary: boolean;
  relationshipId: string;
}

interface HouseholdDetailProps {
  householdId: string;
  onBack: () => void;
  onEdit: () => void;
}

export const HouseholdDetail: React.FC<HouseholdDetailProps> = ({
  householdId,
  onBack,
  onEdit,
}) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMemberWithDetails[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add member modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType>('Member');
  const [addingMember, setAddingMember] = useState(false);

  // Stats
  const [totalDonated, setTotalDonated] = useState(0);
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);

  const relationshipOptions: RelationshipType[] = [
    'Head of Household',
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Other',
    'Member',
  ];

  useEffect(() => {
    fetchHouseholdData();
  }, [householdId]);

  const fetchHouseholdData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch household details
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
        .single();

      if (householdError) throw householdError;

      setHousehold({
        id: householdData.id,
        name: householdData.name,
        address: householdData.address,
        city: householdData.city,
        state: householdData.state,
        zipCode: householdData.zip_code,
        phone: householdData.phone,
        email: householdData.email,
        notes: householdData.notes,
        primaryContactId: householdData.primary_contact_id,
        isActive: householdData.is_active,
        createdAt: householdData.created_at,
        updatedAt: householdData.updated_at,
      });

      // Fetch members with relationship info
      const { data: memberData, error: memberError } = await supabase
        .from('household_relationships')
        .select(`
          id,
          relationship_type,
          is_primary,
          clients (
            id,
            name,
            contact_person,
            email,
            phone,
            location,
            created_at
          )
        `)
        .eq('household_id', householdId);

      if (memberError) throw memberError;

      const mappedMembers: HouseholdMemberWithDetails[] = (memberData || [])
        .filter((m: any) => m.clients)
        .map((m: any) => ({
          id: m.clients.id,
          name: m.clients.name,
          contactPerson: m.clients.contact_person,
          email: m.clients.email,
          phone: m.clients.phone,
          location: m.clients.location,
          createdAt: m.clients.created_at,
          relationshipType: m.relationship_type as RelationshipType,
          isPrimary: m.is_primary,
          relationshipId: m.id,
        }));

      setMembers(mappedMembers);

      // Fetch donation totals for all members
      const memberIds = mappedMembers.map(m => m.id);
      if (memberIds.length > 0) {
        const { data: donationData } = await supabase
          .from('donations')
          .select('amount, donation_date')
          .in('client_id', memberIds);

        if (donationData && donationData.length > 0) {
          const total = donationData.reduce((sum, d) => sum + parseFloat(d.amount), 0);
          setTotalDonated(total);

          const dates = donationData.map(d => new Date(d.donation_date)).sort((a, b) => b.getTime() - a.getTime());
          setLastDonationDate(dates[0]?.toISOString() || null);
        }
      }

      // Fetch available contacts (not in any household)
      const { data: contactsData, error: contactsError } = await supabase
        .from('clients')
        .select('*')
        .is('household_id', null)
        .order('name');

      if (contactsError) throw contactsError;

      setAvailableContacts(
        (contactsData || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          contactPerson: c.contact_person,
          email: c.email,
          phone: c.phone,
          location: c.location,
          createdAt: c.created_at,
        }))
      );
    } catch (err: any) {
      console.error('Error fetching household:', err);
      setError(err.message || 'Failed to load household');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedContactId) return;

    try {
      setAddingMember(true);

      // Create relationship
      const { error: relError } = await supabase.from('household_relationships').insert({
        household_id: householdId,
        client_id: selectedContactId,
        relationship_type: selectedRelationship,
        is_primary: members.length === 0, // First member is primary
      });

      if (relError) throw relError;

      // Update client's household_id
      const { error: updateError } = await supabase
        .from('clients')
        .update({ household_id: householdId })
        .eq('id', selectedContactId);

      if (updateError) throw updateError;

      // Refresh data
      await fetchHouseholdData();
      setIsAddMemberOpen(false);
      setSelectedContactId('');
      setSelectedRelationship('Member');
    } catch (err: any) {
      console.error('Error adding member:', err);
      alert(err.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (member: HouseholdMemberWithDetails) => {
    if (!window.confirm(`Remove ${member.name} from this household?`)) return;

    try {
      // Delete relationship
      const { error: relError } = await supabase
        .from('household_relationships')
        .delete()
        .eq('id', member.relationshipId);

      if (relError) throw relError;

      // Clear client's household_id
      const { error: updateError } = await supabase
        .from('clients')
        .update({ household_id: null })
        .eq('id', member.id);

      if (updateError) throw updateError;

      // Update local state
      setMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (err: any) {
      console.error('Error removing member:', err);
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleSetPrimary = async (memberId: string) => {
    try {
      // Clear all primary flags for this household
      await supabase
        .from('household_relationships')
        .update({ is_primary: false })
        .eq('household_id', householdId);

      // Set selected as primary
      await supabase
        .from('household_relationships')
        .update({ is_primary: true })
        .eq('household_id', householdId)
        .eq('client_id', memberId);

      // Update household primary_contact_id
      await supabase
        .from('households')
        .update({ primary_contact_id: memberId })
        .eq('id', householdId);

      // Update local state
      setMembers(prev =>
        prev.map(m => ({
          ...m,
          isPrimary: m.id === memberId,
        }))
      );
    } catch (err: any) {
      console.error('Error setting primary:', err);
      alert(err.message || 'Failed to update primary contact');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !household) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Household not found'}</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Households
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{household.name}</h1>
          {(household.city || household.state) && (
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {[household.address, household.city, household.state, household.zipCode]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{members.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalDonated)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Given</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {lastDonationDate ? new Date(lastDonationDate).toLocaleDateString() : 'Never'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Last Gift</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(members.length > 0 ? totalDonated / members.length : 0)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg per Member</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      {(household.phone || household.email) && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Contact Information</h3>
          <div className="flex flex-wrap gap-6">
            {household.phone && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4" />
                <a href={`tel:${household.phone}`} className="hover:text-rose-600 dark:hover:text-rose-400">
                  {household.phone}
                </a>
              </div>
            )}
            {household.email && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${household.email}`} className="hover:text-rose-600 dark:hover:text-rose-400">
                  {household.email}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Household Members</h3>
          <Button variant="outline" size="sm" onClick={() => setIsAddMemberOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No members yet. Add contacts to this household.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{member.name}</span>
                      {member.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs rounded-full">
                          <Star className="w-3 h-3" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.relationshipType}</p>
                    {member.email && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!member.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(member.id)}
                      className="text-slate-500 hover:text-rose-600"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<UserMinus className="w-4 h-4" />}
                    onClick={() => handleRemoveMember(member)}
                    title="Remove from household"
                    className="text-slate-500 hover:text-red-600"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {household.notes && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Notes</h3>
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{household.notes}</p>
        </div>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Add Member to Household">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Contact
            </label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="">Select a contact...</option>
              {availableContacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} {contact.email ? `(${contact.email})` : ''}
                </option>
              ))}
            </select>
            {availableContacts.length === 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No unassigned contacts available. Create a new contact first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Relationship
            </label>
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value as RelationshipType)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              {relationshipOptions.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddMember}
              disabled={!selectedContactId || addingMember}
            >
              {addingMember ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
