# k-guides Project Summary

**Date:** November 25, 2025  
**Duration:** ~2 hours  
**Status:** ✅ Phase 1 Complete - Gold Config Package Architecture Guide

---

## What Was Built

### 1. Gold Config Package Architecture Showcase (HTML)
**File:** `gold-config-package-showcase.html`  
**Size:** 103 KB  
**Pages:** 21 pages (print-optimized)  
**Format:** Magazine-style HTML with PDF export capability

**Content Sections:**
1. Cover Page
2. Table of Contents
3. Introduction: The Six Package Types
4. Classic Land-Only Package (Pages 4-5)
5. Classic Air+Land Package (Pages 6-7)
6. Flight Placeholder Deep Dive (Page 7)
7. Combo Land-Only Package (Page 9)
8. Combo Air+Land Package (Page 11)
9. Linked Package Architecture (Page 13)
10. Payment Schedules Deep Dive (Pages 14-15)
11. Payment Schedule Generation Flow (Page 15)
12. Cancellation Policies Deep Dive (Pages 16-17)
13. Cancellation Calculation Example (Page 17)
14. Inventory & Allotments Deep Dive (Page 18)
15. Departure Generation & Status Management (Page 19)
16. Configuration Checklists (Page 20)
17. Back Cover with Key Takeaways

**Real Data Used:**
- 13 packages from ktdev45 org
- Payment schedule configurations with actual rules
- Cancellation policy configurations with tiered fees
- Component structures with field values
- Allotment architecture

**Design:** Follows Kaptio Design System (Lexend font, teal primary, yellow CTA)

---

### 2. Navigation Index (HTML)
**File:** `index.html`  
**Size:** 16 KB

**Features:**
- Central hub linking to all guides
- Card-based navigation with hover effects
- Links to architecture showcases (including booking numbers guide)
- Links to technical markdown references
- "Coming Soon" placeholders for future guides
- Fully responsive design

---

### 3. Package Schema Analysis (Markdown)
**File:** `PACKAGE_SCHEMA_ANALYSIS.md`  
**Size:** 33 KB  
**Lines:** 617

**Sections:**
- Executive Summary
- Detailed analysis of all 6 package types
- Field-by-field configuration documentation
- Component structure for each type
- Flight placeholder architecture explanation
- Service level mode and bed type defaulting
- Pre/post accommodation architecture
- Record types vs field-based classification discussion
- Departure type and scheduling
- Commission and profit groups
- Comparison matrix
- Architectural principles
- Analyst's final thoughts

**Data Source:** 15 SOQL queries across ktdev45 org

---

### 4. Complete Data Model Reference (Markdown)
**File:** `COMPLETE_DATA_MODEL_REFERENCE.md`  
**Size:** 31 KB  
**Lines:** 712

**Comprehensive Coverage:**

#### Core Package Architecture
- Package object complete field reference
- Classification matrix
- Inventory control fields

#### Payment Schedules
- 4-object architecture explained
- Assignment hierarchy (7 levels)
- Rule generation flow
- DateType options
- Dynamic deposit feature
- Pay per pax vs pay per itinerary

#### Cancellation Policies
- 4-object architecture (parallel to payment schedules)
- Tiered fee structure
- Assignment hierarchy
- Rule matching logic
- Supplier vs guest-facing policies
- Financial reconciliation examples

#### Inventory & Allotments
- AllotmentCategory (contract level)
- AllotmentDay (daily units with release tiers)
- Component assignments
- Departure assignments
- Unit tracking fields
- Release logic examples
- Physical inventory modes explained

#### Package Departures
- Departure generation (2 methods)
- Status management
- Capacity configuration
- Departure-level overrides
- Absolute mode explanation

#### Component Structure
- Component types (Package_Item, FlightPlaceholder, etc.)
- Key behavioral fields
- ComponentOption junction pattern
- Day range configuration

#### Pricing & Service Levels
- ServiceCabin object (price categories)
- PackageServiceLevelAssignment
- Bed type defaulting mechanism
- PackagePrice and dynamic pricing

#### Complete Object Relationship Map
- Visual ASCII diagram showing all connections
- Template layer → Inventory layer → Departure layer → Booking layer

#### Key Insights for Guide Creation
- 8 critical insights for accurate documentation
- Terms to use consistently
- Hierarchy explanations

---

### 5. README (This File)
Documentation of the documentation.

---

## Research Methodology

### Phase 1: Environment Setup
✅ Verified Kæ (Kaptio AI API) connectivity  
✅ Confirmed ktdev45 org authentication via sfdx  
✅ Tested SOQL query capabilities

