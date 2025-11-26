# Quick Start Guide: Package Extraction System

**Get started in 5 minutes** | **For:** Implementation Teams & Developers

---

## What You've Got

A complete system for extracting Gold Config packages from ktdev45 and preparing them for deployment to target orgs.

**Status:** ✅ Proof of Concept Complete  
**Tested With:** Japan Discovery - Land Only (85 records extracted)

---

## Quick Start Commands

### Extract a Package

```bash
cd package-extractor
node extract-package.js --packageId a29J8000000IKF9IAO --output ../package-bundles/my-package.json
```

**Package IDs from ktdev45 Gold Config:**
- `a29J8000000IKF9IAO` - Japan Discovery - Land Only (Classic)
- `a29J8000000IKFEIA4` - Japan Discovery - Air & Land
- `a29J8000000IKFnIAO` - South Korea & Japan - Land Only (Combo)
- `a29J8000000IKFOIA4` - South Korea & Japan - Air & Land (Combo)
- `a29J8000000k9tFIAQ` - Egypt & Jordan (Linked)

### Validate a Bundle

```bash
node validate-bundle.js --bundle ../package-bundles/my-package.json
```

### View the Bundle

```bash
# Open in your editor
code ../package-bundles/my-package.json

# Or in browser (via HTML guide)
open ../gold-config-package-showcase.html
# Click "View Complete Package Bundle" in any section
```

---

## What Gets Extracted

For a typical package, you'll get **80-100 records** including:

| Object Type | Count | What It Is |
|-------------|-------|------------|
| Package | 1 | The main product definition |
| Components | 5-8 | Tour, rooms, pre/post stays, excursions, flights |
| Component Options | 15-30 | Hotel properties, room types, etc. |
| Items | 4-10 | Actual services (hotels, activities) |
| Package Days | 10-30 | Day-by-day itinerary content |
| Package Departures | 4-10 | Fixed departure dates |
| Payment Schedule | 1 config + 3 rules | Deposit and balance structure |
| Cancellation Policy | 1 config + 4 rules | Tiered cancellation fees |
| Locations | 2-5 | Geographic locations (cities) |
| Allotment Assignments | 10-30 | Inventory linkages |
| **Total** | **80-150** | **Complete package configuration** |

---

## Bundle Structure

```json
{
  "bundleMetadata": {
    "packageName": "Japan Discovery - Land Only",
    "packageType": "Classic Land-Only (Principle)",
    "totalRecords": 85,
    "requiresMapping": ["OwnerId", "CurrencyIsoCode"]
  },
  "deploymentOrder": [
    "KaptioTravel__Location__c",
    "KaptioTravel__PaymentScheduleConfiguration__c",
    // ... 14 object types in dependency order
  ],
  "records": {
    "KaptioTravel__Package__c": [ /* 1 package */ ],
    "KaptioTravel__Component__c": [ /* 5 components */ ],
    // ... all extracted records
  }
}
```

---

## What Needs Mapping

When deploying to a target org, these fields require mapping:

### Required
- ✅ **OwnerId** - Select package owner in target org
- ✅ **CurrencyIsoCode** - Select currency (if multi-currency org)

### Optional
- ⭕ **Channel** - Select sales channel (or leave null)
- ⭕ **Suppliers** - Map items to supplier accounts (or leave null)

### External (Handled Automatically)
- 🔄 **PriceCategory** - Auto-matched by name or created
- 🔄 **CommissionGroup** - Map to existing or leave null
- 🔄 **TaxGroup** - Map to existing or leave null
- 🔄 **Location** - Check if exists, reuse or create

---

## Next Steps

### For POC Demo
1. Extract Japan Discovery - Land Only ✅ (Already done)
2. Open `gold-config-package-showcase.html` in browser
3. Navigate to "Classic Land-Only Package" section
4. Click "View Complete Package Bundle"
5. Show extracted real data to stakeholders
6. Click "Deploy to My Environment" to show future wizard

### For Production Implementation
1. Extract remaining 6 package types
2. Build deployment wizard (see DEPLOYMENT_WIZARD_DESIGN.md)
3. Implement ID transformation and Salesforce insertion
4. Test in scratch org
5. Deploy to production

