# Sophia Sheet Simplified Contract Specification

**Version:** 1.0  
**Date:** November 26, 2025  
**For:** Bunnik Tours - Sophia Sheet Integration

---

## Overview

This document specifies the **simplified JSON contract** that Bunnik can generate from their Sophia Sheet Excel files. This contract is ~95% simpler than Gold Config format while capturing all essential package data.

### The Translation Layer

```
Sophia Sheet (Excel)
       ↓
[Your Python/JS Script]  ← You control this
       ↓
Simplified JSON  ← This specification
       ↓
[Kaptio Adapter UI]  ← We provide this
       ↓
Gold Config Bundle (135+ records)
       ↓
[Salesforce Deployment]
```

**You own:** Excel → Simplified JSON  
**We provide:** Simplified JSON → Salesforce

---

## Contract Size Comparison

| Format | Lines | Size | Complexity |
|--------|-------|------|------------|
| **Sophia Simplified** | ~100-200 | 1-2 KB | ⭐ Simple |
| **Gold Config Bundle** | ~3,500 | 200 KB | ⭐⭐⭐⭐⭐ Complex |

**Reduction:** 95% less verbose, ~18x compression

---

## Minimal Valid Example

The absolute minimum Sophia JSON:

```json
{
  "package": {
    "name": "Italian Wine Country",
    "duration_days": 8,
    "type": "land_only"
  },
  "components": [
    {
      "name": "Main Tour",
      "type": "tour_inventory"
    }
  ],
  "pricing": {
    "currency": "EUR",
    "room_prices": {
      "double_per_person": 3200
    }
  },
  "departures": [
    {"date": "2026-05-15"}
  ],
  "payment_schedule": {
    "deposit": 500,
    "final_balance_days_before": 60
  },
  "cancellation_policy": {
    "tiers": [
      {"days_before": "61+", "fee_type": "fixed", "amount": 2000}
    ]
  }
}
```

**This 300-character JSON generates 20+ Salesforce records!**

---

## Field Reference

### Package Section

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | Package display name | "South American Discovery" |
| `duration_days` | integer | ✅ Yes | Tour length | 15 |
| `type` | enum | ✅ Yes | Package type | "land_only", "air_land", "combo_land", "combo_air", "linked" |
| `description` | string | No | Marketing description | "15-day guided tour..." |
| `capacity.min` | integer | No | Minimum passengers | 10 |
| `capacity.max` | integer | No | Maximum passengers | 20 |
| `start_location` | string | No | Starting city | "Lima" |
| `end_location` | string | No | Ending city | "Buenos Aires" |
| `categories` | array | No | Filter categories | ["classic", "history", "food"] |
| `minimum_age` | integer | No | Age requirement | 18 |
| `pace` | enum | No | Activity level | "easy", "moderate", "active", "challenging" |

---

### Components Section

Array of components (minimum 1 required):

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | Component name | "Room Configuration" |
| `type` | enum | ✅ Yes | Component type | "tour_inventory", "room_configuration", "accommodation", "activity", "flight_placeholder", "extra" |
| `required` | boolean | No (default true) | Is required? | false |
| `day_range.start` | integer | No | For combo packages | 1 |
| `day_range.end` | integer | No | For combo packages | 12 |
| `max_nights` | integer | No | For accommodations | 3 |
| `room_types` | array | No | For room_configuration | ["single", "double", "twin"] |

**Component Types:**
- `tour_inventory` - Main tour component (always include one marked as main)
- `room_configuration` - Room type selection (generates price categories)
- `accommodation` - Pre/post stays or mid-tour hotels
- `activity` - Optional excursions
- `flight_placeholder` - For air+land packages
- `extra` - Add-ons (headsets, tips, etc.)

---

### Pricing Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currency` | string | ✅ Yes | ISO code (USD, EUR, GBP, AUD) |
| `room_prices.single` | number | No | Single room price (1 person) |
| `room_prices.double_per_person` | number | No | Double room per person |
| `room_prices.twin_per_person` | number | No | Twin room per person |
| `seasonal_pricing[]` | array | No | Seasonal price variations |
| `single_supplement` | number | No | Extra charge for single room |

**Pricing Logic:**
- Specify prices for each room type you offer
- If only `double_per_person` provided, system can calculate single with supplement
- If `single` is absolute price, no supplement calculation needed

**Seasonal Pricing:**
```json
"seasonal_pricing": [
  {
    "season_name": "High Season",
    "date_range": {"start": "2026-06-01", "end": "2026-08-31"},
    "price_modifier": 15
  }
]
```
**Result:** 15% price increase during June-August