### Phase 2: Package Discovery
✅ Found all 13 target packages by name  
✅ Retrieved Package IDs for detailed analysis  
✅ Identified package type patterns

### Phase 3: Schema Exploration
✅ Queried Package__c object for all custom fields  
✅ Compared configurations across all 6 package types  
✅ Documented key differentiating fields

### Phase 4: Component Analysis
✅ Listed components for each package type  
✅ Identified flight placeholder components  
✅ Analyzed component field values  
✅ Documented component structures

### Phase 5: Financial Configuration
✅ Found PaymentScheduleAssignments for packages  
✅ Retrieved PaymentScheduleRules with real values  
✅ Found CancellationAssignments  
✅ Retrieved CancellationRules with tiered fees  
✅ Documented assignment hierarchies

### Phase 6: Codebase Research
✅ Searched kaptiotravel repo for payment schedule logic  
✅ Found PaymentScheduleAssignmentService (836 lines)  
✅ Found CancellationRuleService and related classes  
✅ Analyzed inventory management code  
✅ Understood departure generation logic

### Phase 7: Validation
✅ Verified findings against M1 demo requirements  
✅ Cross-checked component structures  
✅ Validated status management fields  
✅ Confirmed inventory tracking architecture

### Phase 8: Documentation
✅ Created comprehensive markdown references  
✅ Built magazine-style HTML showcase  
✅ Designed navigation index  
✅ Followed Kaptio Design System

---

## Technical Stack

### Analysis Tools
- **Kæ:** Anthropic Claude Sonnet 4.5 with Salesforce adapter
- **sfdx CLI:** Direct org queries (Salesforce CLI v2.49.7)
- **Cursor:** Codebase search across kaptiotravel repo

### Design Tools
- **HTML5:** Semantic markup
- **Tailwind CSS:** Utility-first styling via CDN
- **Google Fonts:** Lexend font family
- **Custom CSS:** Print optimization (@page rules)

### Data Sources
- **ktdev45 org:** 13 packages, 40+ components, payment/cancellation configs
- **kaptiotravel repo:** 836-line PaymentScheduleAssignmentService, object definitions
- **Bunnik demo plan:** M1 requirements and validation criteria

---

## Key Findings

### Package Type Differentiators

The three-field combination that determines package behavior:

```
PACKAGE_TYPE__C + CATEGORIES__C + PHYSICALINVENTORYSELECTION__C = Package Behavior
```

| Type | PACKAGE_TYPE | CATEGORIES | PHYS_INVENTORY | Use Case |
|------|-------------|-----------|---------------|----------|
| Classic Land | Principle | Land Only | Mandatory | Single destination, needs inventory |
| Classic Air+Land | Principle | Air & Land | **NotMandatoryHidden** | Single destination, flights on-demand |
| Combo Land | Combo | Land Only | Mandatory | Multi-destination, needs inventory |
| Combo Air+Land | Combo | Air & Land | Mandatory | Multi-destination, flights + inventory |
| Linked Parent | Principle | Air & Land | Mandatory | Base tour, sells standalone |
| Linked Combined | **Linked** | Air & Land | Mandatory | Composite with extensions |

### Payment Schedule Hierarchy

7-level assignment hierarchy from most specific to fallback:
1. Service + Package + Account + Channel
2. Package + Account + Channel
3. Package + Channel
4. Package Only
5. Account + Channel
6. Channel Only
7. Account Only

**Why:** Allows different payment terms for corporate accounts vs reseller channels on the same package.

### Cancellation Policy Multi-Dimensionality

One package can have **multiple cancellation assignments**:
- One per price category (Single, Double, Twin)
- One per date range (peak season vs off-season)
- One per account type (corporate vs retail)

**Example:** Japan Discovery - Land Only has **4 cancellation assignments**

### Flight Placeholder Two-Component Pattern

| Component | Selection | In Total? | Commission | Purpose |
|-----------|-----------|-----------|------------|---------|
| Return Flight | Required | ✅ Included | 10% | Subsidized economy |
| Flight Upgrade | Optional | ❌ Excluded | 5% | Premium cabin upsell |

**Why Separated:** Different commission structures and financial reporting requirements.

### Inventory Is Component-Specific

**Don't think:** "This package has 20 capacity"  
**Think:** "This package's components are linked to allotment categories that have capacity across multiple days"

A 13-day tour might consume:
- 13 allotment days for hotel rooms
- 12 allotment days for coach seats
- 13 allotment days for guide services
- 10 allotment days for specific activities

Each with its own capacity, release tiers, and supplier contracts.

---

## What Makes This Different from Standard Documentation

