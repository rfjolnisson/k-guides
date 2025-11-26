#!/usr/bin/env node

/**
 * Bundle Validator for Kaptio Gold Config Packages
 * 
 * Validates bundle integrity before deployment:
 * - Schema validation
 * - Referential integrity
 * - Deployment order validation
 * - Required field checks
 * 
 * Usage:
 *   node validate-bundle.js --bundle ../package-bundles/japan-land-only.json
 */

const fs = require('fs');
const path = require('path');

class BundleValidator {
  constructor(bundlePath) {
    this.bundlePath = bundlePath;
    this.bundle = null;
    this.errors = [];
    this.warnings = [];
    this.idIndex = new Set();
  }

  /**
   * Main validation entry point
   */
  async validate() {
    console.log(`\n📋 Validating bundle: ${path.basename(this.bundlePath)}\n`);

    try {
      // Load and parse bundle
      this.loadBundle();

      // Run all validation checks
      this.validateSchema();
      this.validateMetadata();
      this.buildIdIndex();
      this.validateReferentialIntegrity();
      this.validateDeploymentOrder();
      this.checkCircularDependencies();

      // Report results
      this.printResults();

      if (this.errors.length > 0) {
        console.log(`\n❌ Validation FAILED: ${this.errors.length} error(s) found\n`);
        process.exit(1);
      } else {
        console.log(`\n✅ Validation PASSED: Bundle is ready for deployment\n`);
        process.exit(0);
      }

    } catch (error) {
      console.error(`\n❌ Validation failed with exception:`, error.message);
      process.exit(1);
    }
  }