---

### Departures Section

Array of departure dates:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string (YYYY-MM-DD) | ✅ Yes | Departure date |
| `capacity` | integer | No | Override package capacity |
| `status` | enum | No (default "active") | "active", "guaranteed", "sold_out", "cancelled" |

**Each departure generates:**
- 1 PackageDeparture record
- 1 AllotmentDay record (inventory tracking)
- Link to package inventory

---

### Payment Schedule Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | No | "standard_3_tier", "long_lead_4_tier", "full_payment", "custom" |
| `deposit` | number | No | Initial deposit per person |
| `progress_payment.amount` | number | No | Second payment amount |
| `progress_payment.days_after_booking` | integer | No | When second payment is due |
| `final_balance_days_before` | integer | No | Days before departure for final |

**Predefined Patterns:**

**"standard_3_tier"** (most common):
- Deposit at booking
- Progress payment X days after booking
- Balance Y days before departure

**"full_payment"**:
- 100% at booking (simple, no payment rules needed)

**"custom"**:
- Define your own rules in `custom_rules` array

---

### Cancellation Policy Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | No | "standard_4_tier", "strict", "flexible", "custom" |
| `tiers[].days_before` | string | ✅ Yes | "61+", "60-45", "30-0" format |
| `tiers[].fee_type` | enum | ✅ Yes | "fixed" or "percentage" |
| `tiers[].amount` | number | ✅ Yes | Dollar amount or percentage |

**Example 4-Tier:**
```json
"tiers": [
  {"days_before": "61+", "fee_type": "fixed", "amount": 3000},
  {"days_before": "60-45", "fee_type": "percentage", "amount": 25},
  {"days_before": "44-31", "fee_type": "percentage", "amount": 50},
  {"days_before": "30-0", "fee_type": "percentage", "amount": 100}
]
```

---

### Itinerary Section (Optional)

Array of daily content:

| Field | Type | Description |
|-------|------|-------------|
| `day` | integer | Day number (1-based) |
| `title` | string | Day title |
| `description` | string | Daily activities |
| `meals` | array | ["breakfast", "lunch", "dinner"] |
| `accommodation` | string | Hotel name |
| `location` | string | City/location |

**If omitted:** Package created without day-by-day content (can be added later in Kaptio)

---

### Hotels Section (Optional - Advanced)

Array of hotel inventory:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Hotel name |
| `location` | string | City |
| `room_types[].type` | enum | "single", "double", "twin", "triple" |
| `room_types[].capacity` | integer | Number of rooms |
| `date_range` | object | Date restrictions |

**If omitted:** System uses package-level capacity and simple inventory

---

## Transformation Rules

### How Simplified → Gold Config

**1. Package Type Mapping**

| Sophia Value | Gold Config Output |
|--------------|-------------------|
| `"land_only"` | `Package_Type__c = "Principle"`<br>`Categories__c = "Classic;Land Only"`<br>`PhysicalInventorySelection__c = "Mandatory"` |
| `"air_land"` | `Package_Type__c = "Principle"`<br>`Categories__c = "Classic;Air & Land"`<br>`PhysicalInventorySelection__c = "NotMandatoryHidden"` |
| `"combo_land"` | `Package_Type__c = "Combo"`<br>`Categories__c = "Land Only"`<br>`PhysicalInventorySelection__c = "Mandatory"` |

**2. Component Expansion**

```
Sophia:
{
  "name": "Room Configuration",
  "type": "room_configuration",
  "room_types": ["single", "double", "twin"]
}

Gold Config Output:
- 1 Component__c record (RecordType="Package_Item", ComponentType="PriceCategories")
- 3 ComponentOption__c records (one per room type)
- 3 Price_Category__c records (Single, Double, Twin)
```

**3. Pricing Expansion**

```
Sophia:
"room_prices": {
  "single": 8500,
  "double_per_person": 6500
}

Gold Config Output:
- 1 Item__c record (tour service)
- 2 Price_Category__c records (Single, Double)
- 2 Item_Price__c records (pricing for each category)
```

**4. Departures Expansion**

```
Sophia:
{"date": "2026-03-15", "capacity": 20}

Gold Config Output:
- 1 PackageDeparture__c (departure record)
- 1 AllotmentDay__c (inventory for that date)
- 1 PackageDepartureAllotmentAssignment__c (linkage)
```

**5. Payment Schedule Expansion**

```
Sophia:
{
  "deposit": 500,
  "progress_payment": {"amount": 2500, "days_after_booking": 45},
  "final_balance_days_before": 60
}

Gold Config Output:
- 1 PaymentScheduleConfiguration__c
- 3 PaymentScheduleRule__c records (deposit, progress, balance)
- 1 PaymentScheduleAssignment__c (links to package)
```

