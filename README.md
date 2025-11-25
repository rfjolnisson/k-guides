# Kaptio Configuration Guides (k-guides)

**Purpose:** Implementation showcases and best practice documentation for Kaptio Travel platform configuration  
**Created:** November 25, 2025  
**Approach:** Opinionated analysis from 20 years of tour industry experience

---

## Overview

This repository contains **production-ready implementation guides** that combine:
- Real data analysis from live Kaptio implementations
- Architectural principles from the kaptiotravel codebase
- Operational best practices from two decades of tour operations

Unlike typical documentation that explains "what" fields do, these guides explain:
- **Why** configurations matter
- **How** they work together  
- **When** to use specific patterns
- **What** breaks if you configure incorrectly

---

## Contents

### 📄 Guides (HTML Format - Print-Optimized)

#### [Gold Config Package Architecture](gold-config-package-showcase.html)
**Status:** ✅ Complete  
**Format:** Magazine-style HTML (20+ pages, PDF-ready)  
**Source Data:** ktdev45 org (KTDEV45__ namespace)

**Covers:**
- All six package types (Classic Land, Classic Air+Land, Combo Land, Combo Air+Land, Linked Parent, Linked Combined)
- Flight placeholder architecture for air+land pricing
- Payment schedule configuration and assignment hierarchy
- Cancellation policy structure and fee calculation
- Inventory/allotment system and departure generation
- Service level mode and bed type defaulting
- Component structures with day ranges for multi-segment tours
- Complete configuration checklists for each package type

**Real Examples:** 13 packages analyzed with actual field values and component structures

**To View:** Open in browser, use Cmd+P / Ctrl+P to generate PDF

---

#### [Why Separate Booking Numbers Enable Better Guest Service](../quanta-docs-duvine/transfer-architecture-magazine.html)
**Status:** ✅ Complete  
**Format:** Magazine-style HTML (8 pages, PDF-ready)  
**Source Data:** 457 transfer operations across Railbookers, Audley Travel

**Covers:**
- Why single booking architecture fails for partial room transfers
- Financial reporting requirements by departure month
- TransactionTransfer audit trail architecture
- Room-level flexibility with mixed party decisions
- Real transfer scenarios from production systems

**Data-Driven:** Based on 30 days of actual transfer operations

---

### 📚 Technical References (Markdown Format)

#### [PACKAGE_SCHEMA_ANALYSIS.md](PACKAGE_SCHEMA_ANALYSIS.md)
**33 KB | 617 lines**

Field-level documentation of the Package object schema including:
- Complete field reference for Package__c
- Component object field reference
- Configuration patterns for all six package types
- Comparison matrix showing field differences
- Real ktdev45 data examples
- Architectural principles observed

**Use Case:** Reference guide while configuring packages

---

#### [COMPLETE_DATA_MODEL_REFERENCE.md](COMPLETE_DATA_MODEL_REFERENCE.md)
**31 KB | 712 lines**

Comprehensive object relationship map covering:
- Payment schedule architecture (4 objects, assignment hierarchy)
- Cancellation policy structure (4 objects, tiered rules)
- Inventory/allotment system (6 objects, unit tracking)
- Package departure generation flow
- Service level and pricing architecture
- Complete object relationship diagram
- Terms glossary for consistent language

**Use Case:** Deep technical reference for understanding how all objects connect

---

### 🏠 Index

#### [index.html](index.html)
Central navigation page linking to all guides and references

**To Use:** Open in browser as starting point for all documentation

---

## How to Use These Guides

### For Implementation Teams

1. **Start with:** Gold Config Package Architecture showcase
2. **Understand:** The six package types and when to use each
3. **Reference:** Technical markdown docs for field-level details
4. **Implement:** Follow configuration checklists

### For Business Analysts

1. **Read:** Architecture showcases to understand "why" not just "what"
2. **Present:** Print HTML guides as PDFs for stakeholder review
3. **Reference:** Use comparison matrices to explain tradeoffs

### For Developers

1. **Study:** Complete Data Model Reference for object relationships
2. **Search:** Package Schema Analysis for field definitions
3. **Code:** Use object hierarchy diagrams to understand query patterns

---

## Design System

All HTML guides follow the **Kaptio Design System**:

### Colors
- **Primary:** Teal/Cyan family (`#032E36` to `#EFF5F5`)
- **CTA:** Yellow (`#FFBC42`)
- **Accent:** Pink/Magenta (`#DE37A4`)
- **Neutrals:** White, black, and grey scale

### Typography
- **Font:** Lexend (300, 400, 500, 600, 700 weights)
- **Headings:** 700 weight, Kaptio Primary 800
- **Body:** 300 weight, Kaptio Black

