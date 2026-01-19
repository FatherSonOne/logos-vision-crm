# Export Templates System

A comprehensive system for saving and reusing export configurations across different report formats.

## Features

- **Template Management**: Create, edit, delete, and organize export templates
- **Multiple Formats**: Support for PDF, Excel, CSV, and PNG exports
- **Smart Selection**: Recently used templates and quick access
- **Visual Preview**: See what exports will look like before generating
- **Usage Tracking**: Identify popular templates
- **Sharing**: Public and private templates

## Quick Start

### Using in a Report Component

```tsx
import { ExportMenu } from '@/components/reports/export';

function MyReport({ data }) {
  const handleExport = async (format, template) => {
    const config = template?.configuration?.[format] || getDefaultConfig();
    await exportWithConfig(data, format, config);
  };

  return (
    <div>
      <h1>My Report</h1>
      <ExportMenu onExport={handleExport} />
    </div>
  );
}
```

### Standalone Template Manager

```tsx
import { ExportTemplateManager } from '@/components/reports/export';

function TemplatesPage() {
  return (
    <div>
      <h1>Export Templates</h1>
      <ExportTemplateManager />
    </div>
  );
}
```

## Components

### ExportMenu
Main export dropdown with template integration
- Quick export with last used template
- Browse templates by format
- Save current settings as template

### ExportTemplateManager
Full template management interface
- Grid view of all templates
- Search and filter
- Create, edit, delete operations

### ExportTemplateEditor
Dialog for creating/editing templates
- Format-specific configuration forms
- Real-time validation
- Public/private visibility

### ExportTemplateSelector
Modal for selecting templates
- Filter by format
- Recent templates section
- Quick selection interface

### ExportTemplatePreview
Visual preview of export output
- Format-specific rendering
- Zoom controls
- Sample data display

## Database Migration

Run the migration to set up the database:

```bash
cd supabase
supabase migration up
```

This creates:
- `export_templates` table
- Indexes for performance
- RLS policies for security
- Utility functions for usage tracking

## Configuration

Templates support format-specific settings:

**PDF**: Orientation, page size, headers/footers, margins, content options
**Excel**: Sheets, formulas, formatting, column widths, color schemes
**CSV**: Delimiters, encoding, date/number formats, line endings
**PNG**: Dimensions, resolution, quality, format, background

## Default Templates

The system includes pre-configured templates:

**PDF**
- Professional PDF (portrait, full details)
- Presentation PDF (landscape, large fonts)
- Compact PDF (minimal, grayscale)

**Excel**
- Detailed Workbook (multiple sheets, formulas)
- Simple Export (basic data only)
- Analysis Excel (conditional formatting)

**CSV**
- Standard CSV (UTF-8, comma-delimited)
- European CSV (semicolon, European dates)
- Tab-Delimited (database imports)

**PNG**
- High-Resolution Print (300 DPI)
- Screen Resolution (1920x1080)
- Social Media (optimized dimensions)
- Email Attachment (compressed)

## API

### Service Methods

```typescript
// Create template
await reportService.createExportTemplate(templateData);

// Get templates
const templates = await reportService.getExportTemplates(filters);

// Update template
await reportService.updateExportTemplate(id, updates);

// Delete template
await reportService.deleteExportTemplate(id);

// Duplicate template
await reportService.duplicateExportTemplate(id, newName);

// Track usage
await reportService.incrementTemplateUsage(id);
```

## File Structure

```
src/components/reports/export/
├── ExportMenu.tsx                 # Main export dropdown
├── ExportTemplateManager.tsx      # Full management UI
├── ExportTemplateEditor.tsx       # Create/edit dialog
├── ExportTemplateSelector.tsx     # Selection modal
├── ExportTemplatePreview.tsx      # Visual preview
├── index.ts                       # Exports
└── README.md                      # This file

src/config/
└── defaultExportTemplates.ts      # Default template configs

supabase/migrations/
└── 20260123000000_create_export_templates.sql

docs/
├── EXPORT_TEMPLATES_GUIDE.md      # User documentation
└── EXPORT_TEMPLATES_DEV_GUIDE.md  # Developer documentation
```

## Documentation

- **[User Guide](../../../docs/EXPORT_TEMPLATES_GUIDE.md)**: Complete user documentation
- **[Developer Guide](../../../docs/EXPORT_TEMPLATES_DEV_GUIDE.md)**: Technical documentation
- **[Migration](../../../supabase/migrations/20260123000000_create_export_templates.sql)**: Database schema

## Examples

### Basic Export Menu

```tsx
<ExportMenu
  onExport={async (format, template) => {
    if (template) {
      await exportWithTemplate(data, template);
    } else {
      await exportWithDefaults(data, format);
    }
  }}
/>
```

### With Current Settings

```tsx
<ExportMenu
  onExport={handleExport}
  currentSettings={currentExportConfig}
/>
```

### Template Manager with Selection

```tsx
<ExportTemplateManager
  onSelectTemplate={(template) => {
    applyTemplate(template);
    setExportDialogOpen(true);
  }}
/>
```

### Custom Template Selector

```tsx
const [selectorOpen, setSelectorOpen] = useState(false);

<Button onClick={() => setSelectorOpen(true)}>
  Choose Template
</Button>

<ExportTemplateSelector
  open={selectorOpen}
  onClose={() => setSelectorOpen(false)}
  onSelect={handleTemplateSelect}
  format="pdf"
/>
```

## Security

- Row Level Security (RLS) policies protect templates
- Users can only modify their own templates
- Public templates are read-only for non-owners
- Usage tracking is non-critical (fails gracefully)

## Performance

- Templates cached for fast access
- Async usage tracking (non-blocking)
- Efficient JSONB indexing
- Optimized queries with proper indexes

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Contributing

1. Follow existing component patterns
2. Update TypeScript types
3. Add tests for new features
4. Update documentation
5. Follow accessibility guidelines

## License

Part of Logos Vision CRM system.

## Support

For questions or issues:
- Check documentation
- Review examples
- Contact development team