---

## Intelligent Defaults

If you don't specify these, the transformer applies sensible defaults:

| Field | Default Value | Rationale |
|-------|---------------|-----------|
| `Package.ServiceLevelMode__c` | "Standard" | Enables bed type defaulting |
| `Package.DepartureType__c` | "Fixed" | Most tours use fixed dates |
| `Package.NetPriceSetupChoice__c` | "Dynamic" | Allows seasonal pricing |
| `Package.SellingPriceSetupChoice__c` | "Dynamic" | Flexible pricing |
| `Package.IsActive__c` | true | New packages are active |
| `Component[tour_inventory].IsMainTourComponent__c` | true | First component is main |
| `Component[tour_inventory].PrimaryComponent__c` | true | Primary for pricing |
| `AllotmentDay.TotalUnits` | package.capacity.max | Use max capacity |
| `Item.RecordType__c` | "Service" | Standard service type |

---

## Validation Rules

Your Sophia JSON will be validated against these rules:

### Required Structure
✅ Must have: `package`, `components`, `pricing`, `departures`  
✅ Must have: `package.name`, `package.duration_days`, `package.type`  
✅ Must have at least 1 component  
✅ Must have at least 1 departure  
✅ Must have `pricing.currency`

### Business Rules
⚠️ If `package.type = "land_only"` → Must have `capacity.min` for guarantee logic  
⚠️ If component has `room_types` → Must be type "room_configuration"  
⚠️ Payment schedule must have at least deposit OR final_balance  
⚠️ Cancellation tiers must not overlap in day ranges

### Data Integrity
❌ `duration_days` must be > 0  
❌ `capacity.max` must be >= `capacity.min`  
❌ Departure dates must be future dates (or allow historical for testing)  
❌ Currency must be valid ISO code  
❌ Room prices must be positive numbers

---

## Common Patterns

### Pattern 1: Simple Land-Only Package

```json
{
  "package": {"name": "Tour Name", "duration_days": 10, "type": "land_only"},
  "components": [
    {"name": "Main Tour", "type": "tour_inventory"},
    {"name": "Rooms", "type": "room_configuration", "room_types": ["single", "double"]}
  ],
  "pricing": {
    "currency": "USD",
    "room_prices": {"single": 5000, "double_per_person": 4000}
  },
  "departures": [{"date": "2026-06-01"}],
  "payment_schedule": {"deposit": 500, "final_balance_days_before": 60},
  "cancellation_policy": {"tiers": [{"days_before": "30-0", "fee_type": "percentage", "amount": 100}]}
}
```

**Generates:** ~20-25 Salesforce records

---

### Pattern 2: Package with Pre/Post Stays

```json
{
  "components": [
    {"name": "Main Tour", "type": "tour_inventory"},
    {"name": "Rooms", "type": "room_configuration", "room_types": ["single", "double", "twin"]},
    {"name": "Pre-Stay Lima", "type": "accommodation", "required": false, "max_nights": 3},
    {"name": "Post-Stay Buenos Aires", "type": "accommodation", "required": false, "max_nights": 2}
  ]
}
```

**Generates:** 4 Component records + options for each

---

### Pattern 3: Seasonal Pricing

```json
{
  "pricing": {
    "currency": "USD",
    "room_prices": {"double_per_person": 6500},
    "seasonal_pricing": [
      {
        "season_name": "High Season",
        "date_range": {"start": "2026-06-01", "end": "2026-08-31"},
        "price_modifier": 20
      },
      {
        "season_name": "Shoulder",
        "date_range": {"start": "2026-09-01", "end": "2026-10-31"},
        "price_modifier": -10
      }
    ]
  }
}
```

**Generates:** PriceSeason records with adjusted pricing

---

### Pattern 4: Multi-Segment Combo

```json
{
  "package": {"type": "combo_land", "duration_days": 27},
  "components": [
    {
      "name": "South Korea Tour",
      "type": "tour_inventory",
      "day_range": {"start": 1, "end": 13}
    },
    {
      "name": "Japan Tour",
      "type": "tour_inventory",
      "day_range": {"start": 14, "end": 27}
    },
    {
      "name": "Bridge Hotel Tokyo",
      "type": "accommodation",
      "day_range": {"start": 13, "end": 14}
    }
  ]
}
```

**Generates:** Multi-segment tour with day ranges

---

## What Gets Auto-Generated

You don't need to specify these - the transformer creates them automatically:

