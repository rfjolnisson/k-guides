# Kaptio Gold Config Package Extractor

**Version:** 1.0  
**Date:** November 26, 2025  
**Purpose:** Extract deployable package configurations from ktdev45 Gold Config

---

## Quick Start

### 1. Extract a Package

```bash
node extract-package.js --packageId a29J8000000IKF9IAO --output ../package-bundles/japan-land-only.json
```

### 2. Validate the Bundle

```bash
node validate-bundle.js --bundle ../package-bundles/japan-land-only.json
```

### 3. Review the Bundle

Open `../package-bundles/japan-land-only.json` to see the extracted configuration.

---

## What This System Does

The Package Extractor recursively extracts a complete package configuration from ktdev45 Gold Config data, including all dependencies, and generates a deployable JSON bundle.

### Input
- **Package ID** from ktdev45 Gold Config (e.g., `a29J8000000IKF9IAO` = "Japan Discovery - Land Only")

### Output
- **Bundle JSON** with package + all dependencies (components, pricing, inventory, schedules, etc.)
- **83 records** across 15 object types for Japan Land-Only package
- **Deployment-ready** format with metadata and ordering

### What Gets Extracted

For a typical package, the extractor includes:

- ✅ **1 Package** record (the main product)
- ✅ **5 Components** (tour, rooms, pre-stay, post-stay, excursions)
- ✅ **18 Component Options** (hotel properties, room types, etc.)
- ✅ **4 Items** (actual services like hotels and activities)
- ✅ **14 Package Days** (day-by-day itinerary content)
- ✅ **4 Package Departures** (fixed departure dates)
- ✅ **Payment Schedule** (configuration + 3 rules)
- ✅ **Cancellation Policy** (configuration + 4 tiered rules)
- ✅ **3 Locations** (Tokyo, Osaka, Kyoto)
- ✅ **12 Allotment Assignments** (inventory linkages)
- ✅ **8 Package Information** records (content sections)
- ✅ **1 Language** record (English)

---

## System Architecture

```
ktdev45/000000000000000001/
  └── [150+ JSON files with org data]

                  ↓

        extract-package.js
        ┌─────────────────────┐
        │ 1. Load all data    │
        │ 2. Find package     │
        │ 3. Extract deps     │
        │ 4. Clean records    │
        │ 5. Build bundle     │
        └─────────────────────┘

                  ↓

    package-bundles/
      └── japan-discovery-land-only.json
          (83 records, deployment-ready)

                  ↓

        validate-bundle.js
        ┌─────────────────────┐
        │ 1. Schema check     │
        │ 2. Ref integrity    │
        │ 3. Deployment order │
        │ 4. Circular deps    │
        └─────────────────────┘

                  ↓

        Deployment Wizard
        (Future implementation)
```

---

## Key Files

### Configuration Files

| File | Purpose |
|------|---------|
| `dependency-map.json` | Defines complete object relationship tree |
| `field-mapping-rules.json` | Categorizes fields as portable/mappable/excluded |
| `deployment-schema.json` | Bundle format specification |

### Executable Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `extract-package.js` | Extract package with dependencies | `node extract-package.js --packageId <id> --output <file>` |
| `validate-bundle.js` | Validate bundle integrity | `node validate-bundle.js --bundle <file>` |

### Documentation

| Document | Purpose |
|----------|---------|
| `DEPLOYMENT_WIZARD_DESIGN.md` | Complete wizard UI/UX specification |
| `EXTERNAL_DEPENDENCIES.md` | Explains dependencies not in bundles |
| `README.md` | This file - system overview |

### Output

| Directory | Contents |
|-----------|----------|
| `../package-bundles/` | Extracted bundle JSON files |
| `../package-bundles/[bundle]-mappings-example.json` | Sample mapping files |

---

## Extraction Process

### Phase 1: Load Data
Loads all JSON files from `ktdev45/000000000000000001/` into memory.

### Phase 2: Recursive Extraction
Starting from the Package record:
1. Extract package record
2. Follow lookup fields (Locations, CommissionGroups, etc.)
3. Extract child records (Components, PackageDays, etc.)
4. For each child, recursively extract its children
5. Continue until all dependencies are extracted

### Phase 3: Clean Records
Apply field mapping rules:
- Remove system fields (CreatedDate, LastModifiedDate, etc.)
- Mark mappable fields (OwnerId, CurrencyIsoCode)
- Mark lookup fields (for ID remapping during deployment)
- Keep portable fields as-is

### Phase 4: Generate Bundle
Create final JSON with:
- Bundle metadata (name, type, record count)
- Deployment order (sequence for inserting records)
- Records organized by object type

---

## Deployment Strategy

### External Dependencies (Not in Bundle)

The following are **not included** in bundles and must be handled during deployment:

