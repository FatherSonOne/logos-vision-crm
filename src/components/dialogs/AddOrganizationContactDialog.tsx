import React, { useState, useEffect } from 'react';
import { X, Building2, User, Search, UserPlus, Star, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { supabase } from '../../services/supabaseClient';
import { organizationService } from '../../services/organizationService';
import type {
  OrganizationRelationshipType,
  OrganizationContact,
  Client,
  ORGANIZATION_RELATIONSHIP_LABELS,
} from '../../types';

interface AddOrganizationContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  existingRelationship?: OrganizationContact | null; // For editing
  onSuccess: () => void;
}

const RELATIONSHIP_OPTIONS: { value: OrganizationRelationshipType; label: string }[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'donor', label: 'Donor' },
  { value: 'partner', label: 'Partner' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'member', label: 'Member' },
];

export const AddOrganizationContactDialog: React.FC<AddOrganizationContactDialogProps> = ({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  existingRelationship,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedContact, setSelectedContact] = useState<Client | null>(null);
  const [relationshipType, setRelationshipType] = useState<OrganizationRelationshipType>('employee');
  const [roleTitle, setRoleTitle] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingRelationship;

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (existingRelationship) {
        // Editing mode - populate form
        setRelationshipType(existingRelationship.relationshipType);
        setRoleTitle(existingRelationship.roleTitle || '');
        setIsPrimaryContact(existingRelationship.isPrimaryContact);
        setStartDate(existingRelationship.startDate || '');
        setEndDate(existingRelationship.endDate || '');
        setNotes(existingRelationship.notes || '');
        // Set a dummy selected contact for display
        setSelectedContact({
          id: existingRelationship.contactId,
          name: existingRelationship.contactName || 'Unknown Contact',
          email: existingRelationship.contactEmail || '',
          contactPerson: '',
          phone: '',
          location: '',
          createdAt: '',
        });
      } else {
        // Adding mode - reset form
        setSearchQuery('');
        setSearchResults([]);
        setSelectedContact(null);
        setRelationshipType('employee');
        setRoleTitle('');
        setIsPrimaryContact(false);
        setStartDate('');
        setEndDate('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, existingRelationship]);

  // Search for contacts
  useEffect(() => {
    const searchContacts = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, email, phone, location, client_type')
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .eq('is_active', true)
          .neq('client_type', 'organization')
          .neq('client_type', 'nonprofit')
          .order('name')
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error('Error searching contacts:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && !selectedContact) {
      setError('Please select a contact');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && existingRelationship) {
        // Update existing relationship
        await organizationService.updateOrganizationContact(existingRelationship.id, {
          relationshipType,
          roleTitle: roleTitle || null,
          isPrimaryContact,
          startDate: startDate || null,
          endDate: endDate || null,
          notes: notes || null,
        });
      } else if (selectedContact) {
        // Create new relationship
        await organizationService.addContactToOrganization(
          organizationId,
          selectedContact.id,
          relationshipType,
          {
            roleTitle: roleTitle || undefined,
            isPrimaryContact,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            notes: notes || undefined,
          }
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving relationship:', err);
      if (err.code === '23505') {
        setError('This contact already has this relationship type with the organization');
      } else {
        setError(err.message || 'Failed to save relationship');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRelationship || !confirm('Are you sure you want to remove this contact from the organization?')) {
      return;
    }

    setLoading(true);
    try {
      await organizationService.removeContactFromOrganization(existingRelationship.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error removing relationship:', err);
      setError(err.message || 'Failed to remove relationship');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Edit Relationship' : 'Add Contact to Organization'}
              </h2>
              <p className="text-sm text-gray-600">{organizationName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contact Search (only for new) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Contact
              </label>
              {selectedContact ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedContact.name}</p>
                      <p className="text-sm text-gray-600">{selectedContact.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Search Results Dropdown */}
                  {searchQuery.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searching ? (
                        <div className="p-4 text-center text-gray-500">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((contact) => (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => {
                              setSelectedContact(contact);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                              {contact.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{contact.name}</p>
                              <p className="text-sm text-gray-500">{contact.email}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No contacts found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Show selected contact when editing */}
          {isEditing && selectedContact && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{selectedContact.name}</p>
                  <p className="text-sm text-gray-600">{selectedContact.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <Select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as OrganizationRelationshipType)}
              options={RELATIONSHIP_OPTIONS}
              fullWidth
            />
          </div>

          {/* Role Title */}
          <Input
            label="Role/Title (Optional)"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g., CEO, Board Chair, Development Director"
            fullWidth
          />

          {/* Primary Contact Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPrimaryContact(!isPrimaryContact)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPrimaryContact ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPrimaryContact ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isPrimaryContact ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">Primary Contact</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this relationship..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            {isEditing ? (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Remove
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || (!isEditing && !selectedContact)}
              >
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Contact'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};