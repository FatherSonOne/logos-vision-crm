# Advanced Filter Builder Documentation

## Overview

The Advanced Filter Builder is a visual, low-code component for creating complex report filters with nested AND/OR logic. It provides an intuitive interface for non-technical users while generating optimized SQL queries for database operations.

## Features

### 🎨 Visual Interface
- Drag-and-drop filter creation
- No coding required
- Real-time validation
- Accessible with keyboard navigation and screen reader support

### 🔀 Nested Logic
- Support for nested filter groups (up to 3 levels deep)
- AND/OR operators for each group
- Visual nesting with indentation and connecting lines
- Drag to reorder filters

### 🎯 Smart Field Types
The builder adapts to different field types with appropriate operators:

**Text Fields**
- equals, not equals
- contains, does not contain
- starts with, ends with
- regex match
- is empty, is not empty

**Number Fields**
- equals, not equals
- greater than, less than
- greater than or equal, less than or equal
- between
- is empty, is not empty

**Date Fields**
- equals, not equals
- before, after
- between
- last 7 days, last 30 days
- this month, this year, last year
- is empty, is not empty

**Boolean Fields**
- is true
- is false

**Select/Multi-Select Fields**
- equals, not equals
- is one of, is not one of
- is empty, is not empty

### 💾 Filter Templates
- Save filters as reusable templates
- Quick filters (Last 30 Days, High Value, etc.)
- Custom templates with categories:
  - Common (organization-wide)
  - Custom (personal)
  - Shared (team-specific)
- Edit and delete templates
- Template search and filtering

### ⚡ SQL Generation
- Real-time SQL WHERE clause generation
- Parameterized queries for security
- Supabase query builder integration
- SQL preview with syntax highlighting
- Human-readable filter descriptions

### ✅ Validation
- Real-time filter validation
- Type checking for field values
- Conflict detection (e.g., field equals X AND not equals X)
- User-friendly error messages
- Warning for potentially conflicting filters

## Installation

The Advanced Filter Builder is included in the `src/components/reports/` directory with the following structure:

```
src/
├── components/
│   └── reports/
│       ├── AdvancedFilterBuilder.tsx       # Main component
│       ├── filterTypes.ts                  # Type definitions
│       ├── ReportBuilder.tsx              # Integration example
│       ├── AdvancedFilterDemo.tsx         # Demo page
│       └── filters/
│           ├── FilterRow.tsx              # Single filter condition
│           ├── FilterGroup.tsx            # Filter group with AND/OR
│           └── FilterTemplates.tsx        # Template management
└── utils/
    ├── filterValidation.ts                # Validation logic
    └── filterSqlGenerator.ts              # SQL generation
```

## Usage

### Basic Usage

```tsx
import { AdvancedFilterBuilder } from './components/reports/AdvancedFilterBuilder';
import type { FilterGroup } from './components/reports/filterTypes';

function MyReport() {
  const [filter, setFilter] = useState<FilterGroup | null>(null);

  const handleApplyFilter = (filter: FilterGroup) => {
    // Use the filter to query your data
    console.log('Applied filter:', filter);
  };

  return (
    <AdvancedFilterBuilder
      reportType="donors"
      onChange={setFilter}
      onApply={handleApplyFilter}
    />
  );
}
```

### With Custom Fields

```tsx
import { AdvancedFilterBuilder } from './components/reports/AdvancedFilterBuilder';
import type { FilterField } from './components/reports/filterTypes';

const customFields: FilterField[] = [
  {
    id: 'custom_score',
    label: 'Custom Score',
    type: 'number',
    tableName: 'clients',
    columnName: 'custom_score',
  },
  {
    id: 'custom_status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    tableName: 'clients',
    columnName: 'status',
  },
];

function CustomReport() {
  return (
    <AdvancedFilterBuilder
      reportType="custom"
      customFields={customFields}
      onApply={(filter) => {
        // Handle filter application
      }}
    />
  );
}
```

### Generating SQL from Filters

```tsx
import { generateSqlWhere } from './utils/filterSqlGenerator';
import { DONOR_FIELDS } from './components/reports/filterTypes';

function executeFilter(filter: FilterGroup) {
  const { sql, params } = generateSqlWhere(filter, DONOR_FIELDS);

  console.log('SQL:', sql);
  // Example: "clients.name ILIKE $1 AND clients.email = $2"

  console.log('Params:', params);
  // Example: ['%john%', 'john@example.com']

  // Use with your database client
  const results = await db.query(
    `SELECT * FROM clients WHERE ${sql}`,
    params
  );
}
```

