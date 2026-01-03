import React, { useState, useCallback, useRef } from 'react';

/**
 * Smart Data Import/Export Component
 *
 * Features:
 * - CSV/Excel drag-and-drop import with field mapping
 * - Import templates for common formats
 * - Data validation and duplicate detection
 * - Export to CSV/Excel/PDF
 * - Scheduled exports
 */

// ============================================
// TYPES
// ============================================

type ImportStatus = 'idle' | 'uploading' | 'mapping' | 'validating' | 'importing' | 'complete' | 'error';
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'date' | 'currency' | 'phone';
}

interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  entityType: string;
  mappings: FieldMapping[];
  icon: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface DuplicateRecord {
  row: number;
  data: Record<string, string>;
  matchedWith: string;
  confidence: number;
}

interface ImportResult {
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errors: ValidationError[];
  duplicates: DuplicateRecord[];
}

interface DataImportExportProps {
  entityType: 'contacts' | 'donations' | 'volunteers' | 'projects' | 'activities';
  onImportComplete?: (result: ImportResult) => void;
  onExportComplete?: (format: ExportFormat) => void;
}

// ============================================
// ICONS
// ============================================

const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ============================================
// IMPORT TEMPLATES
// ============================================

const importTemplates: ImportTemplate[] = [
  {
    id: 'contacts-standard',
    name: 'Standard Contacts',
    description: 'Name, Email, Phone, Address fields',
    entityType: 'contacts',
    icon: '👥',
    mappings: [
      { sourceField: 'First Name', targetField: 'firstName' },
      { sourceField: 'Last Name', targetField: 'lastName' },
      { sourceField: 'Email', targetField: 'email' },
      { sourceField: 'Phone', targetField: 'phone', transform: 'phone' },
      { sourceField: 'Address', targetField: 'address' },
    ]
  },
  {
    id: 'contacts-mailchimp',
    name: 'Mailchimp Export',
    description: 'Import from Mailchimp subscriber list',
    entityType: 'contacts',
    icon: '📧',
    mappings: [
      { sourceField: 'Email Address', targetField: 'email' },
      { sourceField: 'First Name', targetField: 'firstName' },
      { sourceField: 'Last Name', targetField: 'lastName' },
      { sourceField: 'MEMBER_RATING', targetField: 'engagementScore' },
    ]
  },
  {
    id: 'donations-standard',
    name: 'Standard Donations',
    description: 'Donor, Amount, Date, Campaign fields',
    entityType: 'donations',
    icon: '💰',
    mappings: [
      { sourceField: 'Donor Name', targetField: 'donorName' },
      { sourceField: 'Amount', targetField: 'amount', transform: 'currency' },
      { sourceField: 'Date', targetField: 'date', transform: 'date' },
      { sourceField: 'Campaign', targetField: 'campaign' },
      { sourceField: 'Payment Method', targetField: 'method' },
    ]
  },
  {
    id: 'volunteers-standard',
    name: 'Volunteer List',
    description: 'Name, Contact, Skills, Availability',
    entityType: 'volunteers',
    icon: '🤝',
    mappings: [
      { sourceField: 'Name', targetField: 'name' },
      { sourceField: 'Email', targetField: 'email' },
      { sourceField: 'Phone', targetField: 'phone', transform: 'phone' },
      { sourceField: 'Skills', targetField: 'skills' },
      { sourceField: 'Availability', targetField: 'availability' },
    ]
  },
];

// Target fields for each entity type
const targetFields: Record<string, { field: string; label: string; required?: boolean }[]> = {
  contacts: [
    { field: 'firstName', label: 'First Name', required: true },
    { field: 'lastName', label: 'Last Name', required: true },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone' },
    { field: 'address', label: 'Address' },
    { field: 'city', label: 'City' },
    { field: 'state', label: 'State' },
    { field: 'zip', label: 'ZIP Code' },
    { field: 'organization', label: 'Organization' },
    { field: 'type', label: 'Contact Type' },
    { field: 'notes', label: 'Notes' },
  ],
  donations: [
    { field: 'donorName', label: 'Donor Name', required: true },
    { field: 'amount', label: 'Amount', required: true },
    { field: 'date', label: 'Date', required: true },
    { field: 'campaign', label: 'Campaign' },
    { field: 'method', label: 'Payment Method' },
    { field: 'notes', label: 'Notes' },
    { field: 'recurring', label: 'Recurring' },
  ],
  volunteers: [
    { field: 'name', label: 'Name', required: true },
    { field: 'email', label: 'Email', required: true },
    { field: 'phone', label: 'Phone' },
    { field: 'skills', label: 'Skills' },
    { field: 'availability', label: 'Availability' },
    { field: 'startDate', label: 'Start Date' },
    { field: 'notes', label: 'Notes' },
  ],
  projects: [
    { field: 'name', label: 'Project Name', required: true },
    { field: 'description', label: 'Description' },
    { field: 'startDate', label: 'Start Date' },
    { field: 'endDate', label: 'End Date' },
    { field: 'budget', label: 'Budget' },
    { field: 'status', label: 'Status' },
  ],
  activities: [
    { field: 'type', label: 'Activity Type', required: true },
    { field: 'date', label: 'Date', required: true },
    { field: 'description', label: 'Description' },
    { field: 'contact', label: 'Contact' },
    { field: 'outcome', label: 'Outcome' },
  ],
};

