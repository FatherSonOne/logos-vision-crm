# Advanced Filtering Guide

Master complex data filtering with the advanced filter builder, nested logic, saved templates, and filter best practices.

## Table of Contents
- [Overview](#overview)
- [Advanced Filter Builder](#advanced-filter-builder)
- [Filter Operators by Data Type](#filter-operators-by-data-type)
- [Nested AND/OR Logic](#nested-andor-logic)
- [Saving Filter Templates](#saving-filter-templates)
- [Quick Filters](#quick-filters)
- [Date Range Shortcuts](#date-range-shortcuts)
- [Complex Filter Examples](#complex-filter-examples)
- [Filter Performance Tips](#filter-performance-tips)

---

## Overview

Advanced filtering allows you to create sophisticated queries to find exactly the data you need.

### Why Use Advanced Filters?

**Benefits:**
- ✓ **Precision**: Find exactly what you need
- ✓ **Complexity**: Handle multi-condition logic
- ✓ **Reusability**: Save and reuse filter templates
- ✓ **Flexibility**: Combine any conditions with AND/OR logic
- ✓ **Power**: Access all operators and functions

**When to use advanced filters:**
- Simple filters aren't enough
- Need to combine many conditions
- Require nested AND/OR logic
- Want to save complex filter as template
- Building complex reports or segments

**[Screenshot: Advanced filter builder interface]**

---

## Advanced Filter Builder

### Opening the Advanced Filter Builder

**From any report:**
1. Click **"Filter"** button
2. Click **"Advanced Filters"**
3. Advanced Filter Builder opens

**From report creation wizard:**
1. Step 5: Add Filters
2. Click **"Switch to Advanced"**
3. Builder opens in wizard

**[Screenshot: Advanced filter button location]**

### Filter Builder Interface

**Left Panel: Filter Tree**
- Visual representation of filter logic
- Drag to rearrange conditions
- Click to edit conditions
- Add/remove conditions and groups

**Center Panel: Condition Editor**
- Configure selected condition
- Choose field, operator, value
- Preview matching records

**Right Panel: Properties**
- Filter name and description
- Save as template
- Clear all filters
- Filter statistics (X records match)

**[Screenshot: Annotated filter builder interface]**

### Building Your First Advanced Filter

**Example: Find high-value deals closing soon**

**Step 1: Add first condition**
1. Click **"Add Condition"**
2. Choose field: **Amount**
3. Choose operator: **Greater Than**
4. Enter value: **50000**
5. Result: Amount > $50,000

**Step 2: Add second condition**
1. Click **"Add Condition"** again
2. Choose field: **Close Date**
3. Choose operator: **Next 90 Days**
4. Result: Close Date in next 90 days

**Step 3: Combine with AND**
- By default, conditions are combined with AND
- Both conditions must be true
- Result: Amount > $50,000 AND Close Date in next 90 days

**Preview shows:** Matching deals appear below

**[Screenshot: Step-by-step filter building]**

---

## Filter Operators by Data Type

### Text Field Operators

**Equals / Not Equals**
- Exact match (case-insensitive)
- Example: `Name Equals "Acme Corp"`

**Contains / Doesn't Contain**
- Partial match anywhere in text
- Example: `Company Contains "tech"` (finds "TechCorp", "FinTech Solutions")

**Starts With / Ends With**
- Prefix or suffix match
- Example: `Email Ends With "@gmail.com"`

**Is Empty / Is Not Empty**
- Check for blank/null values
- Example: `Phone Is Empty` (finds contacts without phone)

**In List / Not In List**
- Match multiple values
- Example: `Industry In List ["Technology", "Healthcare", "Finance"]`

**Matches Pattern (Regex)**
- Advanced pattern matching
- Example: `Email Matches Pattern "^[a-z]+@company\.com$"`

**[Screenshot: Text field operators dropdown]**

### Number Field Operators

**Equals / Not Equals**
- Exact value match
- Example: `Amount Equals 100000`

**Greater Than / Less Than**
- Comparison operators
- Example: `Revenue > 50000`

**Greater Than or Equal / Less Than or Equal**
- Inclusive comparison
- Example: `Age >= 18`

**Between / Not Between**
- Range checking (inclusive)
- Example: `Amount Between 10000 and 50000`

**Is Empty / Is Not Empty**
- Check for null values
- Example: `Discount Is Empty` (no discount applied)

**In List / Not In List**
- Match multiple specific values
- Example: `Quantity In List [1, 5, 10, 25]`

**Top N / Bottom N**
- Rank-based filtering
- Example: `Amount Top 10` (top 10 by amount)

**[Screenshot: Number field operators with examples]**

### Date Field Operators

**Equals / Not Equals**
- Specific date
- Example: `Created Date Equals 2026-01-17`

**Before / After**
- Date comparison
- Example: `Close Date After 2026-03-01`

**Between / Not Between**
- Date range
- Example: `Close Date Between 2026-01-01 and 2026-03-31` (Q1)

**Relative Date Operators:**

**Last/Next X Days**
- `Last 7 Days`, `Next 30 Days`
- Rolling window from today

**Last/Next X Weeks**
- `Last 2 Weeks`, `Next 4 Weeks`
- Week starts Sunday (configurable)

**Last/Next X Months**
- `Last 3 Months`, `Next 6 Months`
- Month boundaries (1st to last day)

**Last/Next X Years**
- `Last Year`, `Next 2 Years`

**Specific Period Operators:**

**Today / Yesterday / Tomorrow**
- Exactly that day

**This Week / Last Week / Next Week**
- Week boundaries (Sunday-Saturday)

**This Month / Last Month / Next Month**
- Month boundaries (1st-last day)

**This Quarter / Last Quarter / Next Quarter**
- Quarter boundaries (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)

**This Year / Last Year / Next Year**
- Year boundaries (Jan 1 - Dec 31)

**Fiscal Period Operators:**
- Based on your fiscal year start
- Fiscal Quarter, Fiscal Year, etc.

**Is Empty / Is Not Empty**
- Check for null dates
- Example: `Close Date Is Empty` (no close date set)

**[Screenshot: Date field operators with relative date options]**

### Boolean (Checkbox) Operators

**Is True**
- Checkbox is checked
- Example: `Is Active Is True`

**Is False**
- Checkbox is unchecked
- Example: `Email Opt Out Is False` (can email)

**Is Set / Is Not Set**
- Has value (regardless of true/false)
- Example: `Confirmed Is Set` (has been set to true or false)

**[Screenshot: Boolean field operators]**

### Picklist (Dropdown) Operators

**Equals / Not Equals**
- Single value match
- Example: `Stage Equals "Proposal"`

**In List / Not In List**
- Multiple value match
- Example: `Stage In List ["Qualification", "Proposal", "Negotiation"]`

**Is Empty / Is Not Empty**
- No value selected
- Example: `Lead Source Is Empty` (source unknown)

**[Screenshot: Picklist field operators with multi-select]**

### Multi-Select Picklist Operators

**Includes / Doesn't Include**
- Contains at least one value
- Example: `Interests Includes "AI"` (AI is one of selected interests)

**Includes All**
- Contains all specified values
- Example: `Skills Includes All ["JavaScript", "React"]`

**Includes Only**
- Contains exactly these values, no others
- Example: `Products Includes Only ["Basic", "Pro"]`

**Is Empty / Is Not Empty**
- No values selected

**[Screenshot: Multi-select picklist operators]**

### Lookup/Reference Field Operators

**Equals / Not Equals**
- Specific record
- Example: `Owner Equals "John Smith"`

**In List / Not In List**
- Multiple specific records
- Example: `Owner In List ["John Smith", "Jane Doe"]`

**Contains** (for text within reference)
- Search within referenced record fields
- Example: `Account.Name Contains "Corp"`

**Is Empty / Is Not Empty**
- No related record
- Example: `Owner Is Empty` (unassigned)

**[Screenshot: Lookup field operators with reference]**

---

## Nested AND/OR Logic

Create complex conditions using nested groups.

### Understanding AND vs. OR

**AND logic:**
- All conditions must be true
- Narrows results (more restrictive)
- Example: `Age > 18 AND Country = "USA"` (must meet both)

**OR logic:**
- At least one condition must be true
- Expands results (less restrictive)
- Example: `Industry = "Tech" OR Industry = "Finance"` (either works)

**[Screenshot: AND vs. OR logic diagram]**

### Creating Filter Groups

**To create nested logic:**
1. Click **"Add Group"**
2. Group appears in filter tree
3. Choose AND or OR for group
4. Add conditions within group
5. Combine groups with AND/OR

**[Screenshot: Adding filter group]**

### Complex Logic Examples

**Example 1: Qualified Leads from Specific Sources**
```
(Lead Source = "Website" OR Lead Source = "Referral")
AND
Score > 75
AND
Status = "New"
```

**Interpretation:** Website or referral leads, with high score, that are new.

**Filter tree:**
```
AND
├─ OR
│  ├─ Lead Source = "Website"
│  └─ Lead Source = "Referral"
├─ Score > 75
└─ Status = "New"
```

**[Screenshot: Example 1 in filter builder]**

**Example 2: High-Priority Opportunities**
```
(Amount > 100000 AND Probability > 75%)
OR
(Amount > 50000 AND Close Date in Next 30 Days)
```

**Interpretation:** Either large likely deals, or medium deals closing soon.

**Filter tree:**
```
OR
├─ AND
│  ├─ Amount > 100000
│  └─ Probability > 75%
└─ AND
   ├─ Amount > 50000
   └─ Close Date in Next 30 Days
```

**[Screenshot: Example 2 in filter builder]**

**Example 3: Complex Segmentation**
```
(Company Size = "Enterprise" AND Industry = "Technology")
OR
(Company Size = "Mid-Market" AND Industry In ["Finance", "Healthcare"])
AND
Status = "Active"
AND NOT
(Tags Contains "Competitor" OR Tags Contains "Do Not Contact")
```

**Interpretation:** Active enterprise tech companies, or mid-market finance/healthcare, excluding competitors and DNC.

**Filter tree:**
```
AND
├─ OR
│  ├─ AND
│  │  ├─ Company Size = "Enterprise"
│  │  └─ Industry = "Technology"
│  └─ AND
│     ├─ Company Size = "Mid-Market"
│     └─ Industry In ["Finance", "Healthcare"]
├─ Status = "Active"
└─ NOT (OR)
   ├─ Tags Contains "Competitor"
   └─ Tags Contains "Do Not Contact"
```

**[Screenshot: Example 3 in filter builder]**

### Using NOT Logic

**Negate conditions or groups:**
- Click condition → **"Add NOT"**
- Reverses the condition
- Example: `NOT (Status = "Closed")` = All except closed

**NOT with groups:**
```
NOT (
  Industry = "Competitor Industry"
  OR
  Company Contains "Competitor Name"
)
```

**Interpretation:** Exclude records matching any competitor criteria.

**[Screenshot: NOT logic in filter]**

### Filter Logic Best Practices

**Start with broadest condition:**
```
✓ Good:
  Status = "Active"
  AND (specific conditions...)

✗ Less efficient:
  (complex nested conditions...)
  AND Status = "Active"
```

**Group similar conditions:**
```
✓ Good:
  (Source = "Web" OR Source = "Referral" OR Source = "Partner")

✗ Harder to read:
  Source = "Web"
  OR Source = "Referral"
  OR Source = "Partner"
```

**Use descriptive group names:**
- Name groups to explain their purpose
- Example: "High-Value Sources", "Qualified Criteria"
- Makes complex filters easier to understand

**[Screenshot: Well-organized filter with named groups]**

---

## Saving Filter Templates

Save complex filters to reuse across reports.

### Creating Filter Templates

**To save filter as template:**
1. Build filter in Advanced Filter Builder
2. Click **"Save as Template"**
3. Enter template name: "High-Value Deals Closing Soon"
4. Add description: "Deals >$50K closing in next 90 days"
5. Choose category: Sales, Marketing, etc.
6. Set access: Private, Team, or Organization
7. Click **"Save Template"**

**[Screenshot: Save filter template dialog]**

### Using Filter Templates

**To apply saved template:**
1. Open Advanced Filter Builder
2. Click **"Templates"** button
3. Browse or search templates
4. Click template name
5. Filter applies immediately
6. (Optional) Modify for this specific use

**Template library:**
- Browse by category
- Search by name
- View description and preview
- See usage count (popularity)
- Filter by creator

**[Screenshot: Filter template library]**

### Common Filter Templates

**Sales templates:**
- **Hot Opportunities**: High value, high probability, closing soon
- **Stalled Deals**: No activity in 30+ days
- **New Business**: Deals from new accounts
- **Renewals**: Existing customer renewals

**Marketing templates:**
- **MQLs**: Marketing qualified leads
- **Engaged Contacts**: Opened email or visited site recently
- **Inactive Contacts**: No engagement in 90+ days
- **High-Intent**: Visited pricing page, requested demo

**Customer Success templates:**
- **At-Risk Customers**: Low engagement, support issues
- **Expansion Opportunities**: Using product heavily, good candidates for upsell
- **Renewal Focus**: Contracts expiring in next 90 days
- **Champions**: High satisfaction, good for references

**Activity templates:**
- **Overdue Tasks**: Past due date, not completed
- **My High-Priority Tasks**: Assigned to me, high priority
- **This Week's Meetings**: Meetings scheduled this week
- **Unresponded Emails**: Sent >3 days ago, no reply

**[Screenshot: Common filter template examples]**

### Managing Templates

**Edit template:**
1. Load template
2. Make changes
3. Click **"Update Template"** (if you have permission)
   OR **"Save as New Template"** (creates copy)

**Delete template:**
1. Templates library → Find template
2. Click **"Delete"**
3. Confirm (cannot be undone)
4. Requires permission (owner or admin)

**Share template:**
1. Edit template
2. Change access level:
   - Private → Only you
   - Team → Your team
   - Organization → Everyone
3. Save

**Template permissions:**
- Creator can always edit/delete
- Admins can edit/delete any template
- Team/org templates are read-only for others (they can copy and modify their copy)

**[Screenshot: Template management options]**

---

## Quick Filters

Fast, one-click filters for common scenarios.

### What are Quick Filters?

**Quick filters** are pre-configured filters that appear as buttons above data tables and charts.

**Benefits:**
- One-click application
- No need to build filter
- Common scenarios readily available
- Can combine multiple quick filters

**[Screenshot: Quick filter buttons above data table]**

### Built-in Quick Filters

**Common quick filters:**
- **My Records**: Records owned by you
- **My Team's Records**: Records owned by anyone on your team
- **Active**: Status = Active
- **Created Today**: Created Date = Today
- **Created This Week**: Created Date = This Week
- **Created This Month**: Created Date = This Month
- **Modified Today**: Last Modified = Today
- **Favorites**: Records you've starred

**Data-specific quick filters:**

**Opportunities:**
- Open Opportunities
- Closed Won
- Closed Lost
- Closing This Quarter
- High Value (>$50K)
- High Probability (>75%)

**Contacts:**
- Has Email Address
- Has Phone Number
- Subscribed to Emails
- VIP Contacts

**Tasks:**
- My Tasks
- Overdue
- Due Today
- Due This Week
- High Priority
- Not Started

**[Screenshot: Data-specific quick filters]**

### Creating Custom Quick Filters

**To create quick filter:**
1. Report Settings → **"Quick Filters"**
2. Click **"Add Quick Filter"**
3. Configure:
   - Name: "High-Value Deals"
   - Icon: Choose icon (💰)
   - Filter conditions: Amount > $50,000
   - Color: Green
   - Default: On/Off
4. Click **"Save"**
5. Quick filter appears above report

**Quick filter appears as:**
```
[My Records] [Active] [💰 High-Value Deals]
```

**[Screenshot: Custom quick filter configuration]**

### Combining Quick Filters

**Click multiple quick filters:**
- Filters combine with AND logic
- Example: Click "My Records" + "High-Value Deals"
  - Shows your deals > $50K
- Active filters highlighted
- Click again to remove filter

**Clear all quick filters:**
- Click **"Clear All"** button
- All quick filters deactivate
- Returns to unfiltered view

**[Screenshot: Multiple quick filters active]**

---

## Date Range Shortcuts

Powerful date filtering with smart shortcuts.

### Relative Date Ranges

**Relative dates update automatically:**

**Past periods:**
- Last 7 Days: Today and previous 6 days
- Last 30 Days: Today and previous 29 days
- Last 90 Days: Today and previous 89 days
- Last 6 Months: Today and previous 6 months
- Last 12 Months: Today and previous 12 months

**Future periods:**
- Next 7 Days: Today and next 6 days
- Next 30 Days: Today and next 29 days
- Next 90 Days: Today and next 89 days
- Next 6 Months: Today and next 6 months
- Next 12 Months: Today and next 12 months

**Rolling windows:**
- Automatically update each day
- "Last 30 Days" always means the most recent 30 days

**[Screenshot: Relative date range options]**

### Fixed Period Shortcuts

**Fixed periods with boundaries:**

**Current periods:**
- Today: Exactly today (12:00 AM - 11:59 PM)
- This Week: Sunday - Saturday (or Mon-Sun if configured)
- This Month: 1st - last day of current month
- This Quarter: First - last day of current quarter
- This Year: Jan 1 - Dec 31 of current year

**Previous periods:**
- Yesterday: Exactly yesterday
- Last Week: Previous full week (Sun-Sat)
- Last Month: Previous full month (1st-last)
- Last Quarter: Previous full quarter
- Last Year: Previous full year

**Future periods:**
- Tomorrow: Exactly tomorrow
- Next Week: Next full week
- Next Month: Next full month
- Next Quarter: Next full quarter
- Next Year: Next full year

**[Screenshot: Fixed period shortcuts]**

### Fiscal Period Shortcuts

**If fiscal year is configured:**
- This Fiscal Quarter
- Last Fiscal Quarter
- This Fiscal Year
- Last Fiscal Year
- Fiscal Year to Date

**Example:**
```
Fiscal year starts: April 1
"This Fiscal Year" = April 1, 2025 - March 31, 2026
"This Fiscal Quarter" = January 1 - March 31 (Q4 of fiscal year)
```

**[Screenshot: Fiscal period options]**

### Custom Date Ranges

**Build custom range:**
1. Select date field
2. Choose operator: **Between**
3. Click **"Custom Range"**
4. Calendar picker appears
5. Select start and end dates
6. Click **"Apply"**

**Calendar features:**
- Click date to select
- Hover to preview range
- Type date in input (YYYY-MM-DD)
- Use arrows to change months
- Jump to Today button

**[Screenshot: Custom date range calendar picker]**

### Date Range Comparison

**Compare date ranges:**
1. Set primary date range (e.g., This Month)
2. Enable **"Compare to"**
3. Choose comparison period:
   - Previous Period (Last Month)
   - Same Period Last Year (This Month last year)
   - Custom Period
4. Report shows both periods with % change

**Comparison example:**
```
Revenue This Month: $847,523
Revenue Last Month: $736,492
Change: +15.1% ↑
```

**[Screenshot: Date range comparison setup and results]**

---

## Complex Filter Examples

### Example 1: Sales Pipeline Hygiene Report

**Goal:** Find opportunities that need attention

**Filter logic:**
```
(
  (Stage = "Proposal" AND No Activity in Last 14 Days)
  OR
  (Stage = "Negotiation" AND No Activity in Last 7 Days)
  OR
  (Close Date < Today AND Stage NOT IN ["Closed Won", "Closed Lost"])
)
AND
Probability > 0
```

**Implementation:**
```
AND
├─ OR
│  ├─ AND
│  │  ├─ Stage = "Proposal"
│  │  └─ Last Activity Date < Today - 14 Days
│  ├─ AND
│  │  ├─ Stage = "Negotiation"
│  │  └─ Last Activity Date < Today - 7 Days
│  └─ AND
│     ├─ Close Date < Today
│     └─ Stage NOT IN ["Closed Won", "Closed Lost"]
└─ Probability > 0
```

**Result:** Stalled deals and overdue deals that need immediate attention.

**[Screenshot: Example 1 filter in builder]**

### Example 2: Targeted Marketing Campaign

**Goal:** Find ideal prospects for email campaign

**Filter logic:**
```
(Company Size = "Mid-Market" OR Company Size = "Enterprise")
AND
Industry IN ["Technology", "Financial Services", "Healthcare"]
AND
(
  Website Visit in Last 30 Days
  OR
  Email Opened in Last 30 Days
  OR
  Downloaded Content in Last 60 Days
)
AND NOT
(
  Email Opt Out = True
  OR
  Marked as "Competitor"
  OR
  Last Email Sent in Last 7 Days
)
```

**Result:** Engaged prospects in target industries/sizes, excluding those who can't be emailed or were recently contacted.

**[Screenshot: Example 2 filter in builder]**

### Example 3: Customer Health Score

**Goal:** Identify at-risk customers

**Filter logic:**
```
Account Type = "Customer"
AND
(
  (
    Login Count in Last 90 Days < 10
    AND
    Feature Usage < 25%
  )
  OR
  Support Tickets in Last 30 Days > 5
  OR
  (
    NPS Score < 6
    AND
    NPS Score IS NOT EMPTY
  )
  OR
  (
    Invoice Overdue > 30 Days
  )
)
AND
Contract Value > 10000
```

**Result:** High-value customers showing signs of churn risk.

**[Screenshot: Example 3 filter in builder]**

### Example 4: Lead Scoring Filter

**Goal:** Identify sales-ready leads (MQLs)

**Filter logic:**
```
Lead Status = "New"
AND
(
  Lead Score > 75
  OR
  (
    (Title Contains "Director" OR Title Contains "VP" OR Title Contains "C-Level")
    AND
    Company Size = "Enterprise"
    AND
    (Website Visits in Last 7 Days > 3 OR Pricing Page Visit in Last 7 Days)
  )
)
AND NOT
(
  Domain Contains "gmail.com"
  OR
  Domain Contains "yahoo.com"
  OR
  Country NOT IN ["USA", "Canada", "UK", "Australia"]
)
```

**Result:** High-quality leads meeting scoring threshold or showing strong buying signals.

**[Screenshot: Example 4 filter in builder]**

---

## Filter Performance Tips

### Optimizing Filter Speed

**For large datasets (10,000+ records):**

✓ **Filter on indexed fields first**
- Fields like ID, Name, Date, Status are indexed
- Filters on indexed fields are faster
- Put indexed field conditions first in filter tree

✓ **Use specific date ranges instead of "All Time"**
- `Created Date in Last 90 Days` (faster)
- vs. `Created Date >= 2020-01-01` (slower)

✓ **Limit use of "Contains" and "Matches Pattern"**
- `Email Ends With "@company.com"` (faster)
- vs. `Email Contains "company"` (slower for large datasets)

✓ **Use IN list instead of multiple ORs**
- `Stage IN ["Proposal", "Negotiation", "Closed Won"]` (faster)
- vs. `Stage = "Proposal" OR Stage = "Negotiation" OR Stage = "Closed Won"` (slower)

✓ **Avoid too many conditions**
- 10-15 conditions max recommended
- If you need more, consider data model changes

✓ **Test filter performance**
- Check "X records match" count
- If slow (>3 seconds), simplify filter

**[Screenshot: Filter performance metrics]**

### Filter Testing

**Before saving filter, test it:**

**Check record count:**
- Does "123 records match" seem right?
- Too many? Filter isn't specific enough
- Too few? Filter might be too restrictive
- Zero? Filter logic may be wrong

**Preview results:**
- Look at first 10-20 records
- Do they match what you expect?
- Spot check a few records manually

**Test edge cases:**
- Records right at threshold (e.g., Amount = exactly 50000 when filter is >50000)
- Records with null/empty values
- Records in different statuses/stages

**Version and document:**
- Add description explaining filter logic
- Note any caveats or limitations
- Track changes if filter is modified

**[Screenshot: Filter testing preview]**

---

## Related Topics

- [Creating Reports](Creating_Reports.md) - Use filters in reports
- [Advanced Tables](Advanced_Tables.md) - Table-level filtering
- [Dashboards](Dashboards.md) - Dashboard-level filters
- [KPIs and Metrics](KPIs_and_Metrics.md) - Filter KPI data
- [Tips and Best Practices](Tips_and_Best_Practices.md) - General best practices

---

**Last Updated**: January 2026
**Version**: 3.0

---

*Next: Learn about [Tips and Best Practices](Tips_and_Best_Practices.md) for overall reporting optimization and design guidelines.*
