# Package Deployment Wizard Design

**Version:** 1.0  
**Date:** November 26, 2025  
**Purpose:** UI/UX specification for Gold Config package deployment wizard

---

## Overview

The Package Deployment Wizard enables users to deploy pre-configured package bundles from the Gold Config into their Kaptio orgs. The wizard guides users through uploading a bundle, mapping org-specific dependencies, previewing what will be created, and deploying the configuration.

### Key Principles

1. **Guided Experience**: Step-by-step wizard with clear progress indication
2. **Safety First**: Preview before deploy, validation at every step, rollback capability
3. **Transparency**: Show exactly what will be created and where it's coming from
4. **Flexibility**: Allow users to customize mappings while maintaining data integrity

---

## User Personas

### Primary: Implementation Consultant
- **Goal**: Quickly deploy Gold Config packages to demonstrate best practices to clients
- **Pain Points**: Manual package setup is time-consuming and error-prone
- **Needs**: Fast deployment, confidence that configuration matches Gold Config exactly

### Secondary: Kaptio Customer (Tour Operator)
- **Goal**: Implement a package type they've seen in Gold Config demo
- **Pain Points**: Don't understand all the technical dependencies
- **Needs**: Simple interface, clear explanations, ability to customize for their business

---

## Wizard Flow

## Step 1: Upload Bundle

### Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  Deploy Gold Config Package                         [X]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 1 of 4: Upload Package Bundle                       │
│  ●───○───○───○                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  📦  Drag & Drop Bundle JSON                         │ │
│  │                                                       │ │
│  │      or click to browse files                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Available Gold Config Packages:                           │
│  ┌──────────────────────────────────────┐                │
│  │ ✓ Japan Discovery - Land Only        │  [Download]    │
│  │   Classic Land-Only (Principle)      │                │
│  │   83 records | 15 object types       │                │
│  ├──────────────────────────────────────┤                │
│  │ ○ Japan Discovery - Air & Land       │  [Download]    │
│  │   Classic Air+Land (Principle)       │                │
│  │   97 records | 17 object types       │                │
│  ├──────────────────────────────────────┤                │
│  │ ○ South Korea & Japan - Combo        │  [Download]    │
│  │   Combo Land-Only                    │                │
│  │   156 records | 22 object types      │                │
│  └──────────────────────────────────────┘                │
│                                                            │
│                                [Cancel]  [Next →]          │
└────────────────────────────────────────────────────────────┘
```

### Functionality

**Upload Methods:**
1. Drag & drop JSON file
2. Browse file system
3. Select from pre-loaded Gold Config bundles (downloaded from GitHub)

**Validation on Upload:**
- JSON is valid
- Has required `bundleMetadata` structure
- Has `deploymentOrder` array
- Has `records` object with at least one object type
- All referenced Ids exist within bundle (referential integrity)

**Error Display:**
```
┌────────────────────────────────────────────┐
│ ⚠️  Bundle Validation Failed               │
├────────────────────────────────────────────┤
│ • Missing required field: bundleMetadata.  │
│   packageName                              │
│ • Referenced Id 'a0eXXX' not found in      │
│   bundle (referenced by Component record)  │
│                                            │
│ [Try Another File]                         │
└────────────────────────────────────────────┘
```

**Success State:**
```
┌────────────────────────────────────────────┐
│ ✓ Bundle Validated Successfully            │
├────────────────────────────────────────────┤
│ Package: Japan Discovery - Land Only       │
│ Type: Classic Land-Only (Principle)        │
│ Records: 83 across 15 object types         │
│ Extracted: November 26, 2025               │
│                                            │
│ Ready to proceed to mapping step →         │
└────────────────────────────────────────────┘
```

---

## Step 2: Map Dependencies

### Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  Deploy Gold Config Package                         [X]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 2 of 4: Map Dependencies                            │
│  ●───●───○───○                                            │
│                                                            │
│  Configure org-specific settings for this package         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Package Owner                             * Required │ │
│  │ ┌──────────────────────────────────────────────────┐ │ │
│  │ │ [User lookup: Start typing name...]           │ │ │ │
│  │ └──────────────────────────────────────────────────┘ │ │
│  │ Select the user who will own this package            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Package Currency                          * Required │ │
│  │ ┌──────────────────────────────────────────────────┐ │ │
│  │ │ EUR (Euro) [Change]                            │ │ │ │
│  │ └──────────────────────────────────────────────────┘ │ │
│  │ Source currency: EUR                                 │ │
│  │ Using source currency. Change if needed.             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Sales Channel                               Optional │ │
│  │ ┌──────────────────────────────────────────────────┐ │ │
│  │ │ [Channel lookup: Select channel...]           │ │ │ │
│  │ └──────────────────────────────────────────────────┘ │ │
│  │ Assign package to a sales channel (recommended)      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Advanced Mappings                       [Show/Hide]  │ │
│  │                                                       │ │
│  │ Suppliers (4 items require mapping):                 │ │
│  │ ┌───────────────────────────────────────────────────┤ │
│  │ │ Park Hyatt Tokyo (Item)                           │ │
│  │ │ Source: [Not specified in source org]             │ │
│  │ │ Target: [Select supplier] or [Leave blank]        │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│                        [← Back]  [Cancel]  [Next →]        │
└────────────────────────────────────────────────────────────┘
```

