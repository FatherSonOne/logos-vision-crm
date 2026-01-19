import type { FilterGroup, FilterCondition, FilterField } from '../components/reports/filterTypes';

/**
 * Converts a filter configuration to SQL WHERE clause
 */
export function generateSqlWhere(
  filter: FilterGroup,
  availableFields: FilterField[]
): { sql: string; params: any[] } {
  const params: any[] = [];
  const sql = generateGroupSql(filter, availableFields, params);

  return { sql, params };
}

/**
 * Generates SQL for a filter group
 */
function generateGroupSql(
  group: FilterGroup,
  availableFields: FilterField[],
  params: any[]
): string {
  const parts: string[] = [];

  // Add condition SQLs
  group.conditions.forEach(condition => {
    const conditionSql = generateConditionSql(condition, availableFields, params);
    if (conditionSql) {
      parts.push(conditionSql);
    }
  });

  // Add nested group SQLs
  group.groups.forEach(nestedGroup => {
    const groupSql = generateGroupSql(nestedGroup, availableFields, params);
    if (groupSql) {
      parts.push(`(${groupSql})`);
    }
  });

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return parts.join(` ${group.logic} `);
}

/**
 * Generates SQL for a single condition
 */
function generateConditionSql(
  condition: FilterCondition,
  availableFields: FilterField[],
  params: any[]
): string {
  const field = availableFields.find(f => f.id === condition.fieldId);
  if (!field) {
    return '';
  }

  const columnName = field.columnName || field.id;
  const tableName = field.tableName;
  const fullColumn = tableName ? `${tableName}.${columnName}` : columnName;

  switch (condition.operator) {
    case 'equals':
      params.push(condition.value);
      return `${fullColumn} = $${params.length}`;

    case 'not_equals':
      params.push(condition.value);
      return `${fullColumn} != $${params.length}`;

    case 'contains':
      params.push(`%${condition.value}%`);
      return `${fullColumn} ILIKE $${params.length}`;

    case 'not_contains':
      params.push(`%${condition.value}%`);
      return `${fullColumn} NOT ILIKE $${params.length}`;

    case 'starts_with':
      params.push(`${condition.value}%`);
      return `${fullColumn} ILIKE $${params.length}`;

    case 'ends_with':
      params.push(`%${condition.value}`);
      return `${fullColumn} ILIKE $${params.length}`;

    case 'regex':
      params.push(condition.value);
      return `${fullColumn} ~ $${params.length}`;

    case 'greater_than':
      params.push(condition.value);
      return `${fullColumn} > $${params.length}`;

    case 'less_than':
      params.push(condition.value);
      return `${fullColumn} < $${params.length}`;

    case 'greater_than_or_equal':
      params.push(condition.value);
      return `${fullColumn} >= $${params.length}`;

    case 'less_than_or_equal':
      params.push(condition.value);
      return `${fullColumn} <= $${params.length}`;

    case 'between':
      params.push(condition.value);
      const param1 = params.length;
      params.push(condition.value2);
      const param2 = params.length;
      return `${fullColumn} BETWEEN $${param1} AND $${param2}`;

    case 'before':
      params.push(condition.value);
      return `${fullColumn} < $${params.length}`;

    case 'after':
      params.push(condition.value);
      return `${fullColumn} > $${params.length}`;

    case 'last_7_days':
      return `${fullColumn} >= NOW() - INTERVAL '7 days'`;

    case 'last_30_days':
      return `${fullColumn} >= NOW() - INTERVAL '30 days'`;

    case 'this_month':
      return `${fullColumn} >= DATE_TRUNC('month', NOW()) AND ${fullColumn} < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'`;

    case 'this_year':
      return `${fullColumn} >= DATE_TRUNC('year', NOW()) AND ${fullColumn} < DATE_TRUNC('year', NOW()) + INTERVAL '1 year'`;

    case 'last_year':
      return `${fullColumn} >= DATE_TRUNC('year', NOW()) - INTERVAL '1 year' AND ${fullColumn} < DATE_TRUNC('year', NOW())`;

    case 'is_true':
      return `${fullColumn} = true`;

    case 'is_false':
      return `${fullColumn} = false`;

    case 'in':
      const values = Array.isArray(condition.value) ? condition.value : [condition.value];
      const placeholders = values.map(v => {
        params.push(v);
        return `$${params.length}`;
      });
      return `${fullColumn} IN (${placeholders.join(', ')})`;

    case 'not_in':
      const notInValues = Array.isArray(condition.value) ? condition.value : [condition.value];
      const notInPlaceholders = notInValues.map(v => {
        params.push(v);
        return `$${params.length}`;
      });
      return `${fullColumn} NOT IN (${notInPlaceholders.join(', ')})`;

    case 'is_empty':
      if (field.type === 'text') {
        return `(${fullColumn} IS NULL OR ${fullColumn} = '')`;
      }
      return `${fullColumn} IS NULL`;

    case 'is_not_empty':
      if (field.type === 'text') {
        return `(${fullColumn} IS NOT NULL AND ${fullColumn} != '')`;
      }
      return `${fullColumn} IS NOT NULL`;

    default:
      return '';
  }
}

