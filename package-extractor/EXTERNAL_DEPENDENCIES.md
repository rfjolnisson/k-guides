# External Dependencies for Package Bundles

**Date:** November 26, 2025  
**Purpose:** Document dependencies that are not included in bundles but required for deployment

---

## Overview

When deploying a Gold Config package bundle, certain dependencies are **intentionally not included** in the bundle because they are org-wide shared objects that should already exist in the target org or will be mapped during deployment.

These are called **External Dependencies**.

---

## External Dependency Types

### 1. Org-Wide Configuration Objects

These objects are configured once per org and shared across all packages.

#### CommissionGroup__c
**Purpose:** Commission rate configurations  
**Why Not in Bundle:** Shared across multiple packages, org-specific business rules  
**Deployment Strategy:** Map to existing CommissionGroup in target org or create manually first  
**Wizard Action:** Present dropdown of existing CommissionGroups in target org

**Example:**
```json
{
  "Name": "Standard Tours",
  "KaptioTravel__AgentCommissionRate__c": 10,
  "KaptioTravel__ResellerCommissionRate__c": 8
}
```

**If Missing in Target Org:**
- Option A: Map to closest equivalent commission group
- Option B: Create new CommissionGroup with default rates (10%)
- Option C: Deploy package with null CommissionGroup, assign later

---

#### TaxGroup__c
**Purpose:** Tax calculation rules  
**Why Not in Bundle:** Tax rules are jurisdiction-specific, vary by org location  
**Deployment Strategy:** Map to target org's tax configuration  
**Wizard Action:** Present dropdown or leave null (assign later)

**Example:**
```json
{
  "Name": "Standard Tax",
  "KaptioTravel__TaxRate__c": 10
}
```

**If Missing in Target Org:**
- Option A: Map to equivalent tax group
- Option B: Leave null, assign manually after deployment based on local tax requirements

---

#### PriceCategory__c
**Purpose:** Price category definitions (Single, Double, Twin, etc.)  
**Why Not in Bundle:** Standard price categories are org-wide, reused across packages  
**Deployment Strategy:** Match by name or create if missing  
**Wizard Action:** Auto-match by name (e.g., "Single Room" → query target org for "Single Room")

**Standard Categories (should exist in target org):**
```json
[
  {"Name": "Single Room", "MaxOccupancy": 1, "MinOccupancy": 1},
  {"Name": "Double Room", "MaxOccupancy": 2, "MinOccupancy": 2},
  {"Name": "Twin Room", "MaxOccupancy": 2, "MinOccupancy": 2}
]
```

**Deployment Logic:**
```javascript
for (each reference to PriceCategory) {
  sourceName = getPriceCategoryName(sourcePriceCategoryId);
  targetPriceCategory = query("SELECT Id FROM PriceCategory WHERE Name = :sourceName");
  
  if (found) {
    map sourcePriceCategoryId → targetPriceCategory.Id;
  } else {
    create PriceCategory with sourceName;
    map sourcePriceCategoryId → newId;
  }
}
```

---

#### Channel__c
**Purpose:** Sales channels (Direct, Partner, Online, etc.)  
**Why Not in Bundle:** Channels are org-specific, vary by business model  
**Deployment Strategy:** User selects target channel(s) in wizard  
**Wizard Action:** Dropdown with channels in target org

**Example:**
```json
{
  "Name": "Direct Sales",
  "KaptioTravel__ChannelType__c": "Direct",
  "KaptioTravel__IsActive__c": true
}
```

**If Missing in Target Org:**
- Option A: Map to "Default" channel if exists
- Option B: Leave channel assignments null (assign later)

---

### 2. Reference Data Objects

#### Supplier (Account)
**Purpose:** Supplier/vendor accounts  
**Why Not in Bundle:** Suppliers are org-specific, pre-existing relationships  
**Deployment Strategy:** Map to existing Accounts in target org  
**Wizard Action:** For each Item that references a Supplier, present lookup to existing Accounts

**Deployment Options:**
- **Option A:** Map to existing supplier Account
- **Option B:** Leave null (assign suppliers manually after deployment)
- **Option C:** Create placeholder Accounts during deployment

**Recommended:** Option B (leave null). Suppliers should be configured by operations team with proper contracts, contacts, and financial terms.

---

### 3. Inventory Objects

#### AllotmentCategory__c & AllotmentDay__c
**Purpose:** Inventory contracts and daily capacity  
**Why Not in Bundle:** Date-specific, need to be created fresh for target org's season  
**Deployment Strategy:** Extract with bundle but mark as "template only"  
**Wizard Action:** Option to include or skip inventory data

**Considerations:**
```
Source Org Inventory:
- Departures: March-April 2026
- Capacity: 20 per departure
- Specific to ktdev45 demo environment

Target Org Reality:
- Need departures for 2026-2027 season
- Capacity may differ (different coach size, different contracts)
- Different hotel room blocks
```

