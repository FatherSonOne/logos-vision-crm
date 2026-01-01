import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign,
  Building2, Users, FileText, Activity, TrendingUp, Gift,
  MessageSquare, Edit, MoreVertical, Plus, Link2, UserPlus,
  GitBranch, ChevronRight, Star, Briefcase, Award
} from 'lucide-react';
import { organizationService } from '../services/organizationService';
import { Button } from './ui/Button';
import type {
  OrganizationWithContacts,
  OrganizationContact,
  OrganizationHierarchy,
  ORGANIZATION_RELATIONSHIP_LABELS,
  ORGANIZATION_HIERARCHY_LABELS,
} from '../types';

interface OrganizationProfileProps {
  organizationId: string;
  onBack: () => void;
  onContactClick?: (contactId: string) => void;
  onOrganizationClick?: (organizationId: string) => void;
  onAddContact?: (organizationId: string) => void;
  onEditRelationship?: (relationship: OrganizationContact) => void;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  employee: 'Employee',
  board_member: 'Board Member',
  volunteer: 'Volunteer',
  donor: 'Donor',
  partner: 'Partner',
  consultant: 'Consultant',
  vendor: 'Vendor',
  member: 'Member',
};

const HIERARCHY_LABELS: Record<string, string> = {
  subsidiary: 'Subsidiary',
  chapter: 'Chapter',
  affiliate: 'Affiliate',
  division: 'Division',
  department: 'Department',
  branch: 'Branch',
  region: 'Region',
};