/**
 * Generates Supabase query filters from filter configuration
 */
export function generateSupabaseFilters(
  filter: FilterGroup,
  availableFields: FilterField[]
): any {
  // This would be used with Supabase's query builder
  // Example: query.filter(...)

  const filters: any[] = [];

  generateSupabaseGroupFilters(filter, availableFields, filters);

  return filters;
}

function generateSupabaseGroupFilters(
  group: FilterGroup,
  availableFields: FilterField[],
  filters: any[]
): void {
  group.conditions.forEach(condition => {
    const field = availableFields.find(f => f.id === condition.fieldId);
    if (!field) return;

    const columnName = field.columnName || field.id;

    switch (condition.operator) {
      case 'equals':
        filters.push({ column: columnName, operator: 'eq', value: condition.value });
        break;
      case 'not_equals':
        filters.push({ column: columnName, operator: 'neq', value: condition.value });
        break;
      case 'contains':
        filters.push({ column: columnName, operator: 'ilike', value: `%${condition.value}%` });
        break;
      case 'greater_than':
        filters.push({ column: columnName, operator: 'gt', value: condition.value });
        break;
      case 'less_than':
        filters.push({ column: columnName, operator: 'lt', value: condition.value });
        break;
      case 'greater_than_or_equal':
        filters.push({ column: columnName, operator: 'gte', value: condition.value });
        break;
      case 'less_than_or_equal':
        filters.push({ column: columnName, operator: 'lte', value: condition.value });
        break;
      case 'in':
        filters.push({ column: columnName, operator: 'in', value: condition.value });
        break;
      case 'is_empty':
        filters.push({ column: columnName, operator: 'is', value: null });
        break;
      // Add more as needed
    }
  });

  // Handle nested groups recursively
  group.groups.forEach(nestedGroup => {
    generateSupabaseGroupFilters(nestedGroup, availableFields, filters);
  });
}

/**
 * Generates human-readable description of the filter
 */
export function generateFilterDescription(
  filter: FilterGroup,
  availableFields: FilterField[]
): string {
  return generateGroupDescription(filter, availableFields, 0);
}

function generateGroupDescription(
  group: FilterGroup,
  availableFields: FilterField[],
  depth: number
): string {
  const parts: string[] = [];

  group.conditions.forEach(condition => {
    const description = generateConditionDescription(condition, availableFields);
    if (description) {
      parts.push(description);
    }
  });

  group.groups.forEach(nestedGroup => {
    const groupDesc = generateGroupDescription(nestedGroup, availableFields, depth + 1);
    if (groupDesc) {
      parts.push(`(${groupDesc})`);
    }
  });

  if (parts.length === 0) {
    return '';
  }

  return parts.join(` ${group.logic.toLowerCase()} `);
}

function generateConditionDescription(
  condition: FilterCondition,
  availableFields: FilterField[]
): string {
  const field = availableFields.find(f => f.id === condition.fieldId);
  if (!field) {
    return '';
  }

  const operatorLabels: Record<string, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    starts_with: 'starts with',
    ends_with: 'ends with',
    regex: 'matches',
    greater_than: 'is greater than',
    less_than: 'is less than',
    greater_than_or_equal: 'is at least',
    less_than_or_equal: 'is at most',
    between: 'is between',
    before: 'is before',
    after: 'is after',
    last_7_days: 'in the last 7 days',
    last_30_days: 'in the last 30 days',
    this_month: 'this month',
    this_year: 'this year',
    last_year: 'last year',
    is_true: 'is true',
    is_false: 'is false',
    in: 'is one of',
    not_in: 'is not one of',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
  };

  const operatorLabel = operatorLabels[condition.operator] || condition.operator;

  if (condition.operator === 'between' && condition.value2) {
    return `${field.label} ${operatorLabel} ${condition.value} and ${condition.value2}`;
  }

  if (['is_empty', 'is_not_empty', 'is_true', 'is_false', 'last_7_days', 'last_30_days', 'this_month', 'this_year', 'last_year'].includes(condition.operator)) {
    return `${field.label} ${operatorLabel}`;
  }

  return `${field.label} ${operatorLabel} ${formatValue(condition.value, field)}`;
}

function formatValue(value: any, field: FilterField): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (field.type === 'date' && value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (field.type === 'select' && field.options) {
    const option = field.options.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  return String(value);
}