**Recommended Strategy:**
1. **Skip AllotmentDay records during deployment** (they're demo data with past dates)
2. **Include AllotmentCategory structure** (shows how to set up inventory)
3. **Operations team creates fresh inventory** for their season

---

## Deployment Wizard Handling

### Phase 1: Identify External Dependencies

When bundle is uploaded:
```javascript
externalDeps = {
  CommissionGroups: [id1, id2],
  TaxGroups: [id3],
  PriceCategories: [id4, id5, id6],
  Channels: [id7, id8],
  Suppliers: [id9, id10]
};
```

### Phase 2: Present Mapping Interface

**For Each Dependency Type:**

**CommissionGroups:**
```
Source: a14J8000000YqzvIAC
Target Options:
  - Map to existing: [Dropdown of CommissionGroups in target]
  - Create new: "Standard Tours" (10% commission)
  - Leave null
```

**PriceCategories:**
```
Source: a2OJ8000000LMj5MAG ("Single Room")
Target Action:
  ✓ Auto-matched to existing "Single Room" (a2Xxx...)
  or
  ○ Create new "Single Room"
  or  
  ○ Map to different category [Dropdown]
```

**Channels:**
```
Bundle requires 4 channel assignments:
  Assignment 1: [Select target channel] (required for package visibility)
  Assignment 2: [Select target channel]
  Assignment 3: [Select target channel]
  Assignment 4: [Select target channel]
  
Or: Apply single channel to all assignments: [Dropdown]
```

**Suppliers:**
```
4 items reference suppliers:
  Item 1: "Hotel Tokyo" → [Select supplier] or [No supplier]
  Item 2: "Hotel Osaka" → [Select supplier] or [No supplier]
  Item 3: "Sushi-Making Class" → [Select supplier] or [No supplier]
  Item 4: "Tour Inventory" → [Select supplier] or [No supplier]

Recommended: Leave blank, assign after deployment
```

### Phase 3: Validation

**Before Deploy:**
- Verify all required external deps have mappings
- Check mapped records exist in target org
- Validate field compatibility

---

## Implementation Guidance

### For Developers

When implementing the deployment wizard, handle external dependencies in this order:

```javascript
// 1. Load bundle
const bundle = loadBundle(file);

// 2. Identify external dependencies
const externalDeps = identifyExternalDependencies(bundle);

// 3. Query target org for matching records
const availableCommissionGroups = query("SELECT Id, Name FROM CommissionGroup WHERE IsActive = true");
const availablePriceCategories = query("SELECT Id, Name FROM PriceCategory WHERE IsActive = true");

// 4. Auto-match where possible
for (priceCategoryId of externalDeps.PriceCategories) {
  sourceName = bundle.priceCategoryNames[priceCategoryId];
  match = availablePriceCategories.find(pc => pc.Name === sourceName);
  if (match) {
    autoMappings[priceCategoryId] = match.Id;
  }
}

// 5. Present wizard for unmapped dependencies
showMappingInterface(externalDeps, autoMappings);

// 6. During deployment, apply all mappings
applyExternalDependencyMappings(bundle, userMappings, autoMappings);
```

---

## Testing Strategy

### Test Case 1: All Dependencies Exist in Target
- **Setup:** Target org has matching CommissionGroups, PriceCategories, Channels
- **Expected:** Auto-matching works, minimal user mapping required
- **Success:** Package deploys with correct references

### Test Case 2: Missing PriceCategories
- **Setup:** Target org lacks "Single Room" price category
- **Expected:** Wizard prompts to create or map to different category
- **Success:** Package deploys, creates missing PriceCategory

### Test Case 3: No Channels in Target
- **Setup:** Fresh org with no Channel records
- **Expected:** Wizard skips channel assignment or prompts to create channels
- **Success:** Package deploys with null channel assignments

### Test Case 4: Different Tax System
- **Setup:** Target org uses different tax structure than source
- **Expected:** Wizard prompts to map TaxGroups or leave null
- **Success:** Package deploys, tax can be configured post-deployment

---

## Appendix: Complete External Dependency List

Based on Japan Discovery - Land Only analysis:

| Object | Instances | Include Strategy | Wizard Action |
|--------|-----------|------------------|---------------|
| CommissionGroup__c | 2 unique IDs | Map to existing | Dropdown selection |
| TaxGroup__c | 1 unique ID | Map to existing or null | Dropdown or skip |
| PriceCategory__c | 18 references | Auto-match + create if missing | Automatic + review |
| Channel__c | 4 references | Map to target channels | Dropdown per assignment |
| Account (Supplier) | 1 unique supplier | Map to existing or null | Optional dropdown |
| Language__c | 1 (English) | Auto-match or create | Automatic |
| AllotmentDay__c | 12 references | Skip (date-specific) | Checkbox to include/exclude |

---

**Recommendation for MVP:**

For the initial deployment wizard implementation:
1. **Auto-handle:** PriceCategory (match by name, create if missing)
2. **Required mapping:** OwnerId, CurrencyIsoCode
3. **Optional mapping:** Channel (single dropdown, applied to all assignments)
4. **Skip:** CommissionGroup, TaxGroup, Suppliers (deploy with null, assign later)
5. **Skip:** AllotmentDay (demo data, not useful in production)

This minimizes wizard complexity while still creating a functional package that can be configured post-deployment.

---

**End of External Dependencies Documentation**