### Standard Docs Say:
"PHYSICALINVENTORYSELECTION__C: Controls whether inventory is required. Values: Mandatory, NotMandatoryHidden."

### These Guides Say:
"Why Classic Air+Land uses NotMandatoryHidden: Flight placeholders are **pricing components**, not inventory components. You don't hold airplane seats 6 months out. Flights are booked on-demand via Connect gateways 60 days before departure. The placeholder holds the subsidized cost delta ($1,500 = Air+Land price minus Land-Only price) and gets overwritten when the PNR is imported. Using Mandatory would force the system to check 'flight inventory' which doesn't exist as physical allotments—blocking bookings unnecessarily."

**The Difference:** Operational context, real examples, and "why it matters" explanations.

---

## Success Criteria Met

✅ Complete understanding of all 6 package types  
✅ No blind spots in data model knowledge  
✅ Real data from ktdev45 org  
✅ Payment schedule architecture documented  
✅ Cancellation policy structure explained  
✅ Inventory/allotment system mapped  
✅ Magazine-style presentation following kaptio-connect-showcase format  
✅ Print-optimized for PDF generation  
✅ Kaptio Design System compliance  
✅ Opinionated analyst voice throughout  
✅ Configuration checklists for implementation

---

## Files Delivered

| File | Type | Size | Purpose |
|------|------|------|---------|
| index.html | HTML | 16 KB | Navigation hub |
| gold-config-package-showcase.html | HTML | 103 KB | Main guide (21 pages) |
| PACKAGE_SCHEMA_ANALYSIS.md | Markdown | 33 KB | Field reference |
| COMPLETE_DATA_MODEL_REFERENCE.md | Markdown | 31 KB | Object relationships |
| README.md | Markdown | This file | Documentation guide |
| PROJECT_SUMMARY.md | Markdown | This file | Project completion summary |

**Total:** 6 files, ~184 KB documentation

---

## Next Steps

### Immediate
- Review HTML guide in browser
- Generate PDF for sharing
- Share with Bunnik demo team for M1 prep

### Short Term (Next 1-2 weeks)
- Create "Household Account Model" guide
- Create "Payment Schedules Deep Dive" guide
- Create "Inventory Management" guide

### Medium Term (Month 1)
- Add interactive React components for complex diagrams
- Create searchable guide index
- Add video walkthroughs

---

## How to Share

### For Stakeholders
1. Open `gold-config-package-showcase.html` in Chrome
2. Generate PDF (Cmd+P, Save as PDF)
3. Share PDF: "Gold Config Package Architecture - Kaptio.pdf"

### For Implementation Teams
1. Share entire k-guides directory
2. Point to `index.html` as starting point
3. Reference markdown docs for technical details

### For Training
1. Present HTML guide page-by-page (21 pages = ~60 min presentation)
2. Use real ktdev45 data for live demos
3. Reference configuration checklists during hands-on sessions

---

## Acknowledgments

**Data Sources:**
- ktdev45 org (Bunnik sandbox Gold Config)
- kaptiotravel codebase (platform architecture)
- M1 demo plan (requirements and validation)

**Tools:**
- Kæ (Kaptio AI API) for schema exploration
- sfdx CLI for direct queries
- Cursor for codebase analysis

**Inspired By:**
- kaptio-connect-showcase (React/magazine format)
- transfer-architecture-magazine.html (booking numbers guide)
- KAPTIO_DESIGN_SYSTEM.md (design consistency)

---

## Lessons Learned

### What Worked Well
- **Kæ + sfdx combination:** Natural language exploration + precise queries
- **Codebase search:** Found object definitions and business logic quickly
- **Real data approach:** Using actual ktdev45 examples makes guide authentic
- **Magazine format:** Print-optimized HTML creates professional deliverables

### Challenges Overcome
- **Namespace discovery:** Initially tried KaptioTravel__ but org uses KTDEV45__
- **Field name variations:** Had to discover correct field names through trial
- **Complex relationships:** Payment/cancellation assignment hierarchy required deep dive

### Best Practices Confirmed
- **Field-based classification** is superior to record type proliferation
- **Template-based rules** (payment/cancellation) provide maximum flexibility
- **Automatic generation** (departures from allotments) eliminates manual errors
- **Component modularity** enables package reusability

---

## Quality Metrics

### Comprehensiveness
- ✅ All 6 package types documented
- ✅ Payment schedules fully explained
- ✅ Cancellation policies mapped completely
- ✅ Inventory system documented end-to-end
- ✅ Real examples for every concept

### Accuracy
- ✅ Based on 15+ SOQL queries to ktdev45
- ✅ Cross-validated against kaptiotravel codebase
- ✅ Verified against M1 demo requirements
- ✅ Real field values, not assumptions

