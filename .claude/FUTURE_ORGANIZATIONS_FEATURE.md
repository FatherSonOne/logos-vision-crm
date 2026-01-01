# Future Enhancement: True Organizations Feature (Option B)

**Status:** Planned for future implementation
**Priority:** Medium
**Related:** Organizations section merged into Contacts (December 2024)

## Current State

Organizations are now managed within the unified Contacts view with a prominent type toggle. This provides:
- Single source of truth for all contacts
- Easy filtering between Organizations/Individuals/All
- Reduced navigation complexity (removed duplicate Organizations nav item)

## Proposed Future Enhancement

Create a true Organizations feature that provides:

### 1. Organization-Contact Relationships
- **Parent-Child Hierarchy**: Organizations can have sub-organizations
- **Affiliation Types**: Employee, Board Member, Volunteer, Donor, Partner
- **Primary Contact**: Designate a primary contact for each organization
- **Role Tracking**: Track roles/titles within organizations

### 2. Database Schema Changes

```sql
-- New table for organization relationships
CREATE TABLE organization_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'employee', 'board_member', 'volunteer', 'donor'
  role_title TEXT,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, contact_id, relationship_type)
);

-- Organization hierarchy
CREATE TABLE organization_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_org_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  child_org_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'subsidiary', -- 'subsidiary', 'chapter', 'affiliate'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_org_id, child_org_id)
);
```

### 3. UI Components Needed

- **OrganizationProfile**: Enhanced organization detail view with:
  - Contacts tab showing related individuals
  - Hierarchy visualization (parent/child orgs)
  - Donation aggregate from all related contacts
  - Activity timeline across all contacts

- **RelationshipManager**: Dialog for managing contact-org relationships

- **OrgChart**: Visual hierarchy of organization structures

### 4. Features

1. **Roll-up Reporting**: Aggregate donations from all contacts affiliated with an org
2. **Communication History**: See all interactions across org-related contacts
3. **Relationship Timeline**: Track when contacts joined/left organizations
4. **Matching Gifts**: Link employee donations to corporate matching programs
5. **Board Management**: Track board terms, committees, voting history

### 5. Implementation Approach

Phase 1: Schema & Basic Relationships
- Create database tables
- Add relationship CRUD in service layer
- Basic UI for adding/viewing relationships

Phase 2: Organization Profile Enhancement
- Enhanced organization detail view
- Contacts list with relationship types
- Aggregate stats (total giving, engagement)

Phase 3: Advanced Features
- Org chart visualization
- Roll-up reporting
- Matching gift tracking
- Board management tools

## Integration Points

- **Donations**: Roll up individual donations to organization totals
- **Campaigns**: Target campaigns by organization affiliation
- **Stewardship**: Organization-level stewardship plans
- **Reports**: Organization giving reports with individual breakdowns

## Notes

This enhancement would significantly improve CRM capabilities for nonprofits managing relationships with corporate donors, foundations, and partner organizations. The current unified Contacts view with type toggle provides a solid foundation for this future work.
