# Phase 3: Charity Hub - Unique Development & Tile System

**Status:** Unfinished  
**Priority:** High  
**Difficulty:** Medium (6-7 hours)  
**Location:** F:\logos-vision-crm\development\03-CharityHubUniqueDevelopment.md

---

## 🎯 Research & Unique Design Concept

### What Makes Effective Charity Platforms?

After researching leading nonprofit platforms (Guidestar, Charity Navigator, GiveWell, Network for Good), here's what makes them stand out:

1. **Holistic Charity View** - Show impact, financials, team, donations in one unified interface
2. **Tier System** - Bronze/Silver/Gold nonprofits based on engagement level
3. **Impact Storytelling** - Photos, testimonials, impact videos alongside data
4. **Donation Funnel** - From discovery → interest → donation → impact tracking
5. **Transparency Score** - Visual trust indicator
6. **Collaboration Network** - Show related nonprofits and partnerships

---

## 🏗️ Proposed Charity Hub Architecture

### The Unified Charity Card Concept

Instead of separate sections, create adaptive "Smart Tiles" that show:

┌─────────────────────────────────────┐
│ CHARITY HUB - Interactive Network │
├─────────────────────────────────────┤
│ │
│ [Tier Filter] [Impact Filter] │
│ │
│ ┌──────────┐ ┌──────────┐ │
│ │ CHARITY │ │ CHARITY │ ... │
│ │ Tile │ │ Tile │ │
│ │ (Smart) │ │ (Smart) │ │
│ └──────────┘ └──────────┘ │
│ │
│ Expandable Details: │
│ - Mission & Impact (Video) │
│ - Leadership Team │
│ - Financial Breakdown (Pie Chart) │
│ - Donation History (Chart) │
│ - Partner Network (Graph) │
│ - Recent Activities (Timeline) │
│ - Testimonials (Carousel) │
│ │
└─────────────────────────────────────┘


---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Review Current Charity Hub**
   - Open `/src/components/CharityHub.tsx`
   - Identify undeveloped tiles
   - List what's missing

2. **Define Charity Tiers**
   - What defines each tier? (Donations received, engagement level, impact metrics?)
   - Design tier progression
   - Set tier thresholds

3. **Gather Sample Data**
   - Identify 5-10 real South Carolina nonprofits
   - Gather their mission, impact, financials
   - Prepare testimonials/quotes

4. **Plan Tile Interactions**
   - Should tiles expand in-place or open modal?
   - What happens on click?
   - How does detail view work?

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

Absolutely! I'll send each file in a cleaner format with clear copy boundaries. Here are the remaining phase documents:

📄 File 5: 03-CharityHubUniqueDevelopment.md
Copy everything below this line:

text
# Phase 3: Charity Hub - Unique Development & Tile System

**Status:** Unfinished  
**Priority:** High  
**Difficulty:** Medium (6-7 hours)  
**Location:** F:\logos-vision-crm\development\03-CharityHubUniqueDevelopment.md

---

## 🎯 Research & Unique Design Concept

### What Makes Effective Charity Platforms?

After researching leading nonprofit platforms (Guidestar, Charity Navigator, GiveWell, Network for Good), here's what makes them stand out:

1. **Holistic Charity View** - Show impact, financials, team, donations in one unified interface
2. **Tier System** - Bronze/Silver/Gold nonprofits based on engagement level
3. **Impact Storytelling** - Photos, testimonials, impact videos alongside data
4. **Donation Funnel** - From discovery → interest → donation → impact tracking
5. **Transparency Score** - Visual trust indicator
6. **Collaboration Network** - Show related nonprofits and partnerships

---

## 🏗️ Proposed Charity Hub Architecture

### The Unified Charity Card Concept

Instead of separate sections, create adaptive "Smart Tiles" that show:

