# Deploy Bundle Integration to Netlify

**Date:** November 26, 2025  
**Issue:** JSON bundle loading not working on Netlify  
**Fix:** Updated netlify.toml and HTML error handling

---

## Problem

The Gold Config guide on Netlify (https://kaptio-gold-configuration.netlify.app/gold-config-package-showcase) shows an error when trying to load the package bundle JSON:

```
Error loading bundle: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This happens because the catch-all redirect in `netlify.toml` was rewriting ALL requests (including `.json` files) to `/index.html`.

---

## Solution

### 1. Updated netlify.toml

**Changed:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**To:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

**Impact:** `force = false` means the redirect only applies if the requested file doesn't exist. This allows JSON files, HTML files, and other assets to be served normally.

**Also Added:**
```toml
[[headers]]
  for = "/package-bundles/*.json"
  [headers.values]
    Content-Type = "application/json"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600"
```

**Impact:** Proper headers for JSON files with CORS support.

---

### 2. Updated HTML Error Handling

Enhanced the JavaScript error handling in `gold-config-package-showcase.html` to provide better error messages when bundles can't be loaded.

---

## Deployment Steps

To fix the Netlify site:

### Step 1: Commit and Push Changes

```bash
cd /Users/ragnarfjolnisson/Documents/2025\ Coding/k-guides

# Add all new files
git add package-bundles/
git add package-extractor/
git add netlify.toml
git add gold-config-package-showcase.html
git add serve.sh
git add DEPLOY_BUNDLE_INTEGRATION.md

# Commit
git commit -m "Add package extraction system and deployable JSON bundles

- Complete package extractor with recursive dependency extraction
- japan-discovery-land-only.json bundle (85 records)
- Deployment wizard design documentation
- Updated netlify.toml to allow JSON file serving
- Enhanced HTML with real bundle JSON viewer integration
- Added serve.sh for local HTTP server"

# Push to trigger Netlify deployment
git push origin main
```

### Step 2: Verify Deployment

After Netlify build completes (~30 seconds):

1. Visit: https://kaptio-gold-configuration.netlify.app/gold-config-package-showcase
2. Scroll to "Classic Land-Only Package" section
3. Click "Click to view complete bundle (83 records, 15 object types) →"
4. Should see the actual JSON bundle loaded (instead of error)

### Step 3: Test Bundle Loading

Check that the JSON file is accessible directly:
- Visit: https://kaptio-gold-configuration.netlify.app/package-bundles/japan-discovery-land-only.json
- Should see JSON content (not redirected to index.html)

---

## What's Being Deployed

### New Files

```
package-bundles/
  ├── japan-discovery-land-only.json      (200 KB - 85 records)
  └── japan-land-only-mappings-example.json (10 KB - sample mappings)

package-extractor/
  ├── extract-package.js                  (Extraction tool)
  ├── validate-bundle.js                  (Validation tool)
  ├── dependency-map.json                 (Object relationships)
  ├── field-mapping-rules.json            (Field categorization)
  ├── deployment-schema.json              (Bundle spec)
  ├── README.md                           (System overview)
  ├── QUICK_START.md                      (Getting started)
  ├── DEPLOYMENT_WIZARD_DESIGN.md         (Complete wizard spec)
  ├── EXTERNAL_DEPENDENCIES.md            (Dependency strategy)
  └── IMPLEMENTATION_SUMMARY.md           (What was built)

serve.sh                                   (Local HTTP server script)
DEPLOY_BUNDLE_INTEGRATION.md               (This file)
```

### Modified Files

- `netlify.toml` - Fixed redirect to allow JSON serving
- `gold-config-package-showcase.html` - Added bundle JSON viewer
- `README.md` - Added package extraction system docs

---

## Expected Result

After deployment, visitors to the Gold Config guide will:

1. ✅ See "Deploy to My Environment" button (clickable, shows coming soon alert)
2. ✅ Expand "Click to view complete bundle" section
3. ✅ See actual JSON bundle load dynamically
4. ✅ View 85 records with complete package configuration
5. ✅ Download bundle via link if desired

---

## Troubleshooting

### If JSON still doesn't load after deployment:

**Check 1: File is deployed**
```bash
curl https://kaptio-gold-configuration.netlify.app/package-bundles/japan-discovery-land-only.json
```

Should return JSON, not HTML.

**Check 2: CORS headers**
Open browser dev tools (F12) → Network tab → Reload page → Check JSON request
- Should have `Content-Type: application/json`
- Should have `Access-Control-Allow-Origin: *`

**Check 3: Redirect not interfering**
If still getting redirected, try:
```toml
# Alternative: Explicitly exclude patterns
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["missing"]}
  
# Or be more specific:
[[redirects]]
  from = "/:page"
  to = "/index.html"
  status = 200
  conditions = {Role = ["missing"]}
```

---

## Testing Locally

Before deploying, test locally:

```bash
cd k-guides
./serve.sh

# Open: http://localhost:8000/gold-config-package-showcase.html
# Click "View complete bundle"
# Should see JSON load successfully
```

If it works locally with the HTTP server, it will work on Netlify after deployment.

---

## Rollback Plan

If something breaks:

```bash
# Revert netlify.toml
git checkout HEAD~1 netlify.toml

# Or revert specific change
git revert <commit-hash>

# Push
git push origin main
```

---

## Success Criteria

- ✅ JSON bundle accessible at `/package-bundles/japan-discovery-land-only.json`
- ✅ HTML guide loads bundle via JavaScript
- ✅ No CORS errors in browser console
- ✅ "Deploy" button shows wizard alert
- ✅ Download link works

---

**Status:** Ready to deploy  
**Risk:** Low (only adding files and fixing redirect)  
**Rollback:** Easy (revert commit if needed)

---

**Next Step:** Commit and push the changes above to trigger Netlify deployment.

