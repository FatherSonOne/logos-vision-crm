# Export Templates System - User Guide

## Overview

The Export Templates System provides a comprehensive solution for saving and reusing export configurations across your CRM reports. Instead of configuring export settings every time, you can create templates once and reuse them with a single click.

## Features

### Core Capabilities

- **Template Management**: Create, edit, delete, and organize export templates
- **Multiple Formats**: Support for PDF, Excel, CSV, and PNG exports
- **Template Sharing**: Make templates public or keep them private
- **Quick Access**: Recently used templates and favorites for fast exports
- **Preview**: Visual preview of how exports will look before generating
- **Usage Tracking**: See which templates are most popular

### Template Types

#### PDF Templates
Configure comprehensive PDF export settings:
- **Layout**: Portrait/landscape, page size (Letter, A4, Legal, Tabloid)
- **Content**: Include/exclude charts, filters, summary, metadata
- **Styling**: Font size, color scheme (color/grayscale)
- **Headers/Footers**: Custom text, page numbers, dates, branding
- **Margins**: Precise margin control

#### Excel Templates
Optimize Excel workbook exports:
- **Sheets**: Multiple sheets, summary, charts, raw data
- **Formatting**: Apply styles, conditional formatting, formulas
- **Options**: Freeze headers, auto-filter, column width modes
- **Data Formats**: Number and date formatting patterns
- **Color Schemes**: Default, professional, or vibrant

#### CSV Templates
Fine-tune CSV file generation:
- **Delimiters**: Comma, semicolon, tab, or pipe
- **Encoding**: UTF-8, UTF-16, ASCII, ISO-8859-1
- **Formatting**: Date formats, number formats
- **Options**: Headers, BOM, quote strings, line endings

#### PNG/Image Templates
Configure image exports:
- **Dimensions**: Custom width and height
- **Quality**: Resolution (72-600 DPI), quality percentage
- **Format**: PNG, JPEG, or WebP
- **Content**: Include/exclude charts and filters
- **Optimization**: Crop to content, background color, scale factor

## Getting Started

### 1. Creating Your First Template

Navigate to the Export Templates section and click "Create Template":

1. **Enter Basic Information**
   - Name: "Professional Monthly Report"
   - Description: "Standard format for monthly financial reports"
   - Format: Select PDF, Excel, CSV, or PNG

2. **Configure Settings**
   - Each format has specific options
   - Use the preview to see changes in real-time
   - Set appropriate margins, headers, and content options

3. **Save Template**
   - Choose public or private visibility
   - Template is now available for all exports

### 2. Using Templates

#### Method 1: Quick Export with Last Used Template
- The export menu remembers your last used template
- Click "Export" → Select the starred recent template
- One-click export with your preferred settings

#### Method 2: Browse Templates
- Click "Export" → Choose format → "Use Template"
- Browse available templates
- Search by name or filter by format
- Select and apply

#### Method 3: Recent Templates
- Export menu shows 3 most recent templates
- Quick access without searching
- Automatically tracks usage

### 3. Managing Templates

#### Edit Templates
- Only template owners can edit
- Update settings without losing usage history
- Changes apply to future exports

#### Share Templates
- Make templates public for team access
- Keep private for personal use
- View who created each template

#### Duplicate Templates
- Clone existing templates as starting point
- Customize for specific needs
- Maintain original template

#### Delete Templates
- Remove unused templates
- Confirmation required
- Cannot delete public templates in use

## Default Templates

The system includes pre-configured templates:

### PDF Templates
- **Professional PDF**: Portrait, full details, branding
- **Presentation PDF**: Landscape, large fonts, minimal
- **Compact PDF**: A4, grayscale, no extras

### Excel Templates
- **Detailed Excel Workbook**: Multiple sheets, formulas, formatting
- **Simple Excel Export**: Single sheet, basic data
- **Analysis Excel**: Optimized for data analysis with conditionals

### CSV Templates
- **Standard CSV**: UTF-8, comma-delimited
- **European CSV**: Semicolon, European date format
- **Tab-Delimited**: For database imports

### PNG Templates
- **High-Resolution Print**: 300 DPI for printing
- **Screen Resolution**: 1920x1080 for displays
- **Social Media**: 1200x630 optimized
- **Email Attachment**: Compressed JPEG

## Integration Examples

### Using in ReportViewer

```tsx
import { ExportMenu } from '@/components/reports/export';

// In your component
const handleExport = async (format, template) => {
  // Use template configuration for export
  const config = template?.configuration || getDefaultConfig();

  // Apply template settings to export
  await exportService.exportWithConfig(data, format, config);
};

<ExportMenu onExport={handleExport} />
```

### Standalone Template Manager

