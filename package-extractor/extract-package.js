#!/usr/bin/env node

/**
 * Package Extractor for Kaptio Gold Config
 * 
 * Extracts a complete package configuration from ktdev45 data with all dependencies.
 * Generates a deployable JSON bundle ready for import to target orgs.
 * 
 * Usage:
 *   node extract-package.js --packageId a29J8000000IKF9IAO --output japan-land-only.json
 */

const fs = require('fs');
const path = require('path');

// Load configuration files
const dependencyMap = require('./dependency-map.json');
const fieldMappingRules = require('./field-mapping-rules.json');

// Path to ktdev45 data
const KTDEV45_DATA_PATH = path.join(__dirname, '../ktdev45/000000000000000001');

class PackageExtractor {
  constructor(packageId, outputPath) {
    this.packageId = packageId;
    this.outputPath = outputPath;
    this.bundle = {
      bundleMetadata: {
        packageName: null,
        packageType: null,
        extractedFrom: 'ktdev45',
        extractionDate: new Date().toISOString().split('T')[0],
        totalRecords: 0,
        requiresMapping: []
      },
      deploymentOrder: [],
      records: {}
    };
    this.extractedIds = new Set(); // Track already-extracted records to avoid duplicates
    this.sharedObjects = new Set(['Location__c', 'Account']); // Objects shared across packages
  }

  /**
   * Main extraction entry point
   */
  async extract() {
    console.log(`\n📦 Extracting package: ${this.packageId}`);
    console.log(`📂 Data source: ${KTDEV45_DATA_PATH}\n`);

    try {
      // Load all data files
      console.log('Loading ktdev45 data files...');
      const allData = this.loadAllData();
      
      // Extract the package
      console.log(`\n🔍 Finding package ${this.packageId}...`);
      const packageRecord = this.findRecordById(allData, 'KaptioTravel__Package__c', this.packageId);
      
      if (!packageRecord) {
        throw new Error(`Package ${this.packageId} not found in data`);
      }

      this.bundle.bundleMetadata.packageName = packageRecord.Name;
      this.bundle.bundleMetadata.packageType = this.getPackageType(packageRecord);
      
      console.log(`✓ Found: ${packageRecord.Name}`);
      console.log(`  Type: ${this.bundle.bundleMetadata.packageType}`);
      console.log(`  Length: ${packageRecord.KaptioTravel__Length__c} days`);

      // Start recursive extraction
      console.log('\n🔗 Extracting dependencies...\n');
      this.extractRecord(allData, 'KaptioTravel__Package__c', packageRecord);

      // Build deployment order
      this.buildDeploymentOrder();

      // Calculate totals and identify mappable fields
      this.finalizeBundleMetadata();

      // Write output
      this.writeBundle();

      console.log(`\n✅ Extraction complete!`);
      console.log(`📄 Bundle saved to: ${this.outputPath}`);
      console.log(`📊 Total records: ${this.bundle.bundleMetadata.totalRecords}`);
      console.log(`🗂️  Object types: ${Object.keys(this.bundle.records).length}`);

    } catch (error) {
      console.error(`\n❌ Extraction failed:`, error.message);
      throw error;
    }
  }

  /**
   * Load all ktdev45 JSON data files
   */
  loadAllData() {
    const allData = {};
    const files = fs.readdirSync(KTDEV45_DATA_PATH);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const objectName = file.replace('.json', '');
        const filePath = path.join(KTDEV45_DATA_PATH, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Handle both {records: [...]} and direct array formats
        const records = Array.isArray(content) 
          ? content 
          : (content.records || []).map(r => r.record || r);
          
        allData[objectName] = records;
        console.log(`    Loaded ${records.length} records from ${objectName}`);
      }
    }
    