  /**
   * Load and parse the bundle JSON
   */
  loadBundle() {
    try {
      const content = fs.readFileSync(this.bundlePath, 'utf8');
      this.bundle = JSON.parse(content);
      console.log(`✓ Bundle loaded successfully`);
    } catch (error) {
      this.addError('FILE_READ', `Failed to load bundle: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate bundle has required top-level structure
   */
  validateSchema() {
    console.log(`\n🔍 Checking bundle schema...`);

    // Check top-level properties
    if (!this.bundle.bundleMetadata) {
      this.addError('SCHEMA', 'Missing required property: bundleMetadata');
    }
    if (!this.bundle.deploymentOrder) {
      this.addError('SCHEMA', 'Missing required property: deploymentOrder');
    }
    if (!this.bundle.records) {
      this.addError('SCHEMA', 'Missing required property: records');
    }

    // Check deploymentOrder is array
    if (this.bundle.deploymentOrder && !Array.isArray(this.bundle.deploymentOrder)) {
      this.addError('SCHEMA', 'deploymentOrder must be an array');
    }

    // Check records is object
    if (this.bundle.records && typeof this.bundle.records !== 'object') {
      this.addError('SCHEMA', 'records must be an object');
    }

    if (this.errors.length === 0) {
      console.log(`  ✓ Bundle schema is valid`);
    }
  }

  /**
   * Validate metadata has required fields
   */
  validateMetadata() {
    console.log(`\n🔍 Checking bundle metadata...`);

    const metadata = this.bundle.bundleMetadata;
    if (!metadata) return;

    const requiredFields = [
      'packageName',
      'packageType',
      'extractedFrom',
      'extractionDate',
      'totalRecords'
    ];

    for (const field of requiredFields) {
      if (!metadata[field]) {
        this.addError('METADATA', `Missing required metadata field: ${field}`);
      }
    }

    // Validate totalRecords matches actual count
    if (metadata.totalRecords) {
      const actualCount = this.countAllRecords();
      if (metadata.totalRecords !== actualCount) {
        this.addWarning(
          'METADATA',
          `totalRecords mismatch: metadata says ${metadata.totalRecords}, actual count is ${actualCount}`
        );
      }
    }

    // Validate extractionDate format
    if (metadata.extractionDate) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(metadata.extractionDate)) {
        this.addWarning(
          'METADATA',
          `extractionDate should be in YYYY-MM-DD format, got: ${metadata.extractionDate}`
        );
      }
    }

    if (this.errors.filter(e => e.category === 'METADATA').length === 0) {
      console.log(`  ✓ Metadata is valid`);
      console.log(`    Package: ${metadata.packageName}`);
      console.log(`    Type: ${metadata.packageType}`);
      console.log(`    Records: ${metadata.totalRecords}`);
    }
  }

  /**
   * Build index of all record IDs in the bundle
   */
  buildIdIndex() {
    console.log(`\n🔍 Building ID index...`);

    for (const [objectType, records] of Object.entries(this.bundle.records)) {
      if (!Array.isArray(records)) {
        this.addError('RECORDS', `Records for ${objectType} must be an array`);
        continue;
      }

      for (const record of records) {
        if (!record.Id) {
          this.addError('RECORDS', `Record in ${objectType} missing Id field`);
          continue;
        }

        if (this.idIndex.has(record.Id)) {
          this.addError(
            'DUPLICATE_ID',
            `Duplicate record Id found: ${record.Id} in ${objectType}`
          );
        }

        this.idIndex.add(record.Id);
      }
    }

    console.log(`  ✓ Indexed ${this.idIndex.size} record IDs`);
  }

  /**
   * Validate all referenced IDs exist within the bundle
   */
  validateReferentialIntegrity() {
    console.log(`\n🔍 Checking referential integrity...`);

    let checkedReferences = 0;
    let brokenReferences = 0;

    for (const [objectType, records] of Object.entries(this.bundle.records)) {
      for (const record of records) {
        // Check all lookup fields
        for (const [fieldName, fieldValue] of Object.entries(record)) {
          // Skip non-lookup fields
          if (fieldName.startsWith('_')) continue;
          if (fieldValue === null || fieldValue === undefined) continue;
          if (typeof fieldValue !== 'string') continue;

          // Skip fields that are text values, not IDs
          const textFieldPatterns = [
            'ComponentType__c',
            'RecordType__c',
            'DateTimeVisibility__c',
            'Type__c',
            'Status__c',
            'Categories__c'
          ];
          const isTextField = textFieldPatterns.some(pattern => fieldName.includes(pattern));
          if (isTextField) continue;

          // Check if this looks like a Salesforce ID (15 or 18 chars, alphanumeric)
          const idPattern = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
          if (!idPattern.test(fieldValue)) continue;

          // Skip standard object lookups (usually lookups to parent)
          if (!fieldName.includes('__c') && !fieldName.includes('__r')) continue;

          checkedReferences++;

          // Check if referenced ID exists in bundle
          if (!this.idIndex.has(fieldValue)) {
            // Check if it's a mappable field (will be provided by user)
            if (record[`_${fieldName}_mappable`]) {
              // This is OK, user will provide mapping
              continue;
            }

            // Check if it's marked as excluded from bundle
            const lookupMarker = `_${fieldName}_lookup`;
            if (record[lookupMarker] === false) {
              // This lookup intentionally not included in bundle
              continue;
            }

            this.addError(
              'BROKEN_REFERENCE',
              `${objectType} record ${record.Id} (${record.Name || 'unnamed'}) references ${fieldName} = ${fieldValue}, but that record is not in bundle`
            );
            brokenReferences++;
          }
        }
      }
    }

    if (brokenReferences === 0) {
      console.log(`  ✓ All ${checkedReferences} references are valid`);
    } else {
      console.log(`  ✗ Found ${brokenReferences} broken references`);
    }
  }

  /**
   * Validate deployment order doesn't have forward references
   */
  validateDeploymentOrder() {
    console.log(`\n🔍 Checking deployment order...`);

    const deploymentOrder = this.bundle.deploymentOrder;
    if (!deploymentOrder || !Array.isArray(deploymentOrder)) return;

    const deployedSoFar = new Set();
    const recordsByType = this.groupRecordsByType();

    for (let i = 0; i < deploymentOrder.length; i++) {
      const objectType = deploymentOrder[i];
      const records = recordsByType[objectType] || [];

      // Check if this object type has records
      if (records.length === 0) {
        this.addWarning(
          'DEPLOYMENT_ORDER',
          `${objectType} in deployment order but no records of this type exist in bundle`
        );
        continue;
      }

      // For each record of this type, check its lookups
      for (const record of records) {
        for (const [fieldName, fieldValue] of Object.entries(record)) {
          // Skip non-lookup fields
          if (fieldName.startsWith('_')) continue;
          if (!fieldValue) continue;
          if (typeof fieldValue !== 'string') continue;

          const idPattern = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
          if (!idPattern.test(fieldValue)) continue;

          // If this references a record in the bundle, check it's already deployed
          if (this.idIndex.has(fieldValue)) {
            const referencedType = this.getObjectTypeForId(fieldValue);
            
            // Skip self-references (same object type) - these are OK since all records of same type deploy together
            if (referencedType === objectType) continue;
            
            if (referencedType && !deployedSoFar.has(referencedType)) {
              // Forward reference detected
              if (!record[`_${fieldName}_mappable`]) {
                this.addError(
                  'DEPLOYMENT_ORDER',
                  `Forward reference: ${objectType} (position ${i}) references ${referencedType} which comes later in deployment order`
                );
              }
            }
          }
        }
      }

      deployedSoFar.add(objectType);
    }

    // Check all object types in records are in deployment order
    for (const objectType of Object.keys(recordsByType)) {
      if (recordsByType[objectType].length > 0 && !deploymentOrder.includes(objectType)) {
        this.addError(
          'DEPLOYMENT_ORDER',
          `${objectType} has records but is not in deployment order`
        );
      }
    }

    if (this.errors.filter(e => e.category === 'DEPLOYMENT_ORDER').length === 0) {
      console.log(`  ✓ Deployment order is valid (${deploymentOrder.length} object types)`);
    }
  }

  /**
   * Check for circular dependencies
   */
  checkCircularDependencies() {
    console.log(`\n🔍 Checking for circular dependencies...`);

    // Build dependency graph
    const graph = {};
    const recordsByType = this.groupRecordsByType();

    for (const [objectType, records] of Object.entries(recordsByType)) {
      if (!graph[objectType]) {
        graph[objectType] = new Set();
      }

      for (const record of records) {
        for (const [fieldName, fieldValue] of Object.entries(record)) {
          if (fieldName.startsWith('_')) continue;
          if (!fieldValue) continue;
          if (typeof fieldValue !== 'string') continue;

          const idPattern = /^[a-zA-Z0-9]{15}$|^[a-zA-Z0-9]{18}$/;
          if (!idPattern.test(fieldValue)) continue;

          if (this.idIndex.has(fieldValue)) {
            const referencedType = this.getObjectTypeForId(fieldValue);
            if (referencedType && referencedType !== objectType) {
              graph[objectType].add(referencedType);
            }
          }
        }
      }
    }

    // Detect cycles using DFS
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (node, path = []) => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph[node] || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor, [...path])) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // Cycle detected
          const cyclePath = [...path, neighbor];
          this.addError(
            'CIRCULAR_DEPENDENCY',
            `Circular dependency detected: ${cyclePath.join(' → ')}`
          );
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) {
        hasCycle(node);
      }
    }

    if (this.errors.filter(e => e.category === 'CIRCULAR_DEPENDENCY').length === 0) {
      console.log(`  ✓ No circular dependencies found`);
    }
  }

  /**
   * Helper: Count total records in bundle
   */
  countAllRecords() {
    let count = 0;
    for (const records of Object.values(this.bundle.records)) {
      if (Array.isArray(records)) {
        count += records.length;
      }
    }
    return count;
  }

  /**
   * Helper: Group records by object type
   */
  groupRecordsByType() {
    return this.bundle.records || {};
  }

  /**
   * Helper: Find object type for a given record ID
   */
  getObjectTypeForId(recordId) {
    for (const [objectType, records] of Object.entries(this.bundle.records)) {
      for (const record of records) {
        if (record.Id === recordId) {
          return objectType;
        }
      }
    }
    return null;
  }

  /**
   * Add an error to the error list
   */
  addError(category, message) {
    this.errors.push({ category, message });
  }

  /**
   * Add a warning to the warning list
   */
  addWarning(category, message) {
    this.warnings.push({ category, message });
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`VALIDATION RESULTS`);
    console.log(`${'='.repeat(60)}\n`);

    // Print errors
    if (this.errors.length > 0) {
      console.log(`❌ ERRORS (${this.errors.length}):\n`);
      for (const error of this.errors) {
        console.log(`   [${error.category}] ${error.message}`);
      }
      console.log();
    }

    // Print warnings
    if (this.warnings.length > 0) {
      console.log(`⚠️  WARNINGS (${this.warnings.length}):\n`);
      for (const warning of this.warnings) {
        console.log(`   [${warning.category}] ${warning.message}`);
      }
      console.log();
    }

    // Print summary
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`✅ Bundle is valid with no errors or warnings`);
    } else if (this.errors.length === 0) {
      console.log(`✅ Bundle is valid but has ${this.warnings.length} warning(s)`);
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let bundlePath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bundle' && args[i + 1]) {
      bundlePath = args[i + 1];
      i++;
    }
  }

  if (!bundlePath) {
    console.error('Error: --bundle is required');
    console.log('\nUsage: node validate-bundle.js --bundle <path>');
    console.log('\nExample:');
    console.log('  node validate-bundle.js --bundle ../package-bundles/japan-land-only.json');
    process.exit(1);
  }

  if (!path.isAbsolute(bundlePath)) {
    bundlePath = path.join(__dirname, bundlePath);
  }

  if (!fs.existsSync(bundlePath)) {
    console.error(`Error: Bundle file not found: ${bundlePath}`);
    process.exit(1);
  }

  const validator = new BundleValidator(bundlePath);
  validator.validate();
}

module.exports = BundleValidator;

