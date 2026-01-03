# Adding Screenshots to Landing Page

The landing page at `https://crm.logosvision.org` now displays real screenshots from the actual CRM application instead of placeholder mockups.

## How to Add Screenshots

1. **Take Screenshots** of your actual Logos Vision CRM:
   - Dashboard view
   - Projects page
   - Contacts/Client management
   - Any other key features you want to showcase

2. **Save Screenshots** to the `public/screenshots/` folder with these exact names:
   - `dashboard-hero.png` - Main dashboard view
   - `projects-view.png` - Projects management interface
   - `contacts-view.png` - Contacts/client management

3. **Screenshot Recommendations**:
   - **Resolution**: 1920x1080 or higher (will be scaled down)
   - **Format**: PNG or JPG
   - **Content**: Show the actual CRM interface with real (or anonymized) data
   - **Browser**: Use Chrome/Firefox with the Source Prism theme active

4. **The carousel will automatically**:
   - Display the screenshots in rotation
   - Show navigation arrows on hover
   - Auto-advance every 5 seconds
   - Fall back to a "Visit Site" button if images aren't found

## Current Screenshot Slots

The landing page is configured to show these screenshots (in order):
1. Dashboard Hero - Main dashboard overview
2. Projects View - Project management interface  
3. Contacts View - Client/contact management

You can add more screenshots by:
- Adding new entries to the `screenshots` array in `LandingPage.tsx`
- Placing the image files in `public/screenshots/`

## Quick Screenshot Tips

- Use browser DevTools to capture at specific viewport sizes
- Consider using tools like:
  - Browser extensions (Full Page Screen Capture)
  - macOS: Cmd+Shift+4 for selection, Cmd+Shift+3 for full screen
  - Windows: Snipping Tool or Win+Shift+S
  - Online tools: screenshot.guru, etc.

The landing page will automatically detect and display your screenshots once they're in place!
