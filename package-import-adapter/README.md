# Kaptio Package Import Adapter

**Version:** 1.0  
**Date:** November 26, 2025  
**For:** Tour Operators Using Custom Planning Tools

---

## The Problem We're Solving

**Tour operators plan tours in diverse systems:**
- Complex Excel workbooks (Sophia Sheets, custom templates)
- CSV exports from legacy reservation systems
- Database extracts from booking platforms
- Manual spreadsheets with years of operational knowledge

**Kaptio's native format is comprehensive but verbose:**
- 135+ Salesforce records per package
- Complex parent-child relationships
- Salesforce-specific fields (RecordTypeId, namespace prefixes)
- Every field must be explicitly defined
- Designed for system completeness, not human authoring

**The gap:** Getting data from planning tools into Kaptio is painful.

---

## The Solution: Universal Import Adapter

We built a **source-agnostic translation layer**:

```
Your Excel Sheet
       ↓
Your Script (Excel → JSON)  ← You control extraction logic
       ↓
Simplified JSON (~100 lines)  ← Our contract specification
       ↓
Our Transformer  ← We transform to Gold Config
       ↓
Gold Config Bundle (135+ records)
       ↓
Salesforce Deployment  ← Existing wizard
```

**You own:** Excel analysis and extraction  
**We provide:** Everything after that

---

## Quick Start

### 1. Create Your Simplified JSON

Use our contract format (see [`IMPORT_CONTRACT_SPEC.md`](IMPORT_CONTRACT_SPEC.md)):

```json
{
  "package": {
    "name": "South American Discovery",
    "duration_days": 15,
    "type": "land_only"
  },
  "components": [
    {"name": "Main Tour", "type": "tour_inventory"}
  ],
  "pricing": {
    "currency": "USD",
    "room_prices": {"double_per_person": 6500}
  },
  "departures": [{"date": "2026-03-15"}],
  "payment_schedule": {"deposit": 500, "final_balance_days_before": 60},
  "cancellation_policy": {
    "tiers": [{"days_before": "30-0", "fee_type": "percentage", "amount": 100}]
  }
}
```

**That's it!** This minimal JSON generates 25+ Salesforce records.

### 2. Transform to Kaptio Format

```bash
node transform-to-gold-config.js --input your-package.json --output bundle.json
```

**Output:** Complete Kaptio bundle ready for Salesforce

### 3. Upload to Web UI

```bash
# Serve the UI locally
cd ../
./serve.sh

# Open in browser
# http://localhost:8000/package-import-adapter/upload-ui.html
```

**Or:** Open `upload-ui.html` directly and:
1. Drag & drop your JSON
2. Review extracted data
3. Preview transformation
4. Download bundle or deploy directly

---

## Contract Simplification

### What You Specify (Simple)

**~100 lines of human-friendly JSON:**
- Package name, duration, type
- List of components
- Pricing by room type
- Departure dates
- Payment & cancellation patterns

### What Gets Generated (Complete)

**~3,500 lines of Salesforce records:**
- Package__c with all Salesforce fields
- Component__c with RecordTypes and relationships
- Item__c for services
- Price_Category__c for each room type
- Item_Price__c for pricing
- PackageDeparture__c for each date
- AllotmentDay__c for inventory
- PaymentScheduleConfiguration + Rules
- CancellationConfiguration + Rules
- Location__c records
- All parent-child linkages

**Compression Ratio:** 95% less verbose!

---

## Key Benefits

### For Script Writers / Data Engineers

✅ **Simple Output Format** - No Salesforce knowledge needed  
✅ **No ID Management** - We generate deterministic IDs  
✅ **No Relationships** - Just provide names, we link records  
✅ **Flexible Structure** - Only specify what you have  
✅ **Source Agnostic** - Works with any data source

### For Operations Teams

✅ **Visual Review** - See extracted data before deployment  
✅ **Edit Capability** - Adjust values in UI  
✅ **Preview** - See exactly what will be created  
✅ **One-Click Deploy** - Direct to Salesforce from UI  
✅ **No Technical Skills** - Drag & drop interface

### For Tour Operators