┌─────────────────────────────────────┐
│ CHARITY HUB - Interactive Network │
├─────────────────────────────────────┤
│ │
│ [Tier Filter] [Impact Filter] │
│ │
│ ┌──────────┐ ┌──────────┐ │
│ │ CHARITY │ │ CHARITY │ ... │
│ │ Tile │ │ Tile │ │
│ │ (Smart) │ │ (Smart) │ │
│ └──────────┘ └──────────┘ │
│ │
│ Expandable Details: │
│ - Mission & Impact (Video) │
│ - Leadership Team │
│ - Financial Breakdown (Pie Chart) │
│ - Donation History (Chart) │
│ - Partner Network (Graph) │
│ - Recent Activities (Timeline) │
│ - Testimonials (Carousel) │
│ │
└─────────────────────────────────────┘

text

---

## 📋 Step-by-Step Instructions

### FOR YOU (Project Manager):

1. **Review Current Charity Hub**
   - Open `/src/components/CharityHub.tsx`
   - Identify undeveloped tiles
   - List what's missing

2. **Define Charity Tiers**
   - What defines each tier? (Donations received, engagement level, impact metrics?)
   - Design tier progression
   - Set tier thresholds

3. **Gather Sample Data**
   - Identify 5-10 real South Carolina nonprofits
   - Gather their mission, impact, financials
   - Prepare testimonials/quotes

4. **Plan Tile Interactions**
   - Should tiles expand in-place or open modal?
   - What happens on click?
   - How does detail view work?

---

### FOR CLAUDE CODE:

#### **PROMPT TO USE:**

I need to develop the Charity Hub with a unique Smart Tile system that unifies all charity/donation elements.

Current situation:

CharityHub.tsx exists but has undeveloped tiles

Need to create interconnected tiles showing charity data

Create the following:

Smart Charity Tiles (Grid View)
Each tile shows:

Charity logo/image

Organization name

Tier badge (Bronze/Silver/Gold)

Transparency score (0-100%)

Quick stats:

Total donations received

Number of donors

Primary impact area

Mini donation button

"View Details" button

Tier color coding (Bronze=#CD7F32, Silver=#C0C0C0, Gold=#FFD700)

Expandable Detail Modal (Click "View Details")
Tabs/Sections:

a) Overview Tab

Full charity description

Mission statement

Featured image/video

Quick facts (Founded, Headquarters, Website, Contact)

b) Impact Tab

Impact metrics (Lives helped, Projects, Volunteer hours)

Impact stories (carousel of testimonials)

Video testimonial (embed YouTube)

Progress toward annual goals (progress bars)

c) Financials Tab

Budget breakdown (pie chart: Programs/Admin/Fundraising)

Revenue sources (bar chart)

Year-over-year growth

Expense trends

d) Team Tab

Leadership roster (cards with photos)

Board of directors

Key team members

Contact information

e) Donations Tab

Donation history (line chart over time)

Donation tiers available (e.g., $25 = feeds 1 family)

Recent donors (anonymized)

Quick donate button

Recurring donation option

f) Network Tab

Partner organizations (linked tiles)

Related charities

Collaboration opportunities

Network graph visualization

Filtering System

Tier filter (Bronze, Silver, Gold, All)

Impact filter (Health, Education, Environment, etc.)

Donation amount filter (Minimum received)

Search by name

Sort options (Highest Impact, Most Donated, Newest, A-Z)

Add Charity Function

Modal to add new charity to hub

Auto-set to Bronze tier initially

Can import from web (Charity Navigator API if possible)

Manual entry option

Sample Data
Include sample data for 10 South Carolina nonprofits with realistic:

Names, missions, founded dates

Financial data

Impact metrics

Team members

Donation history

Testimonials

Design:

Use responsive grid (auto-fit, minmax(300px, 1fr))

Smooth tile hover effects

Color-coded tiers

Mobile-responsive

Accessibility features (ARIA labels, keyboard nav)

Please create the CharityHub component with all these features.


---

## 🔧 Technical Implementation

### Database Schema:

