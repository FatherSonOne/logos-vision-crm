/**
 * Excel Export Service Example
 *
 * Demonstrates comprehensive Excel export functionality with multi-sheet workbooks,
 * professional styling, and advanced formatting features.
 */

import { ExcelExportService } from '../ExcelExportService';
import type { ExportOptions } from '../types';

// ============================================
// SAMPLE DATA
// ============================================

/**
 * Sample donation data for demonstration
 */
const sampleDonationData = [
  {
    id: 'DON-001',
    donor_name: 'John Smith',
    donation_amount: 1500.00,
    donation_date: '2026-01-15T10:30:00Z',
    campaign: 'Annual Giving',
    payment_method: 'Credit Card',
    is_recurring: true,
    donor_email: 'john.smith@example.com',
  },
  {
    id: 'DON-002',
    donor_name: 'Sarah Johnson',
    donation_amount: 2500.00,
    donation_date: '2026-01-14T14:20:00Z',
    campaign: 'Building Fund',
    payment_method: 'Bank Transfer',
    is_recurring: false,
    donor_email: 'sarah.j@example.com',
  },
  {
    id: 'DON-003',
    donor_name: 'Michael Chen',
    donation_amount: 500.00,
    donation_date: '2026-01-13T09:15:00Z',
    campaign: 'Annual Giving',
    payment_method: 'Check',
    is_recurring: true,
    donor_email: 'michael.chen@example.com',
  },
  {
    id: 'DON-004',
    donor_name: 'Emily Davis',
    donation_amount: 3000.00,
    donation_date: '2026-01-12T16:45:00Z',
    campaign: 'Emergency Relief',
    payment_method: 'Credit Card',
    is_recurring: false,
    donor_email: 'emily.davis@example.com',
  },
  {
    id: 'DON-005',
    donor_name: 'Robert Wilson',
    donation_amount: 750.00,
    donation_date: '2026-01-11T11:00:00Z',
    campaign: 'Annual Giving',
    payment_method: 'PayPal',
    is_recurring: true,
    donor_email: 'r.wilson@example.com',
  },
];

/**
 * Sample client data for demonstration
 */
const sampleClientData = [
  {
    id: 'CLI-001',
    client_name: 'Acme Corporation',
    contact_person: 'Jane Doe',
    total_revenue: 125000.00,
    active_projects: 3,
    last_contact_date: '2026-01-10T15:30:00Z',
    client_status: 'Active',
    satisfaction_score: 4.5,
  },
  {
    id: 'CLI-002',
    client_name: 'TechStart Inc',
    contact_person: 'Bob Miller',
    total_revenue: 75000.00,
    active_projects: 1,
    last_contact_date: '2026-01-08T10:00:00Z',
    client_status: 'Active',
    satisfaction_score: 4.8,
  },
  {
    id: 'CLI-003',
    client_name: 'Global Solutions',
    contact_person: 'Alice Brown',
    total_revenue: 200000.00,
    active_projects: 5,
    last_contact_date: '2026-01-05T14:20:00Z',
    client_status: 'Active',
    satisfaction_score: 4.2,
  },
];

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * Example 1: Basic Excel Export
 *
 * Demonstrates simple export with minimal configuration
 */
export async function basicExcelExport() {
  const excelService = new ExcelExportService();

  const options: ExportOptions = {
    reportName: 'Donation Report',
    data: sampleDonationData,
    timestamp: new Date(),
  };

  const result = await excelService.export(options);

  if (result.success) {
    console.log('✅ Excel export successful');
    console.log(`📁 Filename: ${result.filename}`);
    console.log(`📊 File size: ${(result.fileSize! / 1024).toFixed(2)} KB`);
  } else {
    console.error('❌ Excel export failed:', result.error);
  }

  return result;
}

/**
 * Example 2: Excel Export with Filters
 *
 * Demonstrates export with applied filters shown in metadata sheet
 */
export async function excelExportWithFilters() {
  const excelService = new ExcelExportService();

  const options: ExportOptions = {
    reportName: 'Filtered Donation Report',
    data: sampleDonationData,
    filters: {
      campaign: 'Annual Giving',
      date_range: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
      is_recurring: true,
      min_amount: 500,
    },
    timestamp: new Date(),
  };

  const result = await excelService.export(options);

  if (result.success) {
    console.log('✅ Excel export with filters successful');
    console.log(`📁 Filename: ${result.filename}`);
    console.log('📋 Filters applied:');
    Object.entries(options.filters!).forEach(([key, value]) => {
      console.log(`   - ${key}: ${JSON.stringify(value)}`);
    });
  } else {
    console.error('❌ Excel export failed:', result.error);
  }

  return result;
}

/**
 * Example 3: Large Dataset Export
 *
 * Demonstrates export performance with larger dataset
 */