### Mapping Fields

#### Required Mappings

**1. Package Owner (OwnerId)**
- **Type**: User lookup
- **Validation**: User must exist and be active
- **Default**: Current user
- **Help Text**: "Select the user who will own this package. They will have full edit access."

**2. Currency (CurrencyIsoCode)**  
*Only shown if target org is multi-currency enabled*
- **Type**: Picklist (enabled currencies only)
- **Source Value Display**: "Source: EUR"
- **Default**: Match source currency if available, else org default
- **Validation**: Selected currency must be enabled in target org
- **Help Text**: "Package and all related records will use this currency."

#### Optional Mappings

**3. Sales Channel**
- **Type**: Lookup to Channel__c
- **Default**: Blank
- **Help Text**: "Assign package to a sales channel for channel-specific visibility and pricing."

**4. Business Unit**  
*Only shown if org uses business units*
- **Type**: Lookup to custom Business Unit object
- **Default**: Blank

#### Advanced Mappings (Collapsed by Default)

**Suppliers (for Items)**
- **Context**: "4 items in this package reference suppliers"
- **Options**: 
  - Map to existing Account
  - Leave blank (supplier assignment optional)
- **Display**: Show Item name and source supplier name (if available)
- **Help Text**: "Map each item to an existing supplier in your org, or leave blank to assign later."

### Validation Rules

**Before proceeding to Step 3:**
1. All required fields have values
2. User lookup resolves to active user
3. Currency is enabled in org
4. No validation errors on any field

**Error Display (inline):**
```
┌──────────────────────────────────────────────────────┐
│ Package Owner                             * Required │
│ ┌──────────────────────────────────────────────────┐ │
│ │ (empty)                                        │ │ │
│ └──────────────────────────────────────────────────┘ │
│ ⚠️  This field is required                           │
└──────────────────────────────────────────────────────┘
```

---

## Step 3: Preview Deployment

### Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  Deploy Gold Config Package                         [X]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 3 of 4: Preview Deployment                          │
│  ●───●───●───○                                            │
│                                                            │
│  Review what will be created in your org                  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 📦 Japan Discovery - Land Only                       │ │
│  │    Classic Land-Only (Principle) • 13 days           │ │
│  │                                                       │ │
│  │ Total Records: 83 across 15 object types             │ │
│  │ Extracted from: ktdev45 Gold Config                  │ │
│  │ Date: November 26, 2025                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Records to be Created:                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✓ 1   Package                                        │ │
│  │       • Japan Discovery - Land Only                  │ │
│  │                                                       │ │
│  │ ✓ 5   Components                                     │ │
│  │       • Tour Inventory & Pricing                     │ │
│  │       • Room Configuration                           │ │
│  │       • Pre-Stay – Tokyo                             │ │
│  │       • Post-Stay – Osaka                            │ │
│  │       • Optional Excursion                           │ │
│  │                                                       │ │
│  │ ✓ 18  Component Options                              │ │
│  │       (Hotel properties, room types, etc.)           │ │
│  │                                                       │ │
│  │ ✓ 4   Items                                          │ │
│  │       (Accommodations, activities)                   │ │
│  │                                                       │ │
│  │ ✓ 14  Package Days                                   │ │
│  │       (Day-by-day itinerary content)                 │ │
│  │                                                       │ │
│  │ ✓ 4   Package Departures                             │ │
│  │       • March 5, 2026                                │ │
│  │       • March 12, 2026                               │ │
│  │       • March 19, 2026                               │ │
│  │       • March 26, 2026                               │ │
│  │                                                       │ │
│  │ ✓ 1   Payment Schedule (3 rules)                     │ │
│  │       • $500 at booking                              │ │
│  │       • $2,500 45 days after booking                 │ │
│  │       • Balance 60 days before departure             │ │
│  │                                                       │ │
│  │ ✓ 1   Cancellation Policy (4 tiers)                  │ │
│  │       • 61+ days: $3,000 fixed fee                   │ │
│  │       • 60-45 days: 25%                              │ │
│  │       • 44-31 days: 50%                              │ │
│  │       • 30-0 days: 100% (no refund)                  │ │
│  │                                                       │ │
│  │ ✓ 3   Locations (Tokyo, Osaka, Kyoto)               │ │
│  │       Shared objects - will check if exist           │ │
│  │                                                       │ │
│  │ ✓ 33  Other supporting records                       │ │
│  │       (Allotments, assignments, etc.)                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Your Mappings:                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ • Owner: John Smith                                  │ │
│  │ • Currency: EUR (Euro)                               │ │
│  │ • Channel: Direct Sales                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ⚠️  Important Notes:                                     │
│  • Deployment will create 83 new records                  │
│  • Existing records will not be modified                  │
│  • Locations will be checked for duplicates               │
│  • Process may take 30-60 seconds                         │
│                                                            │
│                        [← Back]  [Cancel]  [Deploy →]      │
└────────────────────────────────────────────────────────────┘
```

### Key Features

**1. Summary Card**
- Package name and type
- Record count
- Source org indicator

**2. Expandable Record List**
- Show key records by object type
- Expand/collapse sections
- Highlight important records (package name, component names, departure dates)

**3. Mapping Summary**
- Show all user-configured mappings
- Allow "Edit" to go back to Step 2

**4. Warning Messages**
- Clearly state what's about to happen
- Emphasize no existing records will be modified
- Set expectations on timing

**5. Deploy Button**
- Primary action, prominent placement
- Disabled until user scrolls to bottom (ensure they reviewed)
- Shows loading state during deployment

---

## Step 4: Deployment Progress

### Screen Layout (During Deployment)

```
┌────────────────────────────────────────────────────────────┐
│  Deploy Gold Config Package                         [X]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 4 of 4: Deploying Package                           │
│  ●───●───●───●                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │         [====================    ] 65%                │ │
│  │                                                       │ │
│  │         Deploying Japan Discovery - Land Only         │ │
│  │                                                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Progress:                                                │
│  ✓ Validated bundle (83 records)                          │
│  ✓ Created ID mapping table                               │
│  ✓ Inserted 3 Locations                                   │
│  ✓ Inserted 1 PaymentScheduleConfiguration                │
│  ✓ Inserted 3 PaymentScheduleRules                        │
│  ✓ Inserted 1 CancellationConfiguration                   │
│  ✓ Inserted 4 CancellationRules                           │
│  ✓ Inserted 1 Package                                     │
│  ✓ Inserted 1 PaymentScheduleAssignment                   │
│  ⏳ Inserting 5 Components...                             │
│  ○ Pending: 18 ComponentOptions                           │
│  ○ Pending: 4 Items                                       │
│  ○ Pending: 14 PackageDays                                │
│  ○ Pending: 4 PackageDepartures                           │
│  ○ Pending: 33 other records                              │
│                                                            │
│  Please wait... Do not close this window.                 │
│                                                            │
│                             [Cancel Deployment]            │
└────────────────────────────────────────────────────────────┘
```

### Deployment Process

**1. Pre-Deployment Checks**
```javascript
// Verify user permissions
- Check Create permission on all object types
- Check field-level security on all fields
- Verify user is not in read-only mode
```

**2. ID Transformation**
```javascript
// Create mapping table
idMapping = new Map();