1. **CommissionGroup__c** - Map to existing or create
2. **TaxGroup__c** - Map to existing or leave null
3. **PriceCategory__c** - Auto-match by name or create
4. **Channel__c** - User selects in wizard
5. **Account (Suppliers)** - Map to existing or leave null

See [`EXTERNAL_DEPENDENCIES.md`](EXTERNAL_DEPENDENCIES.md) for details.

### Deployment Wizard Flow

```
1. Upload Bundle
   └── Validate structure

2. Map Dependencies
   ├── Required: OwnerId, Currency
   ├── Optional: Channel
   └── Advanced: Suppliers

3. Preview Deployment
   └── Show what will be created

4. Deploy
   ├── Transform IDs
   ├── Insert in order
   └── Handle errors

5. Complete
   └── Show results + new record links
```

See [`DEPLOYMENT_WIZARD_DESIGN.md`](DEPLOYMENT_WIZARD_DESIGN.md) for complete UI specification.

---

## Validation

The validator checks:
- ✓ Bundle schema is valid
- ✓ All required metadata present
- ✓ No duplicate record IDs
- ✓ All references exist (or are external deps)
- ✓ Deployment order has no forward references
- ✓ No circular dependencies

**Example output:**
```
📋 Validating bundle: japan-discovery-land-only.json

✓ Bundle loaded successfully
✓ Bundle schema is valid
✓ Metadata is valid
  Package: Japan Discovery - Land Only
  Type: Classic Land-Only (Principle)
  Records: 85
✓ Indexed 85 record IDs
✓ All 237 references are valid
✓ Deployment order is valid (14 object types)
✓ No circular dependencies found

✅ Validation PASSED: Bundle is ready for deployment
```

---

## Known Limitations (POC Phase)

### Current State
- ✅ Extracts single package (proof of concept)
- ✅ Includes most dependencies
- ✅ Validates bundle integrity
- ❌ External dependencies noted but not handled
- ❌ Deployment wizard not yet built
- ❌ Actual Salesforce deployment not implemented

### External Dependencies

Some objects are **not included** in bundles:
- CommissionGroup__c (org-wide config)
- TaxGroup__c (jurisdiction-specific)
- PriceCategory__c (standard org-wide categories)
- Channel__c (org-specific sales channels)
- Account/Suppliers (pre-existing relationships)

**Why:** These are org-wide shared objects that should already exist in target org or be mapped during deployment.

**Solution:** Deployment wizard will map these to existing records in target org.

### Inventory Data

AllotmentDay records are extracted but may not be useful:
- Contain specific dates from ktdev45 demo environment
- Demo data with past dates
- Target org needs fresh inventory for their season

**Recommendation:** Extract AllotmentCategory structure (shows how to set up inventory) but skip AllotmentDay records during deployment.

---

## Roadmap

### Phase 2: Complete Extraction
- [ ] Extract all 7 package types (currently: 1 of 7)
- [ ] Handle all external dependencies elegantly
- [ ] Add option to skip inventory data
- [ ] Extract PriceCategory definitions
- [ ] Extract ServiceLevel assignments

### Phase 3: Deployment Wizard
- [ ] Build Lightning Web Component wizard
- [ ] Implement mapping interface
- [ ] Add validation and preview
- [ ] Implement actual deployment via Composite API
- [ ] Add rollback capability

### Phase 4: Production Ready
- [ ] Error handling and recovery
- [ ] Bulk operations for multiple packages
- [ ] Package customization before deployment
- [ ] Post-deployment configuration automation
- [ ] Version management and updates

---

## Contributing

### Adding Support for New Objects

To add support for extracting additional objects:

1. **Update `dependency-map.json`:**
```json
"NewObject__c": {
  "description": "What this object does",
  "direct_children": [ /* child objects */ ],
  "lookup_fields": [ /* lookup dependencies */ ]
}
```

2. **Update `field-mapping-rules.json`:**
```json
"NewObject__c": {
  "mappable_fields": { /* fields requiring wizard mapping */ },
  "portable_fields": [ /* fields safe to copy */ ],
  "dependency_lookups": { /* lookups to include in bundle */ }
}
```

3. **Test extraction:**
```bash
node extract-package.js --packageId <id> --output test.json
node validate-bundle.js --bundle test.json
```

---

## Support

**Questions?** See:
- [`DEPLOYMENT_WIZARD_DESIGN.md`](DEPLOYMENT_WIZARD_DESIGN.md) - Complete wizard specification
- [`EXTERNAL_DEPENDENCIES.md`](EXTERNAL_DEPENDENCIES.md) - Dependency handling strategy
- [`../PACKAGE_SCHEMA_ANALYSIS.md`](../PACKAGE_SCHEMA_ANALYSIS.md) - Gold Config data model
- [`../COMPLETE_DATA_MODEL_REFERENCE.md`](../COMPLETE_DATA_MODEL_REFERENCE.md) - Full Kaptio data model

---

**Built with ❤️ for the Kaptio Implementation Team**