export async function largeDatasetExport() {
  const excelService = new ExcelExportService();

  // Generate large dataset (1000 records)
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: `DON-${String(i + 1).padStart(4, '0')}`,
    donor_name: `Donor ${i + 1}`,
    donation_amount: Math.random() * 5000,
    donation_date: new Date(2026, 0, 1 + Math.floor(Math.random() * 30)).toISOString(),
    campaign: ['Annual Giving', 'Building Fund', 'Emergency Relief'][Math.floor(Math.random() * 3)],
    payment_method: ['Credit Card', 'Bank Transfer', 'Check', 'PayPal'][Math.floor(Math.random() * 4)],
    is_recurring: Math.random() > 0.5,
    donor_email: `donor${i + 1}@example.com`,
  }));

  const startTime = Date.now();

  const options: ExportOptions = {
    reportName: 'Large Donation Dataset',
    data: largeData,
    timestamp: new Date(),
  };

  const result = await excelService.export(options);
  const exportTime = Date.now() - startTime;

  if (result.success) {
    console.log('✅ Large dataset export successful');
    console.log(`📁 Filename: ${result.filename}`);
    console.log(`📊 Records exported: ${largeData.length}`);
    console.log(`⚡ Export time: ${exportTime}ms`);
    console.log(`📦 File size: ${(result.fileSize! / 1024).toFixed(2)} KB`);
    console.log(`📈 Performance: ${(largeData.length / (exportTime / 1000)).toFixed(0)} records/second`);
  } else {
    console.error('❌ Large dataset export failed:', result.error);
  }

  return result;
}

/**
 * Example 4: Multi-Type Data Export
 *
 * Demonstrates export with various data types (strings, numbers, dates, booleans)
 */
export async function multiTypeDataExport() {
  const excelService = new ExcelExportService();

  const options: ExportOptions = {
    reportName: 'Client Performance Report',
    data: sampleClientData,
    filters: {
      status: 'Active',
      min_satisfaction: 4.0,
    },
    timestamp: new Date(),
  };

  const result = await excelService.export(options);

  if (result.success) {
    console.log('✅ Multi-type data export successful');
    console.log(`📁 Filename: ${result.filename}`);
    console.log('📊 Data types included:');
    console.log('   - Strings: client_name, contact_person, client_status');
    console.log('   - Numbers: total_revenue, active_projects, satisfaction_score');
    console.log('   - Dates: last_contact_date');
  } else {
    console.error('❌ Multi-type data export failed:', result.error);
  }

  return result;
}

// ============================================
// FEATURE DEMONSTRATION
// ============================================

/**
 * Demonstrate all Excel export features
 */
export async function demonstrateAllFeatures() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('Excel Export Service - Feature Demonstration');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📋 Feature Overview:');
  console.log('   ✓ Multi-sheet workbooks (Data, Summary, Metadata)');
  console.log('   ✓ Professional cell styling');
  console.log('   ✓ Frozen header rows');
  console.log('   ✓ Auto-sized columns');
  console.log('   ✓ Summary statistics with formulas');
  console.log('   ✓ Type-specific formatting');
  console.log('   ✓ Alternating row colors');
  console.log('   ✓ Border styling');
  console.log('   ✓ Compatible with Excel & Google Sheets\n');

  console.log('─────────────────────────────────────────────────────\n');

  // Run examples
  console.log('Example 1: Basic Export');
  await basicExcelExport();
  console.log('\n─────────────────────────────────────────────────────\n');

  console.log('Example 2: Export with Filters');
  await excelExportWithFilters();
  console.log('\n─────────────────────────────────────────────────────\n');

  console.log('Example 3: Large Dataset Export');
  await largeDatasetExport();
  console.log('\n─────────────────────────────────────────────────────\n');

  console.log('Example 4: Multi-Type Data Export');
  await multiTypeDataExport();
  console.log('\n═══════════════════════════════════════════════════════');
}

// ============================================
// EXCEL SHEET STRUCTURE DOCUMENTATION
// ============================================

/**
 * Excel Export Sheet Structure
 *
 * Sheet 1: Data
 * ─────────────────────────────────────────────────────
 * - Header Row: Bold white text on indigo (#4F46E5) background
 * - Data Rows: Alternating gray (#F9FAFB) and white backgrounds
 * - Borders: All cells have thin gray (#E5E7EB) borders
 * - Column Widths: Auto-sized based on content (10-50 characters)
 * - Frozen: Header row frozen for scrolling
 * - Auto Filter: Enabled on header row
 * - Formatting:
 *   - Dates: yyyy-mm-dd hh:mm:ss
 *   - Currency: $#,##0.00
 *   - Percentages: 0.00%
 *   - Numbers: #,##0 or #,##0.00
 *
 * Sheet 2: Summary
 * ─────────────────────────────────────────────────────
 * - Statistics for all numeric fields:
 *   - Count: Number of non-null values
 *   - Sum: Total of all values
 *   - Average: Mean value
 *   - Min: Minimum value
 *   - Max: Maximum value
 * - Total Row: Excel formulas (SUM, MIN, MAX)
 * - Frozen: Header row frozen
 *
 * Sheet 3: Metadata
 * ─────────────────────────────────────────────────────
 * - Report Information:
 *   - Report Name
 *   - Export Date/Time
 *   - Generated By
 *   - Total Records
 * - Applied Filters: All active filters with formatted values
 * - Export Details: File format, compatibility info
 */

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateAllFeatures().catch(console.error);
}
