import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AdvancedDataTable } from './AdvancedDataTable';
import { VirtualizedTable } from './VirtualizedTable';

// ============================================
// SAMPLE DATA TYPES
// ============================================

interface DonationRecord {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  campaign: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

// ============================================
// SAMPLE DATA GENERATOR
// ============================================

const generateSampleData = (count: number): DonationRecord[] => {
  const donors = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Williams', 'Charlie Brown', 'Diana Prince'];
  const campaigns = ['Annual Fund', 'Building Campaign', 'Emergency Relief', 'Scholarship Fund', 'General Support'];
  const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'pending', 'failed'];
  const paymentMethods = ['Credit Card', 'Check', 'Bank Transfer', 'PayPal', 'Cash'];

  return Array.from({ length: count }, (_, i) => ({
    id: `DON-${String(i + 1).padStart(5, '0')}`,
    donorName: donors[Math.floor(Math.random() * donors.length)],
    amount: Math.floor(Math.random() * 10000) + 100,
    date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
  }));
};

// ============================================
// COLUMN DEFINITIONS
// ============================================

const createColumns = (): ColumnDef<DonationRecord>[] => [
  {
    accessorKey: 'id',
    header: 'Donation ID',
    cell: info => (
      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
        {info.getValue() as string}
      </span>
    ),
    size: 120,
  },
  {
    accessorKey: 'donorName',
    header: 'Donor Name',
    cell: info => (
      <span className="font-medium text-gray-900 dark:text-white">
        {info.getValue() as string}
      </span>
    ),
    size: 150,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: info => {
      const amount = info.getValue() as number;
      return (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${amount.toLocaleString()}
        </span>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: info => {
      const date = new Date(info.getValue() as string);
      return (
        <span className="text-gray-700 dark:text-gray-300">
          {date.toLocaleDateString()}
        </span>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'campaign',
    header: 'Campaign',
    cell: info => (
      <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
        {info.getValue() as string}
      </span>
    ),
    size: 150,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => {
      const status = info.getValue() as string;
      const colors = {
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      };
      return (
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${colors[status as keyof typeof colors]}`}>
          {status}
        </span>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment Method',
    cell: info => (
      <span className="text-gray-700 dark:text-gray-300">
        {info.getValue() as string}
      </span>
    ),
    size: 140,
  },
];

// ============================================
// DEMO COMPONENT
// ============================================

export function TableDemo() {
  const [activeTab, setActiveTab] = React.useState<'standard' | 'virtualized'>('standard');

  // Generate sample data
  const standardData = useMemo(() => generateSampleData(100), []);
  const virtualizedData = useMemo(() => generateSampleData(10000), []);

  const columns = useMemo(() => createColumns(), []);

  const handleExport = (selectedRows: DonationRecord[]) => {
    console.log('Exporting rows:', selectedRows);
    alert(`Exporting ${selectedRows.length} rows`);
  };

  const handleBulkAction = (action: string, selectedRows: DonationRecord[]) => {
    console.log(`Bulk action ${action} on:`, selectedRows);
    alert(`Performing ${action} on ${selectedRows.length} rows`);
  };

  const handleRowClick = (row: DonationRecord) => {
    console.log('Row clicked:', row);
    alert(`Viewing donation ${row.id}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Advanced Data Table Demo
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Demonstration of TanStack Table with advanced features including sorting, filtering, pagination, and virtualization.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('standard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'standard'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Standard Table (100 rows)
          </button>
          <button
            onClick={() => setActiveTab('virtualized')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'virtualized'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Virtualized Table (10,000 rows)
          </button>
        </nav>
      </div>

      {/* Features List */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          Available Features:
        </h3>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-indigo-700 dark:text-indigo-400">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Multi-column sorting (Shift+Click)
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Column filtering
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Global search
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Row selection
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Column visibility toggle
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Density control
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Pagination
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Export functionality
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Bulk actions
          </li>
        </ul>
      </div>

      {/* Table Display */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        {activeTab === 'standard' ? (
          <AdvancedDataTable
            data={standardData}
            columns={columns}
            onRowClick={handleRowClick}
            onExport={handleExport}
            onBulkAction={handleBulkAction}
            enableRowSelection={true}
            enableMultiSort={true}
            enableColumnFilters={true}
            enableGlobalFilter={true}
            enablePagination={true}
            pageSize={10}
            emptyMessage="No donation records found"
          />
        ) : (
          <VirtualizedTable
            data={virtualizedData}
            columns={columns}
            onRowClick={handleRowClick}
            onExport={handleExport}
            height={600}
            estimatedRowHeight={52}
            overscan={5}
            enableRowSelection={true}
            enableMultiSort={true}
            emptyMessage="No donation records found"
          />
        )}
      </div>

      {/* Performance Notes */}
      {activeTab === 'virtualized' && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Performance Optimized
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            This table is rendering 10,000 rows with virtual scrolling. Only visible rows are rendered to the DOM,
            ensuring smooth 60 FPS scrolling performance even with massive datasets. Try scrolling to see the
            performance in action!
          </p>
        </div>
      )}
    </div>
  );
}