✅ **Keep Your Tools** - Use existing Excel/planning workflows  
✅ **Fast Migration** - Import packages in minutes, not days  
✅ **Standardized** - Consistent format across teams  
✅ **Reusable** - Same adapter for all your packages

---

## Files in This System

| File | Purpose | Who Uses It |
|------|---------|-------------|
| **simplified-contract-schema.json** | JSON schema definition | Data engineers (validation) |
| **IMPORT_CONTRACT_SPEC.md** | Complete specification | Developers (documentation) |
| **examples/south-american-discovery-example.json** | Full example | Everyone (template) |
| **examples/minimal-example.json** | Minimal example | Getting started |
| **transform-to-gold-config.js** | Transformer script | System (backend) |
| **upload-ui.html** | Web interface | Operations teams (frontend) |
| **README.md** | This file | Everyone (overview) |

---

## Universal Import Workflow

### Your Side (Source → JSON)

**Step 1:** Extract from your planning tool
```python
# Example: Python script for Excel
python extract_tour_data.py --input "2026 - Tour Planning.xlsx" --output package.json

# Or: Database export
node export_from_database.js --tour-id 12345 --output package.json

# Or: CSV conversion
python csv_to_json.py --input tours.csv --output package.json
```

**Step 2:** Script outputs simplified JSON
```json
// package.json - following our contract spec
{
  "package": {...},
  "components": [...},
  "pricing": {...}
}
```

### Our Side (JSON → Kaptio)

**Step 3:** Upload to import adapter UI
- Drag & drop your JSON file
- Or paste JSON directly
- System validates against schema

**Step 4:** Review in UI
- See extracted package details
- Edit any fields if needed
- Add missing information

**Step 5:** Transform
- Click "Transform to Kaptio Format"
- Generates 135+ Salesforce records automatically
- Shows complete preview

**Step 6:** Deploy
- Connect to Salesforce via OAuth
- Map org-specific fields (Owner, Currency, Channel)
- Deploy bundle with one click
- Package goes live in Kaptio immediately

---

## Example: Full Transformation

**Input (Sophia JSON - 150 lines):**
```json
{
  "package": {
    "name": "South American Discovery",
    "duration_days": 15,
    "type": "land_only",
    "capacity": {"min": 10, "max": 20}
  },
  "components": [
    {"name": "Main Tour", "type": "tour_inventory"},
    {"name": "Room Selection", "type": "room_configuration", "room_types": ["single", "double", "twin"]},
    {"name": "Pre-Stay Lima", "type": "accommodation", "required": false, "max_nights": 3}
  ],
  "pricing": {
    "currency": "USD",
    "room_prices": {
      "single": 8500,
      "double_per_person": 6500,
      "twin_per_person": 6500
    }
  },
  "departures": [
    {"date": "2026-03-15", "capacity": 20},
    {"date": "2026-04-12", "capacity": 18}
  ],
  "payment_schedule": {
    "deposit": 500,
    "progress_payment": {"amount": 2500, "days_after_booking": 45},
    "final_balance_days_before": 60
  },
  "cancellation_policy": {
    "tiers": [
      {"days_before": "61+", "fee_type": "fixed", "amount": 3000},
      {"days_before": "60-45", "fee_type": "percentage", "amount": 25},
      {"days_before": "44-31", "fee_type": "percentage", "amount": 50},
      {"days_before": "30-0", "fee_type": "percentage", "amount": 100}
    ]
  }
}
```

**Output (Gold Config - ~3,000 lines):**
```json
{
  "bundleMetadata": {
    "packageName": "South American Discovery",
    "totalRecords": 35
  },
  "records": {
    "KaptioTravel__Package__c": [{ /* 1 record with 50+ fields */ }],
    "KaptioTravel__Component__c": [{ /* 3 records */ }],
    "KaptioTravel__ComponentOption__c": [{ /* 3 room type options */ }],
    "KaptioTravel__Item__c": [{ /* 1 service item */ }],
    "KaptioTravel__Price_Category__c": [{ /* 3 categories */ }],
    "KaptioTravel__Item_Price__c": [{ /* 3 prices */ }],
    "KaptioTravel__PackageDeparture__c": [{ /* 2 departures */ }],
    "KaptioTravel__AllotmentDay__c": [{ /* 2 inventory records */ }],
    "KaptioTravel__PaymentScheduleConfiguration__c": [{ /* 1 config */ }],
    "KaptioTravel__PaymentScheduleRule__c": [{ /* 3 rules */ }],
    "KaptioTravel__CancellationConfiguration__c": [{ /* 1 config */ }],
    "KaptioTravel__CancellationRule__c": [{ /* 4 rules */ }],
    "KaptioTravel__Location__c": [{ /* 2 locations */ }]
  }
}
```

