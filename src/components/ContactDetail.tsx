import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign,
  Award, Building2, Home, Users, FileText, Activity,
  TrendingUp, Gift, MessageSquare, Edit, MoreVertical,
  Briefcase, ChevronRight, Star, Link2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { organizationService } from '../services/organizationService';
import { CommentThread, ActivityFeed as CollaborationActivityFeed, CollaborationErrorBoundary } from './collaboration';
import type { ContactAffiliation, TeamMember } from '../types';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: 'individual' | 'organization' | 'nonprofit' | null;
  organization: string;
  household_id: string | null;
  household?: {
    household_name: string;
  };
  total_lifetime_giving: number;
  last_gift_date: string | null;
  donor_stage: string;
  engagement_score: string;
  notes: string;
  created_at: string;
}

interface Donation {
  id: string;
  amount: number;
  donation_date: string;
  payment_method: string;
  campaign_id: string | null;
  campaign?: {
    name: string;
  };
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
}

interface ContactDetailProps {
  contactId: string;
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  onBack: () => void;
  onNavigateToHousehold?: (householdId: string) => void;
  onNavigateToOrganization?: (organizationId: string) => void;
}

export const ContactDetail: React.FC<ContactDetailProps> = ({ contactId, currentUser, teamMembers, onBack, onNavigateToHousehold, onNavigateToOrganization }) => {

  const [contact, setContact] = useState<Contact | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<Contact[]>([]);
  const [organizationAffiliations, setOrganizationAffiliations] = useState<ContactAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'giving' | 'interactions' | 'relationships' | 'notes'>('overview');

  useEffect(() => {
    if (contactId) {
      fetchContactDetails();
    }
  }, [contactId]);

  const fetchContactDetails = async () => {
    try {
      setLoading(true);

      // Fetch contact
      const { data: contactData, error: contactError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', contactId)
        .single();

      if (contactError) throw contactError;
      setContact(contactData);

      // Fetch donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .eq('client_id', contactId)
        .order('donation_date', { ascending: false });

      if (!donationsError) setDonations(donationsData || []);

      // Fetch household members if contact has household_id
      if (contactData?.household_id) {
        const { data: householdData, error: householdError } = await supabase
          .from('clients')
          .select('*')
          .eq('household_id', contactData.household_id)
          .neq('id', contactId);

        if (!householdError) setHouseholdMembers(householdData || []);
      }

      // Fetch organization affiliations
      try {
        const affiliations = await organizationService.getContactAffiliations(contactId);
        setOrganizationAffiliations(affiliations);
      } catch (err) {
        console.warn('Could not fetch organization affiliations:', err);
        setOrganizationAffiliations([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching contact details:', error);
      setLoading(false);
    }
  };

  const getEngagementBadge = (score: string) => {
    const styles = {
      high: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-gray-100 text-gray-600 border-gray-300'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${styles[score as keyof typeof styles] || styles.low}`}>
        <Award className="w-4 h-4" />
        {score?.toUpperCase() || 'LOW'} ENGAGEMENT
      </span>
    );
  };

  const getDonorStageBadge = (stage: string) => {
    const styles = {
      'Prospect': 'bg-slate-100 text-slate-700 border-slate-300',
      'First-time Donor': 'bg-blue-100 text-blue-700 border-blue-300',
      'Repeat Donor': 'bg-purple-100 text-purple-700 border-purple-300',
      'Major Donor': 'bg-amber-100 text-amber-700 border-amber-300',
      'Lapsed': 'bg-red-100 text-red-700 border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[stage as keyof typeof styles] || styles.Prospect}`}>
        {stage || 'Prospect'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Not Found</h2>
          <p className="text-gray-600 mb-6">The contact you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;
  const donationCount = donations.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Contacts
      </button>

      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {contact.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-800">{contact.name}</h1>
                {contact.type === 'organization' || contact.type === 'nonprofit' ? (
                  <Building2 className="w-6 h-6 text-blue-600" />
                ) : (
                  <Users className="w-6 h-6 text-gray-600" />
                )}
                {contact.household_id && onNavigateToHousehold && (
                  <button
                    onClick={() => onNavigateToHousehold(contact.household_id!)}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm font-medium transition-colors"
                    title="View household"
                  >
                    <Home className="w-4 h-4" />
                    <span>Household</span>
                  </button>
                )}
                {contact.household_id && !onNavigateToHousehold && (
                  <Home className="w-6 h-6 text-purple-600" title="Part of household" />
                )}
              </div>

              {contact.organization && contact.type !== 'organization' && (
                <p className="text-lg text-gray-600 mb-3">{contact.organization}</p>
              )}

              <div className="flex items-center gap-3 mb-4">
                {getEngagementBadge(contact.engagement_score)}
                {getDonorStageBadge(contact.donor_stage)}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </a>
                )}
                {contact.city && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {contact.city}, {contact.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Lifetime Giving</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${totalDonations.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{donationCount} donations</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Average Gift</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">${avgDonation.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          <p className="text-sm text-gray-500 mt-1">per donation</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Last Gift</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {contact.last_gift_date
              ? new Date(contact.last_gift_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '—'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {contact.last_gift_date
              ? `${Math.floor((Date.now() - new Date(contact.last_gift_date).getTime()) / (1000 * 60 * 60 * 24))} days ago`
              : 'Never'
            }
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Interactions</span>
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{activities.length}</p>
          <p className="text-sm text-gray-500 mt-1">total activities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'giving', label: 'Giving History', icon: Gift },
              { id: 'interactions', label: 'Interactions', icon: MessageSquare },
              { id: 'relationships', label: 'Relationships', icon: Users },
              { id: 'notes', label: 'Notes', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-800">{contact.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-base font-medium text-gray-800">{contact.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-base font-medium text-gray-800">
                      {contact.address ? `${contact.address}, ${contact.city}, ${contact.state} ${contact.zip}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-base font-medium text-gray-800">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {contact.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'giving' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Donation History</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Record Donation
                </button>
              </div>

              {donations.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Campaign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donations.map(donation => (
                      <tr key={donation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {new Date(donation.donation_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          ${Number(donation.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          {donation.payment_method?.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {(donation.campaign as any)?.name || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No donations recorded</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No interactions logged yet</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                Log Interaction
              </button>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-8">
              {/* Organization Affiliations */}
              {organizationAffiliations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Organization Affiliations
                  </h3>
                  <div className="space-y-3">
                    {organizationAffiliations.map(affiliation => (
                      <div
                        key={`${affiliation.organizationId}-${affiliation.relationshipType}`}
                        onClick={() => onNavigateToOrganization?.(affiliation.organizationId)}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                          affiliation.isCurrent
                            ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{affiliation.organizationName}</p>
                              {affiliation.isPrimaryContact && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                              {!affiliation.isCurrent && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Past</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="capitalize">{affiliation.relationshipType.replace('_', ' ')}</span>
                              {affiliation.roleTitle && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>{affiliation.roleTitle}</span>
                                </>
                              )}
                            </div>
                            {affiliation.startDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(affiliation.startDate).toLocaleDateString()} - {
                                  affiliation.endDate
                                    ? new Date(affiliation.endDate).toLocaleDateString()
                                    : 'Present'
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Household Members */}
              {householdMembers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-purple-600" />
                    Household Members
                  </h3>
                  <div className="space-y-3">
                    {householdMembers.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {organizationAffiliations.length === 0 && householdMembers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No relationships</p>
                  <p className="text-sm">This contact isn't affiliated with any organizations or household.</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Add Affiliation
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents or notes</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Notes Section */}
      <section className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Team Notes</h3>
        {!currentUser ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please log in to view and add team notes.
            </p>
          </div>
        ) : !teamMembers || teamMembers.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading team members...
            </p>
          </div>
        ) : (
          <CollaborationErrorBoundary>
            <CommentThread
              entityType="client"
              entityId={contactId}
              currentUser={currentUser}
              teamMembers={teamMembers}
              title=""
              placeholder="Add internal notes about this contact... Use @ to mention team members"
            />
          </CollaborationErrorBoundary>
        )}
      </section>

      {/* Activity History Section */}
      <section className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Activity History</h3>
        {!currentUser ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please log in to view activity history.
            </p>
          </div>
        ) : (
          <CollaborationErrorBoundary>
            <CollaborationActivityFeed
              entityType="client"
              entityId={contactId}
              currentUser={currentUser}
              compact={true}
              limit={15}
              title=""
            />
          </CollaborationErrorBoundary>
        )}
      </section>
    </div>
  );
};
