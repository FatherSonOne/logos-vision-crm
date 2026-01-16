# Advanced Micro-interactions Guide

## 🎬 Overview

Your Logos Vision CRM now has **professional-grade micro-interactions** that provide instant feedback, guide users, and create a delightful experience!

---

## ✨ What's Included

1. **Toast Notifications** - Animated feedback messages
2. **Modal Animations** - Smooth enter/exit for dialogs
3. **Scroll Reveals** - Elements appear as you scroll
4. **Focus States** - Enhanced keyboard navigation
5. **Pulse Animations** - Draw attention to important items
6. **Button Ripples** - Touch feedback
7. **Contextual Feedback** - Smart visual cues

---

## 🍞 1. Toast Notifications

Beautiful, animated notification system for user feedback.

### Setup

**Wrap your app with ToastProvider:**
```tsx
import { ToastProvider } from './src/components/ui/Toast';

<ToastProvider>
  <App />
</ToastProvider>
```

### Usage

```tsx
import { useToast } from './src/components/ui/Toast';

function MyComponent() {
  const { addToast } = useToast();

  const handleSave = () => {
    // Show success toast
    addToast({
      type: 'success',
      message: 'Project saved successfully!',
      description: 'All changes have been saved.',
      duration: 5000 // Optional, defaults to 5000ms
    });
  };

  const handleError = () => {
    addToast({
      type: 'error',
      message: 'Failed to save project',
      description: 'Please try again later.'
    });
  };

  const handleWarning = () => {
    addToast({
      type: 'warning',
      message: 'You have unsaved changes',
      description: 'Save before leaving this page.'
    });
  };

  const handleInfo = () => {
    addToast({
      type: 'info',
      message: 'New feature available!',
      description: 'Check out the updated dashboard.'
    });
  };
}
```

### Toast Types

**Success** - Green, checkmark icon
- Use for: Successful operations, confirmations
- Example: "Project created successfully!"

**Error** - Red, X icon
- Use for: Failed operations, errors
- Example: "Failed to upload file"

**Warning** - Amber, exclamation icon
- Use for: Cautions, non-blocking issues
- Example: "You have unsaved changes"

**Info** - Blue, info icon
- Use for: General information, tips
- Example: "New features available"

### Animation

- **Slide in from right** (300ms)
- **Auto-dismiss** after duration (default 5s)
- **Stacks vertically** (top-right corner)
- **Manual dismiss** with X button

---

## 🪟 2. Modal Animations

Smooth animations for modal dialogs.

### CSS Classes

```tsx
// Backdrop (overlay)
<div className="modal-backdrop fixed inset-0 bg-black/50 z-40">
  
  // Modal content
  <div className="modal-content bg-white dark:bg-slate-900 rounded-xl p-6">
    {/* Your modal content */}
  </div>
</div>
```

### Animations

**Backdrop:**
- Fade in over 200ms
- Black overlay with 50% opacity

**Modal Content:**
- Scale from 95% to 100%
- Slide up 10px while fading in
- 300ms cubic-bezier timing

### Usage Example

```tsx
{isOpen && (
  <div className="modal-backdrop fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
    <div className="modal-content bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full">
      <h2>Modal Title</h2>
      <p>Modal content</p>
    </div>
  </div>
)}
```

---

## 📜 3. Scroll Reveal Animations

Elements animate in as they scroll into view.

### Hook Usage

```tsx
import { useScrollReveal } from '../src/hooks/useScrollReveal';

function MyComponent() {
  const [ref, isVisible] = useScrollReveal({
    threshold: 0.1,        // Trigger when 10% visible
    rootMargin: '0px',     // Offset from viewport
    triggerOnce: true      // Only animate once
  });

  return (
    <div 
      ref={ref} 
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''}`}
    >
      {/* Content animates in when visible */}
    </div>
  );
}
```

### CSS Class Usage

```tsx
<div className="reveal-on-scroll is-visible">
  {/* Content */}
