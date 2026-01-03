import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Case, Client, TeamMember } from '../types';
import { CaseStatus, CasePriority } from '../types';
import { Modal } from './Modal';
import { AiEnhancedTextarea } from './AiEnhancedTextarea';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface CaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Omit<Case, 'createdAt' | 'lastUpdatedAt'> & { id?: string }) => void;
  clients: Client[];
  teamMembers: TeamMember[];
  caseToEdit?: Case | null;
}

// Case type categories for better organization
const CASE_TYPES = [
  { value: 'general', label: 'General Inquiry', icon: '📋' },
  { value: 'support', label: 'Support Request', icon: '🛠️' },
  { value: 'donation', label: 'Donation Related', icon: '💝' },
  { value: 'volunteer', label: 'Volunteer', icon: '🤝' },
  { value: 'event', label: 'Event Planning', icon: '📅' },
  { value: 'outreach', label: 'Outreach', icon: '🌍' },
  { value: 'grant', label: 'Grant/Funding', icon: '📑' },
  { value: 'followup', label: 'Follow-up', icon: '🔄' },
];

// Smart search component for clients - like searching contacts on a phone
const ClientSearch: React.FC<{
  clients: Client[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}> = ({ clients, selectedId, onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get selected client name for display
  const selectedClient = clients.find(c => c.id === selectedId);

  // Filter clients based on search query with smart matching
  const filteredClients = useMemo(() => {
    if (!query.trim()) return clients.slice(0, 10); // Show first 10 when no query

    const lowerQuery = query.toLowerCase();
    return clients
      .filter(client => {
        const name = client.name.toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = (client.phone || '').toLowerCase();
        const company = (client.company || '').toLowerCase();

        // Match start of words or contains
        return name.includes(lowerQuery) ||
               email.includes(lowerQuery) ||
               phone.includes(lowerQuery) ||
               company.includes(lowerQuery);
      })
      .sort((a, b) => {
        // Prioritize matches at start of name
        const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
        const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (bStartsWith && !aStartsWith) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [clients, query]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredClients]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filteredClients.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredClients[highlightedIndex]) {
          handleSelect(filteredClients[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery(selectedClient?.name || '');
        break;
    }
  };

  const handleSelect = (client: Client) => {
    onSelect(client.id);
    setQuery(client.name);
    setIsOpen(false);
  };

  // Set initial query when selected client changes
  useEffect(() => {
    if (selectedClient && !isOpen) {
      setQuery(selectedClient.name);
    }
  }, [selectedClient, isOpen]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: 'var(--cmf-accent)', fontWeight: 600 }}>
          {text.slice(idx, idx + query.length)}
        </span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="relative">
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'var(--cmf-text-secondary)' }}
      >
        Client *
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onSelect(''); // Clear selection when input is cleared
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Search by name, email, or phone..."
          className="w-full h-10 px-3 pl-10 text-sm rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            color: 'var(--cmf-text)',
            border: '1px solid var(--cmf-border-strong)',
          }}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {/* Search icon */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--cmf-text-faint)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        {/* Clear button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSelect('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-75 transition-opacity"
            style={{ color: 'var(--cmf-text-faint)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 py-1 rounded-lg shadow-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--cmf-surface)',
            border: '1px solid var(--cmf-border)',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
          role="listbox"
        >
          {filteredClients.length === 0 ? (
            <div className="px-4 py-3 text-center">
              <div style={{ color: 'var(--cmf-text-muted)' }} className="text-sm">
                No clients found matching "{query}"
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--cmf-text-faint)' }}>
                Try a different search term
              </div>
            </div>
          ) : (
            <>
              {query.trim() === '' && (
                <div
                  className="px-3 py-2 text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--cmf-text-faint)' }}
                >
                  Recent Clients
                </div>
              )}
              {filteredClients.map((client, index) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className="w-full px-3 py-2 flex items-center gap-3 transition-colors"
                  style={{
                    backgroundColor: highlightedIndex === index ? 'var(--cmf-accent-muted)' : 'transparent',
                  }}
                  role="option"
                  aria-selected={selectedId === client.id}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: selectedId === client.id ? 'var(--cmf-accent)' : 'var(--cmf-accent-muted)',
                      color: selectedId === client.id ? 'white' : 'var(--cmf-accent)'
                    }}
                  >
                    {getInitials(client.name)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--cmf-text)' }}
                    >
                      {highlightMatch(client.name, query)}
                    </div>
                    <div
                      className="text-xs truncate flex items-center gap-2"
                      style={{ color: 'var(--cmf-text-muted)' }}
                    >
                      {client.email && <span>{highlightMatch(client.email, query)}</span>}
                      {client.email && client.phone && <span>•</span>}
                      {client.phone && <span>{highlightMatch(client.phone, query)}</span>}
                      {!client.email && !client.phone && (
                        <span style={{ fontStyle: 'italic' }}>No contact info</span>
                      )}
                    </div>
                  </div>
                  {/* Selected check */}
                  {selectedId === client.id && (
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      style={{ color: 'var(--cmf-accent)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Priority button styles
const getPriorityStyles = (priority: CasePriority, isSelected: boolean) => {
  const configs: Record<CasePriority, { bg: string; activeBg: string; text: string }> = {
    [CasePriority.Low]: { bg: 'transparent', activeBg: 'var(--cmf-success-muted)', text: 'var(--cmf-success)' },
    [CasePriority.Medium]: { bg: 'transparent', activeBg: 'var(--cmf-warning-muted)', text: 'var(--cmf-warning)' },
    [CasePriority.High]: { bg: 'transparent', activeBg: 'var(--cmf-error-muted)', text: 'var(--cmf-error)' },
    [CasePriority.Urgent]: { bg: 'transparent', activeBg: '#ff000025', text: '#ff4444' },
  };
  const config = configs[priority];
  return {
    backgroundColor: isSelected ? config.activeBg : config.bg,
    color: isSelected ? config.text : 'var(--cmf-text-muted)',
    border: `1px solid ${isSelected ? config.text : 'var(--cmf-border)'}`,
  };
};

const initialFormData = {
  title: "",
  description: "",
  clientId: "",
  assignedToId: "",
  status: CaseStatus.New,
  priority: CasePriority.Medium,
  caseType: "general",
  dueDate: "",
  tags: [] as string[],
};

export const CaseDialog: React.FC<CaseDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  teamMembers,
  caseToEdit
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (caseToEdit) {
        setFormData({
          title: caseToEdit.title,
          description: caseToEdit.description,
          clientId: caseToEdit.clientId,
          assignedToId: caseToEdit.assignedToId,
          status: caseToEdit.status,
          priority: caseToEdit.priority,
          caseType: (caseToEdit as any).caseType || 'general',
          dueDate: (caseToEdit as any).dueDate || '',
          tags: (caseToEdit as any).tags || [],
        });
      } else {
        // Start fresh - no default client selection, user must search
        setFormData({
          ...initialFormData,
          clientId: '',
          assignedToId: teamMembers[0]?.id || ''
        });
      }
      setShowAdvanced(false);
      setTagInput('');
    }
  }, [isOpen, caseToEdit, teamMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a case title.");
      return;
    }
    if (!formData.clientId) {
      alert("Please select a client.");
      return;
    }
    if (!formData.assignedToId) {
      alert("Please select an assignee.");
      return;
    }
    onSave({
      ...formData,
      id: caseToEdit?.id,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  // Quick tags suggestions
  const suggestedTags = ['urgent', 'follow-up', 'donation', 'volunteer', 'event', 'grant'];
  const availableSuggestions = suggestedTags.filter(t => !formData.tags.includes(t));

  const selectedCaseType = CASE_TYPES.find(t => t.value === formData.caseType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={caseToEdit ? "Edit Case" : "Create New Case"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Case Type Selection */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--cmf-text-secondary)' }}
          >
            Case Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CASE_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, caseType: type.value }))}
                className="p-2 rounded-lg text-center transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: formData.caseType === type.value
                    ? 'var(--cmf-accent-muted)'
                    : 'var(--cmf-surface-elevated)',
                  border: `1px solid ${formData.caseType === type.value ? 'var(--cmf-accent)' : 'var(--cmf-border)'}`,
                  color: formData.caseType === type.value
                    ? 'var(--cmf-accent)'
                    : 'var(--cmf-text-muted)',
                }}
              >
                <span className="text-lg block mb-0.5">{type.icon}</span>
                <span className="text-[11px] leading-tight block">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Title *"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief description of the case..."
          required
          fullWidth
        />

        {/* Description with AI */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--cmf-text-secondary)' }}
          >
            Description
          </label>
          <AiEnhancedTextarea
            id="description"
            name="description"
            value={formData.description}
            onValueChange={(value) => handleTextareaChange('description', value)}
            rows={3}
            placeholder="Detailed information about the case, client needs, and any relevant context..."
            className="w-full rounded-lg px-3 py-2 text-sm transition-all duration-150 focus:outline-none"
            style={{
              backgroundColor: 'var(--cmf-surface)',
              color: 'var(--cmf-text)',
              border: '1px solid var(--cmf-border-strong)',
            }}
          />
        </div>

        {/* Client Search & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ClientSearch
            clients={clients}
            selectedId={formData.clientId}
            onSelect={(id) => setFormData(prev => ({ ...prev, clientId: id }))}
            disabled={!!caseToEdit}
          />
          <Select
            label="Assignee *"
            id="assignedToId"
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleChange}
            required
            options={teamMembers.map(member => ({ value: member.id, label: member.name }))}
            fullWidth
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={Object.values(CaseStatus).map(s => ({ value: s, label: s }))}
            fullWidth
          />
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--cmf-text-secondary)' }}
            >
              Priority
            </label>
            <div className="flex gap-2">
              {Object.values(CasePriority).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                  className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all"
                  style={getPriorityStyles(p, formData.priority === p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div
            className="space-y-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--cmf-surface-elevated)',
              border: '1px solid var(--cmf-border)'
            }}
          >
            {/* Due Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--cmf-text-secondary)' }}
              >
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full h-10 px-3 text-sm rounded-lg transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--cmf-surface)',
                  color: 'var(--cmf-text)',
                  border: '1px solid var(--cmf-border-strong)',
                }}
              />
            </div>

            {/* Tags */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--cmf-text-secondary)' }}
              >
                Tags
              </label>
              {/* Existing tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--cmf-accent-muted)',
                        color: 'var(--cmf-accent)'
                      }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-0.5 hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Add tag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                  className="flex-1 h-9 px-3 text-sm rounded-lg focus:outline-none"
                  style={{
                    backgroundColor: 'var(--cmf-surface)',
                    color: 'var(--cmf-text)',
                    border: '1px solid var(--cmf-border-strong)',
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {/* Tag suggestions */}
              {availableSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>Quick add:</span>
                  {availableSuggestions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
                      className="text-xs px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                      style={{
                        color: 'var(--cmf-text-muted)',
                        border: '1px dashed var(--cmf-border)'
                      }}
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Summary */}
        {formData.title && formData.clientId && (
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: 'var(--cmf-surface-elevated)',
              border: '1px solid var(--cmf-border)'
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{selectedCaseType?.icon || '📋'}</span>
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--cmf-text)' }}
                >
                  {formData.title}
                </span>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                style={getPriorityStyles(formData.priority, true)}
              >
                {formData.priority}
              </span>
            </div>
            <div className="mt-1.5 text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {clients.find(c => c.id === formData.clientId)?.name || 'Unknown'}
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {teamMembers.find(m => m.id === formData.assignedToId)?.name || 'Unassigned'}
              </span>
              {formData.dueDate && (
                <>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Due {new Date(formData.dueDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          className="flex justify-end gap-2 pt-4"
          style={{ borderTop: '1px solid var(--cmf-divider)' }}
        >
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            {caseToEdit ? 'Update Case' : 'Create Case'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