✅ **Salesforce Record IDs** - Deterministic IDs generated from names  
✅ **Parent-Child Relationships** - Component.Package__c linked automatically  
✅ **RecordTypes** - Inferred from component type  
✅ **Sort Orders** - Components numbered 1, 2, 3...  
✅ **System Fields** - IsActive, dates, etc.  
✅ **Namespace Prefixes** - KaptioTravel__ added automatically  
✅ **Inventory Records** - AllotmentDay created for each departure  
✅ **Locations** - Created from start/end/itinerary locations  
✅ **Payment/Cancellation Assignments** - Linked to package automatically

---

## Error Handling

### Common Errors & Solutions

**Error: "Missing required field: package.name"**
- **Cause:** Package name not provided
- **Fix:** Add `"name": "Your Package Name"` to package section

**Error: "Invalid package.type: combo"**
- **Cause:** Wrong type value
- **Fix:** Use one of: land_only, air_land, combo_land, combo_air, linked

**Error: "Component type 'hotel' not recognized"**
- **Cause:** Invalid component type
- **Fix:** Use: tour_inventory, room_configuration, accommodation, activity, flight_placeholder, extra

**Error: "Departure date must be in YYYY-MM-DD format"**
- **Cause:** Wrong date format
- **Fix:** Use ISO format: "2026-03-15"

**Error: "No room types specified for room_configuration component"**
- **Cause:** room_configuration component needs room_types array
- **Fix:** Add `"room_types": ["single", "double", "twin"]`

---

## Testing Your JSON

Before uploading to the adapter UI, validate locally:

```bash
# Check if JSON is valid
node -e "console.log(JSON.parse(require('fs').readFileSync('your-file.json')))"

# Transform and see output
node transform-to-gold-config.js --input your-file.json --output test-bundle.json

# Check generated records
cat test-bundle.json | grep "bundleMetadata" -A 10
```

---

## Advanced Features

### Custom Payment Rules

```json
"payment_schedule": {
  "type": "custom",
  "custom_rules": [
    {
      "amount": 1000,
      "type": "deposit",
      "timing": "after_booking",
      "days_offset": 0
    },
    {
      "amount": 2000,
      "type": "deposit",
      "timing": "before_travel",
      "days_offset": 180
    }
  ]
}
```

### Detailed Hotel Inventory

```json
"hotels": [
  {
    "name": "Park Hyatt Tokyo",
    "location": "Tokyo",
    "room_types": [
      {"type": "single", "capacity": 5},
      {"type": "double", "capacity": 15}
    ],
    "date_range": {
      "start": "2026-03-01",
      "end": "2026-03-31"
    }
  }
]
```

**Generates:** ComponentOptions with date restrictions, separate inventory contracts per hotel/date

---

## FAQs

**Q: Can I include actual hotel names and suppliers?**  
A: Yes, add them to the hotels array or components. We'll extract them as Item and Account records.

**Q: What if I don't know some pricing yet?**  
A: Provide approximate pricing. You can edit in Kaptio after deployment.

**Q: Can I update an existing package?**  
A: Not yet. V1 only creates new packages. Updates coming in V2.

**Q: How do I handle optional excursions with their own pricing?**  
A: Add as separate components with type "activity", include pricing in component if different from main tour.

**Q: What about flight placeholders for air+land?**  
A: Add component with type "flight_placeholder", specify cost in pricing section.

---

## Integration with Gold Config

The generated bundle is **identical in structure** to Gold Config bundles. This means:

✅ Can be deployed using same deployment wizard  
✅ Can be validated using same validator  
✅ Produces same Salesforce records as manually configured Gold Config  
✅ No difference in functionality after deployment

**The only difference:** How the bundle was created (extracted vs transformed)

---

## Support & Examples

**Full Examples:** See `sophia-adapter/examples/` folder
- `south-american-discovery-example.json` - Complete example
- `minimal-example.json` - Simplest valid package

**Transformer:** `sophia-adapter/transform-to-gold-config.js`

**Web UI:** `sophia-adapter/upload-ui.html`

**Schema:** `sophia-adapter/simplified-contract-schema.json`

---

## Versioning

**Current Version:** 1.0  
**Date:** November 26, 2025  
**Breaking Changes:** None yet (initial release)

**Future Enhancements:**
- V1.1: Support for package updates (not just creates)
- V1.2: Multi-package bulk upload
- V1.3: More component types (cruises, rail, etc.)
- V2.0: Two-way sync (Kaptio → Sophia format for exports)

---

**Ready to simplify your package creation workflow?** 🚀  
**Start with the minimal example, then expand as needed.**