// For each record in deploymentOrder:
for (objectType of deploymentOrder) {
  for (record of bundle.records[objectType]) {
    // Remove system fields
    delete record.CreatedDate;
    delete record.LastModifiedDate;
    
    // Store original Id, then remove
    originalId = record.Id;
    delete record.Id;
    
    // Apply user mappings
    if (record._OwnerId_mappable) {
      record.OwnerId = userMappings.ownerId;
    }
    if (record._CurrencyIsoCode_mappable) {
      record.CurrencyIsoCode = userMappings.currency;
    }
    
    // Remap lookup Ids
    for (field in record) {
      if (record[`_${field}_lookup`]) {
        record[field] = idMapping.get(record[field]);
      }
    }
    
    // Check for existing shared records
    if (record._shared) {
      existingId = queryExisting(objectType, record);
      if (existingId) {
        idMapping.set(originalId, existingId);
        continue; // Skip insert
      }
    }
    
    // Insert record
    result = insert(objectType, record);
    
    // Store mapping
    idMapping.set(originalId, result.Id);
  }
}
```

**3. Progress Updates**
- Real-time updates as each object type completes
- Show percentage complete
- Display current operation

**4. Error Handling**
```
If deployment fails at any step:

┌────────────────────────────────────────────────────┐
│ ⚠️  Deployment Failed                               │
├────────────────────────────────────────────────────┤
│ Error inserting Component records:                 │
│                                                    │
│ FIELD_CUSTOM_VALIDATION_EXCEPTION                  │
│ Field KaptioTravel__Package__c: Invalid reference │
│ (Record Id: temp-001)                              │
│                                                    │
│ Successfully inserted: 14 records                  │
│ Failed at: Component insertion                     │
│                                                    │
│ [View Full Error Log]                              │
│ [Rollback Deployment]  [Contact Support]           │
└────────────────────────────────────────────────────┘
```

**Rollback Capability:**
- Track all inserted record Ids
- On failure or user cancellation, delete all inserted records
- Display rollback progress
- Report final state

---

## Step 5: Deployment Complete

### Success Screen

```
┌────────────────────────────────────────────────────────────┐
│  Deploy Gold Config Package                         [X]    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ✅ Deployment Successful!                                 │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │          🎉 Package Deployed Successfully             │ │
│  │                                                       │ │
│  │     Japan Discovery - Land Only                       │ │
│  │     is now available in your org                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Deployment Summary:                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Total Records Created: 83                            │ │
│  │ Locations Reused: 2 (Tokyo, Osaka)                   │ │
│  │ New Locations Created: 1 (Kyoto)                     │ │
│  │ Duration: 42 seconds                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Quick Actions:                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [View Package in Salesforce]                         │ │
│  │ [View Package Departures]                            │ │
│  │ [View All Components]                                │ │
│  │ [Download ID Mapping File]                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  What's Next?                                             │
│  • Review package configuration                           │
│  • Customize pricing for your market                      │
│  • Add your brand imagery                                 │
│  • Configure online booking settings                      │
│  • Test booking flow                                      │
│                                                            │
│  [Deploy Another Package]  [View Documentation]  [Close]  │
└────────────────────────────────────────────────────────────┘
```

### ID Mapping Export

**Format: CSV**
```csv
Object Type,Original Id,New Id,Record Name
KaptioTravel__Package__c,a29J8000000IKF9IAO,a29XX000000NEWIDXX,Japan Discovery - Land Only
KaptioTravel__Component__c,a0eJ8000002CCsRIAW,a0eXX000000NEWIDXX,Tour Inventory & Pricing
KaptioTravel__Location__c,a1gJ80000004uvQIAQ,a1gXX000000EXISTXX,Tokyo (existing record used)
...
```

**Use Cases:**
- Troubleshooting deployment issues
- Reference for future customizations
- Audit trail

---

## Technical Implementation Notes

### Technology Stack (Recommended)

**Lightning Web Component (LWC)**
```javascript
// Main wizard component
<template>
  <lightning-card title="Deploy Gold Config Package">
    <div if:true={isStep1}>
      <!-- Upload UI -->
    </div>
    <div if:true={isStep2}>
      <!-- Mapping UI -->
    </div>
    <!-- etc. -->
  </lightning-card>
