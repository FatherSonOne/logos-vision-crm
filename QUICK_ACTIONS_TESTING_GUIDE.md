# Quick Actions Testing Guide

## Prerequisites

Before testing, ensure the database migration has been applied:

```bash
# Apply the migration
supabase migration up

# OR manually run the SQL file
psql -h your-db-host -U postgres -d your-database -f supabase/migrations/20260124000000_create_report_templates.sql
```

## Verify Templates Created

Run this query to confirm templates exist:

```sql
SELECT
  id,
  name,
  category,
  visualization_type,
  is_template,
  icon,
  color
FROM reports
WHERE is_template = true;
```

**Expected Output**: 3 rows
- Financial Summary (bar, green, 💰)
- Donation Report (line, pink, ❤️)
- Impact Report (area, emerald, 📊)

## Manual Testing Steps

### Test 1: Financial Summary Quick Action

1. **Navigate to Reports Hub**
   - Go to Reports page in the application
   - Ensure you're on the "Dashboard" tab

2. **Click Financial Summary Button**
   - Locate "Quick Actions" section
   - Click the "Financial Summary" button (green icon with 💰)

3. **Verify Loading State**
   - Blue loading indicator should appear
   - Message: "Creating report from template..."

4. **Verify Success**
   - Loading indicator disappears
   - Report viewer opens automatically
   - Report name: "Financial Summary (Copy)"
   - Bar chart visualization displayed
   - Last 30 days filter applied

5. **Verify Data**
   - Chart shows donation data grouped by month
   - X-axis: Months
   - Y-axis: Total amount
   - Data from donations table

### Test 2: Donation Report Quick Action

1. **Return to Dashboard**
   - Click "Back to Reports" if in viewer
   - Or click "Dashboard" tab

2. **Click Donation Report Button**
   - Pink button with ❤️ icon
   - Should say "Donation Report"

3. **Verify Creation**
   - Loading indicator appears
   - Report created successfully
   - Line chart visualization
   - Last 90 days filter applied
   - Grouped by week

4. **Check Report Details**
   - Name: "Donation Report (Copy)"
   - Description includes donor insights
   - Category: Donation
   - Color: Pink

### Test 3: Impact Report Quick Action

1. **Click Impact Report Button**
   - Green button with 📊 icon
   - Located in Quick Actions section

2. **Verify Creation**
   - Loading state shown
   - Area chart created
   - Last year filter applied
   - Grouped by month

3. **Check Outcome Data**
   - Chart shows outcomes over time
   - Categories: employment, housing, education, health, financial
   - Stacked area visualization
   - Impact value metrics displayed

### Test 4: Error Handling

#### Test Invalid Template
```typescript
// In browser console
const { reportTemplateService } = await import('./services/reportTemplateService');
const result = await reportTemplateService.getTemplate('NonExistent Template');
console.log(result); // Should be null
```

#### Test Network Error
1. Disconnect network
2. Click any Quick Action button
3. Verify error notification appears
4. Error message should be clear and dismissible
5. Reconnect network
6. Dismiss error and retry

### Test 5: Template Preview and Customization

1. **Browse Templates Section**
   - Scroll to "Browse Templates"
   - Should see same 3 templates as cards

2. **Click Template Card**
   - Click on "Financial Summary" card
   - Preview modal opens
   - Shows template details

3. **Customize Option**
   - Click "Customize" in modal
   - Report Builder opens
   - Template data pre-filled
   - Modify name: "My Custom Financial Report"
   - Change date range
   - Save report

4. **Verify Custom Report**
   - Report created with custom name
   - Modified filters applied
   - Not called "(Copy)"

### Test 6: Multiple Report Creation

1. **Create Multiple Reports**
   - Click "Financial Summary" button
   - Wait for creation
   - Click "Financial Summary" again
   - Repeat 2-3 times

2. **Verify Each Report**
   - Each has unique ID
   - All named "Financial Summary (Copy)"
   - All have same template configuration
   - All appear in Recent Reports

3. **Check Report List**
   - Navigate to "Reports" tab
   - Filter by "Financial" category
   - Should see all created reports
   - Can edit/delete independently

## Expected Behavior Summary

### Quick Action Buttons Should:
- ✅ Show loading state immediately on click
- ✅ Create report in ~1-2 seconds
- ✅ Navigate to report viewer automatically
- ✅ Display success (no error messages)
- ✅ Add report to Recent Reports list
- ✅ Apply template's default filters
- ✅ Use template's visualization type
- ✅ Be clickable multiple times (create multiple reports)

