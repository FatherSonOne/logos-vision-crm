# Export Templates System - Developer Guide

## Quick Start

### Installation

The export templates system is ready to use. First, run the database migration:

```bash
cd supabase
supabase migration up
```

### Basic Usage

```tsx
import { ExportMenu } from '@/components/reports/export';

function MyReport() {
  const handleExport = async (format, template) => {
    if (template) {
      // Export with template configuration
      await exportWithTemplate(data, format, template.configuration);
    } else {
      // Export with default settings
      await exportWithDefaults(data, format);
    }
  };

  return (
    <div>
      <ExportMenu onExport={handleExport} />
    </div>
  );
}
```

## Component Architecture

### Component Hierarchy

```
ExportMenu (Main entry point)
├── ExportTemplateSelector (Template selection dialog)
├── ExportTemplateEditor (Create/edit templates)
└── ExportTemplatePreview (Visual preview)

ExportTemplateManager (Standalone manager)
├── ExportTemplateEditor
└── Template Cards
```

### Data Flow

```
User Action → ExportMenu
            ↓
    Select Template
            ↓
    Apply Configuration
            ↓
    Execute Export
            ↓
    Track Usage
```

## Components

### ExportMenu

The main export dropdown menu with template integration.

**Props:**
```typescript
interface ExportMenuProps {
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'png', template?: any) => Promise<void>;
  disabled?: boolean;
  currentSettings?: any;
}
```

**Features:**
- Quick export with last used template
- Recent templates list
- Format-specific submenus
- Save current settings as template

**Usage:**
```tsx
<ExportMenu
  onExport={handleExport}
  disabled={isLoading}
  currentSettings={currentExportConfig}
/>
```

### ExportTemplateManager

Full-featured template management interface.

**Props:**
```typescript
interface ExportTemplateManagerProps {
  onSelectTemplate?: (template: any) => void;
}
```

**Features:**
- Grid view of templates
- Search and filter
- Create, edit, delete templates
- Duplicate templates
- Toggle public/private

**Usage:**
```tsx
<ExportTemplateManager
  onSelectTemplate={(template) => {
    applyTemplate(template);
  }}
/>
```

### ExportTemplateEditor

Dialog for creating and editing templates.

**Props:**
```typescript
interface ExportTemplateEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: TemplateData) => void;
  initialTemplate?: Template;
}
```

**Features:**
- Format-specific configuration forms
- Real-time preview
- Validation
- Public/private toggle

**Usage:**
```tsx
const [editorOpen, setEditorOpen] = useState(false);

<ExportTemplateEditor
  open={editorOpen}
  onClose={() => setEditorOpen(false)}
  onSave={handleSave}
  initialTemplate={existingTemplate}
/>
```

### ExportTemplateSelector

Modal for selecting templates during export.

**Props:**
```typescript
interface ExportTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: any) => void;
  format?: 'pdf' | 'excel' | 'csv' | 'png';
  showDefault?: boolean;
}
```

**Features:**
- Search templates
- Filter by format
- Recent templates section
- Quick selection

**Usage:**
```tsx
<ExportTemplateSelector
  open={selectorOpen}
  onClose={() => setSelectorOpen(false)}
  onSelect={handleTemplateSelect}
  format="pdf"
/>
```

### ExportTemplatePreview

Visual preview of export output.

**Props:**
```typescript
interface ExportTemplatePreviewProps {
  templateType: 'pdf' | 'excel' | 'csv' | 'png';
  configuration: ExportTemplateConfiguration;
  sampleData?: any[];
}
```

**Features:**
- Format-specific rendering
- Zoom controls
- Sample data display

**Usage:**
```tsx
<ExportTemplatePreview
  templateType="pdf"
  configuration={template.configuration}
  sampleData={previewData}
/>
```

## Service Layer

### reportService Methods

#### Template CRUD Operations

```typescript
// Create template
const template = await reportService.createExportTemplate({
  name: string,
  description?: string,
  template_type: 'pdf' | 'excel' | 'csv' | 'png',
  configuration: ExportTemplateConfiguration,
  is_public?: boolean,
  shared_with?: string[],
  thumbnail_url?: string
});

// Update template
await reportService.updateExportTemplate(id, {
  name?: string,
  description?: string,
  configuration?: ExportTemplateConfiguration,
  is_public?: boolean,
  shared_with?: string[],
  thumbnail_url?: string
});

// Delete template
await reportService.deleteExportTemplate(id);
```

#### Template Retrieval

```typescript
// Get all templates with filters
const templates = await reportService.getExportTemplates({
  template_type?: 'pdf' | 'excel' | 'csv' | 'png',
  is_public?: boolean,
  search?: string
});

// Get templates by format
const pdfTemplates = await reportService.getTemplatesByFormat('pdf');

// Get user's templates
const myTemplates = await reportService.getUserTemplates(userId);

// Get public templates
const publicTemplates = await reportService.getPublicTemplates();

// Get single template
const template = await reportService.getExportTemplateById(id);
```