</template>
```

**Apex Controller**
```apex
public class PackageDeploymentController {
  
  @AuraEnabled
  public static ValidationResult validateBundle(String bundleJson) {
    // Validate bundle structure
  }
  
  @AuraEnabled
  public static DeploymentResult deployPackage(
    String bundleJson, 
    Map<String, String> userMappings
  ) {
    // Deploy package with transaction control
  }
  
  @AuraEnabled
  public static void rollbackDeployment(List<String> insertedIds) {
    // Delete all inserted records
  }
}
```

### Alternative: External Web App

**Technology:** React + Salesforce REST API

**Pros:**
- No Apex governor limits
- Richer UI capabilities
- Easier to iterate on

**Cons:**
- Requires OAuth setup
- Network dependency
- Separate hosting needed

**Architecture:**
```
[React App] → [Salesforce REST API]
             → [Composite API for bulk insert]
             → [Query API for validation]
```

---

## Future Enhancements

### Phase 2 Features

1. **Batch Deployment**
   - Deploy multiple packages at once
   - Bulk mapping interface

2. **Package Customization**
   - Edit package fields before deployment
   - Adjust pricing during deployment
   - Select which components to include

3. **Conflict Detection**
   - Check if package with same name already exists
   - Option to update vs. create new

4. **Deployment Templates**
   - Save mapping configurations for reuse
   - Organization-level defaults

5. **Version Management**
   - Track which Gold Config version was deployed
   - Update existing packages to newer versions
   - Show changelog between versions

6. **Post-Deployment Automation**
   - Auto-create test bookings
   - Generate sample quotes
   - Configure default images/branding

---

## Security & Permissions

### Required Permissions

**User must have:**
- Create on all Kaptio objects (Package, Component, etc.)
- Edit on parent objects (to link child records)
- View on lookup objects (User, Channel, etc.)

**Org must have:**
- Kaptio Travel package installed
- Sufficient data storage
- API access enabled

### Permission Checks

**Pre-deployment validation:**
```apex
// Check object permissions
if (!Schema.sObjectType.KaptioTravel__Package__c.isCreateable()) {
  throw new InsufficientPermissionsException(
    'You do not have permission to create Package records'
  );
}

