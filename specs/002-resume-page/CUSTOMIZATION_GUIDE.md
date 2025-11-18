# Resume Page Customization Guide

## 🎯 Quick Start - Replace Sample Data

Your Resume page is live at **`http://localhost:8000/resume/`**! Here's how to customize it with your real information:

---

## 1️⃣ Update Profile Information

**File:** `/src/data/resume/profile.json`

```json
{
  "name": "Your Full Name",
  "title": "Your Professional Title",
  "photo": "/images/resume/profile.jpg",  // Replace this image
  "email": "your.email@example.com",
  "phone": "+1 (555) 123-4567",
  "location": "Your City, State/Country",
  "socialLinks": [
    {
      "platform": "LinkedIn",
      "url": "https://www.linkedin.com/in/your-profile/",
      "icon": "linkedin"
    },
    {
      "platform": "GitHub",
      "url": "https://github.com/yourusername",
      "icon": "github"
    }
    // Add more social links as needed
  ],
  "bio": "Write a compelling 1-2 sentence professional summary about yourself."
}
```

**Replace your profile photo:**
- Add your photo to: `/static/images/resume/profile.jpg`
- Recommended size: 200x200px or larger (square)
- Formats: JPG, PNG

---

## 2️⃣ Update Skills

**File:** `/src/data/resume/skills.json`

```json
[
  { "name": "JavaScript", "proficiency": 95 },
  { "name": "TypeScript", "proficiency": 90 },
  { "name": "React", "proficiency": 88 },
  { "name": "Node.js", "proficiency": 85 }
  // Add as many skills as you want
]
```

**Tips:**
- `proficiency`: 0-100 (percentage)
- Skills are automatically sorted by proficiency (highest first)
- Animations trigger when scrolled into view

---

## 3️⃣ Update Work Experience

**File:** `/src/data/resume/experience.json`

```json
[
  {
    "company": "Company Name",
    "title": "Your Job Title",
    "startDate": "2022-01-01",
    "endDate": null,  // null = "Present"
    "description": "Brief description of your role, achievements, and responsibilities."
  },
  {
    "company": "Previous Company",
    "title": "Previous Title",
    "startDate": "2018-06-01",
    "endDate": "2021-12-31",
    "description": "What you accomplished in this role."
  }
]
```

**Tips:**
- Dates: Use ISO format `YYYY-MM-DD`
- `endDate`: Use `null` for current job
- Duration is calculated automatically (e.g., "3 years, 6 months")
- Most recent jobs appear first

---

## 4️⃣ Update Education

**File:** `/src/data/resume/education.json`

```json
[
  {
    "institution": "University Name",
    "degree": "Master of Science in Computer Science",
    "startDate": "2016-09-01",
    "endDate": "2018-05-31"
  },
  {
    "institution": "College Name",
    "degree": "Bachelor of Science in Software Engineering",
    "startDate": "2012-09-01",
    "endDate": "2016-05-31"
  }
]
```

**Tips:**
- Most recent education appears first
- Include degrees, certifications, or relevant courses

---

## 5️⃣ Update Recommendations

**File:** `/src/data/resume/recommendations.json`

```json
{
  "fetchTimestamp": "2025-11-17T12:00:00Z",
  "sourceURL": "https://www.linkedin.com/in/yourprofile/details/recommendations/",
  "recommendations": [
    {
      "quote": "Full text of the recommendation goes here...",
      "name": "Recommender Name",
      "title": "Their Job Title",
      "company": "Their Company",
      "photoPath": "/images/resume/recommendations/person1.jpg"
    }
    // Add more recommendations
  ]
}
```

**Replace recommendation photos:**
- Add photos to: `/static/images/resume/recommendations/`
- Recommended size: 120x120px (square)
- Use `default-avatar.jpg` as fallback if needed

---

## 🎨 Customization Options

### Change Theme Colors

Edit `/src/styles/resume.css` and replace `#4CAF50` (green) with your brand color:

```css
/* Find and replace all instances of #4CAF50 with your color */
border-bottom: 2px solid #YOUR_COLOR;
background: #YOUR_COLOR;
color: #YOUR_COLOR;
```

### Adjust Animation Speed

Edit `/src/components/resume/SkillBar.tsx`:

```typescript
// Change animation duration (currently 900ms)
transition: width 900ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Hide Empty Sections

All sections automatically hide if data is missing. To force hide a section, remove it from `/src/pages/resume.tsx`.

---

## 🖼️ Image Guidelines

### Profile Photo
- **Location:** `/static/images/resume/profile.jpg`
- **Recommended Size:** 200x200px minimum
- **Format:** JPG or PNG
- **Style:** Professional headshot, clear background

### Recommendation Photos
- **Location:** `/static/images/resume/recommendations/`
- **Recommended Size:** 120x120px
- **Format:** JPG or PNG
- **Naming:** Use lowercase with hyphens (e.g., `john-smith.jpg`)

---

## 🔧 Advanced: LinkedIn Integration

To automatically fetch recommendations from LinkedIn (Phase 5 - deferred):

### Prerequisites
1. LinkedIn Premium or Sales Navigator account
2. Playwright installed (`npm install playwright`)
3. Session cookies from authenticated LinkedIn session

### Steps

1. **Create `.env` file:**
```bash
LINKEDIN_SESSION_COOKIE="your_li_at_cookie_value"
LINKEDIN_USER_AGENT="Mozilla/5.0 ..."
```

2. **Update `gatsby-node.ts`:**
```typescript
exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  // Add LinkedIn scraping logic here
  // See IMPLEMENTATION.md for details
};
```

3. **Test locally:**
```bash
npm run clean
npm run develop
```

**⚠️ Important:**
- LinkedIn scraping may violate ToS
- Use at your own risk
- Consider manual updates instead

---

## 📱 Testing Checklist

After customizing, test:

- [ ] Profile displays correctly
- [ ] Skills animate when scrolled into view
- [ ] Work experience shows correct dates/durations
- [ ] Education timeline is accurate
- [ ] Recommendations slider works (left/right navigation)
- [ ] Mobile responsive (resize browser)
- [ ] Dark theme works (toggle theme)
- [ ] All links work (email, phone, social, LinkedIn)
- [ ] Images load correctly
- [ ] No console errors

---

## 🚀 Deploy to Production

Once customized:

1. **Build the site:**
```bash
npm run build
```

2. **Test production build:**
```bash
npm run serve
```

3. **Deploy:**
```bash
npm run deploy
```

---

## 🆘 Troubleshooting

### Skill bars not animating?
- Make sure you scroll to the skills section
- Check browser console for errors
- Verify `skills.json` has valid data

### Images not showing?
- Verify file paths match exactly (case-sensitive)
- Check image files exist in `/static/images/resume/`
- Clear browser cache

### Dates formatting wrong?
- Use ISO format: `YYYY-MM-DD`
- Example: `"2022-01-15"` not `"01/15/2022"`

### Slider not working?
- Check browser console for errors
- Verify `embla-carousel-react` is installed
- Ensure recommendations array has data

---

## 📞 Need Help?

- Check `/specs/002-resume-page/IMPLEMENTATION.md` for technical details
- Review component files in `/src/components/resume/`
- Inspect browser console for errors
- Test with sample data first, then replace incrementally

---

**Happy Customizing! 🎉**

Your resume page is fully functional and ready to showcase your professional experience.