### Error States Should:
- ✅ Show red error notification if creation fails
- ✅ Display clear error message
- ✅ Allow dismissing error
- ✅ Not break the application
- ✅ Clear loading state on error
- ✅ Allow retry after error

### Template Reports Should Have:
- ✅ Correct visualization type (bar, line, area)
- ✅ Correct default filters
- ✅ Correct data source configuration
- ✅ Correct grouping settings
- ✅ Template icon and color
- ✅ Category assigned
- ✅ is_template = false (user copy)
- ✅ Created timestamp

## Browser Console Tests

### Check Template Service

```javascript
// Import service
const { reportTemplateService } = await import('./src/services/reportTemplateService.js');

// Get all templates
const templates = await reportTemplateService.getAllTemplates();
console.log('Templates:', templates);
// Expected: Array of 3 templates

// Get specific template
const financial = await reportTemplateService.getTemplate('Financial Summary');
console.log('Financial Summary:', financial);
// Expected: Template object with configuration

// Create report
const report = await reportTemplateService.createFinancialSummary();
console.log('Created report:', report);
// Expected: New report object
```

### Check Report Service

```javascript
// Import service
const { reportService } = await import('./src/services/reportService.js');

// Get all reports (including templates)
const allReports = await reportService.getReports();
console.log('All reports:', allReports);

// Get only templates
const templates = await reportService.getReports({ templatesOnly: true });
console.log('Templates:', templates);
// Expected: 3 templates

// Create from template (using template ID from above)
const templateId = templates[0].id;
const newReport = await reportService.createFromTemplate(templateId);
console.log('New report:', newReport);
// Expected: Copy of template with is_template = false
```

## Database Verification Queries

### Check Template Count
```sql
SELECT COUNT(*) as template_count
FROM reports
WHERE is_template = true;
-- Expected: 3
```

### Check User Reports Created from Templates
```sql
SELECT
  r.id,
  r.name,
  r.category,
  r.visualization_type,
  r.is_template,
  r.created_at
FROM reports r
WHERE r.is_template = false
  AND r.report_type = 'custom'
ORDER BY r.created_at DESC
LIMIT 10;
-- Shows recent user-created reports
```

### Check Template Configuration
```sql
SELECT
  name,
  jsonb_pretty(filters) as default_filters,
  jsonb_pretty(data_source) as data_config,
  columns
FROM reports
WHERE is_template = true;
-- Shows full template configurations
```

## Performance Testing

### Measure Creation Speed

```javascript
console.time('Template Creation');
const report = await reportTemplateService.createFinancialSummary();
console.timeEnd('Template Creation');
// Expected: < 500ms
```

### Bulk Creation Test

```javascript
// Create 10 reports rapidly
const promises = Array(10).fill(null).map((_, i) =>
  reportTemplateService.createFinancialSummary({
    name: `Bulk Test ${i + 1}`
  })
);

console.time('Bulk Creation');
const reports = await Promise.all(promises);
console.timeEnd('Bulk Creation');
console.log(`Created ${reports.length} reports`);
// Expected: < 5 seconds for 10 reports
```

## Common Issues and Solutions

### Issue: Templates Not Appearing
**Solution**: Run migration
```bash
supabase migration up
```

### Issue: "Template not found" Error
**Solution**: Check template name exactly matches database
```sql
SELECT name FROM reports WHERE is_template = true;
```

### Issue: Empty Report Data
**Solution**: Ensure data tables exist
```sql
-- Check if tables have data
SELECT COUNT(*) FROM donations;
SELECT COUNT(*) FROM outcomes;
```

### Issue: Wrong Visualization
**Solution**: Check template configuration
```sql
SELECT name, visualization_type FROM reports WHERE is_template = true;
```

## Success Criteria

All tests pass if:

1. ✅ All 3 Quick Action buttons create reports successfully
2. ✅ Reports open automatically after creation
3. ✅ Correct visualizations displayed (bar, line, area)
4. ✅ Default filters applied correctly
5. ✅ No console errors
6. ✅ Loading states work properly
7. ✅ Error handling works gracefully
8. ✅ Multiple reports can be created from same template
9. ✅ Reports appear in Recent Reports
10. ✅ Reports are editable and deletable

## Next Steps After Testing

Once all tests pass:

1. **User Training**
   - Document Quick Actions in user guide
   - Create video tutorial
   - Add tooltips to buttons

2. **Monitoring**
   - Track template usage analytics
   - Monitor creation success rates
   - Collect user feedback

3. **Enhancements**
   - Add more templates based on usage
   - Improve template customization options
   - Add template preview with sample data

4. **Maintenance**
   - Update templates as needed
   - Add new templates for common use cases
   - Archive unused templates
