/**
 * Pulse Archive Browser
 * UI to browse and import from Pulse app archive
 */

import React, { useState, useEffect } from 'react';
import { Cloud, Download, Calendar, Users, FileText, Mic, FolderOpen } from 'lucide-react';
import { browsePulseArchive, importPulseItem, bulkImportFromPulse } from '../../../services/documents/pulse/pulseArchiveImporter';
import type { PulseArchiveItem } from '../../../services/documents/pulse/pulseArchiveImporter';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Check if Pulse importer can run in current environment
 */
function canRunPulseImporter(): boolean {
    // Pulse Archive Importer requires file system access
    // This is only available in Node.js or through a backend API
    // Browser environments cannot access local file system
    return false; // Disabled until backend API is implemented
}

interface PulseBrowserProps {
  onImportComplete?: () => void;
  onClose?: () => void;
}

export const PulseBrowser: React.FC<PulseBrowserProps> = ({
  onImportComplete,
  onClose,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<PulseArchiveItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<PulseArchiveItem['type'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  // Load Pulse archive items on mount
  useEffect(() => {
    loadPulseItems();
  }, [filterType]);

  const loadPulseItems = async () => {
    setIsLoading(true);
    try {
      // Check if Pulse importer can run in this environment
      if (!canRunPulseImporter()) {
        console.warn('Pulse Archive Importer requires backend API');
        setItems([]);
        setIsLoading(false);
        return;
      }

      const options = filterType !== 'all' ? { type: filterType } : undefined;
      const pulseItems = await browsePulseArchive(options);
      setItems(pulseItems);
    } catch (error) {
      console.error('Error loading Pulse items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSelected = async () => {
    if (!user?.id) return;

    setIsImporting(true);
    const itemsToImport = items.filter(item => selectedItems.has(item.id));

    try {
      const result = await bulkImportFromPulse(
        itemsToImport,
        user.id,
        (progress) => setImportProgress(progress)
      );

      console.log('Import result:', result);

      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }

      // Refresh list
      loadPulseItems();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error importing:', error);
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const getTypeIcon = (type: PulseArchiveItem['type']) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'conversation': return <FileText className="w-4 h-4" />;
      case 'vox': return <Mic className="w-4 h-4" />;
      case 'project': return <FolderOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-cyan-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pulse Archive Browser
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
        {['all', 'meeting', 'conversation', 'vox', 'project'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Loading Pulse archive...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Cloud className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Pulse Integration Not Available
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-4">
              The Pulse Archive Browser requires a backend API to access files.
              This feature needs server-side implementation to work in the browser.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>For developers:</strong> Implement a REST API endpoint that can browse
                the Pulse archive directory and return available items. See the backend
                documentation for implementation details.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedItems.has(item.id)
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-700'
                }`}
                onClick={() => {
                  const newSelected = new Set(selectedItems);
                  if (newSelected.has(item.id)) {
                    newSelected.delete(item.id);
                  } else {
                    newSelected.add(item.id);
                  }
                  setSelectedItems(newSelected);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => {}}
                  className="w-4 h-4 text-cyan-500 rounded border-slate-300 dark:border-slate-600"
                />
                <div className="flex-shrink-0 text-cyan-500">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.date} {item.participants && `• ${item.participants.length} participants`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
        </div>
        <button
          onClick={handleImportSelected}
          disabled={selectedItems.size === 0 || isImporting}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-4 h-4" />
          {isImporting
            ? `Importing (${importProgress.current}/${importProgress.total})...`
            : 'Import Selected'}
        </button>
      </div>
    </div>
  );
};
