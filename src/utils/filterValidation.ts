import type { FilterGroup, FilterCondition, FilterValidationError, FilterField } from '../components/reports/filterTypes';
import { operatorNeedsValue, operatorNeedsTwoValues } from '../components/reports/filterTypes';

/**
 * Validates a complete filter configuration
 */
export function validateFilter(
  filter: FilterGroup,
  availableFields: FilterField[]
): FilterValidationError[] {
  const errors: FilterValidationError[] = [];

  validateGroup(filter, availableFields, errors);

  return errors;
}

/**
 * Recursively validates a filter group
 */
function validateGroup(
  group: FilterGroup,
  availableFields: FilterField[],
  errors: FilterValidationError[]
): void {
  // Check if group has at least one condition or nested group
  if (group.conditions.length === 0 && group.groups.length === 0) {
    errors.push({
      groupId: group.id,
      field: 'group',
      message: 'Filter group must contain at least one condition or nested group',
    });
  }

  // Validate each condition
  group.conditions.forEach(condition => {
    validateCondition(condition, availableFields, errors);
  });

  // Validate nested groups
  group.groups.forEach(nestedGroup => {
    validateGroup(nestedGroup, availableFields, errors);
  });
}

/**
 * Validates a single filter condition
 */
function validateCondition(
  condition: FilterCondition,
  availableFields: FilterField[],
  errors: FilterValidationError[]
): void {
  // Check if field exists
  const field = availableFields.find(f => f.id === condition.fieldId);
  if (!field) {
    errors.push({
      conditionId: condition.id,
      field: 'fieldId',
      message: `Field "${condition.fieldId}" not found`,
    });
    return;
  }

  // Check if operator is valid for field type
  const validOperators = getOperatorsForFieldType(field.type);
  if (!validOperators.includes(condition.operator)) {
    errors.push({
      conditionId: condition.id,
      field: 'operator',
      message: `Operator "${condition.operator}" is not valid for field type "${field.type}"`,
    });
  }

  // Check if value is required and provided
  if (operatorNeedsValue(condition.operator)) {
    if (condition.value === null || condition.value === undefined || condition.value === '') {
      errors.push({
        conditionId: condition.id,
        field: 'value',
        message: 'Value is required for this operator',
      });
    } else {
      // Validate value format based on field type
      validateValue(condition, field, errors);
    }
  }

  // Check if second value is required for 'between' operator
  if (operatorNeedsTwoValues(condition.operator)) {
    if (condition.value2 === null || condition.value2 === undefined || condition.value2 === '') {
      errors.push({
        conditionId: condition.id,
        field: 'value2',
        message: 'Second value is required for "between" operator',
      });
    } else {
      // Validate that value2 > value for numbers and dates
      if (field.type === 'number' || field.type === 'date') {
        if (field.type === 'number' && Number(condition.value2) <= Number(condition.value)) {
          errors.push({
            conditionId: condition.id,
            field: 'value2',
            message: 'Second value must be greater than first value',
          });
        }
        if (field.type === 'date' && new Date(condition.value2) <= new Date(condition.value)) {
          errors.push({
            conditionId: condition.id,
            field: 'value2',
            message: 'Second date must be after first date',
          });
        }
      }
    }
  }
}

/**
 * Validates value format based on field type
 */
function validateValue(
  condition: FilterCondition,
  field: FilterField,
  errors: FilterValidationError[]
): void {
  switch (field.type) {
    case 'number':
      if (isNaN(Number(condition.value))) {
        errors.push({
          conditionId: condition.id,
          field: 'value',
          message: 'Value must be a valid number',
        });
      }
      break;

    case 'date':
      if (isNaN(new Date(condition.value).getTime())) {
        errors.push({
          conditionId: condition.id,
          field: 'value',
          message: 'Value must be a valid date',
        });
      }
      break;

    case 'select':
    case 'multi-select':
      if (field.options) {
        const validValues = field.options.map(opt => opt.value);
        const values = Array.isArray(condition.value) ? condition.value : [condition.value];

        values.forEach(val => {
          if (!validValues.includes(val)) {
            errors.push({
              conditionId: condition.id,
              field: 'value',
              message: `Value "${val}" is not a valid option for this field`,
            });
          }
        });
      }
      break;

    case 'boolean':
      if (typeof condition.value !== 'boolean') {
        errors.push({
          conditionId: condition.id,
          field: 'value',
          message: 'Value must be a boolean',
        });
      }
      break;
  }

  // Validate regex pattern if operator is 'regex'
  if (condition.operator === 'regex') {
    try {
      new RegExp(condition.value);
    } catch (e) {
      errors.push({
        conditionId: condition.id,
        field: 'value',
        message: 'Invalid regular expression pattern',
      });
    }
  }
}

