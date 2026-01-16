# 🚀 Quick Start: Testing Your Tabs Component

## Step 1: Add to Your App

Open `src/App.tsx` and add this import at the top:

```tsx
import { TabsExample } from '../components/TabsExample';
```

## Step 2: Show the Example

Find a good place in your App.tsx render (maybe in the 'dashboard' case) and add:

```tsx
<TabsExample />
```

For example, you could temporarily add it right below your Dashboard:

```tsx
case 'dashboard':
  return (
    <>
      <Dashboard 
        clients={clients}
        projects={projects}
        onNavigate={setPage}
        onViewClient={handleViewClient}
        tasks={tasks}
        activities={activities}
        donations={donations}
      />
      <TabsExample />  {/* ADD THIS LINE */}
    </>
  );
```

## Step 3: View in Browser

1. Save the file
2. Your browser should auto-reload
3. Navigate to the Dashboard
4. Scroll down to see your Tabs examples!

## Step 4: Try the Features

### Test These Things:
- ✅ Click different tabs
- ✅ Watch the smooth animations
- ✅ Try all three style variants (default, pills, underline)
- ✅ Click a tab, then use arrow keys to navigate
- ✅ Look at the badges on some tabs
- ✅ Check it in dark mode (toggle theme)
- ✅ Resize your browser to see responsive design

## Step 5: Remove When Done

Once you've seen how tabs work, you can:
1. Remove the `<TabsExample />` line from App.tsx
2. Start adding real tabs to your actual components!

---

## ✨ What You Should See

You'll see 3 different examples showing off different tab styles:

1. **Example 1 (Default)**: Nice sliding blue indicator under active tab
2. **Example 2 (Pills)**: Rounded button-style tabs  
3. **Example 3 (Underline)**: Clean minimal style with underlines

Each example shows different features like icons, badges, and content.

---

## 🎯 Next: Add to Real Components

After testing, check out `TABS_GUIDE.md` for examples of how to add tabs to:
- Client detail pages
- Project views  
- Settings pages
- Anywhere you want organized content!

---

## 🐛 Troubleshooting

### Tabs not showing?
- Make sure you saved all files
- Check the browser console for errors
- Verify the import path is correct

### Styling looks weird?
- Make sure your dev server is running
- Try a hard refresh (Ctrl+Shift+R)
- Check that index.html has all the animation styles

### Dark mode issues?
- Click the sun/moon icon in your header
- Tabs should look great in both modes!

---

## 📚 Learn More

Read `TABS_GUIDE.md` for:
- Complete API reference
- Real-world examples
- Best practices
- Customization tips
- And much more!

---

**Happy Tabbing!** 📑✨