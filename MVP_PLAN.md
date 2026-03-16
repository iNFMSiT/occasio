# MVP Plan - nanobanana Only

## Overview

This document outlines the MVP (Minimum Viable Product) implementation using **only nanobanana** for backend services. We'll add Google services and other enhancements in later phases.

---

## MVP Scope: nanobanana Only

### ✅ **What We'll Use**

1. **nanobanana API** - All AI services
   - Vision analysis
   - Image generation (single & batch)
   - Quality checking
   - Image upscaling
   - Job management (if provided)

2. **Browser Local Storage** - Client-side only
   - IndexedDB for job tracking
   - localStorage for user preferences
   - Temporary image cache

3. **No External Services** (for MVP)
   - ❌ No Google Sign-In (yet)
   - ❌ No Google Drive (yet)
   - ❌ No Google Sheets (yet)
   - ❌ No other third-party services

---

## MVP Architecture

```
┌─────────────────────────────────────────┐
│         Browser (Frontend Only)          │
├─────────────────────────────────────────┤
│ ✅ UI/UX (React/Vanilla JS)            │
│ ✅ Job Management (IndexedDB)          │
│ ✅ Image Cache (IndexedDB)              │
│ ✅ User Preferences (localStorage)      │
└─────────────────────────────────────────┘
                    │
                    │ API Calls
                    ▼
┌─────────────────────────────────────────┐
│         nanobanana Backend               │
├─────────────────────────────────────────┤
│ ✅ Vision Analysis                      │
│ ✅ Image Generation                     │
│ ✅ Quality Checking                     │
│ ✅ Image Upscaling                      │
│ ✅ Job Management (optional)            │
│ ✅ Image CDN/Storage (if provided)      │
└─────────────────────────────────────────┘
```

---

## MVP Implementation Checklist

### **Phase 1: Core Functionality** ✅

#### 1.1 Setup & Configuration
- [x] Frontend structure (already done)
- [x] API configuration (`src/config/api.js`)
- [x] API service (`src/services/api.js`)
- [ ] nanobanana API key setup
- [ ] Environment variables (`.env`)

#### 1.2 Image Upload & Vision Analysis
- [x] Upload step component
- [ ] Connect to `/api/vision/analyze`
- [ ] Display anchor description
- [ ] Error handling

#### 1.3 Survey & Prompt Generation
- [x] Survey step (style battles, mood sliders, etc.)
- [x] Mad libs with multiple templates
- [x] Mystery box themes
- [x] Prompt engine (`src/services/promptEngine.js`)
- [ ] Test prompt generation

#### 1.4 Style & Theme Selection
- [x] Style/theme selection step
- [x] Selection tracking
- [ ] Validation (min 1 style, 1 theme)

#### 1.5 Testing Step
- [x] Testing step component
- [ ] Connect to `/api/images/generate`
- [ ] Display test card
- [ ] Allow regeneration

### **Phase 2: Full Generation** 🚧

#### 2.1 Job Creation
- [x] Job manager (`src/services/jobManager.js`)
- [ ] Connect to `/api/jobs` (create job)
- [ ] Store job in IndexedDB
- [ ] Generate 52-card blueprint

#### 2.2 Batch Image Generation
- [ ] Connect to `/api/images/generate/batch`
- [ ] Handle batch responses
- [ ] Progress tracking
- [ ] Error handling for failed cards

#### 2.3 Quality Checking
- [x] Quality guard service (`src/services/qualityGuard.js`)
- [ ] Connect to `/api/quality/check`
- [ ] Auto-reject poor quality images
- [ ] Retry failed cards

#### 2.4 Progress Tracking
- [x] Progress step component
- [ ] Connect to `/api/jobs/{id}/status`
- [ ] Poll job status every 2 seconds
- [ ] Display progress bar
- [ ] Show completed cards

### **Phase 3: Finalization** 📋

#### 3.1 Image Upscaling
- [x] Upscale service (`src/services/upscaleService.js`)
- [ ] Connect to `/api/images/upscale`
- [ ] Batch upscale all 52 cards
- [ ] Progress tracking

#### 3.2 Card Gallery
- [x] Gallery component (`src/components/CardGallery.js`)
- [ ] Display all 52 cards
- [ ] Card selection
- [ ] Download individual cards
- [ ] Download all as ZIP

#### 3.3 Local Storage (IndexedDB)
- [ ] Set up IndexedDB schema
- [ ] Store jobs
- [ ] Store completed cards
- [ ] Retrieve on page reload
- [ ] Clear old data

#### 3.4 Error Handling & UX
- [ ] Loading states
- [ ] Error messages
- [ ] Retry mechanisms
- [ ] Offline handling
- [ ] User feedback

---

## Required nanobanana Endpoints (MVP)

### **Must Have:**
1. ✅ `POST /api/vision/analyze` - Vision analysis
2. ✅ `POST /api/images/generate` - Single image generation
3. ✅ `POST /api/images/generate/batch` - Batch generation
4. ✅ `POST /api/quality/check` - Quality checking
5. ✅ `POST /api/images/upscale` - Image upscaling

### **Nice to Have:**
6. ⚠️ `POST /api/jobs` - Create job (if not using local IndexedDB)
7. ⚠️ `GET /api/jobs/{id}/status` - Job status (if not using local IndexedDB)

### **Optional:**
8. ⚠️ Image CDN/storage - If nanobanana provides image URLs

---

## MVP Data Flow

### **User Journey:**

