# Kaptio CRM & Salesforce Licensing Whitepaper

A beautiful, interactive whitepaper that explains what's included in Kaptio's CRM offering and when additional Salesforce licenses may be needed. Built with the Kaptio Design System for consistent branding.

## 🌟 Features

- **Single-page scrollable design** with smooth navigation
- **Sticky navigation menu** that appears on scroll
- **Interactive FAQ accordion** with expand/collapse functionality
- **Responsive design** optimized for mobile, tablet, and desktop
- **Kaptio Design System** implementation with consistent branding
- **Print-friendly** styling for PDF generation
- **Trip & Itinerary showcase** highlighting Kaptio's unique customer journey tracking
- **Marketing integration emphasis** showing how Trip lifecycle integrates with automation platforms

## 📋 Content Sections

1. **Hero Section** - Introduction and value proposition
2. **What's Included in Kaptio** - Core CRM features and capabilities
   - ⭐ **Featured**: Trip & Itinerary objects (Kaptio's unique customer journey tracking)
   - Standard Salesforce platform features (Accounts, Contacts, Reports, etc.)
   - Marketing automation integration capabilities
3. **Understanding Platform Licenses** - Comparison table of Platform vs Full licenses
4. **ISV vs OEM Licensing Models** - Detailed comparison of licensing approaches
5. **When Additional Licenses May Be Needed** - Use cases requiring full Salesforce licenses
6. **Frequently Asked Questions** - Interactive accordion with common questions (8 questions)
   - Includes dedicated FAQ on Trip & Itinerary objects and marketing integration
7. **Call-to-Action** - Contact and demo request section

## 🚀 Deployment to Netlify

### Option 1: Drag & Drop (Easiest)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire `crm-licensing` folder onto the drop zone
3. Your site will be deployed instantly with a random URL
4. (Optional) Configure a custom domain in Netlify settings

### Option 2: Git-Based Deployment (Recommended for updates)

1. **Initialize Git repository** (if not already done):
   ```bash
   cd crm-licensing
   git init
   git add .
   git commit -m "Initial commit: Kaptio CRM licensing whitepaper"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Netlify**:
   - Log in to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Connect to your GitHub account
   - Select your repository
   - Configure build settings:
     - **Base directory**: `crm-licensing`
     - **Build command**: (leave empty)
     - **Publish directory**: `.` (current directory)
   - Click "Deploy site"

4. **Configure custom domain** (optional):
   - Go to Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

### Option 3: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy from the crm-licensing directory**:
   ```bash
   cd crm-licensing
   netlify deploy
   ```

4. **For production deployment**:
   ```bash
   netlify deploy --prod
   ```

## 🎨 Design System

This whitepaper uses the Kaptio Design System with the following key elements:

### Colors
- **Primary**: `#032E36` (Kaptio Primary 800)
- **CTA**: `#FFBC42` (Kaptio Yellow 400)
- **Background**: `#F9FAF8`
- **Accent**: `#056F82` (Kaptio Primary 400)

### Typography
- **Font**: Lexend (via Google Fonts)
- **Headings**: 700 weight, Kaptio Primary 800
- **Body**: 300 weight, Kaptio Black

### Components
- Cards with custom Kaptio shadow
- Yellow primary CTA buttons
- Status badges for license types
- Smooth transitions (200ms)
- Interactive hover effects

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility

- Semantic HTML5 structure
- ARIA labels for interactive elements
- Keyboard navigation support
- WCAG AA color contrast compliance
- Focus states on all interactive elements

## 📝 Making Updates

### Content Updates

To update content, simply edit the `index.html` file:

1. Find the section you want to update
2. Modify the text or add new elements
3. Save the file
4. If using Git-based deployment, commit and push:
   ```bash
   git add index.html
   git commit -m "Update content"
   git push
   ```
   Netlify will automatically redeploy

### Styling Updates

All styles are embedded in the `<style>` tag within `index.html`. The whitepaper uses:
- Tailwind CSS (via CDN) with custom Kaptio configuration
- Custom CSS for animations and special effects

### Adding New Sections

1. Add new section HTML before the CTA section
2. Add navigation link in the sticky nav
3. Update smooth scroll anchor handling if needed

## 🔧 Technical Details

- **Framework**: Pure HTML, CSS, JavaScript (no build process)
- **CSS**: Tailwind CSS 3.x via CDN + custom styles
- **Fonts**: Lexend via Google Fonts
- **Icons**: Heroicons (inline SVG)
- **JavaScript**: Vanilla JS for interactivity

## 📄 File Structure

```
crm-licensing/
├── index.html          # Main whitepaper (self-contained)
├── netlify.toml        # Netlify configuration
└── README.md           # This file
```

## 🎯 Use Cases

This whitepaper is designed for:

- **Sales enablement** - Help prospects understand licensing
- **Customer onboarding** - Clarify what's included in Kaptio
- **Internal training** - Educate team members on licensing models
- **RFP responses** - Provide detailed licensing information

## 📞 Support

For questions about content or deployment:
- Email: sales@kaptio.com
- Website: https://www.kaptio.com

## 📊 Analytics (Optional)

To add analytics tracking, insert your tracking code in the `<head>` section of `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 Security

The `netlify.toml` configuration includes security headers:
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff (prevents MIME sniffing)
- X-XSS-Protection: enabled
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrictive

## 📜 License

© 2025 Kaptio. All rights reserved.

---

Built with ❤️ using the Kaptio Design System