</div>
```

### Animation

- Starts **opacity: 0**, **translateY(30px)**
- Animates to **opacity: 1**, **translateY(0)**
- Duration: **600ms**
- Easing: **ease-out**

### Best Practices

- Use for **sections** on long pages
- Use for **feature showcases**
- Use for **marketing content**
- Don't overuse on interactive elements

---

## ⌨️ 4. Enhanced Focus States

Beautiful, accessible focus rings for keyboard navigation.

### Classes

**Primary Focus Ring:**
```tsx
<button className="focus-ring-primary ...">
  Click Me
</button>
```
- Color: Primary cyan (`rgba(6, 182, 212, 0.4)`)
- Shadow: 3px ring
- Rounded corners

**Secondary Focus Ring:**
```tsx
<button className="focus-ring-secondary ...">
  Click Me
</button>
```
- Color: Secondary indigo (`rgba(99, 102, 241, 0.4)`)
- Shadow: 3px ring
- Rounded corners

### Usage

Apply to:
- ✅ Buttons
- ✅ Links
- ✅ Input fields
- ✅ Interactive cards
- ✅ Navigation items

### Accessibility

- Uses `:focus-visible` (only shows on keyboard focus)
- WCAG 2.1 AA compliant
- High contrast in both light and dark modes

---

## 💫 5. Pulse Animations

Draws attention to important items.

### Class

```tsx
<div className="pulse-ring">
  {/* Content */}
</div>
```

### Animation

- Creates expanding ring effect
- Color: Primary cyan with fade
- Duration: 1.5s infinite
- Expands from 0 to 10px

### Use Cases

- **Notification badges** ("3 new messages")
- **Important buttons** (primary CTAs)
- **Live indicators** ("Recording...")
- **Attention grabbers** (limited time offers)

### Example

```tsx
<button className="relative">
  <span className="absolute -top-1 -right-1 pulse-ring h-3 w-3 bg-primary-500 rounded-full"></span>
  Notifications
</button>
```

---

## 🎨 6. Button Ripple Effect

Touch feedback for buttons (already in CSS).

### Usage

```tsx
<button className="btn-ripple ...">
  Click Me
</button>
```

### Effect

- Creates ripple on click
- Starts from click position
- Expands and fades out
- Enhances tactile feedback

---

## 🎯 7. Contextual Animations

Smart animations based on context.

### Page Transitions

```tsx
<div className="page-transition">
  {/* Page content */}