// ============================================
// MAIN COMPONENT
// ============================================

export const DataImportExport: React.FC<DataImportExportProps> = ({
  entityType,
  onImportComplete,
  onExportComplete
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateRecord[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ImportTemplate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter templates for current entity type
  const availableTemplates = importTemplates.filter(t => t.entityType === entityType);

  // Parse CSV file
  const parseCSV = useCallback((text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setImportStatus('uploading');

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length < 2) {
        throw new Error('File must have at least a header row and one data row');
      }

      const headers = data[0];
      setSourceFields(headers);
      setParsedData(data.slice(1)); // Exclude header row

      // Auto-map fields if template selected
      if (selectedTemplate) {
        setFieldMappings(selectedTemplate.mappings.filter(m => headers.includes(m.sourceField)));
      } else {
        // Auto-detect common field names
        const autoMappings: FieldMapping[] = [];
        const targets = targetFields[entityType] || [];

        headers.forEach(header => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
          const matchedTarget = targets.find(t =>
            t.field.toLowerCase() === normalizedHeader ||
            t.label.toLowerCase().replace(/[^a-z]/g, '') === normalizedHeader
          );
          if (matchedTarget) {
            autoMappings.push({ sourceField: header, targetField: matchedTarget.field });
          }
        });

        setFieldMappings(autoMappings);
      }

      setImportStatus('mapping');
    } catch (error) {
      console.error('Error parsing file:', error);
      setImportStatus('error');
    }
  }, [parseCSV, selectedTemplate, entityType]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Update field mapping
  const updateMapping = useCallback((sourceField: string, targetField: string) => {
    setFieldMappings(prev => {
      const existing = prev.find(m => m.sourceField === sourceField);
      if (existing) {
        if (targetField === '') {
          return prev.filter(m => m.sourceField !== sourceField);
        }
        return prev.map(m => m.sourceField === sourceField ? { ...m, targetField } : m);
      }
      return [...prev, { sourceField, targetField }];
    });
  }, []);

  // Validate data
  const validateData = useCallback(() => {
    setImportStatus('validating');
    const errors: ValidationError[] = [];
    const potentialDuplicates: DuplicateRecord[] = [];
    const targets = targetFields[entityType] || [];
    const requiredFields = targets.filter(t => t.required).map(t => t.field);

    parsedData.forEach((row, rowIndex) => {
      fieldMappings.forEach(mapping => {
        const sourceIndex = sourceFields.indexOf(mapping.sourceField);
        const value = row[sourceIndex] || '';

        // Check required fields
        if (requiredFields.includes(mapping.targetField) && !value.trim()) {
          errors.push({
            row: rowIndex + 2, // +2 for header row and 1-based indexing
            field: mapping.targetField,
            value,
            message: `${mapping.targetField} is required`
          });
        }

        // Validate email format
        if (mapping.targetField === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            row: rowIndex + 2,
            field: 'email',
            value,
            message: 'Invalid email format'
          });
        }

        // Validate amount is numeric
        if (mapping.targetField === 'amount' && value && isNaN(parseFloat(value.replace(/[$,]/g, '')))) {
          errors.push({
            row: rowIndex + 2,
            field: 'amount',
            value,
            message: 'Amount must be a number'
          });
        }
      });

      // Simple duplicate detection based on name/email
      const rowData: Record<string, string> = {};
      fieldMappings.forEach(mapping => {
        const sourceIndex = sourceFields.indexOf(mapping.sourceField);
        rowData[mapping.targetField] = row[sourceIndex] || '';
      });

      // Check for duplicates within the import
      for (let i = 0; i < rowIndex; i++) {
        const prevRowData: Record<string, string> = {};
        fieldMappings.forEach(mapping => {
          const sourceIndex = sourceFields.indexOf(mapping.sourceField);
          prevRowData[mapping.targetField] = parsedData[i][sourceIndex] || '';
        });

        if (rowData.email && rowData.email === prevRowData.email) {
          potentialDuplicates.push({
            row: rowIndex + 2,
            data: rowData,
            matchedWith: `Row ${i + 2}`,
            confidence: 100
          });
          break;
        }
      }
    });

    setValidationErrors(errors);
    setDuplicates(potentialDuplicates);
    setImportStatus('mapping');

    return errors.length === 0;
  }, [parsedData, fieldMappings, sourceFields, entityType]);

  // Perform import
  const performImport = useCallback(async () => {
    setImportStatus('importing');

    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result: ImportResult = {
      totalRows: parsedData.length,
      importedRows: parsedData.length - validationErrors.length - duplicates.length,
      skippedRows: validationErrors.length + duplicates.length,
      errors: validationErrors,
      duplicates: duplicates
    };

    setImportResult(result);
    setImportStatus('complete');
    onImportComplete?.(result);
  }, [parsedData.length, validationErrors, duplicates, onImportComplete]);

  // Reset import
  const resetImport = useCallback(() => {
    setImportStatus('idle');
    setUploadedFile(null);
    setParsedData([]);
    setSourceFields([]);
    setFieldMappings([]);
    setValidationErrors([]);
    setDuplicates([]);
    setImportResult(null);
    setSelectedTemplate(null);
  }, []);

  // Handle export
  const handleExport = useCallback((format: ExportFormat) => {
    // In a real app, this would generate and download the file
    console.log(`Exporting as ${format}`);
    onExportComplete?.(format);
  }, [onExportComplete]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Import Data
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Export Data
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'import' ? (
          <div className="space-y-6">
            {/* Import Status: Idle - Show upload area */}
            {importStatus === 'idle' && (
              <>
                {/* Templates */}
                {availableTemplates.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Import Templates
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedTemplate?.id === template.id
                              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {template.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                    ${isDragging
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-600'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${isDragging ? 'bg-cyan-100 dark:bg-cyan-900/40' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <UploadIcon />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                        {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Supports CSV files up to 10MB
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Import Status: Uploading */}
            {importStatus === 'uploading' && (
              <div className="flex flex-col items-center py-12">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Processing file...</p>
              </div>
            )}

            {/* Import Status: Mapping */}
            {importStatus === 'mapping' && uploadedFile && (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileIcon />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{uploadedFile.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {parsedData.length} rows found
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetImport}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <XIcon />
                  </button>
                </div>

                {/* Field Mapping */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Map Fields
                  </h3>
                  <div className="space-y-2">
                    {sourceFields.map(sourceField => {
                      const mapping = fieldMappings.find(m => m.sourceField === sourceField);
                      return (
                        <div key={sourceField} className="flex items-center gap-4">
                          <div className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                            {sourceField}
                          </div>
                          <ArrowRightIcon />
                          <select
                            value={mapping?.targetField || ''}
                            onChange={(e) => updateMapping(sourceField, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="">Skip this field</option>
                            {(targetFields[entityType] || []).map(target => (
                              <option key={target.field} value={target.field}>
                                {target.label} {target.required && '*'}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                      <WarningIcon />
                      <span className="font-medium">{validationErrors.length} validation errors</span>
                    </div>
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {validationErrors.slice(0, 5).map((error, i) => (
                        <li key={i}>Row {error.row}: {error.message}</li>
                      ))}
                      {validationErrors.length > 5 && (
                        <li>...and {validationErrors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Duplicates Warning */}
                {duplicates.length > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                      <WarningIcon />
                      <span className="font-medium">{duplicates.length} potential duplicates</span>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      These rows will be skipped during import
                    </p>
                  </div>
                )}

                {/* Preview */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Preview (first 5 rows)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                          {fieldMappings.map(m => (
                            <th key={m.targetField} className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">
                              {(targetFields[entityType] || []).find(t => t.field === m.targetField)?.label || m.targetField}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-slate-200 dark:border-slate-700">
                            {fieldMappings.map(m => {
                              const sourceIndex = sourceFields.indexOf(m.sourceField);
                              return (
                                <td key={m.targetField} className="px-4 py-2 text-slate-700 dark:text-slate-300">
                                  {row[sourceIndex] || '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={resetImport}
                    className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={validateData}
                    className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                  >
                    Validate
                  </button>
                  <button
                    onClick={performImport}
                    disabled={fieldMappings.length === 0}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import {parsedData.length} Records
                  </button>
                </div>
              </div>
            )}

            {/* Import Status: Importing */}
            {importStatus === 'importing' && (
              <div className="flex flex-col items-center py-12">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Importing data...</p>
              </div>
            )}

            {/* Import Status: Complete */}
            {importStatus === 'complete' && importResult && (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckIcon />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Import Complete!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Successfully imported {importResult.importedRows} of {importResult.totalRows} records
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult.importedRows}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Imported</div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{importResult.skippedRows}</div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">Skipped</div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{importResult.errors.length}</div>
                    <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
                  </div>
                </div>

                <button
                  onClick={resetImport}
                  className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Import More Data
                </button>
              </div>
            )}

            {/* Import Status: Error */}
            {importStatus === 'error' && (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <XIcon />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Import Failed
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  There was an error processing your file
                </p>
                <button
                  onClick={resetImport}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Export Tab */
          <div className="space-y-6">
            <p className="text-slate-600 dark:text-slate-400">
              Export your {entityType} data in various formats
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { format: 'csv' as ExportFormat, label: 'CSV', icon: '📄', description: 'Comma-separated values' },
                { format: 'excel' as ExportFormat, label: 'Excel', icon: '📊', description: 'Microsoft Excel format' },
                { format: 'pdf' as ExportFormat, label: 'PDF', icon: '📕', description: 'Printable report' },
                { format: 'json' as ExportFormat, label: 'JSON', icon: '{ }', description: 'For developers' },
              ].map(option => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </div>
                    </div>
                    <DownloadIcon />
                  </div>
                </button>
              ))}
            </div>

            {/* Scheduled Exports */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Scheduled Exports
              </h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Set up automatic exports to receive data on a regular schedule
                </p>
                <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">
                  + Create Scheduled Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataImportExport;
