# API Endpoints Setup Guide for Beginners

This guide explains all the API endpoints your backend needs and how to set them up step-by-step.

## 📋 Overview

Your frontend app needs **7 API endpoints** to work. All endpoints should be available at:
```
https://nanobnana.com/api/[endpoint-name]
```

**Important:** All endpoints require authentication. The frontend sends the API key in the `Authorization` header like this:
```
Authorization: Bearer YOUR_API_KEY
```

---

## 🔐 Step 1: Set Up Authentication

Before creating any endpoints, you need to verify the API key.

### How to Check Authentication

1. Read the `Authorization` header from the request
2. Extract the API key (remove "Bearer " prefix)
3. Verify it matches a valid API key in your database
4. If invalid, return `401 Unauthorized`

### Example (Node.js/Express):
```javascript
function verifyApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  // Check if apiKey is valid (compare with database)
  if (!isValidApiKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.apiKey = apiKey;
  next();
}
```

---

## 📍 Endpoint 1: Vision Analysis

**What it does:** Analyzes a photo to describe the person (age, appearance, clothing). This description is used to keep all 52 cards consistent.

**Endpoint:** `POST /api/vision/analyze`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data` (because we're uploading an image)
- Body: Form data with `image` field containing the image file
- Header: `Authorization: Bearer YOUR_API_KEY`

**Response (Success):**
```json
{
  "description": "Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses, casual clothing",
  "confidence": 0.95
}
```

**Response (Error):**
```json
{
  "error": "No image provided"
}
```

### How to Implement:

1. **Receive the image file** from the form data
2. **Use a vision AI model** (like GPT-4 Vision, Claude Vision, or similar) to analyze it
3. **Extract key details:**
   - Age range
   - Gender
   - Hair color and length
   - Facial features
   - Clothing style
   - Accessories (glasses, etc.)
4. **Return a text description** that can be added to prompts

### Example (Node.js/Express):
```javascript
app.post('/api/vision/analyze', verifyApiKey, async (req, res) => {
  try {
    // Get the uploaded image
    const imageFile = req.files.image;
    if (!imageFile) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Use your vision AI service (e.g., OpenAI, Anthropic, etc.)
    const description = await analyzeImageWithAI(imageFile);
    
    res.json({
      description: description,
      confidence: 0.95
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📍 Endpoint 2: Single Image Generation

**What it does:** Generates one AI image based on a text prompt and style.

**Endpoint:** `POST /api/images/generate`

**Request:**
```json
{
  "prompt": "Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses, casual clothing, as a famous celebrity, in Pixar 3D style, close-up shot, epic mood, high quality, detailed, professional",
  "style": "pixar",
  "test": false
}
```

**Response:**
```json
{
  "imageUrl": "https://cdn.nanobnana.com/generated/image_12345.png",
  "prompt": "...",
  "style": "pixar"
}
```

### How to Implement:

1. **Receive the prompt and style** from the request body
2. **Call your image generation service** (DALL-E, Midjourney, Stable Diffusion, etc.)
3. **Apply the style** to the generation
4. **Upload the generated image** to your CDN/storage
5. **Return the public URL** of the image

### Example (Node.js/Express):
```javascript
app.post('/api/images/generate', verifyApiKey, async (req, res) => {
  try {
    const { prompt, style, test } = req.body;
    
    // Generate image using your AI service
    const imageBuffer = await generateImageWithAI(prompt, style);
    
    // Upload to storage (AWS S3, Cloudinary, etc.)
    const imageUrl = await uploadImageToStorage(imageBuffer);
    
    res.json({
      imageUrl: imageUrl,
      prompt: prompt,
      style: style
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📍 Endpoint 3: Batch Image Generation

**What it does:** Generates multiple images at once (for all 52 cards). More efficient than generating one at a time.

**Endpoint:** `POST /api/images/generate/batch`

**Request:**
```json
{
  "prompts": [
    {
      "cardIndex": 0,
      "prompt": "Male, late 20s... as a Viking...",
      "style": "pixar"
    },
    {
      "cardIndex": 1,
      "prompt": "Male, late 20s... as a wizard...",
      "style": "watercolor"
    }
    // ... up to 52 prompts
  ],
  "jobId": "job_1234567890_abc123"
}
```

**Response:**
```json
[
  {
    "cardIndex": 0,
    "imageUrl": "https://cdn.nanobnana.com/generated/card_0.png",
    "prompt": "...",
    "style": "pixar"
  },
  {
    "cardIndex": 1,
    "imageUrl": "https://cdn.nanobnana.com/generated/card_1.png",
    "prompt": "...",
    "style": "watercolor"
  }
  // ... array of all results
]
```

### How to Implement:

1. **Receive the array of prompts** from the request body
2. **Process images in parallel** (or sequentially if your service has rate limits)
3. **Generate each image** using the same process as single generation
4. **Return results in the same order** as the input
5. **Include the `cardIndex`** in each response to match with the original request

### Example (Node.js/Express):
```javascript
app.post('/api/images/generate/batch', verifyApiKey, async (req, res) => {
  try {
    const { prompts, jobId } = req.body;
    
    // Process all prompts in parallel
    const results = await Promise.all(
      prompts.map(async (promptData) => {
        const imageBuffer = await generateImageWithAI(
          promptData.prompt, 
          promptData.style
        );
        const imageUrl = await uploadImageToStorage(imageBuffer);
        
        return {
          cardIndex: promptData.cardIndex,
          imageUrl: imageUrl,
          prompt: promptData.prompt,
          style: promptData.style
        };
      })
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📍 Endpoint 4: Quality Check

**What it does:** Checks if a generated image is good quality (face matches the original photo, hands aren't mangled, etc.).

**Endpoint:** `POST /api/quality/check`

**Request:**
```json
{
  "imageUrl": "https://cdn.nanobnana.com/generated/image_12345.png",
  "anchorDescription": "Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses"
}
```

**Response (Passed):**
```json
{
  "faceMatch": 0.87,
  "handQuality": 0.92,
  "passed": true,
  "issues": []
}
```

**Response (Failed):**
```json
{
  "faceMatch": 0.45,
  "handQuality": 0.32,
  "passed": false,
  "issues": [
    {
      "type": "face_match",
      "severity": "high",
      "message": "Face does not match the uploaded photo"
    },
    {
      "type": "hand_quality",
      "severity": "high",
      "message": "Hands appear mangled or distorted"
    }
  ]
}
```

### How to Implement:

1. **Download the image** from the provided URL
2. **Use face recognition** to compare with the original photo (if you have it stored)
3. **Use hand detection models** to check for mangled hands
4. **Set thresholds:**
   - `faceMatch >= 0.7` (70% similarity minimum)
   - `handQuality >= 0.8` (80% quality minimum)
5. **Return `passed: false`** if either threshold fails

### Example (Node.js/Express):
```javascript
app.post('/api/quality/check', verifyApiKey, async (req, res) => {
  try {
    const { imageUrl, anchorDescription } = req.body;
    
    // Download the image
    const image = await downloadImage(imageUrl);
    
    // Check face match (compare with original photo)
    const faceMatch = await checkFaceMatch(image, originalPhoto);
    
    // Check hand quality
    const handQuality = await checkHandQuality(image);
    
    const passed = faceMatch >= 0.7 && handQuality >= 0.8;
    const issues = [];
    
    if (faceMatch < 0.7) {
      issues.push({
        type: "face_match",
        severity: "high",
        message: "Face does not match the uploaded photo"
      });
    }
    
    if (handQuality < 0.8) {
      issues.push({
        type: "hand_quality",
        severity: "high",
        message: "Hands appear mangled or distorted"
      });
    }
    
    res.json({
      faceMatch,
      handQuality,
      passed,
      issues
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📍 Endpoint 5: Image Upscaling

**What it does:** Upscales images to print-ready quality (300 DPI for printing).

**Endpoint:** `POST /api/images/upscale`

**Request:**
```json
{
  "imageUrl": "https://cdn.nanobnana.com/generated/image_12345.png",
  "targetDPI": 300
}
```

**Response:**
```json
{
  "upscaledUrl": "https://cdn.nanobnana.com/upscaled/image_12345_300dpi.png",
  "dimensions": {
    "width": 3000,
    "height": 4500
  },
  "dpi": 300,
  "printReady": true
}
```

### How to Implement:

1. **Download the image** from the provided URL
2. **Upscale to target dimensions:**
   - For 300 DPI: ~3000x4500 pixels (for a 2.5" x 3.5" card)
3. **Use an upscaling service** (Real-ESRGAN, Claid.ai, UpscalePics API, etc.)
4. **Upload the upscaled image** to storage
5. **Return the new URL** and dimensions

### Example (Node.js/Express):
```javascript
app.post('/api/images/upscale', verifyApiKey, async (req, res) => {
  try {
    const { imageUrl, targetDPI } = req.body;
    
    // Download the image
    const image = await downloadImage(imageUrl);
    
    // Calculate target dimensions (3000x4500 for 300 DPI)
    const targetWidth = 3000;
    const targetHeight = 4500;
    
    // Upscale using your service
    const upscaledImage = await upscaleImage(image, targetWidth, targetHeight);
    
    // Upload to storage
    const upscaledUrl = await uploadImageToStorage(upscaledImage);
    
    res.json({
      upscaledUrl: upscaledUrl,
      dimensions: {
        width: targetWidth,
        height: targetHeight
      },
      dpi: targetDPI,
      printReady: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📍 Endpoint 6: Create Job

**What it does:** Creates a new job for batch image generation. This allows users to close their browser and come back later to check progress.

**Endpoint:** `POST /api/jobs`

**Request:**
```json
{
  "jobId": "job_1234567890_abc123",
  "blueprint": [
    {
      "cardIndex": 0,
      "prompt": "...",
      "style": "pixar",
      "theme": "celebrities",
      "composition": "close-up",
      "mood": "epic"
    }
    // ... 52 cards
  ],
  "anchorDescription": "Male, late 20s...",
  "surveyData": {...},
  "styles": ["pixar", "watercolor"],
  "themes": ["celebrities", "sports"]
}
```

**Response:**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "queued",
  "createdAt": "2024-01-13T17:35:00Z"
}
```

### How to Implement:

1. **Store the job** in your database (with all the blueprint data)
2. **Set initial status** to "queued"
3. **Start processing asynchronously** (don't wait for it to finish)
4. **Return immediately** with the job ID and status

### Example (Node.js/Express):
```javascript
app.post('/api/jobs', verifyApiKey, async (req, res) => {
  try {
    const jobData = req.body;
    
    // Save job to database
    const job = await db.jobs.create({
      jobId: jobData.jobId,
      status: 'queued',
      blueprint: jobData.blueprint,
      anchorDescription: jobData.anchorDescription,
      createdAt: new Date()
    });
    
    // Start processing in background (don't await)
    processJobInBackground(jobData.jobId);
    
    res.json({
      jobId: jobData.jobId,
      status: 'queued',
      createdAt: job.createdAt.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📍 Endpoint 7: Get Job Status

**What it does:** Returns the current status and progress of a job. The frontend polls this every 2 seconds.

**Endpoint:** `GET /api/jobs/{jobId}/status`

**Request:**
- Method: `GET`
- URL: `/api/jobs/job_1234567890_abc123/status`
- Header: `Authorization: Bearer YOUR_API_KEY`

**Response:**
```json
{
  "status": "processing",
  "progress": 65.5,
  "completedCards": 34,
  "failedCards": 2,
  "totalCards": 52,
  "cards": [
    {
      "cardIndex": 0,
      "imageUrl": "https://cdn.nanobnana.com/generated/card_0.png",
      "status": "completed"
    }
    // ... only completed cards
  ]
}
```

**Status values:**
- `"queued"` - Job is waiting to start
- `"processing"` - Job is currently generating images
- `"completed"` - All cards are generated
- `"failed"` - Job failed (error occurred)

### How to Implement:

1. **Look up the job** in your database using the jobId
2. **Calculate progress:**
   - Count completed cards
   - Calculate percentage: `(completedCards / totalCards) * 100`
3. **Return current status** and all completed cards
4. **Update status** as cards are generated

### Example (Node.js/Express):
```javascript
app.get('/api/jobs/:jobId/status', verifyApiKey, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job from database
    const job = await db.jobs.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Calculate progress
    const completedCards = job.cards.filter(c => c.status === 'completed').length;
    const failedCards = job.cards.filter(c => c.status === 'failed').length;
    const totalCards = job.blueprint.length;
    const progress = (completedCards / totalCards) * 100;
    
    res.json({
      status: job.status,
      progress: progress,
      completedCards: completedCards,
      failedCards: failedCards,
      totalCards: totalCards,
      cards: job.cards.filter(c => c.status === 'completed')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🚀 Implementation Priority

If you're building this step-by-step, implement endpoints in this order:

1. ✅ **Vision Analysis** (`/api/vision/analyze`) - Needed first for Step 2
2. ✅ **Single Image Generation** (`/api/images/generate`) - Needed for testing
3. ✅ **Create Job** (`/api/jobs`) - Needed for full workflow
4. ✅ **Batch Generation** (`/api/images/generate/batch`) - Needed for 52 cards
5. ✅ **Job Status** (`/api/jobs/{id}/status`) - Needed for progress tracking
6. ✅ **Quality Check** (`/api/quality/check`) - Needed for auto-rejection
7. ✅ **Upscaling** (`/api/images/upscale`) - Needed for print-ready format

---

## 🧪 Testing Your Endpoints

### 1. Test Authentication
```bash
curl -X POST https://nanobnana.com/api/vision/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "image=@test-photo.jpg"
```

### 2. Test Image Generation
```bash
curl -X POST https://nanobnana.com/api/images/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A test image",
    "style": "pixar"
  }'
```

### 3. Use the Frontend Connection Test
The frontend has a built-in connection test in the API Settings panel. It will show:
- ✅ "Server reachable" - Your server is responding
- ✅ "API key valid" - Authentication works
- ❌ Error messages if something is wrong

---

## 📝 Error Handling

All endpoints should return proper HTTP status codes:

- **200 OK** - Success
- **400 Bad Request** - Invalid request data (missing fields, wrong format)
- **401 Unauthorized** - Invalid or missing API key
- **404 Not Found** - Endpoint doesn't exist or job not found
- **500 Internal Server Error** - Server error

Error response format:
```json
{
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

---

## 🔗 Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vision/analyze` | POST | Analyze photo to get person description |
| `/api/images/generate` | POST | Generate single image |
| `/api/images/generate/batch` | POST | Generate multiple images |
| `/api/quality/check` | POST | Check image quality |
| `/api/images/upscale` | POST | Upscale to print quality |
| `/api/jobs` | POST | Create new job |
| `/api/jobs/{jobId}/status` | GET | Get job progress |

All endpoints require: `Authorization: Bearer YOUR_API_KEY`

---

## 💡 Tips for Beginners

1. **Start with one endpoint at a time** - Don't try to build everything at once
2. **Test each endpoint** before moving to the next
3. **Use mock data first** - Return fake responses to test the frontend connection
4. **Check the frontend code** - Look at `src/services/api.js` to see exactly what the frontend expects
5. **Use Postman or curl** - Test endpoints manually before integrating with the frontend
6. **Log everything** - Add console.logs to see what data you're receiving

---

## 📚 Next Steps

1. Set up your backend server (Node.js, Python Flask, etc.)
2. Implement authentication middleware
3. Implement endpoints in priority order
4. Test with the frontend connection test
5. Deploy and update your server URL if needed

For more details, see `BACKEND_IMPLEMENTATION.md` in this project.
