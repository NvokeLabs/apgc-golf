# APGC Golf Assets Guide

This document explains where to place your APGC Golf branding assets.

## Required Assets

### 1. APGC Logo
**Location:** `/public/logo-apgc.svg` or `/public/logo-apgc.png`

**Specifications:**
- Format: SVG (preferred) or PNG with transparent background
- Recommended size: 200x60px (or maintain aspect ratio)
- Color: Should work on both light and dark backgrounds
- Usage: Header navigation, footer, admin panel

**Current Status:** ⚠️ Placeholder SVG in place - Replace with actual logo

**How to replace:**
1. Export your logo as SVG or PNG
2. Name it `logo-apgc.svg` or `logo-apgc.png`
3. Place it in `/public/` directory
4. The app will automatically use it

---

### 2. Hero Background Images
**Location:** `/public/hero/`

**Specifications:**
- Format: JPG or WebP (WebP preferred for performance)
- Recommended size: 1920x1080px (Full HD)
- Aspect ratio: 16:9
- File size: < 500KB (optimize for web)
- Quality: 80-85% compression

**Suggested images:**
- `hero-golf-course.jpg` - Main golf course aerial view
- `hero-tournament.jpg` - Tournament action shot
- `hero-clubhouse.jpg` - Clubhouse or facilities
- `hero-players.jpg` - Players on the course

**Current Status:** ⚠️ Using Unsplash placeholder images

**How to add:**
1. Create `/public/hero/` directory
2. Add your hero images with descriptive names
3. Update the HeroBlock component or use Payload CMS to upload

---

### 3. Favicon
**Location:** `/public/favicon.svg` and `/public/favicon.ico`

**Specifications:**
- SVG: Scalable vector format (preferred)
- ICO: 32x32px for legacy browser support
- Should be recognizable at small sizes

**Current Status:** ✅ Generic favicon in place - Replace with APGC branding

**How to replace:**
1. Create a simple, recognizable icon (usually just the "A" or golf ball)
2. Export as SVG and ICO
3. Replace existing files in `/public/`

---

### 4. Open Graph Image
**Location:** `/public/og-image.jpg`

**Specifications:**
- Format: JPG or PNG
- Size: 1200x630px (Facebook/LinkedIn standard)
- Aspect ratio: 1.91:1
- File size: < 300KB
- Should include: APGC logo, tagline, and appealing golf imagery

**Current Status:** ⚠️ Generic template image - Replace with APGC branding

**Usage:** Shows when sharing links on social media

---

## Optional Assets

### 5. Sponsor Logos
**Location:** Upload via Payload CMS Admin Panel

**Specifications:**
- Format: PNG with transparent background or SVG
- Recommended size: 400x200px (maintain aspect ratio)
- Should work on light backgrounds
- File size: < 100KB per logo

**How to add:**
1. Go to `/admin` → Sponsors collection
2. Upload logo for each sponsor
3. Logos will appear in the sponsor marquee

---

### 6. Player Photos
**Location:** Upload via Payload CMS Admin Panel

**Specifications:**
- Format: JPG or WebP
- Recommended size: 800x1067px (3:4 aspect ratio)
- Portrait orientation
- Professional quality
- File size: < 200KB per photo

**How to add:**
1. Go to `/admin` → Players collection
2. Upload photo for each player
3. Photos will appear in player cards and profiles

---

### 7. Event Images
**Location:** Upload via Payload CMS Admin Panel

**Specifications:**
- Format: JPG or WebP
- Recommended size: 1200x675px (16:9 aspect ratio)
- Landscape orientation
- File size: < 300KB per image

**How to add:**
1. Go to `/admin` → Events collection
2. Upload image for each event
3. Images will appear in event cards and detail pages

---

## Quick Start Checklist

- [ ] Replace `/public/logo-apgc.svg` with actual APGC logo
- [ ] Add hero images to `/public/hero/` directory
- [ ] Replace `/public/favicon.svg` and `/public/favicon.ico`
- [ ] Create and add `/public/og-image.jpg` for social sharing
- [ ] Upload sponsor logos via admin panel
- [ ] Upload player photos via admin panel
- [ ] Upload event images via admin panel

---

## Image Optimization Tips

1. **Use WebP format** when possible for better compression
2. **Compress images** before uploading (use tools like TinyPNG, Squoosh)
3. **Maintain aspect ratios** to avoid distortion
4. **Use descriptive filenames** (e.g., `hero-golf-course.jpg` not `IMG_1234.jpg`)
5. **Test on mobile** to ensure images look good on all devices

---

## Need Help?

If you need help with image optimization or have questions about asset specifications, refer to:
- Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- WebP Converter: https://squoosh.app/
- Image Compression: https://tinypng.com/

---

**Last Updated:** December 2024