```tsx
import { ExportTemplateManager } from '@/components/reports/export';

<ExportTemplateManager
  onSelectTemplate={(template) => {
    // Handle template selection
    console.log('Selected template:', template);
  }}
/>
```

### Custom Template Selector

```tsx
import { ExportTemplateSelector } from '@/components/reports/export';

const [selectorOpen, setSelectorOpen] = useState(false);

<ExportTemplateSelector
  open={selectorOpen}
  onClose={() => setSelectorOpen(false)}
  onSelect={(template) => {
    // Apply template
    applyExportTemplate(template);
  }}
  format="pdf"  // Optional: filter by format
/>
```

## Database Schema

### export_templates Table

```sql
CREATE TABLE export_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL,
  configuration JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  shared_with TEXT[],
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security

- Users can view their own templates
- Users can view public templates
- Users can view templates shared with them
- Only owners can modify their templates
- Usage count updated via RPC function

## API Reference

### reportService Methods

#### createExportTemplate(template)
Creates a new export template.

```typescript
const template = await reportService.createExportTemplate({
  name: 'My Template',
  description: 'Custom template',
  template_type: 'pdf',
  configuration: { pdf: { /* settings */ } },
  is_public: false
});
```

#### updateExportTemplate(id, updates)
Updates an existing template.

```typescript
await reportService.updateExportTemplate(templateId, {
  name: 'Updated Name',
  configuration: newConfig
});
```

#### getExportTemplates(filters)
Retrieves templates with optional filtering.

```typescript
const templates = await reportService.getExportTemplates({
  template_type: 'pdf',
  search: 'monthly'
});
```

#### incrementTemplateUsage(id)
Increments the usage counter.

```typescript
await reportService.incrementTemplateUsage(templateId);
```

#### duplicateExportTemplate(id, newName)
Creates a copy of an existing template.

```typescript
const copy = await reportService.duplicateExportTemplate(
  templateId,
  'Copy of Original'
);
```

## Best Practices

### Naming Conventions
- Use descriptive names: "Monthly Financial Report - Portrait"
- Include format in name if you have similar templates
- Mention key features: "Executive Summary - Landscape - No Charts"

### Template Organization
- Create templates for common use cases
- Make frequently used templates public
- Use descriptions to explain when to use each template
- Keep private templates for experimental settings

### Performance
- Templates are cached for fast access
- Usage count helps identify popular templates
- Recent templates list provides quick access
- Template configuration is lightweight JSONB

### Security
- RLS policies protect template data
- Only owners can modify templates
- Public templates are read-only for non-owners
- Sharing via shared_with array for specific users

## Troubleshooting

### Template Not Appearing
- Check if filters are applied
- Verify template visibility (public/private)
- Ensure you have proper permissions
- Refresh the template list

### Export Fails with Template
- Verify template configuration is valid
- Check browser console for errors
- Try exporting without template first
- Contact support with template ID

### Cannot Edit Template
- Only template owners can edit
- Check created_by field
- Duplicate template to create your own copy
- Request owner to make it public

### Template Usage Not Incrementing
- RPC function may need permissions
- Check database logs
- Fallback method should work automatically
- Usage count is non-critical feature

## Migration Guide

To migrate existing export settings to templates:

1. **Run the Migration**
   ```bash
   # Apply database migration
   supabase migration up
   ```

2. **Create Templates from Defaults**
   - Default templates are automatically available
   - System creates them on first access
   - No user action required

3. **Convert Custom Settings**
   - Export with your current settings
   - Click "Save as Template" in export menu
   - Name and save for future use

## Advanced Usage

### Custom Template Thumbnails
Upload preview images for templates:

```typescript
const template = await reportService.createExportTemplate({
  // ... other fields
  thumbnail_url: 'https://example.com/preview.png'
});
```

### Template Statistics
Get usage statistics:

```typescript
const stats = await supabase.rpc('get_template_stats', {
  user_id: currentUserId
});

console.log('Total templates:', stats.total_templates);
console.log('Most used:', stats.most_used_template_name);
```

### Bulk Template Operations
Manage multiple templates:

```typescript
// Get all user templates
const myTemplates = await reportService.getUserTemplates(userId);

// Make multiple templates public
for (const template of myTemplates) {
  await reportService.updateExportTemplate(template.id, {
    is_public: true
  });
}
```

## Support

For issues or questions:
- Check this documentation
- Review error messages in console
- Contact development team
- Submit feature requests via issue tracker

## Changelog

### Version 1.0.0 (Initial Release)
- Complete export templates system
- Support for PDF, Excel, CSV, PNG
- Template manager UI
- Template editor with previews
- Quick export menu integration
- Usage tracking and statistics
- Default template library
- RLS security policies