### Validating Filters

```tsx
import { validateFilter, checkForConflicts } from './utils/filterValidation';
import { DONOR_FIELDS } from './components/reports/filterTypes';

function validateMyFilter(filter: FilterGroup) {
  // Check for validation errors
  const errors = validateFilter(filter, DONOR_FIELDS);

  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    // Example: [{ conditionId: 'c1', field: 'value', message: 'Value is required' }]
    return false;
  }

  // Check for logical conflicts
  const conflicts = checkForConflicts(filter);

  if (conflicts.length > 0) {
    console.warn('Potential conflicts:', conflicts);
    // Example: ['Field "name" has contradictory conditions: equals and not equals']
  }

  return true;
}
```

## Filter Data Structure

### FilterGroup

```typescript
interface FilterGroup {
  id: string;                    // Unique identifier
  logic: 'AND' | 'OR';          // How to combine conditions
  conditions: FilterCondition[]; // Array of filter conditions
  groups: FilterGroup[];         // Nested filter groups
}
```

### FilterCondition

```typescript
interface FilterCondition {
  id: string;               // Unique identifier
  fieldId: string;          // Field to filter on
  operator: FilterOperator; // Comparison operator
  value: any;              // Filter value
  value2?: any;            // Second value (for 'between')
}
```

### Example Filter Structure

```json
{
  "id": "root",
  "logic": "AND",
  "conditions": [
    {
      "id": "c1",
      "fieldId": "total_donated",
      "operator": "greater_than_or_equal",
      "value": 1000
    },
    {
      "id": "c2",
      "fieldId": "email_opt_in",
      "operator": "is_true",
      "value": true
    }
  ],
  "groups": [
    {
      "id": "g1",
      "logic": "OR",
      "conditions": [
        {
          "id": "c3",
          "fieldId": "engagement_level",
          "operator": "equals",
          "value": "Highly Engaged"
        },
        {
          "id": "c4",
          "fieldId": "last_donation_date",
          "operator": "last_30_days",
          "value": undefined
        }
      ],
      "groups": []
    }
  ]
}
```

This translates to:
```
(total_donated >= 1000)
AND (email_opt_in = true)
AND (engagement_level = 'Highly Engaged' OR last_donation_date >= NOW() - INTERVAL '30 days')
```

## Accessibility

The Advanced Filter Builder is fully accessible:

### Keyboard Navigation
- **Tab**: Move between filter components
- **Space/Enter**: Toggle AND/OR logic, activate buttons
- **Escape**: Close dialogs
- **Arrow keys**: Navigate within select dropdowns

### Screen Reader Support
- All interactive elements have proper ARIA labels
- Form fields have descriptive labels
- Dynamic content changes are announced
- Clear focus indicators throughout

### Accessible Features
- High contrast support
- Keyboard-only operation
- Clear error messages
- Logical tab order
- Focus management in dialogs

## Performance Considerations

### Optimization Tips

1. **Limit Nesting Depth**: Keep filter groups to 2-3 levels for better UX
2. **Field Count**: Limit available fields to 20-30 for faster rendering
3. **Validation**: Debounce validation for real-time updates
4. **SQL Generation**: Cache generated SQL when filter hasn't changed

### Best Practices

```tsx
// Good: Use memoization for expensive operations
const sqlPreview = useMemo(() => {
  return generateSqlWhere(filter, availableFields);
}, [filter, availableFields]);

// Good: Debounce onChange handler
const debouncedOnChange = useMemo(
  () => debounce((filter) => onChange(filter), 300),
  [onChange]
);

// Good: Limit nested group depth
<FilterGroup
  group={filter}
  maxDepth={3}
  depth={0}
/>
```

## Extending the Builder

### Adding Custom Field Types

```typescript
// 1. Add new field type to filterTypes.ts
export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';

// 2. Add operators for new type
export function getOperatorsForType(type: FieldType): FilterOperator[] {
  switch (type) {
    case 'custom':
      return ['custom_operator_1', 'custom_operator_2'];
    // ... other cases
  }
}

// 3. Add value input component in FilterRow.tsx
case 'custom':
  return <CustomValueInput value={value} onChange={onChange} />;
```

### Custom SQL Generation

```typescript
// Extend filterSqlGenerator.ts
function generateConditionSql(condition: FilterCondition, ...): string {
  switch (condition.operator) {
    case 'custom_operator':
      return `custom_function(${fullColumn}, $${params.length})`;
    // ... other cases
  }
}
```

## API Reference

### Components