### Usability
- ✅ Print-optimized for PDF sharing
- ✅ Page numbers and table of contents
- ✅ Visual hierarchy with color-coded sections
- ✅ Configuration checklists for implementation
- ✅ "Why it matters" explanations throughout

### Design Quality
- ✅ Kaptio Design System compliance
- ✅ Consistent typography (Lexend font)
- ✅ Proper color usage (teal primary, yellow CTA)
- ✅ Professional spacing and layout
- ✅ Magazine-quality presentation

---

## Impact on M1 Demo Preparation

This guide directly supports the Bunnik M1 demo (Nov 27, 2025):

### Section 1.1: Gold Config Foundation
✅ **"Docs: RF TODO"** → COMPLETE  
✅ Documentation for the 4 package models in M1 scope  
✅ Service structures explained  
✅ Price categories (Single/Double/Twin) documented  
✅ Allotment contracts explained  
✅ Pricing strategy and supplement handling covered

### Section 1.2: Flight Placeholder & Airfare Reconciliation
✅ **"Docs: Flight placeholder configuration guide"** → COMPLETE  
✅ Placeholder architecture fully documented  
✅ PNR import workflow explained  
✅ Cost variance tracking covered  
✅ Upgrade services commission separation documented

### General Demo Support
✅ Complete object model understanding (no blind spots)  
✅ Real examples ready for demo  
✅ Configuration patterns validated  
✅ Operational narratives prepared

---

## File Inventory

```
/Users/ragnarfjolnisson/Documents/2025 Coding/k-guides/
├── index.html                           ✅ 16 KB  - Navigation hub
├── gold-config-package-showcase.html    ✅ 103 KB - Main guide (21 pages)
├── PACKAGE_SCHEMA_ANALYSIS.md           ✅ 33 KB  - Field reference
├── COMPLETE_DATA_MODEL_REFERENCE.md     ✅ 31 KB  - Object relationships
├── README.md                            ✅ 7 KB   - Directory documentation
└── PROJECT_SUMMARY.md                   ✅ This file

Related:
└── ../quanta-docs-duvine/transfer-architecture-magazine.html  ✅ Booking numbers guide (linked from index)
```

---

## Ready for Use

### For Immediate Use
1. **Open** `index.html` in browser
2. **Navigate** to Gold Config Package Architecture
3. **Print** to PDF (Cmd+P, enable background graphics)
4. **Share** with implementation teams

### For M1 Demo (Nov 27)
- Guide covers all M1-scoped package models (Classic, Land+Air, Combo, Linked)
- Flight placeholder docs ready for Section 1.2
- Configuration patterns validated against demo requirements
- Can be presented page-by-page or shared as PDF

### For Future Guides
- Template established (magazine-style HTML)
- Design system in place (Kaptio colors, Lexend font)
- Navigation framework ready (index.html)
- Real data analysis approach proven

---

## What's Next

### Planned Future Guides

1. **Household Account Model** (from demo Section 3)
   - When to use vs person accounts
   - 7 scenarios documented in demo plan
   - Migration strategies

2. **Bed Type Defaulting** (from demo Section 1.4)
   - Service Level Mode configuration
   - Cascading selection logic
   - Sold-out handling (no auto-single fallback)

3. **Pre/Post Accommodation** (from demo Section 1.3)
   - Date-restricted component pattern
   - Multi-property configuration
   - Operational flexibility

4. **Departure Status Management** (from demo Section 1.11)
   - Status picklist configuration
   - Absolute mode setup
   - Online booking status control

5. **Payment Schedules Advanced** (from demo Section 1.8)
   - Policy matrix simplification
   - Bulk cancellation workflows
   - Exception handling

---

## Conclusion

This project successfully created **production-ready implementation documentation** that goes beyond typical field-level docs. 

By combining:
- Real data analysis (ktdev45 org)
- Codebase research (kaptiotravel repo)
- 20 years operational experience
- Magazine-style presentation
- Kaptio Design System

We've created guides that:
- **Explain** the "why" behind configurations
- **Show** real examples with actual field values
- **Guide** implementation with step-by-step checklists
- **Present** professionally for PDF sharing

**Status:** Phase 1 Complete ✅  
**Quality:** Production-ready  
**Format:** Magazine-style HTML + Technical markdown  
**Audience:** Implementation teams, business analysts, developers

---

**Total Time:** ~2 hours (exploration + documentation + design)  
**Total Output:** 6 files, 184 KB, 21-page showcase guide  
**Ready for:** M1 demo prep, implementation teams, stakeholder presentations




