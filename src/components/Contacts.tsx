import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, Users, Building2, Home, Award, AlertCircle, Plus, Mail, Phone, Calendar, DollarSign, User, MapPin, List } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { contactService } from '../services/contactService';
import { DonationDialog } from './dialogs/DonationDialog';
import { InteractionDialog } from './dialogs/InteractionDialog';
import { TaskDialog } from './dialogs/TaskDialog';
import { ContactSlideOut } from './ContactSlideOut';
import { AddContactSlideOut } from './AddContactSlideOut';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  created_at: string;
}

interface FilterState {
  search: string;
  contactType: string[];
  engagement: string[];
  donorStage: string[];
  hasHousehold: boolean | null;
}

type ContactTypeFilter = 'all' | 'organization' | 'individual';

interface ContactsProps {
  defaultType?: ContactTypeFilter;
  onSelectContact?: (contact: Contact) => void;
  onNavigateToOrganization?: (orgId: string) => void;
}

export const Contacts: React.FC<ContactsProps> = ({ defaultType = 'all', onSelectContact, onNavigateToOrganization }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; contact: Contact } | null>(null);

  // Slide-out panel state
  const [slideOutContactId, setSlideOutContactId] = useState<string | null>(null);
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false);

  // Add/Edit contact slide-out state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  // Track newly added contact for animation
  const [newContactId, setNewContactId] = useState<string | null>(null);

  const handleOpenSlideOut = (contactId: string) => {
    setSlideOutContactId(contactId);
    setIsSlideOutOpen(true);
  };

  const handleCloseSlideOut = () => {
    setIsSlideOutOpen(false);
    // Keep contactId for animation, clear after
    setTimeout(() => setSlideOutContactId(null), 300);
  };

  // Active type filter - controlled by prominent toggle
  const [activeTypeFilter, setActiveTypeFilter] = useState<ContactTypeFilter>(defaultType);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    contactType: defaultType === 'all' ? [] : [defaultType],
    engagement: [],
    donorStage: [],
    hasHousehold: null
  });

  // Sync activeTypeFilter with filters.contactType
  useEffect(() => {
    if (activeTypeFilter === 'all') {
      setFilters(prev => ({ ...prev, contactType: [] }));
    } else {
      setFilters(prev => ({ ...prev, contactType: [activeTypeFilter] }));
    }
  }, [activeTypeFilter]);

  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [activeDialog, setActiveDialog] = useState<{
    type: 'donation' | 'interaction' | 'task' | null;
    contactId: string;
    contactName: string;
  } | null>(null);

  useEffect(() => {
    fetchContacts();

    // Close context menu on click outside
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // Use new contactService to fetch from 'contacts' table
      const data = await contactService.getAll();
      // Map to local Contact interface format
      const mappedContacts = data.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        type: c.type === 'organization_contact' ? 'organization' : 'individual' as 'individual' | 'organization' | 'nonprofit' | null,
        organization: '', // No longer using organization field
        household_id: null, // Contacts don't have households (that's for Case Management)
        household: undefined,
        total_lifetime_giving: c.totalLifetimeGiving || 0,
        last_gift_date: c.lastGiftDate || null,
        donor_stage: c.donorStage || 'Prospect',
        engagement_score: c.engagementScore || 'low',
        created_at: c.createdAt,
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.organization?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Contact type filter
      if (filters.contactType.length > 0) {
        const contactType = contact.type || 'individual';
        const isOrg = contactType === 'organization' || contactType === 'nonprofit';

        if (filters.contactType.includes('organization') && !isOrg) return false;
        if (filters.contactType.includes('individual') && isOrg) return false;
      }

      // Engagement filter
      if (filters.engagement.length > 0) {
        if (!filters.engagement.includes(contact.engagement_score)) return false;
      }

      // Donor stage filter
      if (filters.donorStage.length > 0) {
        if (!filters.donorStage.includes(contact.donor_stage || 'Prospect')) return false;
      }

      // Household filter
      if (filters.hasHousehold !== null) {
        const hasHousehold = !!contact.household_id;
        if (hasHousehold !== filters.hasHousehold) return false;
      }

      return true;
    });
  }, [contacts, filters]);

  const toggleSelectContact = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllVisibleSelected = filteredContacts.length > 0 &&
    filteredContacts.every(c => selectedIds.includes(c.id));

  const clearSelection = () => setSelectedIds([]);

  const getEngagementBadge = (score: string) => {
    const normalizedScore = score?.toLowerCase();

    const styles = {
      high: 'bg-green-50 text-green-700 border-green-200',
      medium: 'bg-amber-50 text-amber-700 border-amber-200',
      low: 'bg-gray-50 text-gray-700 border-gray-200'
    };

    const scoreKey = (normalizedScore === 'high' || normalizedScore === 'medium' || normalizedScore === 'low')
      ? normalizedScore
      : 'low';

    // Capitalize first letter for display
    const displayText = scoreKey.charAt(0).toUpperCase() + scoreKey.slice(1);

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[scoreKey]}`}>
        {displayText}
      </span>
    );
  };

  const getDonorStageBadge = (stage: string) => {
    const styles = {
      'Prospect': 'bg-gray-50 text-gray-700 border-gray-200',
      'First-time Donor': 'bg-blue-50 text-blue-700 border-blue-200',
      'New': 'bg-blue-50 text-blue-700 border-blue-200',
      'Repeat Donor': 'bg-purple-50 text-purple-700 border-purple-200',
      'Major Donor': 'bg-amber-50 text-amber-700 border-amber-200',
      'Lapsed': 'bg-red-50 text-red-700 border-red-200'
    };

    const styleKey = styles[stage as keyof typeof styles] || styles.Prospect;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styleKey}`}>
        {stage || 'Prospect'}
      </span>
    );
  };

  const getTypeIcon = (type: string | null) => {
    if (type === 'organization' || type === 'nonprofit') {
      return <Building2 className="w-5 h-5 text-blue-600" />;
    }
    return <User className="w-5 h-5 text-gray-600" />;
  };

  const handleContextMenu = (e: React.MouseEvent, contact: Contact) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent row click from firing

    // Menu dimensions
    const menuWidth = 220;
    const menuHeight = 240;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Use clientX/clientY for fixed positioning (relative to viewport)
    // These coordinates are already viewport-relative and don't need scroll adjustment
    let x = e.clientX;
    let y = e.clientY;

    // Adjust if menu would go off right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // Adjust if menu would go off bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    // Ensure minimum padding from edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    console.log('Context menu position:', { x, y, clientX: e.clientX, clientY: e.clientY, viewportWidth, viewportHeight });

    setContextMenu({ x, y, contact });
  };

  const handleQuickAction = (action: string, contact: Contact) => {
    console.log(`Quick action: ${action} for ${contact.name}`);
    setContextMenu(null);

    switch (action) {
      case 'log-interaction':
        setActiveDialog({
          type: 'interaction',
          contactId: contact.id,
          contactName: contact.name
        });
        break;
      case 'record-donation':
        setActiveDialog({
          type: 'donation',
          contactId: contact.id,
          contactName: contact.name
        });
        break;
      case 'send-email':
        if (contact.email) {
          window.location.href = `mailto:${contact.email}`;
        } else {
          alert('No email address on file for this contact.');
        }
        break;
      case 'schedule-task':
        setActiveDialog({
          type: 'task',
          contactId: contact.id,
          contactName: contact.name
        });
        break;
    }
  };

  const toggleFilter = (type: 'contactType' | 'engagement' | 'donorStage', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const clearFilters = () => {
    setActiveTypeFilter(defaultType);
    setFilters({
      search: '',
      contactType: defaultType === 'all' ? [] : [defaultType],
      engagement: [],
      donorStage: [],
      hasHousehold: null
    });
  };

  const activeFilterCount =
    (filters.contactType.length > 0 && defaultType === 'all' ? filters.contactType.length : 0) +
    filters.engagement.length +
    filters.donorStage.length +
    (filters.hasHousehold !== null ? 1 : 0);

  // Dynamic page title based on active filter
  const getPageTitle = () => {
    switch (activeTypeFilter) {
      case 'organization': return 'Organizations';
      case 'individual': return 'Individual Contacts';
      default: return 'All Contacts';
    }
  };

  // Count by type for toggle badges
  const orgCount = contacts.filter(c => c.type === 'organization' || c.type === 'nonprofit').length;
  const individualCount = contacts.filter(c => c.type === 'individual' || !c.type).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{getPageTitle()}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredContacts.length} of {contacts.length} contacts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Map
            </button>
          </div>

          <button
            onClick={() => {
              setEditingContact(null);
              setIsAddContactOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Prominent Type Toggle - Always visible */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTypeFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTypeFilter === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          All
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {contacts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTypeFilter('organization')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTypeFilter === 'organization'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organizations
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTypeFilter === 'organization'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {orgCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTypeFilter('individual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTypeFilter === 'individual'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User className="w-4 h-4" />
          Individuals
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTypeFilter === 'individual'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {individualCount}
          </span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
            {/* Engagement Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Engagement</p>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.engagement.includes(level)}
                      onChange={() => toggleFilter('engagement', level)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Donor Stage Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Donor Stage</p>
              <div className="space-y-2">
                {['Prospect', 'First-time Donor', 'Repeat Donor', 'Major Donor', 'Lapsed'].map(stage => (
                  <label key={stage} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.donorStage.includes(stage)}
                      onChange={() => toggleFilter('donorStage', stage)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-xs">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Household Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Household</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.hasHousehold === true}
                    onChange={() => setFilters(prev => ({ ...prev, hasHousehold: true }))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">In household</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.hasHousehold === false}
                    onChange={() => setFilters(prev => ({ ...prev, hasHousehold: false }))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Individual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.hasHousehold === null}
                    onChange={() => setFilters(prev => ({ ...prev, hasHousehold: null }))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">All</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded-lg">
          <div className="text-sm">
            <span className="font-semibold">{selectedIds.length}</span> contact{selectedIds.length !== 1 && 's'} selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // basic implementation: open default mail client with BCC
                const selectedEmails = filteredContacts
                  .filter(c => selectedIds.includes(c.id) && c.email)
                  .map(c => c.email);
                if (selectedEmails.length === 0) {
                  alert('No email addresses available for selected contacts.');
                  return;
                }
                window.location.href = `mailto:?bcc=${encodeURIComponent(selectedEmails.join(','))}`;
              }}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Send Email
            </button>
            <button
              onClick={() => {
                alert(`Would schedule follow-ups for ${selectedIds.length} contacts (future enhancement).`);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-white text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              Schedule Follow-ups
            </button>
            <button
              onClick={clearSelection}
              className="px-2 py-1 text-xs text-blue-700 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Contact Table */}
      {viewMode === 'table' ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={() => {
                      if (isAllVisibleSelected) {
                        // unselect all visible
                        setSelectedIds(prev =>
                          prev.filter(id => !filteredContacts.some(c => c.id === id))
                        );
                      } else {
                        // add all visible
                        const visibleIds = filteredContacts.map(c => c.id);
                        setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Household
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Donor Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lifetime Giving
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Gift
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Skeleton loading rows
                [...Array(4)].map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-4">
                      <div className="w-4 h-4 rounded border border-gray-200 bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No contacts match your filters yet.</p>
                    <p className="text-xs">Try clearing filters or changing the search.</p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-blue-600 hover:text-blue-700 underline text-sm"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr
                    key={contact.id}
                    onClick={(e) => {
                      // Left click opens slide-out panel
                      if (e.button === 0) {
                        handleOpenSlideOut(contact.id);
                      }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, contact)}
                    className={`hover:bg-blue-50/50 transition-all cursor-pointer ${
                      newContactId === contact.id ? 'animate-slideInHighlight' : ''
                    }`}
                    style={newContactId === contact.id ? {
                      animation: 'slideInHighlight 0.6s ease-out',
                    } : undefined}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(contact.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectContact(contact.id);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(contact.type)}
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          {contact.organization && contact.type !== 'organization' && contact.type !== 'nonprofit' && (
                            <div className="text-sm text-gray-500">{contact.organization}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.household_id ? (
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-rose-500" />
                          <span className="text-sm text-gray-700">
                            {(contact.household as any)?.household_name || 'Unknown'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email || '—'}</div>
                      <div className="text-sm text-gray-500">{contact.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEngagementBadge(contact.engagement_score)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDonorStageBadge(contact.donor_stage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${contact.total_lifetime_giving?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.last_gift_date
                        ? new Date(contact.last_gift_date).toLocaleDateString()
                        : '—'
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden p-4">
          <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Map View Coming Soon</p>
              <p className="text-gray-500 text-sm mt-2">
                Interactive map showing contact locations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu - rendered as portal at document root */}
      {contextMenu && createPortal(
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />

          {/* Menu */}
          <div
            className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 min-w-[220px]"
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {contextMenu.contact.name}
              </p>
            </div>

            <button
              onClick={() => handleQuickAction('log-interaction', contextMenu.contact)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <Calendar className="w-4 h-4" />
              Log Interaction
            </button>
            <button
              onClick={() => handleQuickAction('record-donation', contextMenu.contact)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <DollarSign className="w-4 h-4" />
              Record Donation
            </button>
            <button
              onClick={() => handleQuickAction('send-email', contextMenu.contact)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            <button
              onClick={() => handleQuickAction('schedule-task', contextMenu.contact)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
            >
              <Phone className="w-4 h-4" />
              Schedule Follow-up
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => {
                handleOpenSlideOut(contextMenu.contact.id);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-blue-600 font-medium"
            >
              <Users className="w-4 h-4" />
              View Full Profile
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Contact Slide-Out Panel */}
      <ContactSlideOut
        contactId={slideOutContactId}
        isOpen={isSlideOutOpen}
        onClose={handleCloseSlideOut}
        onNavigateToOrganization={onNavigateToOrganization}
        onEdit={(contact) => {
          // Close the details slide-out and open edit slide-out
          setIsSlideOutOpen(false);
          setEditingContact(contact);
          setIsAddContactOpen(true);
        }}
      />

      {/* Dialogs */}
      {activeDialog?.type === 'donation' && (
        <DonationDialog
          contactId={activeDialog.contactId}
          contactName={activeDialog.contactName}
          onClose={() => setActiveDialog(null)}
          onSuccess={() => {
            fetchContacts(); // Refresh the list
            alert('Donation recorded successfully!');
          }}
        />
      )}

      {activeDialog?.type === 'interaction' && (
        <InteractionDialog
          contactId={activeDialog.contactId}
          contactName={activeDialog.contactName}
          onClose={() => setActiveDialog(null)}
          onSuccess={() => {
            alert('Interaction logged successfully!');
          }}
        />
      )}

      {activeDialog?.type === 'task' && (
        <TaskDialog
          contactId={activeDialog.contactId}
          contactName={activeDialog.contactName}
          onClose={() => setActiveDialog(null)}
          onSuccess={() => {
            alert('Follow-up task created!');
            // later: refresh tasks widget
          }}
        />
      )}

      {/* Add/Edit Contact Slide-Out */}
      <AddContactSlideOut
        contact={editingContact}
        isOpen={isAddContactOpen}
        onClose={() => {
          setIsAddContactOpen(false);
          setEditingContact(null);
        }}
        onSuccess={(newContact) => {
          // Set new contact ID for animation
          setNewContactId(newContact.id);
          // Clear animation flag after animation completes
          setTimeout(() => setNewContactId(null), 1000);
          // Refresh the list
          fetchContacts();
          setIsAddContactOpen(false);
          setEditingContact(null);
        }}
      />
    </div>
  );
};
