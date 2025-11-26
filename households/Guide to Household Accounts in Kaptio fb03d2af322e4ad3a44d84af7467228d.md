# Guide to Household Accounts in Kaptio

**A comprehensive guide to understanding, implementing, and migrating to the Household account model in Kaptio**

---

## What is the Household Model?

The Household model is Kaptio's recommended approach for managing customer data in the travel industry. In this model, a dedicated Account Record Type called "Household" is used, with all individual customer contacts (family members, travel companions) linked as Contacts to a single Household Account record.

<aside>
💡

**Key Distinction:** This is a Kaptio-specific approach that uses a custom Account Record Type. It does not utilize Salesforce's pre-built Household objects found in other products like Nonprofit Cloud or Health Cloud.

</aside>

---

## Household vs. Person Account Models

### Household Model (Recommended)

**Definition:** Multiple contacts (travelers) are linked to a single Account record with the "Household" record type.

**Benefits:**

- **Holistic customer view**: Provides a comprehensive, 360-degree view of all individuals within a household unit
- **Natural fit for travel**: Travel is often a group activity—this model supports viewing families or groups as a single purchasing unit
- **Simplified relationship management**: Easy to see who travels with whom, understand family structures, and manage communications
- **Repeat booking efficiency**: Dramatically speeds up itinerary creation for repeat customers who travel together
- **Reduced system complexity**: Avoids significant re-engineering of Kaptio features that are built around standard Account-Contact relationships
- **Future-proof**: All new Kaptio features and ongoing product enhancements are designed around the Household model

**Key Capabilities:**

- Individual interaction tracking is fully maintained through Contact-level activity tracking
- Contact roles can define specific relationships (e.g., "Primary Booker")
- Personal details, preferences, and communication history are tracked at the Contact level
- Marketing can target either the household or specific individuals

### Person Account Model

**Definition:** Each individual customer Contact becomes their own Account record in Salesforce, merging the Contact and Account objects.

**Limitations:**

- Makes it significantly more challenging to track and manage relationships within households or families
- Leads to a fragmented view of a travel group's collective history and value
- Less beneficial for the travel industry where the "household" or "traveling party" is often the primary customer unit
- Introduces considerable complexity and requires significant re-engineering of existing Kaptio functionalities
- Not aligned with Kaptio's product development roadmap

---

## Why Kaptio Recommends Households

### 1. Industry Alignment

Travel companies typically see high repeat bookings from families and groups. The Household model naturally supports this pattern with shared history and preferences.

### 2. Operational Efficiency

For customers with ~32% repeat business who travel together, the booking wizard allows adding all household members with a single click versus multiple lookup steps with Person Accounts.

### 3. Product Compatibility

Features that align naturally with Households:

- **Passengers and Itinerary Groups**: Built around the household concept
- **Payment Processing**: Simplified with a single household account as primary entity
- **Amendments & Cloning**: More intuitive for group travel
- **Email receipts and Sales Invoices**: Streamlined household-level communication

### 4. Future Development

**All new Kaptio features are being designed and built around the Household data model.** Choosing this model ensures customers will seamlessly benefit from the latest functionalities optimized for household-centric travel data.

---

## Understanding Household Definitions

### What Constitutes a Household?

This is a **business decision** that should be tailored to your operation:

**Typical Approaches:**

- **Co-habiting model**: People who live at the same address
- **Frequent travel companions**: People who regularly book together, regardless of living situation
- **Family units**: Related individuals who may or may not live together
- **Hybrid approach**: Different rules based on your customer segments

<aside>
⚠️

**Important Considerations:**

- Household definitions impact automated communications (welcome home emails, surveys, etc.)
- Clear business rules are needed for when to create, merge, or split households
- Balance efficiency gains with accurate representation of customer relationships
</aside>

### Common Scenarios

**Couple booking together** (shared address)

- Single household account with two contacts
- Shared booking history and preferences

**Family with children**

- One household account with multiple contacts
- Different passengers, typically one billing contact

**Repeat guest adds new household member**

- Add new contact to existing household account
- Inherit household-level history and preferences

**Household member books solo trip**

- Still linked to household for data continuity
- Booking associated with individual contact

**Split payment across household members**

- Payment allocation to specific contacts
- Household-level financial tracking

**Household-level promotions**

- Loyalty programs (e.g., "Bunnik Bucks")
- Shared benefits across all household members

**Reseller relationships**

- Can be managed at household level
- Separate from individual travel agent accounts

### Managing Household Changes

**Common Life Events:**

- **Divorce/Separation**: Change account name, update contact relationships, optionally break into separate households
- **Death**: Inactivate the contact, maintain household for surviving members
- **Marriage/Cohabitation**: Merge existing households or add contacts to existing household
- **Address changes**: Update household or split as appropriate

