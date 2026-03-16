# Backend API Implementation Guide

This document outlines all the API endpoints that need to be implemented on your Nanobanana backend server.

## Overview

The frontend expects these endpoints to be available at `https://nanobnana.com/api/*`. All requests include authentication via the `Authorization` header with a Bearer token.

## Authentication

All endpoints require authentication via the `Authorization` header:
```
Authorization: Bearer YOUR_API_KEY
```

The API key is sent from the frontend's `.env` file (`VITE_NANOBANANA_API_KEY`).

---

## Required Endpoints

### 1. Vision Analysis - Extract "The Anchor"

**Endpoint:** `POST /api/vision/analyze`

**Purpose:** Analyzes an uploaded image to extract a text description of the person (age, appearance, clothing, etc.). This description is used as "The Anchor" in all 52 card prompts to maintain consistency.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the image file
- Headers: `Authorization: Bearer {api_key}`

**Example Request:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

fetch('/api/vision/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});
```

**Response:**
```json
{
  "description": "Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses, casual clothing",
  "confidence": 0.95
}
```

**Implementation Notes:**
- Use a vision model (e.g., GPT-4 Vision, Claude Vision, or similar) to analyze the image
- Extract: age, gender, hair color/length, facial features, clothing, accessories
- Return a concise but descriptive text that can be appended to prompts
- Confidence score (0-1) indicates how certain the model is

**Example Implementation (Python/Flask):**
```python
@app.route('/api/vision/analyze', methods=['POST'])
def analyze_image():
    # Verify auth
    api_key = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_api_key(api_key):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get image file
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    
    # Use vision model to analyze
    description = analyze_with_vision_model(image_file)
    
    return jsonify({
        'description': description,
        'confidence': 0.95
    })
```

---

### 2. Single Image Generation

**Endpoint:** `POST /api/images/generate`

**Purpose:** Generates a single AI image based on a prompt and style.

**Request:**
```json
{
  "prompt": "Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses, casual clothing, as a famous celebrity, in Pixar 3D style, close-up shot, epic mood, high quality, detailed, professional",
  "style": "pixar",
  "test": false  // Optional: indicates this is a test generation
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

**Implementation Notes:**
- Use your AI image generation model (DALL-E, Midjourney, Stable Diffusion, etc.)
- Apply the specified style to the generation
- Return a publicly accessible URL to the generated image
- Store the image temporarily or permanently based on your needs

---

### 3. Batch Image Generation

**Endpoint:** `POST /api/images/generate/batch`

**Purpose:** Generates multiple images in a batch for efficiency. Used for generating all 52 cards.

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
  // ... array of results
]
```

**Implementation Notes:**
- Process images in parallel or sequentially based on your infrastructure
- Return results in the same order as the input prompts
- Include the `cardIndex` in the response to match with the original request
- Consider rate limiting and queue management for large batches

---

### 4. Quality Check

**Endpoint:** `POST /api/quality/check`

**Purpose:** Validates generated images for quality issues (mangled hands, face mismatch, etc.). Used to auto-reject poor quality images.

**Request:**
```json
{
  "imageUrl": "https://cdn.nanobnana.com/generated/image_12345.png",
  "anchorDescription": "Male, late 20s, short brown hair, square jaw, wearing black-rimmed glasses"
}
```

**Response:**
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

**Implementation Notes:**
- Use face recognition/comparison to verify the person matches
- Use hand detection/quality models to check for mangled hands
- Thresholds:
  - `faceMatch >= 0.7` (minimum similarity)
  - `handQuality >= 0.8` (minimum quality)
- Return `passed: false` if either threshold is not met

---

### 5. Image Upscaling

**Endpoint:** `POST /api/images/upscale`

**Purpose:** Upscales images to print-ready 300 DPI format.

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

**Implementation Notes:**
- Target dimensions: ~3000x4500 pixels for 300 DPI (2.5" x 3.5" card)
- Use upscaling service (e.g., Real-ESRGAN, Claid.ai, UpscalePics API)
- Ensure no important details are in the "bleed" area (outer 0.125 inches)
- Return a publicly accessible URL to the upscaled image

---

### 6. Create Job

**Endpoint:** `POST /api/jobs`

**Purpose:** Creates a new async job for batch image generation. Allows users to close the browser and return later.

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

**Implementation Notes:**
- Store job in database/queue system
- Initialize job status as "queued"
- Start processing asynchronously
- Update status as cards are generated

---

### 7. Get Job Status

**Endpoint:** `GET /api/jobs/{jobId}/status`

**Purpose:** Polls job status to show progress to the user.

**Request:**
- Method: `GET`
- URL: `/api/jobs/{jobId}/status`
- Headers: `Authorization: Bearer {api_key}`

**Response:**
```json
{
  "status": "processing",  // "queued", "processing", "completed", "failed"
  "progress": 65.5,  // Percentage (0-100)
  "completedCards": 34,
  "failedCards": 2,
  "totalCards": 52,
  "cards": [
    {
      "cardIndex": 0,
      "imageUrl": "https://...",
      "status": "completed"
    }
    // ... completed cards
  ]
}
```

**Implementation Notes:**
- Update status as job progresses
- Return current progress percentage
- Include completed cards in response
- Frontend polls this endpoint every 2 seconds

---

## Error Handling

All endpoints should return appropriate HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Invalid or missing API key
- `404 Not Found` - Endpoint doesn't exist
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

---

## Implementation Priority

If implementing incrementally, prioritize in this order:

1. **Vision Analysis** (`/api/vision/analyze`) - Required for Step 2
2. **Single Image Generation** (`/api/images/generate`) - Required for testing phase
3. **Create Job** (`/api/jobs`) - Required for full generation
4. **Batch Generation** (`/api/images/generate/batch`) - Required for 52 cards
5. **Job Status** (`/api/jobs/{id}/status`) - Required for progress tracking
6. **Quality Check** (`/api/quality/check`) - Required for auto-rejection
7. **Upscaling** (`/api/images/upscale`) - Required for print-ready format

---

## Testing

Use the frontend's connection test feature (API Settings panel) to verify endpoints are reachable. Even if endpoints return 404 initially, the connection test will show "Server reachable" if the proxy is working.

Test each endpoint individually:
1. Use Postman or curl to test endpoints
2. Verify authentication works
3. Check response formats match expected structure
4. Test error cases (invalid data, missing fields, etc.)

---

## Example Backend Structure

```
backend/
├── routes/
│   ├── vision.js          # Vision analysis endpoint
│   ├── images.js          # Image generation endpoints
│   ├── quality.js         # Quality check endpoint
│   └── jobs.js            # Job management endpoints
├── services/
│   ├── visionService.js   # Vision model integration
│   ├── imageService.js    # Image generation service
│   ├── qualityService.js  # Quality checking service
│   └── upscaleService.js  # Upscaling service
├── middleware/
│   └── auth.js            # API key verification
└── server.js              # Main server file
```

---

## Next Steps

1. Set up your backend server (Node.js, Python, etc.)
2. Implement authentication middleware
3. Implement endpoints in priority order
4. Test with the frontend connection test
5. Deploy and update `vite.config.js` if needed

For questions or issues, refer to the frontend code in `src/services/api.js` to see exactly what the frontend expects.