// Check field-level security
if (!Schema.sObjectType.KaptioTravel__Package__c.fields.Name.isCreateable()) {
  throw new InsufficientPermissionsException(
    'You do not have permission to set Package Name field'
  );
}
```

---

## Error Handling & Recovery

### Common Errors

**1. Validation Errors**
- **Cause**: Required fields missing, field validation rules fail
- **Solution**: Show clear error message, allow user to fix mappings
- **Prevention**: Validate fields before insert

**2. Duplicate Records**
- **Cause**: Record with same unique field already exists
- **Solution**: For shared objects, use existing. For others, prompt user.
- **Prevention**: Check for duplicates before insert

**3. Permission Errors**
- **Cause**: User lacks Create/Edit permission
- **Solution**: Show clear message, link to permission documentation
- **Prevention**: Check permissions in Step 1

**4. Relationship Errors**
- **Cause**: Referenced record doesn't exist
- **Solution**: Ensure deployment order is correct
- **Prevention**: Validate bundle structure before deployment

**5. Governor Limits**
- **Cause**: Too many DML operations
- **Solution**: Use Composite API or async processing
- **Prevention**: Batch operations appropriately

### Rollback Strategy

**Automatic Rollback Triggers:**
- Any deployment error after first insert
- User clicks "Cancel Deployment"
- Timeout (deployment > 5 minutes)

**Rollback Process:**
```apex
List<Id> rollbackIds = new List<Id>();

// Delete in reverse deployment order
for (String objectType : reverseOrder) {
  List<SObject> recordsToDelete = [
    SELECT Id FROM :objectType 
    WHERE Id IN :rollbackIds
  ];
  delete recordsToDelete;
}
```

**User Communication:**
```
Rolling back deployment...
✓ Deleted 15 Component records
✓ Deleted 1 Package record
✓ Deleted 3 PaymentScheduleRule records
✅ Rollback complete. No records remain.
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**1. Keyboard Navigation**
- All actions accessible via keyboard
- Logical tab order
- Clear focus indicators

**2. Screen Reader Support**
- ARIA labels on all interactive elements
- Live regions for progress updates
- Descriptive error messages

**3. Color Contrast**
- All text meets 4.5:1 contrast ratio
- Error states use more than color (icons + text)

**4. Responsive Design**
- Works on mobile, tablet, desktop
- Touch-friendly buttons (min 44px target size)

---

## Analytics & Monitoring

### Tracked Events

1. **Wizard Started**: User opens wizard
2. **Bundle Uploaded**: User uploads/selects bundle
3. **Validation Failed**: Bundle fails validation
4. **Mapping Completed**: User completes Step 2
5. **Preview Viewed**: User reaches Step 3
6. **Deployment Started**: User clicks Deploy
7. **Deployment Success**: Deployment completes
8. **Deployment Failed**: Deployment fails with error
9. **Rollback Triggered**: User or system triggers rollback

### Metrics

- **Conversion Rate**: Wizard starts → Successful deployments
- **Average Time**: From start to completion
- **Error Rate**: % of deployments that fail
- **Most Common Errors**: Categorized by error type
- **Most Deployed Packages**: Which bundles are popular

---

## Testing Strategy

### Unit Tests

```apex
@isTest
class PackageDeploymentControllerTest {
  
  @isTest
  static void testValidateBundle_Success() {
    // Test: Valid bundle passes validation
  }
  
  @isTest
  static void testValidateBundle_MissingMetadata() {
    // Test: Bundle without metadata fails
  }
  
  @isTest
  static void testDeployPackage_Success() {
    // Test: Complete deployment flow
  }
  
  @isTest
  static void testRollback() {
    // Test: Rollback deletes all inserted records
  }
}
```

### Integration Tests

1. **Happy Path**: Deploy complete bundle start to finish
2. **Permission Errors**: User lacks Create permission
3. **Validation Errors**: Required mapping missing
4. **Rollback**: Deployment fails, verify rollback
5. **Duplicate Locations**: Shared record already exists

### User Acceptance Testing

**Test Scenarios:**
1. New user deploys Japan Land-Only package
2. User deploys Air+Land package with flight placeholders
3. User deploys Combo package with multiple segments
4. User cancels mid-deployment, verifies rollback
5. User deploys to multi-currency org

---

## Appendix: Mockup Assets

*Placeholder for actual design mockups, screenshots, and UI specifications*

---

**End of Deployment Wizard Design Document**