### Print Optimization
- Letter size (8.5" × 11")
- Page breaks optimized for reading flow
- Background graphics enabled
- Magazine-style layout

---

## Generating PDFs

To create PDF versions of HTML guides:

1. Open guide in **Chrome** (recommended for best results)
2. Press **Cmd+P** (Mac) or **Ctrl+P** (Windows/Linux)
3. Configure:
   - Destination: **Save as PDF**
   - Paper size: **Letter** or **A4**
   - Margins: **Default**
   - ✅ **Enable "Background graphics"**
   - Scale: **100%**
4. Click **Save**

### Browser-Specific Tips

- **Chrome:** Best rendering, accurate colors
- **Safari:** May need manual "Print backgrounds" enable
- **Firefox:** Enable "Print backgrounds" in print dialog

---

## Data Sources

### Primary Sources

1. **ktdev45 org** (KTDEV45__ namespace)
   - 13 packages across 6 types
   - Real payment schedule configurations
   - Real cancellation policy assignments
   - Actual component structures

2. **kaptiotravel codebase**
   - Object metadata definitions
   - Business logic from Apex classes
   - PaymentScheduleAssignmentService logic
   - CancellationRuleService logic
   - InventoryManagementService patterns

3. **Railbookers & Audley production data**
   - 457 transfer operations (30 days)
   - Real booking scenarios
   - Financial reconciliation examples

### Analysis Tools Used

- **Kæ (Kaptio AI API):** Natural language queries to explore schema
- **sfdx CLI:** Direct SOQL queries for precise data extraction
- **Codebase search:** kaptiotravel repository analysis for object definitions

---

## Directory Structure

```
k-guides/
├── index.html                           # Central navigation (16 KB)
├── gold-config-package-showcase.html    # Complete package guide (103 KB)
├── PACKAGE_SCHEMA_ANALYSIS.md           # Field reference (33 KB)
├── COMPLETE_DATA_MODEL_REFERENCE.md     # Object relationships (31 KB)
└── README.md                            # This file
```

---

## Key Insights from Analysis

### 1. Field-Based Classification > Record Types
Package behavior is determined by three fields working together, not by record type hierarchies. This provides flexibility without structural complexity.

### 2. Flight Placeholders Are Pricing, Not Inventory
The two-component flight model (subsidized return + optional upgrade) enables air+land pricing without inventory complexity and supports separate commission structures.

### 3. Payment & Cancellation Are Template-Based
Configurations contain rules. Assignments link configurations to packages with hierarchical matching. Bookings generate actual schedules from those rules at booking time.

### 4. Allotments Drive Departure Generation
Departures are automatically generated from allotment availability, creating a direct link between supplier contracts and bookable dates.

### 5. Service Level Mode Enables Cascading Defaults
When set to "Standard," bed type selection on main tour cascades to all components, ensuring consistent room configuration throughout the trip with no auto-fallbacks.

### 6. NotMandatoryHidden vs Mandatory Has Operational Impact
This isn't a cosmetic difference—it determines whether the system checks inventory before allowing bookings. Classic Air+Land uses NotMandatoryHidden (flights don't need inventory), while everything else uses Mandatory.

---

## Future Guides (Planned)

- **Household Account Model:** When to use household vs person accounts, migration strategies
- **Payment Schedules Deep Dive:** Advanced assignment patterns, dynamic deposits
- **Cancellation Policies Deep Dive:** Multi-dimensional policy management
- **Inventory Management:** Allotment contracts, release tiers, capacity planning
- **Departure Status Management:** Status automation, absolute mode, online booking control
- **Bed Type Defaulting:** Service level configuration patterns
- **Pre/Post Accommodation:** Date-restricted multi-property components

---

## Version History

- **v1.0** (November 25, 2025): Initial release
  - Gold Config Package Architecture showcase (complete)
  - Package Schema Analysis (complete)
  - Complete Data Model Reference (complete)
  - Central index page

---

## Contributing

When adding new guides:

1. Follow the magazine-style HTML format (see gold-config-package-showcase.html as template)
2. Use Kaptio Design System for all colors, typography, spacing
3. Include real data examples from live orgs
4. Provide "why" explanations, not just "what" descriptions
5. Add to index.html with appropriate categorization
6. Update this README with guide details

---

## Support

For questions about these guides:
- **Technical Questions:** Review Complete Data Model Reference
- **Configuration Questions:** Review Package Schema Analysis
- **Operational Questions:** Review architecture showcases
- **Platform Support:** support@kaptio.com

---

**Built with ❤️ for the Kaptio ecosystem**  
**By:** Business Systems Analyst (20 years tour operations experience)  
**For:** Implementation teams, business analysts, developers