const RELATIONSHIP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  employee: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  board_member: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  volunteer: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  donor: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  partner: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  consultant: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  vendor: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  member: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const OrganizationProfile: React.FC<OrganizationProfileProps> = ({
  organizationId,
  onBack,
  onContactClick,
  onOrganizationClick,
  onAddContact,
  onEditRelationship,
}) => {
  const [organization, setOrganization] = useState<OrganizationWithContacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'hierarchy' | 'giving' | 'activities'>('overview');

  useEffect(() => {
    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getOrganizationWithDetails(organizationId);
      setOrganization(data);
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelationshipBadge = (type: string) => {
    const colors = RELATIONSHIP_COLORS[type] || RELATIONSHIP_COLORS.member;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
        {RELATIONSHIP_LABELS[type] || type}
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

  if (!organization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-6">The organization you're looking for doesn't exist.</p>
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

  const donationRollup = organization.donationRollup;
  const primaryContacts = organization.contacts.filter(c => c.isPrimaryContact);
  const boardMembers = organization.contacts.filter(c => c.relationshipType === 'board_member');
  const employees = organization.contacts.filter(c => c.relationshipType === 'employee');

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
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              <Building2 className="w-12 h-12" />
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-800">{organization.organizationName}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  organization.clientType === 'nonprofit'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {organization.clientType === 'nonprofit' ? 'Nonprofit' : 'Organization'}
                </span>
              </div>

              {organization.parentOrganization && (
                <button
                  onClick={() => onOrganizationClick?.(organization.parentOrganization!.parentOrgId)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-3"
                >
                  <GitBranch className="w-4 h-4" />
                  Part of: {organization.parentOrganization.parentOrgName}
                </button>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-600">
                {organization.email && (
                  <a href={`mailto:${organization.email}`} className="flex items-center gap-2 hover:text-blue-600">
                    <Mail className="w-4 h-4" />
                    {organization.email}
                  </a>
                )}
                {organization.phone && (
                  <a href={`tel:${organization.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                    <Phone className="w-4 h-4" />
                    {organization.phone}
                  </a>
                )}
                {organization.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {organization.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddContact?.(organizationId)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
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
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Affiliated Contacts</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{organization.affiliatedContactsCount}</p>
          <p className="text-sm text-gray-500 mt-1">{primaryContacts.length} primary</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Board Members</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{boardMembers.length}</p>
          <p className="text-sm text-gray-500 mt-1">on board</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Child Orgs</span>
            <GitBranch className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{organization.childOrgsCount}</p>
          <p className="text-sm text-gray-500 mt-1">subsidiaries</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Giving</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            ${donationRollup?.totalAmount.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">{donationRollup?.totalDonations || 0} donations</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Unique Donors</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{donationRollup?.uniqueDonors || 0}</p>
          <p className="text-sm text-gray-500 mt-1">from affiliates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'contacts', label: 'Contacts', icon: Users, count: organization.affiliatedContactsCount },
              { id: 'hierarchy', label: 'Hierarchy', icon: GitBranch, count: organization.childOrgsCount },
              { id: 'giving', label: 'Giving', icon: Gift },
              { id: 'activities', label: 'Activities', icon: Activity },
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
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Primary Contacts */}
              {primaryContacts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Primary Contacts
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {primaryContacts.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => onContactClick?.(contact.contactId)}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          {contact.contactName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{contact.contactName}</p>
                          <p className="text-sm text-gray-600">{contact.roleTitle || RELATIONSHIP_LABELS[contact.relationshipType]}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationship Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Breakdown</h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(
                    organization.contacts.reduce((acc, c) => {
                      acc[c.relationshipType] = (acc[c.relationshipType] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => {
                    const colors = RELATIONSHIP_COLORS[type] || RELATIONSHIP_COLORS.member;
                    return (
                      <div key={type} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                        <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                        <p className="text-sm text-gray-600">{RELATIONSHIP_LABELS[type] || type}s</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Child Organizations Preview */}
              {organization.childOrganizations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-indigo-500" />
                    Child Organizations
                  </h3>
                  <div className="space-y-2">
                    {organization.childOrganizations.slice(0, 3).map(child => (
                      <div
                        key={child.id}
                        onClick={() => onOrganizationClick?.(child.childOrgId)}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Building2 className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800">{child.childOrgName}</p>
                            <p className="text-sm text-gray-600">{HIERARCHY_LABELS[child.relationshipType]}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                    {organization.childOrganizations.length > 3 && (
                      <button
                        onClick={() => setActiveTab('hierarchy')}
                        className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all {organization.childOrganizations.length} organizations
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">All Affiliated Contacts</h3>
                <Button variant="primary" size="sm" onClick={() => onAddContact?.(organizationId)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {organization.contacts.length > 0 ? (
                <div className="space-y-3">
                  {organization.contacts.map(contact => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => onContactClick?.(contact.contactId)}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {contact.contactName?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{contact.contactName}</p>
                            {contact.isPrimaryContact && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {contact.roleTitle && <span>{contact.roleTitle}</span>}
                            {contact.contactEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.contactEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRelationshipBadge(contact.relationshipType)}
                        <button
                          onClick={() => onEditRelationship?.(contact)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No contacts affiliated with this organization</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => onAddContact?.(organizationId)}
                  >
                    Add First Contact
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Organization Structure</h3>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child Organization
                </Button>
              </div>

              {/* Parent Organization */}
              {organization.parentOrganization && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Parent Organization</h4>
                  <div
                    onClick={() => onOrganizationClick?.(organization.parentOrganization!.parentOrgId)}
                    className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <Building2 className="w-10 h-10 text-indigo-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{organization.parentOrganization.parentOrgName}</p>
                      <p className="text-sm text-gray-600">This organization is a {HIERARCHY_LABELS[organization.parentOrganization.relationshipType]}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Child Organizations */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Child Organizations</h4>
                {organization.childOrganizations.length > 0 ? (
                  <div className="space-y-3">
                    {organization.childOrganizations.map(child => (
                      <div
                        key={child.id}
                        onClick={() => onOrganizationClick?.(child.childOrgId)}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Building2 className="w-10 h-10 text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-800">{child.childOrgName}</p>
                            <p className="text-sm text-gray-600">{HIERARCHY_LABELS[child.relationshipType]}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No child organizations</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'giving' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Giving Summary (Roll-up)</h3>
              </div>

              {donationRollup ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-2xl font-bold text-green-700">${donationRollup.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Giving</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-2xl font-bold text-blue-700">{donationRollup.totalDonations}</p>
                      <p className="text-sm text-gray-600">Total Donations</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-2xl font-bold text-purple-700">{donationRollup.uniqueDonors}</p>
                      <p className="text-sm text-gray-600">Unique Donors</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-2xl font-bold text-amber-700">${donationRollup.averageDonation.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-sm text-gray-600">Average Gift</p>
                    </div>
                  </div>

                  {/* Last Donation */}
                  {donationRollup.lastDonationDate && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Last Donation</p>
                          <p className="font-medium text-gray-800">
                            {new Date(donationRollup.lastDonationDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-500 italic">
                    This shows the combined giving from all contacts affiliated with this organization.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No donation data available</p>
                  <p className="text-sm mt-2">Add contacts and their donations to see roll-up data</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activities logged yet</p>
              <Button variant="primary" size="sm" className="mt-4">
                Log Activity
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};