#### Template Utilities

```typescript
// Duplicate template
const copy = await reportService.duplicateExportTemplate(
  id,
  newName?: string
);

// Increment usage count
await reportService.incrementTemplateUsage(id);

// Get recent templates
const recent = await reportService.getRecentTemplates(limit);

// Get most used templates
const popular = await reportService.getMostUsedTemplates(limit);
```

## Configuration Types

### ExportTemplateConfiguration

```typescript
interface ExportTemplateConfiguration {
  pdf?: PdfConfiguration;
  excel?: ExcelConfiguration;
  csv?: CsvConfiguration;
  png?: PngConfiguration;
}
```

### PdfConfiguration

```typescript
interface PdfConfiguration {
  orientation: 'portrait' | 'landscape';
  pageSize: 'letter' | 'a4' | 'legal' | 'tabloid';
  includeCharts: boolean;
  includeFilters: boolean;
  includeSummary: boolean;
  includeMetadata: boolean;
  headerText?: string;
  footerText?: string;
  showPageNumbers: boolean;
  showDate: boolean;
  showBranding: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'color' | 'grayscale';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### ExcelConfiguration

```typescript
interface ExcelConfiguration {
  includeMultipleSheets: boolean;
  includeSummarySheet: boolean;
  includeChartsSheet: boolean;
  includeRawDataSheet: boolean;
  includeMetadata: boolean;
  includeFormulas: boolean;
  applyFormatting: boolean;
  freezeHeaders: boolean;
  autoFilter: boolean;
  columnWidthMode: 'auto' | 'fixed' | 'content';
  includeConditionalFormatting: boolean;
  colorScheme: 'default' | 'professional' | 'vibrant';
  numberFormat: string;
  dateFormat: string;
}
```

### CsvConfiguration

```typescript
interface CsvConfiguration {
  delimiter: ',' | ';' | '\t' | '|';
  encoding: 'utf-8' | 'utf-16' | 'ascii' | 'iso-8859-1';
  includeHeaders: boolean;
  dateFormat: string;
  numberFormat: 'standard' | 'scientific';
  quoteStrings: boolean;
  lineEnding: 'crlf' | 'lf';
  bom: boolean;
}
```

### PngConfiguration

```typescript
interface PngConfiguration {
  width: number;
  height: number;
  resolution: 72 | 150 | 300 | 600;
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 1-100
  backgroundColor: string;
  includeCharts: boolean;
  includeFilters: boolean;
  scale: number; // 1-3
  cropToContent: boolean;
}
```

## Database Schema

### Table Structure

```sql
CREATE TABLE export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('pdf', 'excel', 'csv', 'png')),
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_export_templates_created_by ON export_templates(created_by);
CREATE INDEX idx_export_templates_template_type ON export_templates(template_type);
CREATE INDEX idx_export_templates_is_public ON export_templates(is_public);
CREATE INDEX idx_export_templates_usage_count ON export_templates(usage_count DESC);
CREATE INDEX idx_export_templates_created_at ON export_templates(created_at DESC);
CREATE INDEX idx_export_templates_configuration ON export_templates USING GIN (configuration);
```

### RLS Policies

```sql
-- Users can view own templates
CREATE POLICY "Users can view own templates"
  ON export_templates FOR SELECT
  USING (auth.uid() = created_by);

-- Users can view public templates
CREATE POLICY "Users can view public templates"
  ON export_templates FOR SELECT
  USING (is_public = true);

-- Users can view shared templates
CREATE POLICY "Users can view shared templates"
  ON export_templates FOR SELECT
  USING (auth.uid()::TEXT = ANY(shared_with));

-- CRUD policies for owners only
CREATE POLICY "Users can create templates"
  ON export_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON export_templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
  ON export_templates FOR DELETE
  USING (auth.uid() = created_by);
```

### Utility Functions

```sql
-- Increment usage count
CREATE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE export_templates
  SET usage_count = usage_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get template statistics
CREATE FUNCTION get_template_stats(user_id UUID)
RETURNS TABLE(
  total_templates BIGINT,
  public_templates BIGINT,
  private_templates BIGINT,
  total_usage BIGINT,
  most_used_template_id UUID,
  most_used_template_name TEXT,
  most_used_count INTEGER
) AS $$
  -- Implementation in migration file
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Default Templates

Located in `/src/config/defaultExportTemplates.ts`:

```typescript
export const DEFAULT_EXPORT_TEMPLATES: ExportTemplate[] = [
  // 3 PDF templates
  // 3 Excel templates
  // 3 CSV templates
  // 4 PNG templates
];
```

Access via helper functions:

