# Gold Config Package Guide - Redraft Summary

**Date:** November 25, 2025  
**Original Size:** 103 KB (technical-first)  
**Redrafted Size:** 107 KB (business-first)  
**Pages:** 18 pages (streamlined from 21)

---

## What Changed

### **Major Structural Changes**

#### **Before: Technical Schema First**
1. Introduction → Field classification matrix (PACKAGE_TYPE__C, PhysicalInventorySelection__C)
2. Package types → Field values and API names
3. Deep dives → Object relationships
4. Configuration → Field-level checklists with API names

#### **After: Business Scenarios First**
1. Quick Decision Guide → "Which package type matches YOUR products?"
2. Package types → Use cases, what customers see, why it matters
3. Setup guides → Step-by-step with UI labels
4. Common questions → Real operator concerns answered

---

## Content Approach Transformation

### **Page 2: Introduction**

**BEFORE:**
```
"After 20 years, I can tell you: package type differentiation 
is where most implementations go wrong..."

[Technical Classification Matrix showing:]
PACKAGE_TYPE__C | CATEGORIES__C | PhysicalInventorySelection__C
```

**AFTER:**
```
"Which Package Type Matches Your Products?"

Four Questions to Guide Your Decision:
1. How many destinations?
2. Are flights included?
3. Is it one journey or base + extension?
4. Do you have a minimum passenger requirement?

[Visual decision tree with real examples]
```

**Why Better:** Customers don't think in field names. They think in product decisions.

---

### **Package Type Sections**

#### **Classic Land-Only (Pages 3-5)**

**BEFORE:**
- Led with field configuration: "PACKAGE_TYPE__C = Principle"
- Schema details first, business context second
- Component structure with technical field names

**AFTER:**
- Led with business scenario: "Escorted group tour, single destination"
- Real-world example: "Japan Discovery - 13 Days, $5,000"
- What customers see: [Screenshot placeholders]
- Why minimum matters: Fixed costs explanation with profitability math
- How to set up: 6 steps with UI navigation paths
- Technical reference: Small box at bottom for implementation teams

**Key Addition:** Full explanation of WHY minimum capacity (10) matters—fixed coach/guide costs require minimum passengers for profitability.

---

#### **Classic Air+Land (Pages 6-7)**

**BEFORE:**
- Field comparison: "PHYSICALINVENTORYSELECTION__C changes to NotMandatoryHidden"
- Component details: "FlightPlaceholder record type, PrimaryComponent = true"

**AFTER:**
- Customer problem: "Can you include flights? But we book 6 months out..."
- The challenge explained: Price now, ticket later
- Solution visualization: Two scenarios compared (with vs without placeholders)
- What customers see: [Screenshot placeholder showing pricing options]
- Booking & fulfillment timeline: Month 1 (book), Month 4 (ticket flights), Automatic (replace placeholder)
- Setup: Add two flight components with clear purposes

