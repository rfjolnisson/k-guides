# Deployment Guide: k-guides to Netlify

## Quick Deploy (Recommended)

### Option 1: Netlify Drop (Easiest)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `k-guides` folder onto the drop zone
3. Netlify will deploy immediately and give you a URL

### Option 2: Netlify CLI

1. Install Netlify CLI (if not already installed):
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy from this directory:
```bash
cd /Users/ragnarfjolnisson/Documents/2025\ Coding/k-guides
netlify deploy
```

4. For production deployment:
```bash
netlify deploy --prod
```

### Option 3: Connect GitHub Repo

1. Initialize git repo (if not done):
```bash
git init
git add .
git commit -m "Initial commit: Gold Config Package Guide"
```

2. Create GitHub repo and push:
```bash
gh repo create k-guides --public --source=. --remote=origin --push
```

3. Connect to Netlify:
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repo
   - Netlify will auto-detect settings from `netlify.toml`

---

## Site Configuration

### Files
- `netlify.toml` - Netlify configuration (already created)
- `.gitignore` - Git ignore rules (already created)
- `index.html` - Entry point (navigation hub)
- `gold-config-package-showcase.html` - Main guide
- `*.md` - Reference documentation

### Build Settings
- **Publish directory:** `.` (current directory - static site)
- **Build command:** None needed (static HTML)
- **Node version:** 20 (specified in netlify.toml)

### Routes
- `/` → index.html (navigation hub)
- `/gold-config-package-showcase.html` → Main guide
- `/PACKAGE_SCHEMA_ANALYSIS.md` → Technical reference
- `/COMPLETE_DATA_MODEL_REFERENCE.md` → Data model reference

---

## Post-Deployment

### Get Your Site URL
After deployment, Netlify provides a URL like: `https://k-guides-abc123.netlify.app`

### Custom Domain (Optional)
To use a custom domain like `guides.kaptio.com`:

1. In Netlify dashboard → Domain settings
2. Add custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

### Share Links
- **Main Guide:** `https://your-site.netlify.app/gold-config-package-showcase.html`
- **Index:** `https://your-site.netlify.app/`

---

## Updating the Site

### After making changes:

**If using Netlify Drop:**
- Re-drag the folder to update

**If using Netlify CLI:**
```bash
netlify deploy --prod
```

**If using GitHub:**
- Commit and push changes
- Netlify auto-deploys

---

## Troubleshooting

### "Page not found" errors
- Check `netlify.toml` is in root directory
- Verify all HTML files are present

### Styles not loading
- Check Tailwind CSS CDN link is working
- Verify Google Fonts link is present

### Interactive features not working
- Check JavaScript at bottom of HTML files
- Check browser console for errors

---

## Security Headers

The `netlify.toml` includes security headers:
- X-Frame-Options: Prevent clickjacking
- X-Content-Type-Options: Prevent MIME sniffing
- X-XSS-Protection: Enable XSS filtering
- Referrer-Policy: Control referrer information

---

## Support

For Netlify deployment issues:
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Support](https://answers.netlify.com/)

For guide content issues:
- Check README.md in this directory
- Contact: support@kaptio.com

