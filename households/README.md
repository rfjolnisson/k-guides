# Guide to Household Accounts in Kaptio

A comprehensive, actionable guide for travel operators implementing household-based customer management in Kaptio.

## 🌐 Live Site

**Production URL:** https://kaptio-household-guide.netlify.app

## 🎯 Purpose

This guide helps travel operators understand and implement Kaptio's Household account model—the recommended approach for managing customer data in the multi-day travel industry.

## ✨ Features

- **Stunning Visual Design** - Full Kaptio Design System implementation
- **Actionable Content** - Step-by-step configuration instructions
- **Code-Informed** - Based on actual Kaptio codebase and Tauck implementation
- **Interactive FAQs** - Expandable accordion sections
- **Migration Checklist** - Complete 5-phase implementation guide
- **Responsive** - Optimized for mobile, tablet, and desktop

## 📋 Content Sections

### 1. Hero & Quick Stats
- Compelling value proposition
- Key metrics: 1-click booking, 360° view, 32% repeat rate
- Kaptio branding

### 2. Overview
- What is the Household model
- Visual data model diagram
- Key distinction from Salesforce's built-in Household objects

### 3. Benefits (6 Key Points)
- Operational Efficiency
- 360° Customer View
- Natural Fit for Travel
- Product Compatibility
- Future-Proof
- Reduced Complexity

### 4. Visual Comparison
- Household Model (Recommended) - Green/success styling
- Person Account Model (Not Recommended) - Red/warning styling
- Side-by-side feature comparison

### 5. Step-by-Step Configuration
1. Create Household Record Type
2. Configure App Settings (`HouseholdAccountTypeApiName__c`)
3. Design Page Layout
4. Establish Naming Conventions (3 options provided)
5. Train Your Team

### 6. Booking Flow Demonstration
- 3-step visual flow
- "Magic of Repeat Bookings" highlight
- Real-world time savings example

### 7. Migration Strategy
- New customers: Start with Households
- Existing customers: 5-phase migration checklist
  - Phase 1: Discovery & Planning
  - Phase 2: Data Preparation
  - Phase 3: Sandbox Testing
  - Phase 4: Production Migration
  - Phase 5: Training & Adoption

### 8. FAQ Section (7 Questions)
- How to define households
- Mixed model considerations
- Life event handling (divorce, separation)
- Marketing Cloud integration
- Unrelated traveler groups
- B2B booking scenarios
- Migration timeline expectations

### 9. Call-to-Action
- Contact Kaptio for implementation support

## 🎨 Design Elements

### Kaptio Design System Components
- Primary colors: Teal (#032E36, #056F82)
- CTA color: Yellow (#FFBC42)
- Accent: Pink (#DE37A4)
- Lexend font family
- Custom Kaptio shadow system
- Responsive grid layouts

### Interactive Features
- Sticky navigation (appears on scroll)
- Smooth scroll to sections
- Expandable FAQ accordions
- Card hover effects (lift animation)
- Active button states

### Visual Enhancements
- Gradient backgrounds for emphasis
- Step numbers with gradient styling
- Color-coded comparison (green vs red)
- Data model ASCII diagram
- Icon system throughout

## 🔧 Technical Details

- **Framework**: Pure HTML, CSS, JavaScript
- **CSS**: Tailwind CSS 3.x via CDN
- **Fonts**: Lexend via Google Fonts
- **Icons**: Heroicons (inline SVG)
- **JavaScript**: Vanilla JS (no dependencies)

## 📂 File Structure

```
households/
├── index.html              # Complete guide (self-contained)
├── netlify.toml           # Netlify configuration
├── README.md              # This file
└── Guide to Household Accounts in Kaptio...md  # Original Notion export
```

## 🚀 Local Development

Simply open `index.html` in any browser. No build process or server required.

## 🔄 Deployment

### Updating Content

1. Edit `index.html`
2. Test locally by opening in browser
3. Deploy to Netlify:
   ```bash
   cd households
   netlify deploy --prod
   ```

### Creating New Netlify Site

If deploying to a new site:
```bash
netlify deploy --prod --create-site kaptio-household-guide --dir=.
```

## 📊 What Makes This Guide Superior

### Compared to Original Notion Document:

✅ **Visual Design** - Beautiful, branded UI vs plain text
✅ **Interactive** - FAQ accordions, smooth scrolling
✅ **Actionable Steps** - Clear 5-step configuration guide
✅ **Code Examples** - Real field names and setup paths from codebase
✅ **Migration Phases** - Detailed 5-phase checklist
✅ **Professional** - Ready to share with customers and prospects
✅ **Searchable** - SEO-optimized with proper meta tags
✅ **Accessible** - WCAG AA compliant with keyboard navigation

### Research-Backed Content:

- ✅ Analyzed Kaptio codebase (`BookingWizardContactSearchController.cls`)
- ✅ Reviewed actual Household Record Type configuration
- ✅ Examined Tauck IUT implementation patterns
- ✅ Incorporated App Settings fields (`HouseholdAccountTypeApiName__c`)
- ✅ Referenced real Passenger-Household relationships
- ✅ Used actual page layout recommendations

## 🎯 Target Audience

- **New Kaptio customers** - Configuration guidance
- **Existing customers** - Migration strategy
- **Implementation teams** - Technical reference
- **Sales/CSM teams** - Customer education resource

## 📈 Key Metrics Highlighted

- **1-Click**: Add all household members
- **360°**: Complete family view
- **32%**: Average repeat customer rate
- **100%**: Kaptio's strategic direction

## 📞 Support

For implementation questions:
- Email: support@kaptio.com
- Contact: https://www.kaptio.com/contact

---

Built with the Kaptio Design System