```typescript
import { getTemplatesByType, getTemplateByName } from '@/config/defaultExportTemplates';

const pdfTemplates = getTemplatesByType('pdf');
const template = getTemplateByName('Professional PDF');
```

## Integration Patterns

### Pattern 1: Simple Export Menu

```tsx
import { ExportMenu } from '@/components/reports/export';

function Report() {
  const handleExport = async (format, template) => {
    const config = template?.configuration?.[format] || getDefaultConfig(format);
    await exportData(data, format, config);
  };

  return <ExportMenu onExport={handleExport} />;
}
```

### Pattern 2: With Export Service

```tsx
import { ExportMenu } from '@/components/reports/export';
import { exportService } from '@/services/reports/export/ExportService';

function Report() {
  const handleExport = async (format, template) => {
    if (template) {
      await exportService.exportWithTemplate(data, template);
    } else {
      await exportService.exportToFormat(data, format);
    }
  };

  return <ExportMenu onExport={handleExport} />;
}
```

### Pattern 3: Standalone Manager

```tsx
import { ExportTemplateManager } from '@/components/reports/export';

function TemplatesPage() {
  const handleSelect = (template) => {
    // Navigate to export with template
    navigate(`/reports/${reportId}/export?template=${template.id}`);
  };

  return <ExportTemplateManager onSelectTemplate={handleSelect} />;
}
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportMenu } from '@/components/reports/export';

describe('ExportMenu', () => {
  it('should call onExport with format', async () => {
    const onExport = jest.fn();
    render(<ExportMenu onExport={onExport} />);

    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('PDF'));

    expect(onExport).toHaveBeenCalledWith('pdf', undefined);
  });

  it('should show recent templates', async () => {
    // Mock recent templates
    jest.spyOn(reportService, 'getRecentTemplates').mockResolvedValue([
      { id: '1', name: 'Test Template', template_type: 'pdf' }
    ]);

    render(<ExportMenu onExport={jest.fn()} />);

    await screen.findByText('Test Template');
  });
});
```

### Integration Tests

```typescript
import { renderWithProviders } from '@/test-utils';
import { ExportTemplateManager } from '@/components/reports/export';

describe('ExportTemplateManager Integration', () => {
  it('should create and display template', async () => {
    const { user } = renderWithProviders(<ExportTemplateManager />);

    // Click create button
    await user.click(screen.getByText('Create Template'));

    // Fill form
    await user.type(screen.getByLabelText('Template Name'), 'New Template');
    await user.click(screen.getByText('Save Template'));

    // Verify template appears
    await screen.findByText('New Template');
  });
});
```

## Performance Considerations

### Template Loading

Templates are loaded on-demand with caching:

```typescript
const [templates, setTemplates] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const cached = sessionStorage.getItem('export_templates');
  if (cached) {
    setTemplates(JSON.parse(cached));
    setLoading(false);
  } else {
    loadTemplates();
  }
}, []);
```

### Usage Tracking

Increment usage count asynchronously:

```typescript
const handleUseTemplate = async (template) => {
  // Apply template immediately
  applyTemplate(template);

  // Track usage in background
  reportService.incrementTemplateUsage(template.id).catch(console.error);
};
```

### Preview Optimization

Previews use sample data to avoid large renders:

```typescript
<ExportTemplatePreview
  templateType={type}
  configuration={config}
  sampleData={data.slice(0, 10)} // Only preview first 10 rows
/>
```

## Troubleshooting

### Common Issues

1. **Templates not loading**
   - Check RLS policies
   - Verify user authentication
   - Check network requests

2. **Cannot save template**
   - Validate configuration object
   - Check user permissions
   - Verify required fields

3. **Preview not rendering**
   - Check configuration format
   - Verify sample data structure
   - Check console for errors

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem('DEBUG_EXPORT_TEMPLATES', 'true');

// In components
const DEBUG = localStorage.getItem('DEBUG_EXPORT_TEMPLATES') === 'true';

if (DEBUG) {
  console.log('Loading templates:', filters);
}
```

## Contributing

### Adding New Format

1. Update configuration types
2. Add format to default templates
3. Create configuration form in ExportTemplateEditor
4. Add preview renderer in ExportTemplatePreview
5. Update ExportMenu with new format option

### Adding Template Features

1. Update database schema if needed
2. Add fields to configuration interface
3. Update ExportTemplateEditor form
4. Update preview rendering
5. Document new features

## Resources

- [User Guide](./EXPORT_TEMPLATES_GUIDE.md)
- [API Documentation](./api/export-templates.md)
- [Database Schema](../supabase/migrations/20260123000000_create_export_templates.sql)
- [Default Templates](../src/config/defaultExportTemplates.ts)

## Support

For questions or issues:
- Check this documentation
- Review component source code
- Test with default templates
- Contact development team