    console.log(`  Total object types loaded: ${Object.keys(allData).length}`);
    return allData;
  }

  /**
   * Find a record by ID in the loaded data
   */
  findRecordById(allData, objectName, recordId) {
    const records = allData[objectName] || [];
    return records.find(r => r.Id === recordId);
  }

  /**
   * Find records by parent field (e.g., all Components where Package__c = packageId)
   */
  findRecordsByParent(allData, objectName, parentField, parentId) {
    const records = allData[objectName] || [];
    if (records.length === 0) {
      console.log(`      ⚠️  No data loaded for object type: ${objectName}`);
      return [];
    }
    
    const matched = records.filter(r => r[parentField] === parentId);
    if (matched.length === 0 && records.length > 0) {
      // Debug: Check if the field exists and what values it has
      const sampleRecord = records[0];
      const fieldExists = parentField in sampleRecord;
      console.log(`      🔍 Field '${parentField}' ${fieldExists ? 'exists' : 'does NOT exist'} in ${objectName}`);
      if (fieldExists) {
        const uniqueValues = [...new Set(records.map(r => r[parentField]))].slice(0, 5);
        console.log(`      Sample values: ${uniqueValues.join(', ')}`);
      }
    }
    
    return matched;
  }

  /**
   * Extract a record and all its dependencies recursively
   */
  extractRecord(allData, objectName, record, parentContext = null) {
    const recordId = record.Id;

    // Skip if already extracted
    if (this.extractedIds.has(recordId)) {
      return;
    }

    this.extractedIds.add(recordId);

    // Initialize object array in bundle if needed
    if (!this.bundle.records[objectName]) {
      this.bundle.records[objectName] = [];
    }

    // Clean the record (apply field mapping rules)
    const cleanedRecord = this.cleanRecord(objectName, record);
    
    this.bundle.records[objectName].push(cleanedRecord);
    console.log(`  ✓ ${objectName}: ${record.Name || record.Id}`);

    // Extract lookup dependencies
    this.extractLookupDependencies(allData, objectName, record);

    // Extract child records
    this.extractChildRecords(allData, objectName, recordId);
  }

  /**
   * Get dependency config for an object (handles both namespaced and non-namespaced lookups)
   */
  getDependencyConfig(objectName) {
    // Try exact match first
    if (dependencyMap[objectName]) {
      return dependencyMap[objectName];
    }
    
    // Try without namespace
    const withoutNamespace = objectName.replace('KaptioTravel__', '');
    if (dependencyMap[withoutNamespace]) {
      return dependencyMap[withoutNamespace];
    }
    
    // Try adding namespace
    if (!objectName.includes('__') && !['Account', 'Contact', 'User'].includes(objectName)) {
      const withNamespace = `KaptioTravel__${objectName}`;
      if (dependencyMap[withNamespace]) {
        return dependencyMap[withNamespace];
      }
    }
    
    return null;
  }

  /**
   * Extract records referenced by lookup fields
   */
  extractLookupDependencies(allData, objectName, record) {
    const objectConfig = this.getDependencyConfig(objectName);
    if (!objectConfig || !objectConfig.lookup_fields) return;

    for (const lookupConfig of objectConfig.lookup_fields) {
      const fieldValue = record[lookupConfig.field];
      
      if (!fieldValue) continue; // Skip null lookups
      if (lookupConfig.include_in_bundle === false) continue; // Skip if explicitly excluded

      const targetObjectName = this.getKaptioObjectName(lookupConfig.target_object);
      const referencedRecord = this.findRecordById(allData, targetObjectName, fieldValue);

      if (referencedRecord) {
        // Mark as shared if applicable
        if (lookupConfig.shared) {
          referencedRecord._shared = true;
        }
        this.extractRecord(allData, targetObjectName, referencedRecord, objectName);
      } else {
        // Record not found - might be OK if it's a shared/mappable field
        if (lookupConfig.include_in_bundle) {
          console.log(`    ⚠️  Referenced ${lookupConfig.target_object} ${fieldValue} not found`);
        }
      }
    }
  }

  /**
   * Extract child records (records that have this record as parent)
   */
  extractChildRecords(allData, parentObjectName, parentId) {
    const objectConfig = this.getDependencyConfig(parentObjectName);
    if (!objectConfig) {
      console.log(`  ⚠️  No config found for ${parentObjectName}`);
      return;
    }
    
    if (!objectConfig.direct_children) {
      console.log(`  ℹ️  ${parentObjectName} has no direct children defined`);
      return;
    }

    console.log(`  🔍 Checking ${objectConfig.direct_children.length} child types for ${parentObjectName}...`);

    for (const childConfig of objectConfig.direct_children) {
      const childObjectName = this.getKaptioObjectName(childConfig.object);
      const relationshipField = childConfig.relationship_field;
      
      console.log(`    Looking for ${childConfig.object} (→ ${childObjectName}) where ${relationshipField} = ${parentId}...`);
      const childRecords = this.findRecordsByParent(allData, childObjectName, relationshipField, parentId);
      
      if (childRecords.length > 0) {
        console.log(`    📋 Found ${childRecords.length} ${childConfig.object}${childRecords.length !== 1 ? 's' : ''}`);
      } else {
        console.log(`    📭 No ${childConfig.object} found`);
      }
      
      for (const childRecord of childRecords) {
        this.extractRecord(allData, childObjectName, childRecord, parentObjectName);
      }
    }
  }

  /**
   * Clean a record according to field mapping rules
   */
  cleanRecord(objectName, record) {
    const rules = fieldMappingRules[objectName];
    if (!rules) {
      // No rules defined, include all fields except system fields
      const cleaned = {};
      for (const [key, value] of Object.entries(record)) {
        if (!this.isSystemField(key)) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    }

    const cleaned = { Id: record.Id }; // Always keep Id for relationship mapping

    // Add portable fields
    if (rules.portable_fields) {
      for (const field of rules.portable_fields) {
        if (record[field] !== undefined) {
          cleaned[field] = record[field];
        }
      }
    }

    // Add mappable fields (but mark them in metadata)
    if (rules.mappable_fields) {
      for (const field of Object.keys(rules.mappable_fields)) {
        if (record[field] !== undefined) {
          cleaned[field] = record[field];
          cleaned[`_${field}_mappable`] = true; // Mark for wizard
          
          // Track in bundle metadata
          if (!this.bundle.bundleMetadata.requiresMapping.includes(field)) {
            this.bundle.bundleMetadata.requiresMapping.push(field);
          }
        }
      }
    }

    // Add dependency lookups (will be remapped during deployment)
    if (rules.dependency_lookups) {
      for (const field of Object.keys(rules.dependency_lookups)) {
        if (record[field] !== undefined) {
          cleaned[field] = record[field];
          cleaned[`_${field}_lookup`] = true; // Mark as needing ID remapping
        }
      }
    }

    // Add CurrencyIsoCode if present
    if (record.CurrencyIsoCode) {
      cleaned.CurrencyIsoCode = record.CurrencyIsoCode;
    }

    // Add RecordTypeId handling - extract RecordType name
    if (record.RecordTypeId) {
      // We'll need to resolve this to a name later, for now keep the Id
      cleaned.RecordTypeId = record.RecordTypeId;
      cleaned._RecordTypeId_resolve = true;
    }

    return cleaned;
  }

  /**
   * Check if a field is a system-managed field
   */
  isSystemField(fieldName) {
    const systemFields = [
      'CreatedDate', 'CreatedById', 
      'LastModifiedDate', 'LastModifiedById',
      'SystemModstamp', 'IsDeleted'
    ];
    return systemFields.includes(fieldName);
  }

  /**
   * Remove system-managed fields
   */
  removeSystemFields(record) {
    const systemFields = [
      'CreatedDate', 'CreatedById', 
      'LastModifiedDate', 'LastModifiedById',
      'SystemModstamp', 'IsDeleted'
    ];
    
    const cleaned = { ...record };
    systemFields.forEach(field => delete cleaned[field]);
    return cleaned;
  }

  /**
   * Convert object name to Kaptio format (add namespace if needed)
   */
  getKaptioObjectName(objectName) {
    // If already has KaptioTravel namespace, return as-is
    if (objectName.startsWith('KaptioTravel__')) {
      return objectName;
    }
    
    // Standard objects
    if (objectName === 'Account' || objectName === 'Contact' || objectName === 'User' || objectName === 'RecordType') {
      return objectName;
    }
    
    // Add KaptioTravel namespace to custom objects
    // Custom objects end with __c
    return `KaptioTravel__${objectName}`;
  }

  /**
   * Determine package type for display
   */
  getPackageType(packageRecord) {
    const type = packageRecord.KaptioTravel__Package_Type__c || 'Principle';
    const categories = packageRecord.KaptioTravel__Categories__c || '';
    const hasAir = categories.includes('Air & Land');
    const hasLand = categories.includes('Land Only');

    if (type === 'Principle' && hasLand) return 'Classic Land-Only (Principle)';
    if (type === 'Principle' && hasAir) return 'Classic Air+Land (Principle)';
    if (type === 'Combo' && hasLand) return 'Combo Land-Only';
    if (type === 'Combo' && hasAir) return 'Combo Air+Land';
    if (type === 'Linked') return 'Linked Package (Principle + Sub Tour)';
    
    return type;
  }

  /**
   * Build deployment order based on dependencies
   */
  buildDeploymentOrder() {
    const order = [];
    const extractedObjects = Object.keys(this.bundle.records);

    // Use the predefined deployment order from dependency map
    const fullOrder = dependencyMap.extraction_notes.deployment_order;
    
    for (const item of fullOrder) {
      // Extract object name from the deployment order line
      // Format: "1. Location__c (no dependencies)"
      const match = item.match(/\d+\.\s+(\w+__c)/);
      if (match) {
        const objectName = this.getKaptioObjectName(match[1]);
        if (extractedObjects.includes(objectName)) {
          order.push(objectName);
        }
      }
    }

    this.bundle.deploymentOrder = order;
  }

  /**
   * Finalize bundle metadata
   */
  finalizeBundleMetadata() {
    // Count total records
    let total = 0;
    for (const records of Object.values(this.bundle.records)) {
      total += records.length;
    }
    this.bundle.bundleMetadata.totalRecords = total;

    // Add summary by object type
    this.bundle.bundleMetadata.recordsByType = {};
    for (const [objectName, records] of Object.entries(this.bundle.records)) {
      this.bundle.bundleMetadata.recordsByType[objectName] = records.length;
    }

    // Remove duplicate mappable fields
    this.bundle.bundleMetadata.requiresMapping = [...new Set(this.bundle.bundleMetadata.requiresMapping)];
  }

  /**
   * Write the bundle to output file
   */
  writeBundle() {
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      this.outputPath,
      JSON.stringify(this.bundle, null, 2),
      'utf8'
    );
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let packageId = null;
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--packageId' && args[i + 1]) {
      packageId = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  if (!packageId) {
    console.error('Error: --packageId is required');
    console.log('\nUsage: node extract-package.js --packageId <id> --output <path>');
    console.log('\nExample:');
    console.log('  node extract-package.js --packageId a29J8000000IKF9IAO --output ../package-bundles/japan-land-only.json');
    process.exit(1);
  }

  if (!outputPath) {
    outputPath = path.join(__dirname, '../package-bundles', `package-${packageId}.json`);
  } else if (!path.isAbsolute(outputPath)) {
    outputPath = path.join(__dirname, outputPath);
  }

  const extractor = new PackageExtractor(packageId, outputPath);
  extractor.extract()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = PackageExtractor;