### For Customization
1. Review `dependency-map.json` - add/modify object relationships
2. Review `field-mapping-rules.json` - adjust field handling
3. Update `extract-package.js` - add special case handling
4. Test extraction and validation

---

## Troubleshooting

### "Referenced [Object] not found"

**Cause:** Object is an external dependency (CommissionGroup, PriceCategory, etc.)  
**Solution:** This is expected. These will be mapped in deployment wizard.  
**See:** [EXTERNAL_DEPENDENCIES.md](EXTERNAL_DEPENDENCIES.md)

### "No child records found"

**Cause:** Object relationship not in dependency map, or data not in ktdev45 folder  
**Solution:** Check dependency-map.json, add missing relationships  
**Debug:** Run with more verbose logging to see what's being searched

### "Validation FAILED: X errors"

**Cause:** Bundle has broken references or invalid structure  
**Solution:** Review validator output, fix extraction logic  
**Note:** Some "errors" are actually external deps (see EXTERNAL_DEPENDENCIES.md)

### "Deployment order forward reference"

**Cause:** Child object listed before parent in deployment order  
**Solution:** Update dependency-map.json deployment_order  
**Note:** Self-references (Location → Location) are OK

---

## File Reference

| File | What It Does | When You Need It |
|------|--------------|------------------|
| [`README.md`](README.md) | System overview | Understanding the system |
| [`QUICK_START.md`](QUICK_START.md) | This file - 5min setup | Getting started |
| [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) | Complete implementation details | Deep dive into what was built |
| [`DEPLOYMENT_WIZARD_DESIGN.md`](DEPLOYMENT_WIZARD_DESIGN.md) | Full wizard UI/UX spec | Building the wizard |
| [`EXTERNAL_DEPENDENCIES.md`](EXTERNAL_DEPENDENCIES.md) | External dep strategy | Understanding why some refs are missing |
| `extract-package.js` | Extraction script | Extracting packages |
| `validate-bundle.js` | Validation script | Validating bundles |
| `dependency-map.json` | Object relationships | Modifying extraction logic |
| `field-mapping-rules.json` | Field categorization | Changing field handling |
| `deployment-schema.json` | Bundle format spec | Building wizard or tools |

---

## Examples

### Example 1: Extract and Validate

```bash
# Extract
node extract-package.js --packageId a29J8000000IKF9IAO --output test.json

# Validate
node validate-bundle.js --bundle test.json

# If valid, bundle is ready for deployment
```

### Example 2: Explore Bundle Contents

```javascript
const bundle = require('../package-bundles/japan-land-only.json');

console.log('Package:', bundle.bundleMetadata.packageName);
console.log('Records:', bundle.bundleMetadata.totalRecords);
console.log('Object Types:', Object.keys(bundle.records).length);
console.log('\nComponents:');

for (const component of bundle.records['KaptioTravel__Component__c']) {
  console.log('  -', component.Name);
}
```

**Output:**
```
Package: Japan Discovery - Land Only
Records: 85
Object Types: 16

Components:
  - 🎎 Japan Discovery - Tour Inventory & Pricing
  - 🛌 Japan Discovery - Room Configuration
  - 🎭  Japan Discovery - Optional Excursion
  - 🏨 Pre-Stay – Tokyo (1–31 Mar 2026)
  - 🏨 Post-Stay – Osaka (1–15 Apr 2026)
```

---

## Success Metrics

### For This POC

✅ **Extraction works:** 85 records extracted automatically  
✅ **Validation works:** Identifies real issues vs external deps  
✅ **Documentation complete:** All specs and guides written  
✅ **Integration done:** HTML guide shows real data  
✅ **Handoff ready:** Next team has everything they need

### For Production (Future)

- [ ] Deploy to scratch org successfully
- [ ] Handle all 7 package types
- [ ] Wizard deployed to production
- [ ] 10+ packages deployed to customer orgs
- [ ] Zero manual configuration needed

---

## Support

**Questions?**  
See the other documentation files or contact the Implementation Team.

**Found a bug?**  
Update the relevant config file (dependency-map.json or field-mapping-rules.json) and re-extract.

**Want to contribute?**  
Follow the structure in this POC - update configs, test extraction, validate results.

---

**Ready to deploy packages to any Kaptio org with confidence.** 🚀