/**
 * Get valid operators for a field type
 */
function getOperatorsForFieldType(type: string): string[] {
  switch (type) {
    case 'text':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'regex', 'is_empty', 'is_not_empty'];
    case 'number':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'between', 'is_empty', 'is_not_empty'];
    case 'date':
      return ['equals', 'not_equals', 'before', 'after', 'between', 'last_7_days', 'last_30_days', 'this_month', 'this_year', 'last_year', 'is_empty', 'is_not_empty'];
    case 'boolean':
      return ['is_true', 'is_false'];
    case 'select':
    case 'multi-select':
      return ['equals', 'not_equals', 'in', 'not_in', 'is_empty', 'is_not_empty'];
    default:
      return ['equals', 'not_equals'];
  }
}

/**
 * Checks for potentially conflicting filters
 */
export function checkForConflicts(filter: FilterGroup): string[] {
  const conflicts: string[] = [];

  // Check for same field with contradictory conditions in AND groups
  checkGroupConflicts(filter, conflicts);

  return conflicts;
}

function checkGroupConflicts(group: FilterGroup, conflicts: string[]): void {
  if (group.logic === 'AND') {
    // Group conditions by field
    const conditionsByField: Record<string, FilterCondition[]> = {};

    group.conditions.forEach(condition => {
      if (!conditionsByField[condition.fieldId]) {
        conditionsByField[condition.fieldId] = [];
      }
      conditionsByField[condition.fieldId].push(condition);
    });

    // Check for contradictions
    Object.entries(conditionsByField).forEach(([fieldId, conditions]) => {
      if (conditions.length > 1) {
        // Check for equals + not_equals
        const hasEquals = conditions.some(c => c.operator === 'equals');
        const hasNotEquals = conditions.some(c => c.operator === 'not_equals');

        if (hasEquals && hasNotEquals) {
          const equalsCondition = conditions.find(c => c.operator === 'equals');
          const notEqualsCondition = conditions.find(c => c.operator === 'not_equals');

          if (equalsCondition && notEqualsCondition && equalsCondition.value === notEqualsCondition.value) {
            conflicts.push(`Field "${fieldId}" has contradictory conditions: equals and not equals the same value`);
          }
        }

        // Check for is_empty + is_not_empty
        const hasIsEmpty = conditions.some(c => c.operator === 'is_empty');
        const hasIsNotEmpty = conditions.some(c => c.operator === 'is_not_empty');

        if (hasIsEmpty && hasIsNotEmpty) {
          conflicts.push(`Field "${fieldId}" has contradictory conditions: is empty and is not empty`);
        }

        // Check for is_true + is_false
        const hasIsTrue = conditions.some(c => c.operator === 'is_true');
        const hasIsFalse = conditions.some(c => c.operator === 'is_false');

        if (hasIsTrue && hasIsFalse) {
          conflicts.push(`Field "${fieldId}" has contradictory conditions: is true and is false`);
        }
      }
    });
  }

  // Check nested groups
  group.groups.forEach(nestedGroup => {
    checkGroupConflicts(nestedGroup, conflicts);
  });
}

/**
 * Gets user-friendly error message summary
 */
export function getErrorSummary(errors: FilterValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0].message;
  }

  return `${errors.length} validation errors found. Please review your filter configuration.`;
}
