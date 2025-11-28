import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, FileText, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  importData,
  validateImportedData,
  type ExportFormat,
} from '../utils/dataExportImport';

interface DataExportImportProps {
  data: any[];
  entityType: string;
  requiredFields?: string[];
  onImportComplete?: (data: any[]) => Promise<void>;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({
  data,
  entityType,
  requiredFields = [],
  onImportComplete,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification, ui } = useStore();
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleExport = async (format: ExportFormat) => {
    try {
      const filename = `${entityType.toLowerCase()}_export`;

      switch (format) {
        case 'csv':
          exportToCSV(data, { filename });
          break;
        case 'json':
          exportToJSON(data, { filename });
          break;
        case 'xlsx':
          exportToExcel(data, { filename });
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: `Exported ${data.length} ${entityType.toLowerCase()} to ${format.toUpperCase()}`,
      });

      setShowExportMenu(false);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export data',
      });
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);

    try {
      const importedData = await importData(file);

      // Validate data
      const validation = validateImportedData(importedData, requiredFields);

      if (!validation.valid) {
        setImportResult({
          success: false,
          message: `Validation failed:\n${validation.errors.join('\n')}`,
        });
        return;
      }

      // Call import handler if provided
      if (onImportComplete) {
        await onImportComplete(importedData);
      }

      setImportResult({
        success: true,
        message: `Successfully imported ${importedData.length} ${entityType.toLowerCase()}`,
        count: importedData.length,
      });

      addNotification({
        type: 'success',
        title: 'Import Successful',
        message: `Imported ${importedData.length} ${entityType.toLowerCase()}`,
      });

      // Close dialog after success
      setTimeout(() => {
        setShowImportDialog(false);
        setImportResult(null);
      }, 2000);
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || 'Failed to import data',
      });

      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: error.message || 'Failed to import data',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div className="relative">
      {/* Export/Import Buttons */}
      <div className="flex gap-2">
        {/* Export Button */}
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        {/* Import Button */}
        <button
          onClick={() => setShowImportDialog(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Export Menu */}
      <AnimatePresence>
        {showExportMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 left-0 z-50 rounded-lg shadow-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } overflow-hidden min-w-[200px]`}
          >
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleExport('csv')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <File className="w-4 h-4" />
                <span className="font-medium">JSON</span>
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">Excel</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Dialog */}
      <AnimatePresence>
        {showImportDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportDialog(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className={`max-w-md w-full rounded-2xl shadow-2xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Import {entityType}
                  </h3>
                  <button
                    onClick={() => setShowImportDialog(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  {!importResult ? (
                    <>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Upload a CSV or JSON file to import {entityType.toLowerCase()}. The file must contain the following required fields:
                      </p>

                      {requiredFields.length > 0 && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                          <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Required Fields:
                          </p>
                          <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {requiredFields.map((field) => (
                              <li key={field}>• {field}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* File Input */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.json"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={importing}
                          className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-all ${
                            importing
                              ? 'opacity-50 cursor-not-allowed'
                              : isDark
                              ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50'
                              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          {importing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                Importing...
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Choose File
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className={`p-4 rounded-lg ${
                      importResult.success
                        ? isDark ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-50 border border-green-200'
                        : isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {importResult.success ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${
                            importResult.success
                              ? 'text-green-800 dark:text-green-300'
                              : 'text-red-800 dark:text-red-300'
                          }`}>
                            {importResult.success ? 'Success!' : 'Import Failed'}
                          </h4>
                          <p className={`text-sm whitespace-pre-line ${
                            importResult.success
                              ? 'text-green-700 dark:text-green-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}>
                            {importResult.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