</div>
```

**Animation:**
- Slide up 20px + fade in
- 400ms duration
- Applied to all major pages

### Staggered Items

```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="stagger-item"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    {item.content}
  </div>
))}
```

**Animation:**
- Each item delays by 80ms
- Slide up 10px + fade in
- Creates waterfall effect

### Progress Shimmer

```tsx
<div className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
</div>
```

**Animation:**
- Slide across from left to right
- 2s infinite loop
- Indicates loading/progress

---

## 📱 8. Touch Gestures (Mobile)

Enhanced for mobile interactions.

### Tap Feedback

All interactive elements have:
- Active state with scale
- Smooth transitions
- Touch-optimized hit areas

### Swipe Support

Modal dismissal:
- Swipe down to close
- Smooth spring animation
- Threshold-based

---

## 🎪 Complete Animation Inventory

### Entry Animations

| Animation | Duration | Use Case |
|-----------|----------|----------|
| `toast-slide-in` | 300ms | Notifications |
| `modal-scale-in` | 300ms | Dialogs |
| `page-transition` | 400ms | Page loads |
| `stagger-fade-in` | 400ms | List items |
| `reveal-from-bottom` | 600ms | Scroll reveals |

### Loop Animations

| Animation | Duration | Use Case |
|-----------|----------|----------|
| `shimmer` | 2s | Progress bars |
| `pulse-ring` | 1.5s | Notifications |
| `loading-bar` | 1.5s | Loading indicators |

### Interactive Animations

| Animation | Duration | Use Case |
|-----------|----------|----------|
| `card-lift` | 300ms | Hover effects |
| `btn-ripple` | 600ms | Button clicks |
| `focus-ring` | Instant | Keyboard focus |

---

## ⚡ Performance Considerations

### Hardware Acceleration

All animations use:
- `transform` (not `top`/`left`)
- `opacity` (not `background`)
- `will-change` for intense animations

### Frame Rate

- Target: **60fps** for all animations
- Achieved through CSS transforms
- GPU-accelerated where possible

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Respects user's system settings for accessibility.

---

## 🎯 Implementation Checklist

### Phase 1: Toast System ✅
- [x] ToastProvider context
- [x] Toast component with animations
- [x] 4 toast types (success, error, warning, info)
- [x] Auto-dismiss functionality
- [x] Manual close button

### Phase 2: Modal Animations ✅
- [x] Backdrop fade-in
- [x] Content scale-in
- [x] CSS classes ready
- [x] Dark mode support

### Phase 3: Scroll Reveals ✅
- [x] useScrollReveal hook
- [x] IntersectionObserver implementation
- [x] CSS animations
- [x] Trigger-once option

### Phase 4: Focus States ✅
- [x] Primary focus ring
- [x] Secondary focus ring
- [x] `:focus-visible` support
- [x] Accessibility compliant

### Phase 5: Pulse Effects ✅
- [x] Pulse-ring animation
- [x] Configurable colors
- [x] Infinite loop
- [x] Notification badges

---

## 🚀 Usage Examples

### Complete Component with All Interactions

```tsx
import { useToast } from '../src/components/ui/Toast';
import { useScrollReveal } from '../src/hooks/useScrollReveal';

function FeatureCard() {
  const { addToast } = useToast();
  const [ref, isVisible] = useScrollReveal();

  const handleSave = () => {
    addToast({
      type: 'success',
      message: 'Saved successfully!',
      duration: 3000
    });
  };

  return (
    <div 
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} card-lift-subtle`}
    >
      <h3>Feature Title</h3>
      <p>Feature description</p>
      
      <button
        onClick={handleSave}
        className="focus-ring-primary btn-ripple relative"
      >
        Save Changes
        <span className="absolute -top-1 -right-1 pulse-ring h-3 w-3 bg-primary-500 rounded-full"></span>
      </button>
    </div>
  );
}
```

---

## 📚 Files Created

### Components
- `src/components/ui/Toast.tsx` - Toast system
- `src/components/ui/ToastContext.tsx` - Context provider
- `src/components/ui/ToastContainer.tsx` - Container component

### Hooks
- `src/hooks/useScrollReveal.ts` - Scroll reveal hook

### CSS
- All animations in `index.html` `<style>` section

---

## 🎊 Results

Your CRM now has:
- ✅ **Toast notifications** with 4 types
- ✅ **Modal animations** (backdrop + content)
- ✅ **Scroll reveal** hook and animations
- ✅ **Enhanced focus states** for accessibility
- ✅ **Pulse animations** for notifications
- ✅ **Button ripples** for tactile feedback
- ✅ **Contextual animations** throughout
- ✅ **Mobile-optimized** interactions
- ✅ **Hardware-accelerated** for 60fps
- ✅ **Reduced motion** support

**Your CRM feels alive, responsive, and professional!** 🎬✨

---

## 🎯 Next Steps

### Apply Toasts

Add toast notifications to:
- Save operations
- Delete confirmations
- Error handling
- Success feedback
- Network status

### Apply Scroll Reveals

Add to:
- Landing pages
- Feature sections
- Marketing content
- Long-form content

### Apply Focus States

Update all:
- Buttons
- Form inputs
- Interactive cards
- Navigation links

### Test Accessibility

- [x] Keyboard navigation works
- [x] Screen reader compatible
- [x] Focus visible only on keyboard
- [x] Reduced motion respected

---

**Congratulations! You now have a complete suite of professional micro-interactions!** 🚀✨