**System Capabilities:**

- Straightforward to rename accounts and update relationships
- Contacts can be moved between household accounts
- Standard Salesforce account management applies
- De-duplication features available to prevent duplicates

---

## The Booking Experience

### Creating a Booking with Household Accounts

**Step 1: Start from the Household Account**

- Navigate to the household account (e.g., "The Smith Household")
- All household members are visible as related contacts

**Step 2: Initiate Package Search**

- Start package search directly from the account
- System knows the household context

**Step 3: Add Passengers in Booking Wizard**

- All household members appear in the wizard
- **Single click to add all frequent travel companions**
- Or select specific members for this trip
- Easy to add travelers from other households if needed

**Step 4: Continue with Booking**

- Standard booking flow continues
- Payment associated with household account
- Communications can target household or individuals

### Creating New Households

**From Scratch:**

1. Create the Household Account record with appropriate name
2. Add contacts (travelers) to the household
3. Define contact roles (Primary Booker, etc.)
4. Set household-level preferences

**Naming Conventions:**

- Business decision—no enforced format
- Recommended: Descriptive names (e.g., "Smith-Johnson Family", "Anderson Household (Melbourne)")
- Helps with reporting and data cleanliness
- Consider including location for common surnames

**Best Practices:**

- Establish naming convention guidelines for your team
- Use phone system integration to auto-populate caller information
- Global search functionality to find existing households
- Regular data cleansing to prevent duplicates

---

## Migrating to Household Accounts

### For New Kaptio Customers

**Cleanest Approach:**

- Establish the "Household" Account Record Type from the outset
- Design processes to create Household Accounts and link Contacts
- No migration complexity—start fresh with the recommended model

### For Existing Kaptio Customers (Person Accounts → Households)

**Migration Strategy:**

A data transformation strategy is required involving:

**1. Identifying Households**

- Develop logic to group existing individual Contacts into appropriate household units
- Use criteria such as:
    - Shared addresses
    - Frequent co-travelers on bookings
    - Relationship data if available
    - Manual review for edge cases

**2. Data Cleansing and Deduplication**

- Review and clean existing contact data
- Identify and merge duplicate contacts
- Standardize naming conventions
- Validate address information

**3. Creating Household Accounts**

- Create new Account records with "Household" Record Type
- Apply naming conventions
- Set up appropriate account hierarchies if needed

**4. Parenting Contacts to Households**

- Update Contact records to link to their respective Household Account
- Preserve all individual-level data
- Maintain booking history and relationships

**5. Validation and Testing**

- Iterative testing in lower environments (UAT)
- Multiple test migration cycles
- Custom reports to validate data accuracy
- Comparison between source and target systems

<aside>
🎯

**Important Note:** This can be a complex undertaking, but the long-term benefits of a unified household view and alignment with future product development are considered to outweigh the initial effort.

</aside>

### Migration Scope Decisions

Determine what to migrate:

- **Active bookings only** (recommended for cleaner migration)
- **Active + recent historical bookings** (for reporting continuity)
- **All historical data** (most complex, consider data archiving instead)

### Go-Live Considerations

**Timing:**

- Plan for appropriate downtime window
- Consider low-activity periods (e.g., early January)
- Coordinate with all system integrations

**Approach:**

- **Big Bang** (most common): Full cutover during downtime
- Ensure no bookings are made in legacy system during migration
- Deploy code and migrate data simultaneously
- Repoint all systems after migration complete

**Rollback Planning:**

- Document rollback procedures
- Maintain legacy system access temporarily
- Clear success criteria for go-live

---

## Integration with Other Systems

### Marketing and Communication

**Marketing Cloud Integration:**

- Marketing continues to use Contact IDs
- Household model doesn't impact existing Marketing Cloud setup
- Can target at household or individual contact level
- Contact-level tracking for email engagement maintained

**Email Automation:**

- Receipts: Sent to payment contact
- Invoices: Per itinerary, directed to appropriate contact
- Marketing communications: Can use Contact-level segmentation
- Household-level communications: Use household relationship data

### E-commerce and Web Integration

**Current E-commerce API:**

- Fully supports Household model
- Package search works with household accounts
- Real-time availability and pricing
- Day-by-day itinerary details accessible

**Web Booking Flow:**

- Customers can be identified by household
- Pre-population of passenger details for known households
- Maintains marketing tracking capabilities

### Phone System Integration

**Ideal Flow:**

- 3CX or similar integration pops contact on incoming call
- Global search functionality to quickly find households
- Contact page displays household relationships
- Quick access to booking history at both contact and household level

---

## Technical Implementation Details

