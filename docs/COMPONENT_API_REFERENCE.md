# Component API Reference - Phase 1

## Overview
This document provides comprehensive API documentation for the core UI components in Logos Vision CRM, standardized according to the Phase 1 design system implementation.

## Table of Contents
- [Button Component](#button-component)
- [Card Component](#card-component)
- [Input Component](#input-component)
- [Design Tokens](#design-tokens)

---

## Button Component

**Location:** `src/components/ui/Button.tsx`

### Variants

#### `Button`
Primary button component with aurora-inspired styling and smooth animations.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success' \| 'outline' \| 'aurora'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `leftIcon` | `React.ReactNode` | - | Icon on the left side |
| `rightIcon` | `React.ReactNode` | - | Icon on the right side |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `glow` | `boolean` | `false` | Adds glow effect |
| `disabled` | `boolean` | `false` | Disables the button |

**Variant Descriptions:**

- **primary**: Aurora accent color with glow effect (cyan/teal)
- **secondary**: Subtle surface-based styling
- **ghost**: Transparent background, minimal hover
- **danger**: Error color for destructive actions (red)
- **success**: Aurora green for positive actions
- **outline**: Bordered, transparent background with aurora hover
- **aurora**: Special gradient button with flowing aurora colors

**Usage Examples:**

```tsx
import { Button } from '@/components/ui/Button';
import { Plus, Download } from 'lucide-react';

// Primary button
<Button variant="primary" size="md">
  Save Changes
</Button>

// With icon
<Button variant="primary" leftIcon={<Plus />}>
  Add Contact
</Button>

// Loading state
<Button variant="primary" isLoading>
  Saving...
</Button>

// Aurora gradient button
<Button variant="aurora" size="lg" glow>
  Launch App
</Button>

// Danger button for destructive actions
<Button variant="danger" size="sm">
  Delete
</Button>
```

#### `IconButton`
Icon-only button variant for compact actions.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | **required** | Icon to display |
| `aria-label` | `string` | **required** | Accessibility label |
| `variant` | `ButtonVariant` | `'ghost'` | Visual style variant |
| `size` | `ButtonSize` | `'md'` | Button size |

**Usage Examples:**

```tsx
import { IconButton } from '@/components/ui/Button';
import { Settings, Bell } from 'lucide-react';

// Ghost icon button (default)
<IconButton
  icon={<Settings />}
  aria-label="Open settings"
/>

// Primary icon button
<IconButton
  icon={<Bell />}
  aria-label="Notifications"
  variant="primary"
/>
```

### Size Reference

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| `sm` | 32px | 12px | 13px | 14px |
| `md` | 40px | 16px | 14px | 16px |
| `lg` | 48px | 24px | 15px | 20px |

---

## Card Component

**Location:** `src/components/ui/Card.tsx`

### Variants

#### `Card`
Container component using CMF design tokens.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'ghost'` | `'default'` | Visual style variant |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `hoverable` | `boolean` | `false` | Adds hover effects |
| `onClick` | `() => void` | - | Click handler (makes card interactive) |
| `as` | `'div' \| 'article' \| 'section'` | `'div'` | HTML element type |
| `className` | `string` | - | Additional CSS classes |

**Variant Descriptions:**

- **default**: Standard card with border and subtle shadow
- **elevated**: Enhanced shadow for prominence
- **outlined**: Strong border, no shadow
- **ghost**: Semi-transparent background

**Usage Examples:**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

// Basic card
<Card variant="default" padding="md">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Structured card with sub-components
<Card variant="elevated">
  <CardHeader action={<button>Edit</button>}>
    <CardTitle>Project Dashboard</CardTitle>
    <CardDescription>Track your project metrics</CardDescription>
  </CardHeader>

  <CardContent>
    {/* Main content */}
  </CardContent>

  <CardFooter align="right">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>

// Interactive card
<Card variant="default" onClick={() => navigate('/details')} hoverable>
  <h3>Click me</h3>
</Card>
```

#### `StatCard`
Specialized card for displaying statistics and KPIs.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Stat label |
| `value` | `string \| number` | **required** | Stat value |
| `subtitle` | `string` | - | Additional context |
| `icon` | `React.ReactNode` | - | Icon element |
| `trend` | `{ value: number; label?: string }` | - | Trend indicator |
| `accentColor` | `string` | - | Custom accent color |
| `onClick` | `() => void` | - | Click handler |

**Usage Examples:**

```tsx
import { StatCard } from '@/components/ui/Card';
import { Users } from 'lucide-react';

<StatCard
  title="Total Donors"
  value="2,847"
  subtitle="Active this month"
  icon={<Users size={24} />}
  trend={{ value: 12.5, label: 'vs last month' }}
  accentColor="var(--aurora-teal)"
/>
```

### Sub-Components

- **CardHeader**: Header section with optional action slot
- **CardTitle**: Styled title (h1-h6)
- **CardDescription**: Subtitle/description text
- **CardContent**: Main content area
- **CardFooter**: Footer with aligned actions

### Padding Reference

| Size | Padding |
|------|---------|
| `none` | 0 |
| `sm` | 16px |
| `md` | 24px |
| `lg` | 32px |

---

## Input Component

**Location:** `src/components/ui/Input.tsx`

### Variants

#### `Input`
Standard text input with CMF design tokens.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `helperText` | `string` | - | Helper text below input |
| `error` | `string` | - | Error message |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `leftIcon` | `React.ReactNode` | - | Icon on the left |
| `rightIcon` | `React.ReactNode` | - | Icon on the right |
| `fullWidth` | `boolean` | `false` | Makes input full width |
| `disabled` | `boolean` | `false` | Disables the input |

**Usage Examples:**

```tsx
import { Input } from '@/components/ui/Input';
import { User, Mail, Search } from 'lucide-react';

// Basic input
<Input
  label="Name"
  placeholder="Enter your name"
/>

// With icon
<Input
  label="Email"
  type="email"
  leftIcon={<Mail />}
  placeholder="you@example.com"
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With helper text
<Input
  label="Username"
  helperText="Choose a unique username"
  placeholder="john_doe"
/>

// Search input
<Input
  leftIcon={<Search />}
  placeholder="Search..."
  size="sm"
/>
```

#### `Textarea`
Multi-line text input.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Textarea label |
| `helperText` | `string` | - | Helper text below textarea |
| `error` | `string` | - | Error message |
| `fullWidth` | `boolean` | `false` | Makes textarea full width |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `rows` | `number` | `4` | Number of visible rows |

**Usage Examples:**

```tsx
import { Textarea } from '@/components/ui/Input';

<Textarea
  label="Notes"
  placeholder="Add your notes..."
  rows={6}
  helperText="Maximum 500 characters"
/>

<Textarea
  label="Description"
  error="Description is required"
/>
```

### Size Reference

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 32px | 12px | 13px |
| `md` | 40px | 12px | 14px |
| `lg` | 48px | 16px | 15px |

### Accessibility Features

All input components include:
- ✅ Proper `aria-invalid` on error
- ✅ `aria-describedby` linking to helper text/error
- ✅ Unique IDs for label association
- ✅ Focus ring using `--cmf-accent` color
- ✅ Error state styling

---

## Design Tokens

**Location:** `src/styles/design-tokens.css`

### Usage in Components

All components use CSS custom properties from the design token system:

```tsx
// Color tokens
style={{
  backgroundColor: 'var(--cmf-surface)',
  color: 'var(--cmf-text)',
  borderColor: 'var(--cmf-border)'
}}

// Spacing tokens
style={{
  padding: 'var(--space-4)',
  margin: 'var(--space-2)'
}}

// Border radius tokens
style={{
  borderRadius: 'var(--cmf-radius-lg)'
}}

// Shadow tokens
style={{
  boxShadow: 'var(--shadow-md)'
}}
```

### Core Token Categories

1. **Colors**: `--cmf-*` prefix (background, text, borders, accents)
2. **Aurora Palette**: `--aurora-*` (brand colors: teal, cyan, green, pink, violet)
3. **Spacing**: `--space-*` (4px increments from 1-20)
4. **Typography**: `--text-*` (xs to 5xl), `--font-*` (weights)
5. **Shadows**: `--shadow-*` (xs to 2xl), `--glow-*` (aurora glows)
6. **Border Radius**: `--radius-*` (sm to full)
7. **Transitions**: `--duration-*`, `--ease-*`
8. **Z-Index**: `--z-*` (base to tooltip)

### Dark Mode Support

All tokens automatically adapt to dark mode via the `.dark` class:

```css
.dark {
  --cmf-surface: #0f172a;
  --cmf-text: #f8fafc;
  /* etc... */
}
```

---

## Best Practices

### Button Usage

1. **Use appropriate variants:**
   - Primary for main actions
   - Secondary for alternative actions
   - Ghost for tertiary actions
   - Danger for destructive actions

2. **Add icons for clarity:**
   ```tsx
   <Button leftIcon={<Plus />}>Add Contact</Button>
   ```

3. **Always provide aria-label for icon-only buttons:**
   ```tsx
   <IconButton icon={<Settings />} aria-label="Open settings" />
   ```

4. **Use loading states during async operations:**
   ```tsx
   <Button isLoading={isSubmitting}>Save</Button>
   ```

### Card Usage

1. **Use structured cards for complex content:**
   ```tsx
   <Card>
     <CardHeader>...</CardHeader>
     <CardContent>...</CardContent>
     <CardFooter>...</CardFooter>
   </Card>
   ```

2. **Use StatCard for metrics:**
   ```tsx
   <StatCard title="Revenue" value="$24.5K" trend={{ value: 12.5 }} />
   ```

3. **Add hover effects for interactive cards:**
   ```tsx
   <Card onClick={handleClick} hoverable />
   ```

### Input Usage

1. **Always provide labels:**
   ```tsx
   <Input label="Email" />
   ```

2. **Use helper text for guidance:**
   ```tsx
   <Input label="Password" helperText="Must be at least 8 characters" />
   ```

3. **Display validation errors:**
   ```tsx
   <Input label="Email" error={errors.email} />
   ```

4. **Add icons for context:**
   ```tsx
   <Input leftIcon={<Search />} placeholder="Search..." />
   ```

---

## Component Checklist

When creating new components:

- [ ] Use design tokens for all colors, spacing, and typography
- [ ] Support dark mode via CMF tokens
- [ ] Include proper TypeScript types
- [ ] Add accessibility attributes (aria-*, role, tabIndex)
- [ ] Implement focus states with `--cmf-accent`
- [ ] Support keyboard navigation
- [ ] Use GPU-accelerated animations (transform, opacity)
- [ ] Document props and usage examples
- [ ] Export from appropriate barrel file
- [ ] Test in both light and dark modes

---

## Migration Guide

### From Old Button to New Button

```tsx
// OLD
<button className="btn-primary">Save</button>

// NEW
<Button variant="primary">Save</Button>
```

### From Old Card to New Card

```tsx
// OLD
<div className="card-container">
  <h3>Title</h3>
  <p>Content</p>
</div>

// NEW
<Card variant="default">
  <CardTitle>Title</CardTitle>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### From Old Input to New Input

```tsx
// OLD
<input className="input-field" placeholder="Name" />

// NEW
<Input label="Name" placeholder="Enter your name" />
```

---

## Related Documentation

- [Design Tokens Reference](./design-tokens.md)
- [Accessibility Guidelines](./ACCESSIBILITY_GUIDE.md)
- [Animation Guidelines](./ANIMATION_GUIDE.md)
- [Complete Project Breakdown](./COMPLETE_PROJECT_BREAKDOWN.md)

---

**Last Updated:** January 15, 2026
**Phase:** Phase 1 - Foundation & Design System
**Status:** ✅ Complete
