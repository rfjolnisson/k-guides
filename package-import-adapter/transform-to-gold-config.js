#!/usr/bin/env node

/**
 * Kaptio Package Import Transformer
 * 
 * Transforms simplified package JSON into complete Kaptio deployment bundle.
 * Expands ~150 lines of human-friendly JSON into ~135 Salesforce records.
 * 
 * Source-agnostic: Works with data from Excel, CSV, databases, or any planning tool.
 * 
 * Usage:
 *   node transform-to-gold-config.js --input your-package.json --output kaptio-bundle.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SophiaTransformer {
  constructor(inputPath, outputPath) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.sophia = null;
    this.bundle = {
      bundleMetadata: {
        packageName: null,
        packageType: null,
        extractedFrom: 'package-import-adapter',
        extractionDate: new Date().toISOString().split('T')[0],
        totalRecords: 0,
        requiresMapping: ['OwnerId', 'CurrencyIsoCode'],
        recordsByType: {}
      },
      deploymentOrder: [],
      records: {}
    };
    this.idCounter = 1;
    this.idMap = new Map(); // name-based keys → generated IDs
  }

  /**
   * Main transformation entry point
   */
  async transform() {
    console.log(`\n🔄 Transforming simplified package JSON to Kaptio format...\n`);

    try {
      // Load simplified package JSON
      this.sophia = JSON.parse(fs.readFileSync(this.inputPath, 'utf8'));
      console.log(`✓ Loaded: ${this.sophia.package.name}`);
      console.log(`  Duration: ${this.sophia.package.duration_days} days`);
      console.log(`  Type: ${this.sophia.package.type}`);
      console.log(`  Components: ${this.sophia.components.length}`);
      console.log(`  Departures: ${this.sophia.departures.length}\n`);

      // Transform each section
      console.log('🔨 Generating records...\n');
      this.generateLocations();
      this.generatePaymentSchedule();
      this.generateCancellationPolicy();
      this.generatePackage();
      this.generateComponents();
      this.generateItems();
      this.generatePricing();
      this.generateDepartures();
      this.generateItinerary();

      // Finalize bundle
      this.finalizeBund();
      this.writeBundle();

      console.log(`\n✅ Transformation complete!`);
      console.log(`📄 Bundle saved to: ${this.outputPath}`);
      console.log(`📊 Total records: ${this.bundle.bundleMetadata.totalRecords}`);
      console.log(`🗂️  Object types: ${Object.keys(this.bundle.records).length}\n`);

      this.printSummary();

    } catch (error) {
      console.error(`\n❌ Transformation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Generate deterministic ID for a record
   */
  generateId(prefix, name) {
    const key = `${prefix}:${name}`;
    if (this.idMap.has(key)) {
      return this.idMap.get(key);
    }
    
    // Generate deterministic ID based on hash
    const hash = crypto.createHash('md5').update(key).digest('hex').substring(0, 12);
    const id = prefix + hash;
    this.idMap.set(key, id);
    return id;
  }

  /**
   * Add a record to the bundle
   */
  addRecord(objectType, record) {
    if (!this.bundle.records[objectType]) {
      this.bundle.records[objectType] = [];
    }
    this.bundle.records[objectType].push(record);
  }

  /**
   * Generate Location records
   */
  generateLocations() {
    const locations = [];
    
    if (this.sophia.package.start_location) {
      locations.push({
        name: this.sophia.package.start_location,
        type: 'start'
      });
    }
    
    if (this.sophia.package.end_location) {
      locations.push({
        name: this.sophia.package.end_location,
        type: 'end'
      });
    }

    // Add locations from itinerary
    if (this.sophia.itinerary) {
      this.sophia.itinerary.forEach(day => {
        if (day.location && !locations.find(l => l.name === day.location)) {
          locations.push({
            name: day.location,
            type: 'itinerary'
          });
        }
      });
    }

    locations.forEach(loc => {
      const locId = this.generateId('a1g', loc.name);
      this.addRecord('KaptioTravel__Location__c', {
        Id: locId,
        Name: loc.name,
        KaptioTravel__LocationType__c: 'City',
        _shared: true
      });
    });

    console.log(`  ✓ Generated ${locations.length} Location records`);
  }

  /**
   * Generate Payment Schedule
   */
  generatePaymentSchedule() {
    const ps = this.sophia.payment_schedule;
    if (!ps) return;

    const configId = this.generateId('a3Z', 'PaymentConfig');
    
    // Configuration
    this.addRecord('KaptioTravel__PaymentScheduleConfiguration__c', {
      Id: configId,
      Name: `${this.sophia.package.name} - Payment Schedule`,
      KaptioTravel__IsActive__c: true
    });

    // Rules
    const rules = [];
    
    if (ps.deposit) {
      rules.push({
        Id: this.generateId('a3a', 'Rule1'),
        Name: 'Deposit',
        KaptioTravel__Type__c: 'Deposit',
        KaptioTravel__DateType__c: 'After Booking',
        KaptioTravel__DaysOffset__c: 0,
        KaptioTravel__ChargeType__c: 'Per Person',
        KaptioTravel__Value__c: ps.deposit,
        KaptioTravel__PaymentScheduleConfiguration__c: configId,
        KaptioTravel__Sort__c: 1
      });
    }

    if (ps.progress_payment) {
      rules.push({
        Id: this.generateId('a3a', 'Rule2'),
        Name: 'Progress Payment',
        KaptioTravel__Type__c: 'Deposit',
        KaptioTravel__DateType__c: 'After Booking',
        KaptioTravel__DaysOffset__c: ps.progress_payment.days_after_booking,
        KaptioTravel__ChargeType__c: 'Per Person',
        KaptioTravel__Value__c: ps.progress_payment.amount,
        KaptioTravel__PaymentScheduleConfiguration__c: configId,
        KaptioTravel__Sort__c: 2
      });
    }

    if (ps.final_balance_days_before) {
      rules.push({
        Id: this.generateId('a3a', 'Rule3'),
        Name: 'Final Balance',
        KaptioTravel__Type__c: 'Final Balance',
        KaptioTravel__DateType__c: 'Before Package Departure',
        KaptioTravel__DaysOffset__c: ps.final_balance_days_before,
        KaptioTravel__PaymentScheduleConfiguration__c: configId,
        KaptioTravel__Sort__c: 3
      });
    }

    rules.forEach(rule => this.addRecord('KaptioTravel__PaymentScheduleRule__c', rule));
    
    console.log(`  ✓ Generated Payment Schedule (${rules.length} rules)`);
  }

  /**
   * Generate Cancellation Policy
   */
  generateCancellationPolicy() {
    const cp = this.sophia.cancellation_policy;
    if (!cp || !cp.tiers) return;

    const configId = this.generateId('a3o', 'CancelConfig');
    
    this.addRecord('KaptioTravel__CancellationConfiguration__c', {
      Id: configId,
      Name: `${this.sophia.package.name} - Cancellation Policy`,
      KaptioTravel__IsActive__c: true
    });

    cp.tiers.forEach((tier, index) => {
      const [fromDays, toDays] = this.parseDaysBeforeRange(tier.days_before);
      
      this.addRecord('KaptioTravel__CancellationRule__c', {
        Id: this.generateId('a3p', `Rule${index}`),
        Name: `${tier.days_before} days`,
        KaptioTravel__DaysBeforeTravelFrom__c: fromDays,
        KaptioTravel__DaysBeforeTravelTo__c: toDays,
        KaptioTravel__ChargeType__c: tier.fee_type === 'fixed' ? 'Fixed' : 'Percentage',
        KaptioTravel__Value__c: tier.amount,
        KaptioTravel__CancellationConfiguration__c: configId,
        KaptioTravel__Sort__c: index + 1,
        CurrencyIsoCode: this.sophia.pricing.currency
      });
    });

    console.log(`  ✓ Generated Cancellation Policy (${cp.tiers.length} tiers)`);
  }

  /**
   * Parse days before range (e.g., "61+", "60-45", "30-0")
   */
  parseDaysBeforeRange(range) {
    if (range.endsWith('+')) {
      const days = parseInt(range);
      return [days, 999];
    }
    
    if (range.includes('-')) {
      const [from, to] = range.split('-').map(d => parseInt(d));
      return [from, to];
    }
    
    const days = parseInt(range);
    return [days, days];
  }

  /**
   * Generate Package record
   */
  generatePackage() {
    const pkg = this.sophia.package;
    const packageId = this.generateId('a29', pkg.name);

    const categories = this.buildCategories(pkg);
    const physInv = this.getPhysicalInventorySelection(pkg.type);

    this.addRecord('KaptioTravel__Package__c', {
      Id: packageId,
      Name: pkg.name,
      KaptioTravel__ExternalName__c: pkg.name,
      KaptioTravel__Description__c: pkg.description || '',
      KaptioTravel__Length__c: pkg.duration_days,
      KaptioTravel__Package_Type__c: this.getPackageType(pkg.type),
      KaptioTravel__Categories__c: categories,
      KaptioTravel__DepartureType__c: 'Fixed',
      KaptioTravel__PhysicalInventorySelection__c: physInv,
      KaptioTravel__ServiceLevelMode__c: 'Standard',
      KaptioTravel__Min_Capacity__c: pkg.capacity?.min || null,
      KaptioTravel__TotalCapacity__c: pkg.capacity?.max || null,
      KaptioTravel__NetPriceSetupChoice__c: 'Dynamic',
      KaptioTravel__SellingPriceSetupChoice__c: 'Dynamic',
      KaptioTravel__IsActive__c: true,
      KaptioTravel__MinimumAge__c: pkg.minimum_age || null,
      KaptioTravel__Pace__c: pkg.pace ? this.capitalize(pkg.pace) : null,
      KaptioTravel__PackageStartLocation__c: pkg.start_location ? this.generateId('a1g', pkg.start_location) : null,
      KaptioTravel__PackageEndLocation__c: pkg.end_location ? this.generateId('a1g', pkg.end_location) : null,
      KaptioTravel__Supplier__c: null,
      KaptioTravel__CommissionGroup__c: null,
      KaptioTravel__DiscountGroup__c: null,
      CurrencyIsoCode: this.sophia.pricing.currency,
      _OwnerId_mappable: true,
      _CurrencyIsoCode_mappable: true
    });

    console.log(`  ✓ Generated Package record`);
  }

  /**
   * Build Categories field from simplified data
   */
  buildCategories(pkg) {
    let categories = [];
    
    // Add type-based category
    if (pkg.type === 'land_only' || pkg.type === 'combo_land') {
      categories.push('Land Only');
    } else if (pkg.type === 'air_land' || pkg.type === 'combo_air') {
      categories.push('Air & Land');
    }

    // Add "Classic" for principle packages
    if (pkg.type === 'land_only' || pkg.type === 'air_land') {
      categories.push('Classic');
    }

    // Add user-specified categories
    if (pkg.categories) {
      pkg.categories.forEach(cat => {
        categories.push(this.capitalize(cat));
      });
    }

    return categories.join(';');
  }

  /**
   * Get Kaptio package type from simplified type
   */
  getPackageType(simplifiedType) {
    const typeMap = {
      'land_only': 'Principle',
      'air_land': 'Principle',
      'combo_land': 'Combo',
      'combo_air': 'Combo',
      'linked': 'Linked'
    };
    return typeMap[simplifiedType] || 'Principle';
  }

  /**
   * Get Physical Inventory Selection based on package type
   */
  getPhysicalInventorySelection(simplifiedType) {
    if (simplifiedType === 'air_land') {
      return 'NotMandatoryHidden';
    }
    return 'Mandatory';
  }

  /**
   * Generate Component records
   */
  generateComponents() {
    const packageId = this.generateId('a29', this.sophia.package.name);
    
    this.sophia.components.forEach((comp, index) => {
      const componentId = this.generateId('a0e', `${this.sophia.package.name}-${comp.name}`);
      
      const recordType = this.getComponentRecordType(comp.type);
      const componentType = this.getComponentType(comp.type);

      this.addRecord('KaptioTravel__Component__c', {
        Id: componentId,
        Name: comp.name,
        KaptioTravel__Package__c: packageId,
        KaptioTravel__RecordType__c: recordType,
        KaptioTravel__ComponentType__c: componentType,
        KaptioTravel__SelectionType__c: comp.required === false ? 'Optional' : 'Required',
        KaptioTravel__IsActive__c: true,
        KaptioTravel__Sort__c: index + 1,
        KaptioTravel__Start__c: comp.day_range?.start || null,
        KaptioTravel__End__c: comp.day_range?.end || null,
        KaptioTravel__MaxNumberOfNights__c: comp.max_nights || null,
        KaptioTravel__PrimaryComponent__c: index === 0 || comp.type === 'tour_inventory',
        KaptioTravel__IsMainTourComponent__c: comp.type === 'tour_inventory',
        KaptioTravel__InventoryRequired__c: comp.type === 'tour_inventory',
        KaptioTravel__PackageTotals__c: 'IncludedInPackageTotal',
        KaptioTravel__AllocationBehavior__c: this.getAllocationBehavior(comp.type),
        CurrencyIsoCode: this.sophia.pricing.currency
      });

      // Generate ComponentOptions for room configuration
      if (comp.type === 'room_configuration' && comp.room_types) {
        this.generateRoomConfigOptions(componentId, comp.room_types);
      }
    });

    console.log(`  ✓ Generated ${this.sophia.components.length} Component records`);
  }

  /**
   * Get Component RecordType from simplified type
   */
  getComponentRecordType(type) {
    const typeMap = {
      'tour_inventory': 'Package_Item',
      'room_configuration': 'Package_Item',
      'accommodation': 'Accommodation',
      'activity': 'Activity',
      'flight_placeholder': 'FlightPlaceholder',
      'extra': 'Extra'
    };
    return typeMap[type] || 'Package_Item';
  }

  /**
   * Get ComponentType from simplified type
   */
  getComponentType(type) {
    if (type === 'room_configuration') {
      return 'PriceCategories';
    }
    return 'PriceCategories'; // Default
  }

  /**
   * Get allocation behavior
   */
  getAllocationBehavior(type) {
    const behaviorMap = {
      'accommodation': 'PreNight', // For pre/post stays
      'tour_inventory': 'Standard',
      'activity': 'Standard'
    };
    return behaviorMap[type] || 'Standard';
  }

  /**
   * Generate ComponentOptions for room types
   */
  generateRoomConfigOptions(componentId, roomTypes) {
    roomTypes.forEach((roomType, index) => {
      const optionId = this.generateId('a0c', `${componentId}-${roomType}`);
      const priceCategoryId = this.generateId('a2O', `${this.sophia.package.name}-${roomType}`);

      this.addRecord('KaptioTravel__ComponentOption__c', {
        Id: optionId,
        Name: this.capitalize(roomType),
        KaptioTravel__Component__c: componentId,
        KaptioTravel__PriceCategory__c: priceCategoryId,
        KaptioTravel__Sort__c: index + 1,
        KaptioTravel__IsActive__c: true
      });
    });
  }

  /**
   * Generate Item records (services)
   */
  generateItems() {
    // Generate main tour item
    const tourItemId = this.generateId('a1F', `${this.sophia.package.name}-Tour`);
    
    this.addRecord('KaptioTravel__Item__c', {
      Id: tourItemId,
      Name: `${this.sophia.package.name} - Tour Services`,
      KaptioTravel__ExternalName__c: `${this.sophia.package.name} - Tour`,
      KaptioTravel__IsActive__c: true,
      KaptioTravel__RecordType__c: 'Service',
      KaptioTravel__Supplier__c: null,
      CurrencyIsoCode: this.sophia.pricing.currency
    });

    console.log(`  ✓ Generated Item records`);
  }

  /**
   * Generate pricing records
   */
  generatePricing() {
    if (!this.sophia.pricing.room_prices) return;

    const tourItemId = this.generateId('a1F', `${this.sophia.package.name}-Tour`);

    Object.entries(this.sophia.pricing.room_prices).forEach(([roomType, price]) => {
      const cleanRoomType = roomType.replace('_per_person', '').replace('_', ' ');
      const priceCategoryId = this.generateId('a2O', `${this.sophia.package.name}-${cleanRoomType}`);

      // Price Category
      this.addRecord('KaptioTravel__Price_Category__c', {
        Id: priceCategoryId,
        Name: this.capitalize(cleanRoomType),
        KaptioTravel__Item__c: tourItemId,
        KaptioTravel__IsActive__c: true,
        KaptioTravel__Sort__c: 1,
        CurrencyIsoCode: this.sophia.pricing.currency
      });

      // Item Price
      this.addRecord('KaptioTravel__Item_Price__c', {
        Id: this.generateId('a1E', `${priceCategoryId}-Price`),
        Name: `${this.capitalize(cleanRoomType)} - Price`,
        KaptioTravel__Item__c: tourItemId,
        KaptioTravel__SellPrice__c: price,
        KaptioTravel__NetPrice__c: price * 0.85, // Assume 15% margin
        CurrencyIsoCode: this.sophia.pricing.currency
      });
    });

    console.log(`  ✓ Generated Pricing records (${Object.keys(this.sophia.pricing.room_prices).length} room types)`);
  }

  /**
   * Generate Departure records
   */
  generateDepartures() {
    const packageId = this.generateId('a29', this.sophia.package.name);

    this.sophia.departures.forEach((departure, index) => {
      const departureId = this.generateId('a2T', `${packageId}-${departure.date}`);
      
      this.addRecord('KaptioTravel__PackageDeparture__c', {
        Id: departureId,
        Name: `${this.sophia.package.name} - ${departure.date}`,
        KaptioTravel__Package__c: packageId,
        KaptioTravel__DepartureDate__c: departure.date,
        KaptioTravel__Status__c: departure.status || 'Active',
        KaptioTravel__IsActive__c: true,
        CurrencyIsoCode: this.sophia.pricing.currency
      });

      // Generate AllotmentDay for this departure
      const capacity = departure.capacity || this.sophia.package.capacity?.max || 20;
      this.addRecord('KaptioTravel__AllotmentDay__c', {
        Id: this.generateId('a08', `${departureId}-Allotment`),
        Name: `Capacity - ${departure.date}`,
        KaptioTravel__Date__c: departure.date,
        KaptioTravel__TotalUnits__c: capacity,
        KaptioTravel__UnitsBooked__c: 0,
        KaptioTravel__UnitsReserved__c: 0
      });
    });

    console.log(`  ✓ Generated ${this.sophia.departures.length} Departure records`);
  }

  /**
   * Generate Package Day records (itinerary)
   */
  generateItinerary() {
    if (!this.sophia.itinerary) return;

    const packageId = this.generateId('a29', this.sophia.package.name);

    this.sophia.itinerary.forEach(day => {
      this.addRecord('KaptioTravel__PackageDay__c', {
        Id: this.generateId('a20', `${packageId}-Day${day.day}`),
        Name: `Day ${day.day}`,
        KaptioTravel__Package__c: packageId,
        KaptioTravel__Day__c: day.day,
        KaptioTravel__Title__c: day.title || `Day ${day.day}`,
        KaptioTravel__Description__c: day.description || '',
        KaptioTravel__Meals__c: day.meals ? day.meals.join(', ') : null,
        KaptioTravel__Accommodation__c: day.accommodation || null
      });
    });

    console.log(`  ✓ Generated ${this.sophia.itinerary.length} PackageDay records`);
  }

  /**
   * Finalize bundle metadata
   */
  finalizeBund() {
    // Count records
    let total = 0;
    for (const [objectType, records] of Object.entries(this.bundle.records)) {
      this.bundle.bundleMetadata.recordsByType[objectType] = records.length;
      total += records.length;
    }
    this.bundle.bundleMetadata.totalRecords = total;

    // Set package metadata
    this.bundle.bundleMetadata.packageName = this.sophia.package.name;
    this.bundle.bundleMetadata.packageType = this.getDisplayPackageType(this.sophia.package.type);

    // Build deployment order
    this.bundle.deploymentOrder = this.buildDeploymentOrder();
  }

  /**
   * Build deployment order
   */
  buildDeploymentOrder() {
    const order = [
      'KaptioTravel__Location__c',
      'KaptioTravel__PaymentScheduleConfiguration__c',
      'KaptioTravel__PaymentScheduleRule__c',
      'KaptioTravel__CancellationConfiguration__c',
      'KaptioTravel__CancellationRule__c',
      'KaptioTravel__Package__c',
      'KaptioTravel__Component__c',
      'KaptioTravel__Item__c',
      'KaptioTravel__Price_Category__c',
      'KaptioTravel__Item_Price__c',
      'KaptioTravel__ComponentOption__c',
      'KaptioTravel__PackageDeparture__c',
      'KaptioTravel__AllotmentDay__c',
      'KaptioTravel__PackageDay__c'
    ];

    return order.filter(objectType => this.bundle.records[objectType]);
  }

  /**
   * Get display package type
   */
  getDisplayPackageType(type) {
    const typeMap = {
      'land_only': 'Classic Land-Only (Principle)',
      'air_land': 'Classic Air+Land (Principle)',
      'combo_land': 'Combo Land-Only',
      'combo_air': 'Combo Air+Land',
      'linked': 'Linked Package'
    };
    return typeMap[type] || type;
  }

  /**
   * Capitalize string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Write bundle to file
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

  /**
   * Print transformation summary
   */
  printSummary() {
    console.log('━'.repeat(60));
    console.log('TRANSFORMATION SUMMARY');
    console.log('━'.repeat(60));
    console.log(`\n📥 Input (Simplified):`);
    console.log(`   ${JSON.stringify(this.sophia).length} characters`);
    console.log(`\n📤 Output (Gold Config):`);
    console.log(`   ${JSON.stringify(this.bundle).length} characters`);
    console.log(`\n📊 Expansion Ratio: ${Math.round(JSON.stringify(this.bundle).length / JSON.stringify(this.sophia).length)}x\n`);
    console.log(`💡 ${this.bundle.bundleMetadata.totalRecords} Salesforce records generated from simplified input\n`);
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let inputPath = null;
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      inputPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  if (!inputPath) {
    console.error('Error: --input is required');
    console.log('\nUsage: node transform-to-gold-config.js --input <simplified-json> --output <kaptio-bundle>');
    console.log('\nExample:');
    console.log('  node transform-to-gold-config.js --input my-package.json --output ../package-bundles/my-package-bundle.json');
    process.exit(1);
  }

  if (!outputPath) {
    outputPath = inputPath.replace('.json', '-bundle.json');
  }

  if (!path.isAbsolute(inputPath)) {
    inputPath = path.join(__dirname, inputPath);
  }
  if (!path.isAbsolute(outputPath)) {
    outputPath = path.join(__dirname, outputPath);
  }

  const transformer = new SophiaTransformer(inputPath, outputPath);
  transformer.transform()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = SophiaTransformer;