### Data Model

**Core Objects:**

- **Account** (Record Type: Household)
    - Household name
    - Primary address
    - Household-level preferences
    - Aggregate booking history
    - Financial summaries
- **Contact** (parented to Household Account)
    - Individual personal details
    - Contact preferences
    - Communication history
    - Passenger-specific data
- **Passenger** (links to Contact)
    - Booking-level passenger information
    - Can link to household or person account or standalone
    - Used for content and email generation

**Key Relationships:**

- One Account (Household) → Many Contacts
- One Contact → Many Passengers (across bookings)
- One Itinerary → One Account (billing)
- One Itinerary → Many Passengers → Many Contacts

### Configuration

**Account Record Type Setup:**

- Create "Household" record type
- Configure page layouts for household view
- Set up appropriate fields and sections

**Contact Roles:**

- Define roles (Primary Booker, Traveler, Billing Contact, etc.)
- Use standard Salesforce contact role functionality

**Validation Rules:**

- Ensure contacts are properly parented
- Validate household naming conventions
- Prevent orphaned contacts

---

## Best Practices and Recommendations

### Data Management

✅ **Establish clear household definition criteria**

- Document when to create new households vs. add to existing
- Define rules for splitting/merging households
- Train staff on consistent application

✅ **Implement naming conventions**

- Use descriptive, searchable household names
- Include location for common surnames if needed
- Document your standard format

✅ **Regular data cleansing**

- Schedule periodic duplicate reviews
- Update addresses and contact information
- Archive inactive contacts appropriately

✅ **Leverage Contact roles**

- Identify primary bookers clearly
- Track billing contacts
- Document relationships for better service

### Operational Workflows

✅ **New customer intake**

- Gather household information during first contact
- Ask about frequent travel companions
- Create household structure upfront

✅ **Repeat customer bookings**

- Start from household account to leverage efficiency
- Pre-populate passenger details automatically
- Add new household members as needed

✅ **Communication strategies**

- Use contact-level data for personalization
- Household-level for shared communications
- Respect individual preferences within households

### Training and Change Management

✅ **Staff training focus areas**

- When and how to create households
- Searching and finding existing households
- Managing household changes over time
- Booking flow differences from person accounts

✅ **Document your decisions**

- Household definition criteria
- Naming conventions
- Lifecycle management procedures
- Exception handling processes

---

## Common Questions and Edge Cases

### How do we handle groups of unrelated travelers?

Create a household if they frequently travel together, or create separate person accounts and link bookings via itinerary relationships. Business decision based on repeat booking likelihood.

### What about B2B bookings where we don't know travelers initially?

The Passenger object can be standalone without account linkage for initial bookings. Link to accounts when details become available.

### Can we use both Person Accounts and Households?

Technically possible but **not recommended**. Choose one model for consistency and to avoid complexity. Kaptio strongly recommends Households for all customers.

### How do households interact with travel agent accounts?

Travel agent accounts are separate—they're not household accounts. Maintain separate account structure for B2B relationships.

### What about deceased household members?

Inactivate the contact record. Maintain household for surviving members. Update household name if appropriate.

### How do we handle seasonal addresses or multiple properties?

Store primary address on household. Use contact-level address fields for individual variations. Consider custom fields for seasonal addresses if needed.

---

## Resources and Next Steps

### Documentation to Review

- Technical data model documentation (ERDs)
- Booking wizard user guides
- Migration templates and scripts (when available)
- Customer examples and case studies

### Getting Started

**New Implementations:**

1. Define your household criteria
2. Establish naming conventions
3. Configure household record type
4. Train staff on household creation
5. Start with household model from day one

**Existing Customers Considering Migration:**

1. Review this guide with stakeholders
2. Assess your data and repeat booking patterns
3. Define migration scope and approach
4. Request migration planning workshop with Kaptio
5. Plan iterative testing in lower environments

### Support and Questions

For implementation support, migration planning, or questions about the Household model:

- Engage with your Kaptio implementation team
- Request demos of specific scenarios
- Ask for customer references using Households
- Schedule technical deep-dives as needed

---

## Summary

The Household account model is Kaptio's strategic direction for customer data management in the travel industry. It provides:

- **Operational efficiency** for repeat bookings
- **Better customer insights** through household-level views
- **Alignment with product development** for future capabilities
- **Simplified system architecture** leveraging standard Salesforce patterns

While migration from Person Accounts requires planning and effort, the long-term benefits of unified household data and compatibility with Kaptio's product roadmap make it the recommended choice for all customers.

<aside>
✨

**Bottom Line:** Choose Households for new implementations. For existing customers, plan your migration to align with Kaptio's future and unlock operational efficiencies.

</aside>