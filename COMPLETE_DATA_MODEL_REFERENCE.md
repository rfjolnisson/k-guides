# Complete Kaptio Travel Data Model Reference

**Document Date:** November 25, 2025  
**Purpose:** Comprehensive reference for Gold Config package showcase guide  
**Source:** kaptiotravel codebase + ktdev45 org analysis  
**Author:** Business Systems Analyst

---

## Table of Contents

1. [Core Package Architecture](#core-package-architecture)
2. [Payment Schedules](#payment-schedules)
3. [Cancellation Policies](#cancellation-policies)
4. [Inventory & Allotments](#inventory--allotments)
5. [Package Departures](#package-departures)
6. [Component Structure](#component-structure)
7. [Pricing & Service Levels](#pricing--service-levels)
8. [Complete Object Relationship Map](#complete-object-relationship-map)

---

## Core Package Architecture

### Package Object (Package__c)

**Purpose:** Master product definition  
**Scope:** Template for tours that can be sold

**Key Field Groups:**

#### Type & Classification
- `PACKAGE_TYPE__C`: Principle | Combo | Linked
- `CATEGORIES__C`: Multi-select (Classic, History, Land Only, Air & Land, Food, etc.)
- `DEPARTURETYPE__C`: Fixed | Flex | Custom

#### Inventory Control
- `PHYSICALINVENTORYSELECTION__C`: Mandatory | NotMandatoryHidden
- `MIN_CAPACITY__C`: Minimum passengers to guarantee departure
- `TOTALCAPACITY__C`: Maximum passengers allowed
- `SERVICELEVELMODE__C`: Standard (enables bed type defaulting)

#### Pricing Configuration
- `NETPRICESETUPCHOICE__C`: Dynamic | Fixed
- `SELLINGPRICESETUPCHOICE__C`: Dynamic | Fixed
- `SELLPRICEROUNDING__C`: Rounding rules

#### Financial Assignment
- `COMMISSIONGROUP__C`: Lookup to commission configuration
- `PROFITABILITYGROUP__C`: Lookup to profitability tracking
- `DISCOUNTGROUP__C`: Lookup to discount rules

#### Metadata
- `LENGTH__C`: Tour duration in days
- `PACKAGESTARTLOCATION__C`: Starting city/location
- `PACKAGEENDLOCATION__C`: Ending city/location
- `ISACTIVE__C`: Currently bookable

---

## Payment Schedules

### Architecture Overview

Payment schedules use a **4-tier assignment hierarchy**:

```
1. Service + Package + Account + Channel (most specific)
2. Package + Account + Channel
3. Package + Channel
4. Package Only
5. Account + Channel (fallback)
6. Channel Only (fallback)
7. Account Only (fallback)
```

### Objects Involved

#### 1. PaymentScheduleConfiguration__c
**Purpose:** Container for a set of payment rules

**Example from ktdev45:**
- Config ID: `a3ZJ80000005JXqMAM`
- Used by: Japan Discovery - Land Only

#### 2. PaymentScheduleRule__c
**Purpose:** Individual payment milestone definition

**Fields:**
- `Type__c`: Deposit | Final Balance | Interim Payment
- `DateType__c`: 
  - After Booking
  - Before Travel  
  - After Travel
  - Fixed Date
  - Before Package Departure
  - After Package Departure
- `DaysOffset__c`: Number of days relative to date type
- `ChargeType__c`: Percentage | Per Person | Fixed
- `Value__c`: Amount or percentage value
- `PaymentScheduleConfiguration__c`: Parent configuration

**Real Example from ktdev45:**
```
Rule 1: Deposit, After Booking, 0 days, Per Person, $500
Rule 2: Deposit, After Booking, 45 days, Per Person, $2,500
Rule 3: Final Balance, Before Package Departure, 60 days
```

**Translation:**
- $500 per person due immediately at booking
- $2,500 per person due 45 days after booking
- Final balance due 60 days before package departure date

#### 3. PaymentScheduleAssignment__c
**Purpose:** Links payment schedule configurations to packages/services

**Fields:**
- `Package__c`: Lookup to Package
- `Service__c`: Lookup to Service (for service-level assignments)
- `Account__c`: Lookup to Account (for account-specific rules)
- `Channel__c`: Lookup to Channel (for channel-specific rules)
- `PaymentScheduleConfiguration__c`: Lookup to configuration
- `TravelDateFrom__c`: Optional date range start
- `TravelDateTo__c`: Optional date range end
- `TravelDateComparison__c`: Itinerary Start Date | Package Departure Date

**Why Multiple Assignments per Package?**

From ktdev45, Japan Discovery has multiple assignments for:
1. Different travel date ranges (peak season vs off-season)
2. Different accounts (corporate vs retail pricing)
3. Different channels (direct vs reseller payment terms)

#### 4. PaymentSchedule__c
**Purpose:** Actual payment milestone on an itinerary (booking)

Created when booking is made, generated from the rules.

**Fields:**
- `Itinerary__c`: Parent booking
- `Passenger__c`: For pay-per-pax scenarios
- `Type__c`: Matches rule type (Deposit, Final Balance, etc.)
- `DateType__c`: Matches rule date type
- `DaysOffset__c`: Matches rule offset
- `DueDate__c`: Calculated due date
- `Amount__c`: Calculated amount
- `AmountPaid__c`: Tracked as payments received
- `Status__c`: Pending | Paid | Overdue | Waived

### Payment Schedule Generation Flow

```
1. Customer books Japan Discovery for departure 2026-03-23
2. System finds PaymentScheduleAssignment for that package
3. Retrieves PaymentScheduleConfiguration: a3ZJ80000005JXqMAM
4. Loads 3 PaymentScheduleRules from that configuration
5. Generates 3 PaymentSchedule__c records:
   
   Schedule 1:
   - Type: Deposit
   - Due Date: 2025-11-25 (today, booking date + 0 days)
   - Amount: $500 × 2 passengers = $1,000
   
   Schedule 2:
   - Type: Deposit
   - Due Date: 2026-01-09 (booking date + 45 days)
   - Amount: $2,500 × 2 passengers = $5,000
   
   Schedule 3:
   - Type: Final Balance
   - Due Date: 2026-01-22 (departure date - 60 days)
   - Amount: Package total - deposits paid
```

### Dynamic Deposit Feature

**Field on Itinerary:** `DynamicDepositEnabled__c`, `DynamicDepositCover__c`

If enabled, the system calculates deposit amount dynamically to cover a percentage of supplier costs (e.g., 30% deposit covers all non-refundable supplier deposits).

### Pay Per Pax vs Pay Per Itinerary

**Field on Itinerary:** `EnablePassengerPayments__c`

- **Pay Per Itinerary** (default): One set of payment schedules for the whole booking
- **Pay Per Pax**: Individual payment schedules per passenger (allows split payments)

---

## Cancellation Policies

### Architecture Overview

Similar to payment schedules, cancellations use a **hierarchical assignment** structure.

### Objects Involved

#### 1. CancellationConfiguration__c
**Purpose:** Container for cancellation policy rules (replaces old CancellationPolicy__c)

**Example from ktdev45:**
- Config ID: `a3oJ8000000bpBQIAY`
- Used by: Japan Discovery packages

#### 2. CancellationRule__c
**Purpose:** Tiered cancellation fee structure

**Fields:**
- `CancellationConfiguration__c`: Parent configuration
- `RuleName__c`: Descriptive name (e.g., "30 to 0 days prior")
- `DateType__c`: Before Travel | After Travel | Fixed Date
- `DaysOffset__c`: Days relative to travel start
- `ValueType__c`:
  - Percentage Per Person
  - Fixed Per Person
  - Percentage of Total
  - Fixed Total
- `Value__c`: Fee amount or percentage
- `Priority__c`: Rule matching priority (lower = higher priority)

**Real Example from ktdev45:**
```
Rule 1 (Priority 0): 61+ days before travel → $3,000 fixed per person
Rule 2 (Priority 0): 60-45 days before travel → 25% per person
Rule 3 (Priority 0): 44-31 days before travel → 50% per person
Rule 4 (Priority 0): 30-0 days before travel → 100% per person (no refund)
```

**Rule Matching Logic:**

When a cancellation occurs 50 days before travel:
1. System checks rules in priority order
2. Rule 1 (61+ days): 50 < 61, doesn't match
3. Rule 2 (60-45 days): 60 >= 50 >= 45, **MATCHES**
4. Applies 25% cancellation fee

#### 3. CancellationAssignment__c
**Purpose:** Links cancellation configurations to packages/services

**Fields:**
- `Package__c`: Lookup to Package
- `Service__c`: Lookup to Service
- `Account__c`: Lookup to Account
- `Channel__c`: Lookup to Channel
- `CancellationConfiguration__c`: Lookup to configuration
- `PriceCategory__c`: Lookup to price category (e.g., Single vs Double room)
- `TravelDateFrom__c`: Optional date range
- `TravelDateTo__c`: Optional date range

**Why Multiple Assignments per Package?**

From ktdev45, Japan Discovery - Land Only has **4 cancellation assignments**:
1. One for each price category (Single, Double, Twin)
2. One for each date range (peak season may have stricter policies)

**Assignment Hierarchy:**
1. Service + Package + Account + Channel + Price Category (most specific)
2. Package + Account + Channel + Price Category
3. Package + Channel + Price Category
4. Package + Price Category
5. Channel + Account (fallback)
6. Channel Only (fallback)

#### 4. CancellationGroupRule__c
**Purpose:** Groups services together for bulk cancellation

When cancelling a package, all services in the same cancellation group are cancelled together.

**Field on Service:** `CancellationGroup__c`

#### 5. SupplierCancellationPolicy__c & SupplierCancellationRule__c
**Purpose:** Track supplier-side cancellation terms

While guest cancellation policies determine what guests pay, supplier policies determine what the operator must pay suppliers.

**Financial Reconciliation:**
```
Guest cancels 50 days before travel:
- Guest cancellation fee: 25% = $3,750 (from CancellationRule)
- Supplier cancellation fee: 10% = $1,500 (from SupplierCancellationRule)
- Net to operator: $3,750 - $1,500 = $2,250
```

### Cancellation Fee Calculation Flow

```
1. Passenger requests cancellation 50 days before departure
2. System finds CancellationAssignment for package + price category
3. Retrieves CancellationConfiguration: a3oJ8000000bpBQIAY
4. Loads CancellationRules, sorted by priority
5. Calculates days to travel: 50 days
6. Matches Rule: "60-45 days" → 25% per person
7. Package cost: $15,000 for 2 people
8. Cancellation fee: $15,000 × 0.25 = $3,750 per cancelled passenger
9. Creates cancellation transaction
10. Updates itinerary status
```

---

## Inventory & Allotments

### Architecture Overview

Kaptio's inventory system tracks **physical capacity** (hotel rooms, bus seats, guide capacity) using **allotments**.

### Objects Involved

#### 1. AllotmentCategory__c
**Purpose:** Container for inventory contracts (replaces InventoryContract__c)

**Examples:**
- "Hotel Block - Tokyo Hyatt - March 2026"
- "Coach Capacity - Europe Tours - Summer 2026"
- "Guide Availability - Egypt Guides - 2026"

**Fields:**
- `Name`: Contract name
- `Supplier__c`: Lookup to supplier account
- `StartDate__c`: Contract start
- `EndDate__c`: Contract end
- `AllotmentType__c`: Hard Allotment | Soft Allotment | On Request

#### 2. AllotmentDay__c
**Purpose:** Daily inventory units

**Fields:**
- `Date__c`: Specific date
- `AllotmentCategory__c`: Parent category
- `UnitsTotal__c`: Total units available
- `UnitsBooked__c`: Units consumed by confirmed bookings
- `UnitsReserved__c`: Units held by quotes/pending bookings
- `UnitsAvailable__c`: Formula: Total - Booked - Reserved
- `UnitsReleased__c`: Units released back to supplier
- `UnitsTemporaryHeld__c`: Units in shopping cart
- `Release1Day__c`, `Release1Units__c`: First release date & units
- `Release2Day__c`, `Release2Units__c`: Second release date & units
- `Release3Day__c`, `Release3Units__c`: Third release date & units
- `Release4Day__c`, `Release4Units__c`: Fourth release date & units

**Release Logic Example:**
```
Allotment: 20 rooms, Dec 15, 2026
Release 1: 60 days before (Oct 16), release 5 units → 15 remain
Release 2: 30 days before (Nov 15), release 5 units → 10 remain
Release 3: 14 days before (Dec 1), release 5 units → 5 remain
Release 4: 7 days before (Dec 8), release 5 units → 0 remain (free sale)
```

#### 3. AllotmentCategoryComponentAssignment__c
**Purpose:** Links inventory to package components

**Fields:**
- `AllotmentCategory__c`: Which inventory contract
- `Component__c`: Which package component
- `Item__c`: Which specific service (via ComponentOption)

**Example:**
```
Assignment:
- Allotment: "Hotel Block - Tokyo Hyatt - March 2026"
- Component: "Japan Discovery - Tour Inventory"
- Item: Service "Tokyo Hyatt Accommodation"
```

#### 4. AllotmentDayDepartureAssignment__c
**Purpose:** Links specific allotment days to package departures

**Why This Matters:**

A package departure on March 23 might consume inventory from multiple services across multiple days:

```
Japan Discovery Departure: March 23, 2026

Day 1 (Mar 23): Tokyo Hyatt → AllotmentDay Mar 23
Day 2 (Mar 24): Tokyo Hyatt → AllotmentDay Mar 24
Day 3 (Mar 25): Coach to Kyoto → AllotmentDay Mar 25
Day 4 (Mar 26): Kyoto Hotel → AllotmentDay Mar 26
... etc
```

Each allotment day is linked to the package departure so inventory can be:
- Reserved when quote is created
- Booked when itinerary is confirmed
- Released when booking is cancelled

#### 5. InventorySeasonStatus__c (Legacy Name for Allotment Contract)
**Purpose:** Defines which packages can access which inventory

**Fields:**
- `AllotmentPackageSupportId__c`:
  - "0" = Available to all packages
  - "2" = Available only to assigned packages
  - "3" = Not available to packages (standalone service only)

#### 6. PackageAllotmentAssignment__c
**Purpose:** Explicitly assigns inventory to specific packages

Used when `AllotmentPackageSupportId__c = "2"` (restricted inventory).

**Example:**
```
Inventory: "Premium Guide - High Season"
Package Assignments:
- Japan Discovery (has access)
- South Korea in Depth (has access)
- Budget Asia Tour (NO access)
```

#### 7. InventorySeasonStatusAssignment__c
**Purpose:** Links inventory to price categories

**Why This Matters:**

Single room passengers might use different inventory than double room passengers:

```
Hotel Block A: 10 double rooms
Hotel Block B: 5 single rooms

Package: Japan Discovery
Price Category: Double → Uses Hotel Block A inventory
Price Category: Single → Uses Hotel Block B inventory
```

### Inventory Tracking Flow

```
1. Customer books Japan Discovery for 2 passengers, March 23 departure
2. System finds AllotmentCategoryComponentAssignments for package components
3. Loads AllotmentDays for dates March 23-April 4 (13-day tour)
4. Checks UnitsAvailable for each allotment day
5. If sufficient: Creates AllotmentDayDepartureAssignments
6. Updates AllotmentDay fields:
   - UnitsReserved__c += 2 (if quote)
   - UnitsBooked__c += 2 (if confirmed)
7. Recalculates UnitsAvailable__c = Total - Booked - Reserved
```

### Physical Inventory Selection Modes

Recall from Package object:

**`PHYSICALINVENTORYSELECTION__C`**:

- **Mandatory**: Package MUST have inventory to be bookable
  - Used by: Land-only packages, Combo packages
  - Booking wizard checks inventory before allowing booking
  - Departures without inventory appear as "Sold Out"

- **NotMandatoryHidden**: Package doesn't require physical inventory
  - Used by: Classic Air+Land packages (flight placeholders don't need inventory)
  - Booking wizard doesn't check flight placeholder inventory
  - Land portions still require inventory

**Why Air+Land Packages Use NotMandatoryHidden:**

```
Japan Discovery - Air & Land
Components:
- Return Flight (FlightPlaceholder) → No inventory check
- Tour Inventory → Requires inventory ✓
- Room Configuration → Requires inventory ✓
- Pre-Stay Hotel → Requires inventory ✓
```

The flight placeholder is a **pricing component**, not an inventory component. The system doesn't check if "flight inventory" exists because flights are booked on-demand via Connect gateways.

---

## Package Departures

### PackageDeparture__c

**Purpose:** Specific instance of a package on a specific date

Think of Package as a "template" and PackageDeparture as an "event."

**Key Fields:**

#### Identification
- `Package__c`: Parent package template
- `Date__c`: Departure date
- `Name`: Auto-generated (e.g., "23/3/2026 Japan Discovery - Land Only_PRICE")

#### Status Management
- `Active__c`: Currently bookable (Boolean)
- `DepartureStatus__c`: Open | Guaranteed to Run | Sold Out | Cancelled
- `BookingEligibility__c`: Controls online booking availability

**Status vs Active:**
- `Active__c = true` + `DepartureStatus__c = Open` → Bookable
- `Active__c = true` + `DepartureStatus__c = Guaranteed` → Bookable + "Guaranteed" badge
- `Active__c = false` → Not bookable regardless of status

#### Capacity
- `MinGroupSize__c`: Minimum passengers (can override package-level)
- `MaxGroupSize__c`: Maximum passengers (can override package-level)

#### Metadata
- `Comments__c`: Operational notes (often from allotment descriptions)
- `DepartureType__c`: Inherited from package

### Departure Generation

**Two Methods:**

#### Method 1: From Allotments (Most Common)

```
Package has components with services
Services have AllotmentCategoryComponentAssignments
Allotments have AllotmentDays with specific dates
System generates PackageDeparture for each valid date combination
```

**Example:**
```
Component: "Tour Inventory"
Service: "Japan Guide Services"
Allotment: "Guide Availability - March 2026"
AllotmentDays: March 5, 12, 19, 26

Generated Departures:
- March 5, 2026
- March 12, 2026
- March 19, 2026
- March 26, 2026
```

#### Method 2: From Time Schedules (For Non-Inventory Services)

Used for services that don't require physical inventory (e.g., transfers on-demand).

### Departure-Level Configuration Overrides

**Absolute Mode** (from demo requirements):

Per-departure settings can override package-level defaults:

```
Package: Japan Discovery
- Default Status: Active

Departure April 15:
- Status: Guaranteed to Run (absolute mode override)
- Shows "Guaranteed" badge on website

Departure May 20:
- Status: Sold Out (absolute mode override)
- Not bookable

Departure June 10:
- (No override, inherits package default: Active)
```

### Relationship to Other Objects

```
PackageDeparture
├── Linked to Allotments (via AllotmentDayDepartureAssignment)
├── Generates Itineraries (bookings)
├── Used by Payment Schedules (for "Before Package Departure" rules)
├── Used by Cancellation Rules (for "Before Travel" calculations)
└── Displayed in Package Search (with capacity/status)
```

---

## Component Structure

### Component__c

**Purpose:** Building blocks of packages

A package is composed of multiple components, each representing a different aspect of the tour.

**Component Types (via RecordType field: `RECORDTYPE__C`):**

1. **Package_Item**: Main tour content components
2. **FlightPlaceholder**: Air pricing components
3. **Accommodation**: Pre/post-stay hotels
4. **Activity**: Optional excursions
5. **Extra**: Add-ons (tipping, audio guides, etc.)
6. **Transfer**: Airport/station transfers

**Key Fields:**

#### Behavior Configuration
- `COMPONENTTYPE__C`:
  - **PriceCategories**: Supports service level selection (Single/Double/Twin)
  - **Fixed**: One price for all
  - **Quantity**: Price per unit quantity

- `SELECTIONTYPE__C`:
  - **Required**: Must be included
  - **Optional**: Customer can choose to add
  - **Alternative**: Choose one from a group

- `PRIMARYCOMPONENT__C`: Boolean, affects package total calculation
- `ISMAINTOURCOMPONENT__C`: Boolean, designates main pricing component
- `PACKAGETOTALS__C`:
  - **IncludedInPackageTotal**: Price included in package total
  - **ExcludedFromPackageTotal**: Price shown separately (e.g., flight upgrades)

#### Inventory Configuration
- `INVENTORYREQUIRED__C`: Boolean, whether component needs allotments
- `ALLOCATIONBEHAVIOR__C`: Standard | Custom allocation logic

#### Day Range (For Combo/Linked Packages)
- `START__C`: Starting day number
- `END__C`: Ending day number

**Example:**
```
Combo Package: South Korea & Japan (27 days)

Component: "South Korea Tour Inventory"
- START__C: 1
- END__C: 12
- Days 1-12

Component: "Tokyo Overnight Stay"
- START__C: 12
- END__C: 13
- Bridge between tours

Component: "Japan Tour Inventory"
- START__C: 13
- END__C: 26
- Days 13-26
```

#### Booking Wizard Configuration
- `BOOKINGWIZARDTAB__C`: Which tab/step in booking wizard
- `SORT__C`: Display order
- `DAYBYDAYDISPLAY__C`: Show | Hide | Inherit

### ComponentOption__c

**Purpose:** Links components to specific services

**Why the Junction Object?**

A component can offer multiple service options:

```
Component: "Pre-Stay Hotel - Tokyo"
├── ComponentOption 1 → Service: "Park Hyatt Tokyo"
├── ComponentOption 2 → Service: "Conrad Tokyo"
└── ComponentOption 3 → Service: "Andaz Tokyo"
```

Customer sees one "Pre-Stay Hotel" choice in booking wizard, but can select from 3 hotels.

**Key Fields:**
- `Component__c`: Parent component
- `Item__c`: Lookup to Service (the actual service record)
- `Bundle__c`: For service bundles
- `IsDefault__c`: Boolean, pre-selected option

### ComponentDepartureAssignment__c

**Purpose:** Override component configuration per departure

**Example:**
```
Component: "Optional Excursion - Cherry Blossom Viewing"

Normal Departures: Not available

April Departures (cherry blossom season):
- ComponentDepartureAssignment overrides availability
- Component shows in booking wizard for April only
```

---

## Pricing & Service Levels

### Service Levels (Price Categories)

**ServiceCabin__c Object** (confusingly named, but it's the service level/price category):

**Purpose:** Define pricing tiers (Single, Double, Twin, Suite, etc.)

**Fields:**
- `Name`: "Single Room", "Double Room", "Twin Room"
- `Service__c`: Parent service
- `CabinCode__c`: Short code (e.g., "SGL", "DBL", "TWN")
- `SellPrice__c`: Price for this service level
- `NetPrice__c`: Cost for this service level

**Why Multiple Service Levels?**

Hotel services need different pricing based on occupancy:

```
Service: "Tokyo Hyatt - Standard Room"
├── Service Level: Single Room → $200/night
├── Service Level: Double Room → $150/night per person
└── Service Level: Twin Room → $150/night per person
```

### PackageServiceLevelAssignment__c

**Purpose:** Links service levels to packages

This is what enables **bed type defaulting** (from demo requirements).

**When `SERVICELEVELMODE__C = "Standard"` on package:**

```
Package: Japan Discovery
PackageServiceLevelAssignments:
├── Single Room (across ALL components)
├── Double Room (across ALL components)
└── Twin Room (across ALL components)
```

**Booking Flow:**
1. Customer selects "Twin Room" on main tour component
2. System checks PackageServiceLevelAssignments
3. Auto-selects "Twin Room" for:
   - Pre-stay hotel
   - Post-stay hotel
   - Main tour
   - Optional excursions
4. If Twin sold out on ANY component → entire selection blocked
5. Customer sees "Waitlist" option

**No Auto-Single Fallback** (per demo requirements):

If Twin is sold out, system does NOT automatically change to Single (which would double the price). Customer must explicitly choose a different room type or join waitlist.

### Package Pricing Objects

#### PackagePrice__c
**Purpose:** Price per price category per package

**Fields:**
- `Package__c`: Parent package
- `ServiceCabin__c`: Price category (Single/Double/Twin)
- `SellPrice__c`: Selling price
- `NetPrice__c`: Cost

**Dynamic Pricing:**

When `SELLINGPRICESETUPCHOICE__C = "Dynamic"`:

```
Package: Japan Discovery

PackagePrice for Double Room:
├── Base Price: $5,000
└── Varies by Departure:
    ├── March departures (cherry blossom): +$800 = $5,800
    ├── July departures (summer): Base $5,000
    └── November departures (off-season): -$500 = $4,500
```

#### PackagePriceDepartureAssignment__c
**Purpose:** Override package-level pricing per departure

Enables departure-specific pricing adjustments.

---

## Complete Object Relationship Map

```
PACKAGE TEMPLATE LAYER
═══════════════════════════════════════════════════════════════

Package__c (Product Template)
│
├─── Components (Package__c → Component__c)
│    │
│    ├─── ComponentOptions (Component__c → ComponentOption__c → Item__c/Service)
│    │    │
│    │    └─── ServiceCabins (Service__c → ServiceCabin__c) [Price Categories]
│    │
│    └─── ComponentDepartureAssignments (Component__c ← ComponentDepartureAssignment__c)
│
├─── PackageServiceLevelAssignments (Package__c ← PackageServiceLevelAssignment__c → ServiceCabin__c)
│
├─── PackagePrices (Package__c ← PackagePrice__c → ServiceCabin__c)
│
├─── PaymentScheduleAssignments (Package__c ← PaymentScheduleAssignment__c → PaymentScheduleConfiguration__c)
│    │
│    └─── PaymentScheduleRules (PaymentScheduleConfiguration__c ← PaymentScheduleRule__c)
│
├─── CancellationAssignments (Package__c ← CancellationAssignment__c → CancellationConfiguration__c)
│    │
│    └─── CancellationRules (CancellationConfiguration__c ← CancellationRule__c)
│
└─── PackageAllotmentAssignments (Package__c ← PackageAllotmentAssignment__c → InventorySeasonStatus__c)


INVENTORY LAYER
═══════════════════════════════════════════════════════════════

AllotmentCategory__c (Inventory Contract)
│
├─── AllotmentDays (AllotmentCategory__c ← AllotmentDay__c)
│    │
│    └─── Units Tracking:
│         ├─── UnitsTotal__c
│         ├─── UnitsBooked__c
│         ├─── UnitsReserved__c
│         ├─── UnitsAvailable__c
│         └─── Release tiers (1-4)
│
├─── AllotmentCategoryComponentAssignments
│    (AllotmentCategory__c ← AllotmentCategoryComponentAssignment__c → Component__c)
│
└─── InventorySeasonStatusAssignments
     (InventorySeasonStatus__c ← InventorySeasonStatusAssignment__c → ServiceCabin__c)


DEPARTURE LAYER
═══════════════════════════════════════════════════════════════

PackageDeparture__c (Specific Date Instance)
│
├─── Linked to Package (Package__c ← PackageDeparture__c)
│
├─── AllotmentDayDepartureAssignments
│    (PackageDeparture__c ← AllotmentDayDepartureAssignment__c → AllotmentDay__c)
│
├─── PackagePriceDepartureAssignments
│    (PackageDeparture__c ← PackagePriceDepartureAssignment__c → PackagePrice__c)
│
└─── Generates Itineraries (PackageDeparture__c → Itinerary__c)


BOOKING LAYER
═══════════════════════════════════════════════════════════════

Itinerary__c (Actual Booking)
│
├─── Account (Account__c → Itinerary__c)
├─── Channel (Channel__c → Itinerary__c)
├─── PackageDeparture (PackageDeparture__c → Itinerary__c)
│
├─── Itinerary_Items (Itinerary__c ← Itinerary_Item__c)
│    │
│    └─── Links to:
│         ├─── Package__c (which package component)
│         ├─── Item__c (which service)
│         └─── DateFrom__c, DateTo__c (when)
│
├─── Passengers (Itinerary__c ← Passenger__c)
│    │
│    └─── ServiceAllocations (Passenger__c ← ServiceAllocation__c → Itinerary_Item__c)
│         (Assigns passenger to specific service level: Single/Double/Twin)
│
├─── PaymentSchedules (Itinerary__c ← PaymentSchedule__c)
│    │
│    └─── Generated from PaymentScheduleRules
│         ├─── Type__c (Deposit, Final Balance)
│         ├─── DueDate__c (Calculated)
│         ├─── Amount__c (Calculated)
│         └─── Status__c (Pending, Paid, Overdue)
│
└─── Transactions (Itinerary__c ← Transaction__c)
     │
     └─── Types:
          ├─── Sell (package price)
          ├─── Payment (money received)
          ├─── Cancellation Fee
          ├─── Commission
          └─── Tax
```

---

## Key Insights for Guide Creation

### 1. Payment Schedules Are Template-Based

**Don't say:** "Packages have payment schedules"  
**Do say:** "Packages are assigned payment schedule configurations that contain rules. When a booking is made, the system generates actual payment schedule milestones from those rules."

### 2. Cancellation Policies Are Multi-Dimensional

**Don't say:** "Each package has a cancellation policy"  
**Do say:** "Packages can have multiple cancellation assignments—one per price category, date range, and sales channel—allowing operators to have different cancellation terms for peak season doubles vs off-season singles."

### 3. Inventory Is Component-Specific

**Don't say:** "Packages have inventory"  
**Do say:** "Package components are linked to allotment categories via component assignments. A 13-day tour might consume inventory from 30+ different allotment days across hotels, coaches, guides, and activities."

### 4. Departures Are Generated, Not Manual

**Don't say:** "Create departures for each date"  
**Do say:** "Departures are generated automatically from allotment availability. When a hotel contract has 10 available dates, the system generates 10 package departures."

### 5. Service Levels Enable Bed Type Defaulting

**Don't say:** "Customers select room types"  
**Do say:** "Service level mode 'Standard' enables bed type defaulting. When customers select 'Twin' on the main tour, the system cascades that choice across all components, ensuring consistent room configuration throughout the trip."

### 6. Flight Placeholders Are Pricing, Not Inventory

**Don't say:** "Air packages have flight components"  
**Do say:** "Air packages use flight placeholder components with NotMandatoryHidden inventory mode. These are pricing mechanisms that hold the subsidized flight cost delta, not inventory components. Actual flights are booked on-demand via Connect gateways."

### 7. Primary Components Control Package Behavior

**Don't say:** "All components are equal"  
**Do say:** "Primary components affect package total calculation and availability. A package with 5 components might have 2 primary components that determine the base price, while 3 optional components are add-ons excluded from package total."

### 8. Dynamic Pricing Flows Through the System

**Don't say:** "Packages have fixed prices"  
**Do say:** "When a package uses dynamic pricing, base package prices can vary by departure, and those variations cascade to component pricing, service level supplements, and ultimately to the quoted price customers see."

---

## Terms to Use Consistently in Guide

**Use These Terms:**
- Package (not "tour template", not "product")
- Component (not "service", not "item")
- Service (the actual deliverable: hotel, flight, guide)
- Service Level / Price Category (not "room type", not "cabin")
- Allotment (not "inventory", not "availability")
- PackageDeparture (not "departure date", not "scheduled tour")
- Itinerary (not "booking", not "reservation")
- Configuration (not "policy", not "rule set")
- Assignment (not "link", not "connection")

**Hierarchy:**
```
Package (Template)
  ↓ generates
PackageDeparture (Specific Date)
  ↓ creates
Itinerary (Actual Booking)
  ↓ contains
Itinerary_Items (Booked Services)
```

---

## Document Status

**Completeness:** ✓ Core architecture mapped  
**Validation:** ✓ Verified against ktdev45 real data  
**Ready for Guide Creation:** ✓ Yes

**Next Step:** Create HTML showcase guide following transfer-architecture-magazine.html format, incorporating this complete data model understanding.