1. **Upload Photo**
   ```
   User uploads image
   → Frontend sends to /api/vision/analyze
   → nanobanana returns anchor description
   → Store in app state
   ```

2. **Complete Survey**
   ```
   User fills survey (style battles, mood, mad libs, etc.)
   → Store in app state
   → Generate prompts using promptEngine
   ```

3. **Select Styles & Themes**
   ```
   User selects 1-4 styles and themes
   → Store in app state
   ```

4. **Test Generation** (Optional)
   ```
   User clicks "Generate Test Card"
   → Frontend sends to /api/images/generate
   → nanobanana returns image URL
   → Display test card
   ```

5. **Start Full Generation**
   ```
   User clicks "Generate Full Deck"
   → Create job (local IndexedDB or /api/jobs)
   → Generate 52-card blueprint
   → Send batch request to /api/images/generate/batch
   → nanobanana processes and returns images
   → Store in IndexedDB
   → Display progress
   ```

6. **Quality Check** (Per Card)
   ```
   For each generated image:
   → Send to /api/quality/check
   → If failed, regenerate
   → If passed, continue
   ```

7. **Upscaling**
   ```
   After all cards generated:
   → Send each to /api/images/upscale
   → Store upscaled URLs
   → Display in gallery
   ```

8. **Download**
   ```
   User clicks "Download"
   → Create ZIP from upscaled images
   → Download to user's device
   ```

---

## Local Storage Strategy (IndexedDB)

### **Schema:**

```javascript
// Database: 'customcards'
// Version: 1

// Store: 'jobs'
{
  id: 'job_1234567890_abc',
  status: 'processing',
  progress: 45.5,
  totalCards: 52,
  completedCards: 24,
  failedCards: 2,
  cards: [
    {
      cardIndex: 0,
      imageUrl: 'https://...',
      upscaledUrl: 'https://...',
      prompt: '...',
      style: 'pixar',
      status: 'completed'
    }
  ],
  blueprint: [...],
  anchorDescription: '...',
  createdAt: '2024-01-13T...',
  updatedAt: '2024-01-13T...'
}

// Store: 'preferences'
{
  apiKey: '...',
  devMode: false,
  lastJobId: 'job_...'
}
```

### **Implementation:**

```javascript
// src/utils/db.js
import { openDB } from 'idb';

const DB_NAME = 'customcards';
const DB_VERSION = 1;

export async function initDB() {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Jobs store
      if (!db.objectStoreNames.contains('jobs')) {
        const jobsStore = db.createObjectStore('jobs', { keyPath: 'id' });
        jobsStore.createIndex('status', 'status');
        jobsStore.createIndex('createdAt', 'createdAt');
      }
      
      // Preferences store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' });
      }
    }
  });
}

export async function saveJob(job) {
  const db = await initDB();
  return await db.put('jobs', job);
}

export async function getJob(jobId) {
  const db = await initDB();
  return await db.get('jobs', jobId);
}

export async function getAllJobs() {
  const db = await initDB();
  return await db.getAll('jobs');
}
```

---

## MVP Limitations (By Design)

### **What We're NOT Doing (Yet):**

1. **No User Accounts**
   - No login/authentication
   - Jobs stored locally only
   - Lost if browser data cleared

2. **No Cloud Storage**
   - Images only in IndexedDB (temporary)
   - No cross-device access
   - No sharing capabilities

3. **No Analytics**
   - No user tracking
   - No usage statistics
   - No error logging to server

4. **No Payment Processing**
   - No subscription management
   - No billing integration

5. **No Social Features**
   - No sharing decks
   - No community features

---

## Future Enhancements (Post-MVP)

### **Phase 2: Google Integration**
- [ ] Google Sign-In (user accounts)
- [ ] Google Drive (permanent storage)
- [ ] Cross-device access

### **Phase 3: Enhanced Features**
- [ ] Social sharing
- [ ] Deck templates
- [ ] Advanced customization
- [ ] Print ordering integration

### **Phase 4: Scale & Optimize**
- [ ] Analytics
- [ ] Performance optimization
- [ ] Caching strategies
- [ ] CDN integration

---

## MVP Success Criteria

### **Must Work:**
- ✅ User can upload photo
- ✅ System extracts anchor description
- ✅ User can complete survey
- ✅ User can generate test card
- ✅ User can generate full 52-card deck
- ✅ System checks quality and retries failed cards
- ✅ System upscales all cards
- ✅ User can download deck as ZIP

### **Nice to Have:**
- ⚠️ Jobs persist across page reloads
- ⚠️ Progress tracking works
- ⚠️ Error handling is robust

---

## Next Steps

### **Immediate (This Week):**
1. Set up nanobanana API key
2. Test vision analysis endpoint
3. Test single image generation
4. Implement IndexedDB for jobs

### **Short Term (Next Week):**
1. Implement batch generation
2. Add quality checking
3. Add progress tracking
4. Test full flow end-to-end

### **Before Launch:**
1. Add upscaling
2. Polish UI/UX
3. Error handling
4. Testing & bug fixes

---

## Development Priorities

1. **Core Flow** - Get basic generation working
2. **Error Handling** - Make it robust
3. **User Feedback** - Loading states, progress bars
4. **Polish** - UI improvements, edge cases

---

## Notes

- **Keep it simple** - MVP should be minimal but functional
- **Focus on core** - Image generation is the main feature
- **Local first** - Use IndexedDB for everything possible
- **Add later** - Google services, accounts, etc. can wait

This MVP gets you a working product with nanobanana only. Once it's stable, we can add Google services and other enhancements.