**Expansion:** 150 lines → 3,000 lines, but you only author the 150!

---

## Technical Architecture

### Transformer Logic

The transformer (`transform-to-gold-config.js`) implements:

1. **Schema Expansion** - Simple fields → Complex Salesforce structures
2. **Relationship Building** - Auto-link parent-child records via generated IDs
3. **Default Application** - Apply Gold Config defaults for unspecified fields
4. **Validation** - Check data integrity before transformation
5. **ID Generation** - Deterministic IDs based on name hashing
6. **Dependency Ordering** - Ensure parents created before children

### Supported Package Types

✅ **Classic Land-Only** - Single destination, no flights  
✅ **Classic Air+Land** - Single destination with flights  
✅ **Combo Land-Only** - Multi-destination, no flights  
✅ **Combo Air+Land** - Multi-destination with flights  
⏳ **Linked Packages** - Coming soon  
⏳ **Extension Tours** - Coming soon

---

## Testing

### Test with Provided Examples

```bash
# Test minimal example
node transform-to-gold-config.js --input examples/minimal-example.json --output test-minimal.json

# Verify output
cat test-minimal.json | head -50

# Should see bundleMetadata with 25 records
```

### Test with Your Data

```bash
# Transform your Sophia JSON
node transform-to-gold-config.js --input your-sophia.json --output your-bundle.json

# Validate the bundle
node ../package-extractor/validate-bundle.js --bundle your-bundle.json

# Should show minimal errors (only external dependencies)
```

---

## Deployment

### Deploy the Adapter UI

The upload-ui.html can be:

**Option A:** Hosted on Netlify alongside Gold Config guide  
**Option B:** Hosted separately (dedicated Sophia adapter site)  
**Option C:** Embedded in Kaptio as Lightning Web Component

**Recommendation:** Option A - Add to existing k-guides site

---

## Success Metrics

### Sophia Adapter Goals

- ✅ Reduce JSON authoring by 95% (3,500 lines → 150 lines)
- ✅ Enable non-technical users to create packages
- ✅ Eliminate need to understand Salesforce data model
- ✅ Same deployment quality as Gold Config packages
- ✅ Reusable across multiple tour operators with custom Excel workflows

### V1 Success Criteria

- [x] Simplified contract defined (50 fields vs 200)
- [x] Transformer built and tested (150 lines → 35 records)
- [x] Web UI with upload/review/preview/deploy
- [x] Complete documentation with examples
- [x] Sample JSONs for common patterns
- [x] Integration plan with existing deployment wizard

**Status:** V1 Complete ✅

---

## Roadmap

### V1.0 (Current)
- ✅ Simplified contract specification
- ✅ Sophia → Gold Config transformer
- ✅ Upload UI with validation
- ✅ Example templates

### V1.1 (Next Quarter)
- [ ] Package updates (not just creates)
- [ ] Bulk upload (multiple packages)
- [ ] More component types (cruises, rail)
- [ ] Advanced pricing models

### V2.0 (Future)
- [ ] Two-way sync (export from Kaptio to Sophia format)
- [ ] Live Salesforce integration (no download step)
- [ ] AI-assisted field mapping
- [ ] Template library for common tour types

---

## Support

**Questions about the contract?** See [`IMPORT_CONTRACT_SPEC.md`](IMPORT_CONTRACT_SPEC.md)

**Need examples?** Check `examples/` folder

**Transformer issues?** Review `transform-to-gold-config.js` logic

**Deployment help?** Use existing Gold Config deployment wizard

---

**Built to bridge the gap between your planning tools and Kaptio.** 🌉

