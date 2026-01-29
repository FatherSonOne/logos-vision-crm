import { useState, useEffect } from 'react';
import { previewGoogleContacts, importSelectedContacts, type PreviewContact } from '../../services/pulseApiService';
import { logger } from '../../utils/logger';

interface ContactPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  workspaceId: string;
}

export function ContactPreviewModal({ isOpen, onClose, onImportComplete, workspaceId }: ContactPreviewModalProps) {
  const [contacts, setContacts] = useState<PreviewContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    skipped_no_identifier: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-email' | 'with-phone' | 'with-either'>('with-either');

  // Load contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadContacts();
      setSelectedContacts(new Set());
      setImportResult(null);
      setError(null);
    }
  }, [isOpen]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info('[ContactPreview] Loading Google Contacts preview');
      const result = await previewGoogleContacts(workspaceId);
      setContacts(result.contacts);
      logger.info(`[ContactPreview] Loaded ${result.contacts.length} contacts`);
    } catch (err: any) {
      logger.error('[ContactPreview] Error loading contacts:', err);
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const filtered = getFilteredContacts();
    if (selectedContacts.size === filtered.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filtered.map(c => c.resourceName)));
    }
  };

  const handleToggleContact = (resourceName: string) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(resourceName)) {
      newSelection.delete(resourceName);
    } else {
      newSelection.add(resourceName);
    }
    setSelectedContacts(newSelection);
  };

  const handleImport = async () => {
    if (selectedContacts.size === 0) {
      setError('Please select at least one contact to import');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      logger.info(`[ContactPreview] Importing ${selectedContacts.size} selected contacts`);
      const result = await importSelectedContacts(workspaceId, Array.from(selectedContacts));
      logger.info('[ContactPreview] Import complete:', result);

      setImportResult(result);

      // Auto-close modal after 3 seconds
      setTimeout(() => {
        onImportComplete();
        onClose();
      }, 3000);
    } catch (err: any) {
      logger.error('[ContactPreview] Error importing contacts:', err);
      setError(err.message || 'Failed to import contacts');
    } finally {
      setImporting(false);
    }
  };

  const getFilteredContacts = () => {
    let filtered = contacts;

    // Apply type filter
    if (filterType === 'with-email') {
      filtered = filtered.filter(c => c.email);
    } else if (filterType === 'with-phone') {
      filtered = filtered.filter(c => c.phone);
    } else if (filterType === 'with-either') {
      filtered = filtered.filter(c => c.hasIdentifier);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  if (!isOpen) return null;

  const filteredContacts = getFilteredContacts();
  const allSelected = filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length;

  return (
    <div
      className="fixed bg-black/50 backdrop-blur-sm overflow-y-auto"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      {/* Centering wrapper */}
      <div
        className="flex items-center justify-center p-4"
        style={{
          minHeight: '100vh',
        }}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col w-full"
          style={{
            maxWidth: '56rem',
            maxHeight: '85vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Preview Google Contacts
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All contacts</option>
              <option value="with-either">With email or phone</option>
              <option value="with-email">With email only</option>
              <option value="with-phone">With phone only</option>
            </select>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              {filteredContacts.length} contacts • {selectedContacts.size} selected
            </div>
            <button
              onClick={handleSelectAll}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error && !importResult ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={loadContacts}
                className="mt-2 text-red-600 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : importResult ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-green-600 dark:text-green-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Import Complete!
              </h3>
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <p>✅ {importResult.imported} contacts imported successfully</p>
                {importResult.skipped_no_identifier > 0 && (
                  <p>⚠️ {importResult.skipped_no_identifier} skipped (no email/phone)</p>
                )}
                {importResult.failed > 0 && (
                  <p>❌ {importResult.failed} failed</p>
                )}
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Closing in 3 seconds...
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No contacts found matching your filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.resourceName}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedContacts.has(contact.resourceName)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleToggleContact(contact.resourceName)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.resourceName)}
                      onChange={() => handleToggleContact(contact.resourceName)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {contact.name}
                        </h3>
                        {!contact.hasIdentifier && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                            No email/phone
                          </span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {contact.phone}
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {contact.company}
                            {contact.title && ` • ${contact.title}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!importResult && !loading && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedContacts.size} {selectedContacts.size === 1 ? 'contact' : 'contacts'} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={importing}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedContacts.size === 0 || importing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    Import {selectedContacts.size > 0 && `(${selectedContacts.size})`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