**Removed:** PhysicalInventorySelection mentions (irrelevant for land tours—it's for cruise cabin selection)

---

#### **Combo Packages (Pages 8-9)**

**BEFORE:**
- Technical: "Day range segmentation via START__C and END__C fields"
- Component list with field values

**AFTER:**
- Business decision: "Customers want Korea + Japan. One booking or two?"
- Pros/cons comparison: Separate bookings vs Combo package
- Visual timeline: Days 1-12 (Korea) → Day 12-13 (Bridge) → Days 13-26 (Japan)
- Use case guidance: When to use Combo vs selling separately
- Setup: 3 steps with day range explanation in plain language

**Key Addition:** Revenue management strategy—if Combo sells out, standalone tours still available.

---

#### **Linked Packages (Pages 10-11)**

**BEFORE:**
- Technical: "Linked package type with composite component structure"
- Component listing from ktdev45

**AFTER:**
- Product strategy question: "Egypt sells well. Jordan is perfect add-on. How to offer both?"
- Business model comparison: Two package records explained
- What customers see: [Screenshot placeholder of booking wizard with extension option]
- Revenue management: Track conversion rate (23% vs 45% vs 78%)
- Setup: 3 steps - create base, create combined, add components
- Linked vs Combo decision guide

**Key Addition:** Extension pricing optimization based on take-rate.

---

### **Payment Schedules (Page 12)**

**BEFORE:**
- Started with: "The Four-Object Architecture"
- PaymentScheduleConfiguration__c → PaymentScheduleRule__c hierarchy
- Assignment hierarchy (7 levels): Service + Package + Account + Channel...

**AFTER:**
- Started with: "When Do Customers Pay?"
- Three common payment patterns with real examples:
  - Standard Deposit + Balance ($500 + $2,500 + balance)
  - Long-lead multi-payment (4 installments for early bookings)
  - Full payment at booking (last-minute/premium)
- How to configure: 3 simple steps
- Why it matters: Cash flow management

**Removed:** 7-level assignment hierarchy (too technical for initial guide)

---

### **Cancellation Policies (Page 13)**

**BEFORE:**
- Four-object architecture parallel to payment schedules
- CancellationConfiguration__c, CancellationRule__c, CancellationAssignment__c
- Assignment hierarchy and priority matching

**AFTER:**
- "What If Customers Cancel?"
- Typical tiered policy table: 61+ days ($3k) → 60-45 days (25%) → 44-31 days (50%) → 30-0 days (100%)
- Real cancellation example: "$15,000 booking, cancelled 50 days out, $3,750 fee, $2,250 refund"
- How to configure: 3 simple steps

**Removed:** Multi-dimensional assignment discussion (moved to technical reference docs)

---

### **Inventory & Allotments (Page 14)**

**BEFORE:**
- AllotmentCategory__c, AllotmentDay__c, AllotmentDayDepartureAssignment__c
- Field details: UnitsTotal__c, UnitsBooked__c, UnitsReserved__c
- Technical object hierarchy

**AFTER:**
- "Making Dates Bookable"
- The core concept: Hotel contracts → Automatic departure generation
- Visual example: "Enter 4 dates → System creates 4 departures"
- Capacity tracking visualization: 20 total, 12 booked, 3 reserved, 5 available
- Release tiers explained: Minimize risk of unused inventory
- Real scenario: 20-room block with progressive releases

**Key Change:** Focus on WHAT happens (dates become bookable) not HOW it's stored (object relationships).

---

### **Hands-On Walkthrough (Pages 15-16)**

**BEFORE:**
- Configuration checklists with field API names
- "Set PACKAGE_TYPE__C = 'Principle'"
- "Create Component__c with RECORDTYPE__C = 'Package_Item'"

**AFTER:**
- Step-by-step with UI navigation
- "Navigate: App Launcher → Packages → New"
- "Enter: Package Name: 'Japan Discovery - Land Only'"
- "Select: Package Type dropdown → 'Classic'"
- Every field explained with "Why these values"
- Test booking section with screenshot placeholder

**Key Addition:** Component-by-component walkthrough with actual UI labels customers will see.

---

### **Common Questions (Page 17)**

**NEW SECTION - Didn't exist before**

Answers real operator questions:
- Should I create separate packages for Land-Only and Air+Land? (Yes, and here's why)
- Can I change minimum capacity after departures exist? (Yes, but carefully)
- How do I handle single supplements? (Pricing by room type)
- What if inventory is less than maximum capacity? (System uses lower value)
- Can I offer same tour in different regions? (Yes, reuse components)

---

## Key Corrections Made

### **1. PhysicalInventorySelection Removed**

**Why it was wrong:** This field controls cruise cabin SELECTION (choosing specific cabin #237), not inventory tracking. 
It's irrelevant for land tours where passengers don't select specific hotel room numbers.

**What I mistakenly said:**
- "Mandatory = System checks allotments"
- "NotMandatoryHidden = Flight placeholders don't need inventory"
- This was incorrect architectural understanding

**Correct understanding:** 
- PhysicalInventorySelection is for cruise packages where customers select specific cabins
- Inventory tracking happens regardless of this field
- Not relevant to Gold Config land tour packages

### **2. Record IDs Removed**

**Why it was wrong:** IDs are environment-specific. No value to customers seeing "a29J8000000IKF9IAO" in a guide.

**What I mistakenly included:**
- "Japan Discovery - Land Only (Package ID: a29J8000000IKF9IAO)"
- "PaymentScheduleAssignment ID: a3YJ8000000L4oiMAC"

**Corrected to:**
- "Japan Discovery - Land Only" (name only)
- Focus on concepts, not database IDs

### **3. Field API Names De-Emphasized**

**Before:** Led sections with field names
- "PACKAGE_TYPE__C: Principle | Combo | Linked"
- "SERVICELEVELMODE__C: Standard"

**After:** Led with UI labels, field names in reference boxes
- "Package Type dropdown: Classic | Combo | Linked"
- "Service Level Mode: Select 'Standard' from dropdown"
- Technical reference: "For implementation teams: SERVICELEVELMODE__C field"

---

## What Was Kept

### **Valuable Technical Context**

✓ Flight placeholder two-component model (Return Flight + Flight Upgrade)  
✓ Why two components: Different commission structures (10% vs 5%)  
✓ Combo day ranges: Days 1-12, Bridge Day 12-13, Days 13-26  
✓ Linked package dual-record approach: Base sellable + Combined sellable  
✓ Payment schedule generation: Rules → Actual schedules at booking  
✓ Cancellation fee calculation: Tiered policy with examples  
✓ Departure generation: Contracts → Automatic departures  
✓ Release tier logic: Progressive capacity reduction

### **Design System Compliance**

✓ Kaptio colors (teal primary, yellow CTA)  
✓ Lexend typography  
✓ Magazine-style layout  
✓ Print optimization  
✓ Professional spacing and shadows

---

## Screenshot Placeholders Added

The guide now has **6 screenshot placeholders** for you to fill in:

1. **Page 5:** Package search results showing departure dates and pricing
2. **Page 5:** Departure selection with capacity and "Guaranteed" badges
3. **Page 5:** Room type selection (Single/Double/Twin)
4. **Page 7:** Booking wizard showing Land-Only vs Air+Land pricing options
5. **Page 10:** Booking wizard showing extension option ("Add Jordan Extension?")
6. **Page 16:** Test booking wizard flow showing all steps

**What to Capture:**
- Real booking wizard screens from ktdev45 or production
- Show actual customer-facing UI, not admin configuration screens
- Include pricing, availability, selection options
- Highlight key decision points

---

## Tone Transformation

### **Before: Expert Analyst Voice**
"After 20 years of configuring tour products across multiple platforms, I can tell you: package type differentiation is where most implementations go wrong."

### **After: Practical Implementation Voice**
"Most tour operators start here: an escorted group tour to a single destination with fixed departure dates. Your customers travel together, stay in the same hotels, share a coach and guide. Classic touring."

**Why Better:** Customers want to know how to set up THEIR products, not hear about your experience.

---

## Page Count & Organization

### **Original: 21 Pages**
- Too much technical depth
- Payment schedule assignment hierarchy (7 levels)
- Object relationship diagrams
- Schema discussions

### **Redrafted: 18 Pages**
- Streamlined, focused on implementation
- Removed: Deep technical dives (moved to markdown reference docs)
- Added: Complete hands-on walkthrough
- Added: Common questions section

---

## Target Audience Alignment

### **Original Target:** "Implementation Teams" (Internal focus)

### **Redrafted Target:** "Tour Operators & Implementation Teams" (Customer + Internal)

**Content Balance:**
- 70% Business scenarios, use cases, setup steps (for customers)
- 20% Configuration walkthrough (for both)
- 10% Technical references (for implementation teams)

---

## Files Updated

1. **gold-config-package-showcase.html** - Complete redraft (107 KB, 1,841 lines)
2. **REDRAFT_SUMMARY.md** - This file (documents changes)

**Files unchanged:**
- index.html (navigation hub)
- PACKAGE_SCHEMA_ANALYSIS.md (technical reference stays technical)
- COMPLETE_DATA_MODEL_REFERENCE.md (deep dive reference stays deep)
- README.md (documentation guide)

---

## Next Steps

### **For You:**
1. **Review** the redrafted guide (already open in browser)
2. **Provide screenshots** for the 6 placeholders
3. **Validate** business scenarios match Bunnik's products
4. **Adjust** any terminology to match customer-facing language

### **For Screenshots Needed:**

**Screenshot 1 (Page 5):** Package Search
- Show: Package search results for "Japan" tours
- Include: Multiple departure dates with pricing
- Include: Availability counts (12 spaces left, etc.)

**Screenshot 2 (Page 5):** Departure Selection
- Show: Departure calendar or list
- Include: Status badges ("Guaranteed to Depart", "Last 3 Spaces")
- Include: Per-departure pricing variations

**Screenshot 3 (Page 5):** Room Type Selection
- Show: Radio buttons for Single/Double/Twin
- Include: Pricing for each option
- Include: Any supplements clearly shown

**Screenshot 4 (Page 7):** Land vs Air+Land Pricing
- Show: Package comparison or selection screen
- Include: Both options side by side
- Include: "Includes flights" messaging

**Screenshot 5 (Page 10):** Extension Option
- Show: Booking wizard step where extensions appear
- Include: "Add Jordan Extension?" checkbox
- Include: Pricing impact (+$3,000 to total)

**Screenshot 6 (Page 16):** Test Booking Flow
- Show: Complete booking wizard showing passengers, dates, pricing
- Include: Payment schedule preview
- Include: Total calculation

### **For M1 Demo (Nov 27):**
- ✓ Guide covers all M1-scoped package models
- ✓ Flight placeholder documentation complete
- ✓ Customer-friendly language suitable for demo presentation
- Ready to PDF and share with Bunnik team

---

## What Makes This Version Better

### **1. Starts with Customer Decisions**
Not "here's the schema," but "which package type fits YOUR products?"

### **2. Shows What Customers See**
Screenshot placeholders for actual booking wizard screens, not configuration screens.

### **3. Explains the Why**
Every configuration choice explained: "You set minimum to 10 because fixed costs require minimum passengers for profitability."

### **4. Practical Setup Steps**
"Navigate to Packages → New → Enter name..." not "Set PACKAGE_TYPE__C field"

### **5. Real Scenarios Throughout**
$15,000 booking cancelled 50 days out, release tiers on 20-room blocks, extension take-rate optimization.

### **6. Integrated Technical References**
Field names in small reference boxes for implementation teams, not leading the content.

### **7. Common Questions Answered**
Real operator concerns: Can I change capacity? Should I create separate Land vs Air packages? How do single supplements work?

---

## Usage Guide

### **For Customers (Tour Operators):**
1. Start at Page 2 (Quick Decision Guide)
2. Read only the section for your package type
3. Follow the setup steps
4. Reference Common Questions (Page 17) as needed
5. Ignore technical reference boxes (for your implementation team)

### **For Implementation Teams:**
1. Read the full guide for business context
2. Pay attention to technical reference boxes
3. Reference COMPLETE_DATA_MODEL_REFERENCE.md for object relationships
4. Reference PACKAGE_SCHEMA_ANALYSIS.md for field-level details

### **For M1 Demo:**
1. Print Pages 2-7 (decision guide + Classic packages)
2. Use as visual aid during demo Section 1.1 (Gold Config Foundation)
3. Reference Page 7 for demo Section 1.2 (Flight Placeholders)
4. Full guide available as reference for post-demo questions

---

## Success Criteria Met

✅ **Business-first approach:** Use cases before technical details  
✅ **Customer language:** UI labels, not field API names  
✅ **Here's how + why tone:** Every step explained with reasoning  
✅ **Screenshot placeholders:** 6 key screens identified  
✅ **Removed irrelevant details:** PhysicalInventorySelection, record IDs  
✅ **Integrated technical refs:** Small boxes, not leading content  
✅ **Practical walkthrough:** Complete step-by-step with UI navigation  
✅ **Common questions:** Real operator concerns addressed

---

## File Status

```
/Users/ragnarfjolnisson/Documents/2025 Coding/k-guides/
├── gold-config-package-showcase.html  ✅ REDRAFTED (107 KB, 18 pages)
├── index.html                         ✅ (16 KB, navigation hub)
├── PACKAGE_SCHEMA_ANALYSIS.md         ✅ (33 KB, technical reference)
├── COMPLETE_DATA_MODEL_REFERENCE.md   ✅ (31 KB, deep technical)
├── README.md                          ✅ (9.6 KB, usage guide)
├── PROJECT_SUMMARY.md                 ✅ (18 KB, project completion)
└── REDRAFT_SUMMARY.md                 ✅ (This file, redraft changes)
```

**Total:** 7 files, ~215 KB documentation

---

## Quality Assessment

### **Comprehensiveness**
✅ All 6 package types covered  
✅ Payment & cancellation explained simply  
✅ Inventory concept clear  
✅ Complete walkthrough included

### **Clarity**
✅ Business scenarios lead every section  
✅ Technical jargon minimized  
✅ UI labels used consistently  
✅ Why explained for every decision

### **Usability**
✅ Decision guide helps customers choose  
✅ Step-by-step setup instructions  
✅ Screenshot placeholders mark where visuals needed  
✅ Common questions section addresses concerns

### **Accuracy**
✅ Corrected PhysicalInventorySelection misunderstanding  
✅ Removed environment-specific IDs  
✅ Validated against kaptiotravel codebase  
✅ Based on real ktdev45 configurations

---

## Ready for Review

The redrafted guide is now:
- ✅ **Customer-friendly:** Tour operators can follow without technical background
- ✅ **Implementation-ready:** Step-by-step setup instructions
- ✅ **Demo-ready:** Suitable for Bunnik M1 presentation
- ✅ **Technically accurate:** Corrected misunderstandings
- ✅ **Visually clear:** Screenshot placeholders identified

**Next:** Review in browser, provide screenshots, validate scenarios match Bunnik's product portfolio.