#### AdvancedFilterBuilder

Main component for the filter builder.

**Props:**
- `reportType: ReportType` - Type of report ('donors', 'projects', etc.)
- `initialFilter?: FilterGroup` - Initial filter configuration
- `customFields?: FilterField[]` - Custom field definitions
- `onChange?: (filter: FilterGroup) => void` - Filter change handler
- `onApply?: (filter: FilterGroup) => void` - Filter apply handler

#### FilterRow

Single filter condition row.

**Props:**
- `condition: FilterCondition` - Current condition
- `availableFields: FilterField[]` - Available fields to filter
- `onChange: (condition: FilterCondition) => void` - Condition change handler
- `onRemove: () => void` - Remove condition handler

#### FilterGroup

Container for multiple filters with AND/OR logic.

**Props:**
- `group: FilterGroup` - Current group
- `availableFields: FilterField[]` - Available fields
- `onChange: (group: FilterGroup) => void` - Group change handler
- `onRemove?: () => void` - Remove group handler
- `depth?: number` - Current nesting depth (default: 0)
- `maxDepth?: number` - Maximum nesting depth (default: 3)

#### FilterTemplates

Template management component.

**Props:**
- `templates: FilterTemplate[]` - Array of templates
- `onApply: (template: FilterTemplate) => void` - Apply template handler
- `onSave: (name, description, category) => void` - Save template handler
- `onEdit: (templateId, name, description) => void` - Edit template handler
- `onDelete: (templateId: string) => void` - Delete template handler
- `currentFilter?: FilterGroup` - Current filter for saving

### Utilities

#### generateSqlWhere

Converts filter to SQL WHERE clause.

```typescript
function generateSqlWhere(
  filter: FilterGroup,
  availableFields: FilterField[]
): { sql: string; params: any[] }
```

#### validateFilter

Validates filter configuration.

```typescript
function validateFilter(
  filter: FilterGroup,
  availableFields: FilterField[]
): FilterValidationError[]
```

#### checkForConflicts

Checks for conflicting filter conditions.

```typescript
function checkForConflicts(filter: FilterGroup): string[]
```

#### generateFilterDescription

Generates human-readable description.

```typescript
function generateFilterDescription(
  filter: FilterGroup,
  availableFields: FilterField[]
): string
```

## Examples

### Example 1: High-Value Donors

Filter for donors who have given $1,000+ in the last year:

```json
{
  "logic": "AND",
  "conditions": [
    {
      "fieldId": "total_donated",
      "operator": "greater_than_or_equal",
      "value": 1000
    },
    {
      "fieldId": "last_donation_date",
      "operator": "last_year",
      "value": null
    }
  ],
  "groups": []
}
```

### Example 2: Engaged Donors with Email Opt-In

Complex filter with nested groups:

```json
{
  "logic": "AND",
  "conditions": [
    {
      "fieldId": "email_opt_in",
      "operator": "is_true",
      "value": true
    }
  ],
  "groups": [
    {
      "logic": "OR",
      "conditions": [
        {
          "fieldId": "engagement_level",
          "operator": "equals",
          "value": "Highly Engaged"
        },
        {
          "fieldId": "donation_count",
          "operator": "greater_than_or_equal",
          "value": 5
        }
      ],
      "groups": []
    }
  ]
}
```

### Example 3: Active Projects with Budget Constraints

```json
{
  "logic": "AND",
  "conditions": [
    {
      "fieldId": "status",
      "operator": "in",
      "value": ["In Progress", "Active"]
    },
    {
      "fieldId": "budget",
      "operator": "between",
      "value": 10000,
      "value2": 100000
    }
  ],
  "groups": []
}
```

## Troubleshooting

### Common Issues

**Issue**: Filter validation errors
**Solution**: Check that all required fields are filled and values match expected types

**Issue**: SQL generation fails
**Solution**: Ensure all fields have `tableName` and `columnName` properties

**Issue**: Templates not saving
**Solution**: Verify `onSave` handler is properly connected

**Issue**: Performance issues with many filters
**Solution**: Reduce nesting depth or number of available fields

## Contributing

To contribute to the Advanced Filter Builder:

1. Follow existing code style and patterns
2. Add tests for new operators or field types
3. Update documentation for new features
4. Ensure accessibility compliance
5. Test with keyboard navigation and screen readers

## License

Part of the Logos Vision CRM project.

## Support

For questions or issues:
- Check the demo page: `AdvancedFilterDemo.tsx`
- Review example usage in `ReportBuilder.tsx`
- See type definitions in `filterTypes.ts`