CREATE TABLE charities (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL UNIQUE,
description TEXT,
mission TEXT,
logo_url TEXT,
image_url TEXT,
website TEXT,
email TEXT,
phone TEXT,

-- Location
street_address TEXT,
city TEXT,
state TEXT,
zip_code TEXT,

-- Tier System
tier TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold'
transparency_score INT DEFAULT 50,

-- Impact
impact_area TEXT, -- 'Health', 'Education', 'Environment', etc.
lives_impacted INT DEFAULT 0,
projects_active INT DEFAULT 0,
volunteer_hours INT DEFAULT 0,

-- Financials
annual_budget DECIMAL,
total_donations_received DECIMAL DEFAULT 0,
donor_count INT DEFAULT 0,

-- Metadata
founded_date DATE,
tax_id TEXT,
status TEXT DEFAULT 'active', -- 'active', 'inactive', 'pending'

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE charity_team_members (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
name TEXT NOT NULL,
title TEXT,
bio TEXT,
photo_url TEXT,
email TEXT,
role TEXT, -- 'executive', 'board', 'staff'
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE charity_donations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
donor_id UUID REFERENCES auth.users(id),
amount DECIMAL NOT NULL,
donation_date TIMESTAMP DEFAULT NOW(),
recurring BOOLEAN DEFAULT FALSE,
recurring_frequency TEXT, -- 'monthly', 'quarterly', 'annual'
notes TEXT
);

CREATE TABLE charity_testimonials (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
author_name TEXT,
author_title TEXT,
testimonial TEXT,
impact_story TEXT,
video_url TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE charity_partnerships (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
charity_id_1 UUID NOT NULL REFERENCES charities(id),
charity_id_2 UUID NOT NULL REFERENCES charities(id),
relationship_type TEXT, -- 'partner', 'affiliate', 'collaborator'
created_at TIMESTAMP DEFAULT NOW()
);

### Component Structure:

CharityHub/
├── CharityHub.tsx (Main container)
├── CharityTile.tsx (Individual smart tile)
├── CharityModal.tsx (Expandable detail view)
├── tabs/
│ ├── OverviewTab.tsx
│ ├── ImpactTab.tsx
│ ├── FinancialsTab.tsx
│ ├── TeamTab.tsx
│ ├── DonationsTab.tsx
│ └── NetworkTab.tsx
├── CharityFilters.tsx (Filter sidebar)
├── AddCharityDialog.tsx (Add new charity)
├── CharityNetworkGraph.tsx (D3 visualization)
└── services/
└── charityService.ts (API calls)


---

## 📊 Sample Data Format

const sampleCharities = [
{
id: '1',
name: 'Hope Harbor Foundation',
tier: 'gold',
impactArea: 'Youth Development',
mission: 'Empowering South Carolina youth through education and mentorship',
totalDonations: 450000,
donors: 2340,
teamMembers: [
{ name: 'Sarah Johnson', title: 'Executive Director', role: 'executive' },
{ name: 'Michael Chen', title: 'Program Director', role: 'staff' }
],
testimonials: [
{ author: 'James Rodriguez', text: 'This org changed my life...', impact: 'Helped 500+ youth' }
],
financials: {
programs: 75,
admin: 15,
fundraising: 10,
annualBudget: 500000
}
},
// ... more charities
];

---

## 🎨 Tier Progression System

| Tier | Criteria | Benefits | Color |
|------|----------|----------|-------|
| **Bronze** | New/Under $50k donations | Featured in hub | #CD7F32 |
| **Silver** | $50k-$250k donations | Transparency badge | #C0C0C0 |
| **Gold** | $250k+ donations | Priority placement | #FFD700 |
| **Platinum** | $1M+ donations | VIP treatment | #E5E4E2 |

---

## ✅ Completion Checklist

- [ ] Database tables created (charities, team_members, donations, testimonials, partnerships)
- [ ] Sample data populated (10+ SC nonprofits)
- [ ] Smart Tile component built
- [ ] Detail modal with all 6 tabs
- [ ] Filtering system implemented
- [ ] Donation functionality works
- [ ] Chart visualizations working (pie, bar, line)
- [ ] Partnership network displayed
- [ ] Add charity dialog implemented
- [ ] Mobile responsive
- [ ] Accessibility tested
- [ ] Performance optimized

---

## 🔗 Related Phases

- Builds on: **Phase 2** (Settings)
- Connected to: **Phase 5** (Task Management - can create donation tasks)

---

**Estimated Time:** 6-7 hours  
**Next Phase:** 04-CaseManagementDevelopment.md
