import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Archive, Tag, Mail, Download, Copy, CheckSquare } from 'lucide-react';
import { useStore, selectHasSelections } from '../store/useStore';

interface BulkOperationsBarProps {
  type: 'projects' | 'clients' | 'tasks' | 'cases';
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkArchive?: (ids: string[]) => Promise<void>;
  onBulkTag?: (ids: string[], tags: string[]) => Promise<void>;
  onBulkEmail?: (ids: string[]) => void;
  onBulkExport?: (ids: string[]) => void;
  onBulkDuplicate?: (ids: string[]) => Promise<void>;
}

export const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  type,
  onBulkDelete,
  onBulkArchive,
  onBulkTag,
  onBulkEmail,
  onBulkExport,
  onBulkDuplicate,
}) => {
  const { bulkSelection, deselectAll, addNotification } = useStore();
  const selectedIds = Array.from(bulkSelection[type]);
  const count = selectedIds.length;

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleAction = async (
    action: () => Promise<void> | void,
    successMessage: string
  ) => {
    setIsProcessing(true);
    try {
      await action();
      addNotification({
        type: 'success',
        title: 'Success',
        message: successMessage,
      });
      deselectAll(type);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Operation failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 backdrop-blur-xl border border-white/20">
          {/* Selection Count */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">
                {count} {type} selected
              </div>
              <div className="text-xs text-blue-100">
                Choose an action below
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-white/20" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onBulkExport && (
              <button
                onClick={() =>
                  handleAction(
                    () => onBulkExport(selectedIds),
                    `Exported ${count} ${type}`
                  )
                }
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export selected"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            )}

            {onBulkEmail && (
              <button
                onClick={() => {
                  onBulkEmail(selectedIds);
                  deselectAll(type);
                }}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send email to selected"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email</span>
              </button>
            )}

            {onBulkTag && (
              <button
                onClick={() =>
                  handleAction(
                    () => onBulkTag(selectedIds, []),
                    `Tagged ${count} ${type}`
                  )
                }
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add tags to selected"
              >
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">Tag</span>
              </button>
            )}

            {onBulkDuplicate && (
              <button
                onClick={() =>
                  handleAction(
                    () => onBulkDuplicate(selectedIds),
                    `Duplicated ${count} ${type}`
                  )
                }
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Duplicate selected"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Duplicate</span>
              </button>
            )}

            {onBulkArchive && (
              <button
                onClick={() =>
                  handleAction(
                    () => onBulkArchive(selectedIds),
                    `Archived ${count} ${type}`
                  )
                }
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Archive selected"
              >
                <Archive className="w-4 h-4" />
                <span className="text-sm font-medium">Archive</span>
              </button>
            )}

            {onBulkDelete && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete ${count} ${type}? This action cannot be undone.`
                    )
                  ) {
                    handleAction(
                      () => onBulkDelete(selectedIds),
                      `Deleted ${count} ${type}`
                    );
                  }
                }}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete selected"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-white/20" />

          {/* Cancel Button */}
          <button
            onClick={() => deselectAll(type)}
            disabled={isProcessing}
            className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
