# Nanobanana API Setup Guide

## Quick Start

1. **Create a `.env` file** in the root directory:
   ```bash
   cp .env.example .env
   ```

2. **Add your Nanobanana API key** to the `.env` file:
   ```env
   VITE_NANOBANANA_API_KEY=your_actual_api_key_here
   VITE_NANOBANANA_API_URL=https://nanobnana.com
   ```

3. **Restart the dev server** for changes to take effect:
   ```bash
   npm run dev
   ```

## Configuration Files

### `.env` File
Create a `.env` file in the project root with your API credentials:

```env
# Required: Your Nanobanana API Key
VITE_NANOBANANA_API_KEY=your_api_key_here

# Optional: Override API base URL (defaults to /api which proxies to nanobnana.com)
VITE_NANOBANANA_API_URL=https://nanobnana.com

# Optional: Custom API base URL for local development
# VITE_API_BASE_URL=http://localhost:3000
```

### API Configuration (`src/config/api.js`)

The API configuration is centralized in `src/config/api.js`. You can customize:

- **Auth Method**: How the API key is sent (header, query, bearer token)
- **Auth Header Name**: The header name for authentication (default: `Authorization`)
- **API Endpoints**: All endpoint paths

### Current Auth Format

By default, the API key is sent as a Bearer token:
```
Authorization: Bearer your_api_key_here
```

If Nanobanana uses a different format, update the `getAuthHeader()` function in `src/config/api.js`:

```javascript
// Example: API Key format
return `ApiKey ${API_CONFIG.apiKey}`;

// Example: Custom header
return API_CONFIG.apiKey; // And set authHeaderName to 'X-API-Key'
```

## Vite Proxy Configuration

The `vite.config.js` is already configured to proxy `/api` requests to `https://nanobnana.com`. 

If you need to change the target URL, update `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'https://nanobnana.com', // Change this if needed
    changeOrigin: true,
    secure: true,
  }
}
```

## API Endpoints

The app expects these endpoints on your Nanobanana backend:

- `POST /api/vision/analyze` - Vision analysis for anchor extraction
- `POST /api/images/generate` - Single image generation
- `POST /api/images/generate/batch` - Batch image generation
- `POST /api/quality/check` - Quality checking (face match, hand quality)
- `POST /api/images/upscale` - Image upscaling to 300 DPI
- `GET /api/jobs/:id/status` - Job status polling
- `POST /api/jobs` - Create new job

## Development Mode

If no API key is configured, the app automatically uses **mock data** for development. You'll see a "Development Mode" banner.

To force dev mode, add `?dev=true` to the URL:
```
http://localhost:5173?dev=true
```

## Testing Your API

1. Make sure your `.env` file has the API key
2. Restart the dev server
3. Upload an image - it should call the real API
4. Check the browser console for API requests
5. Check the terminal for proxy logs

## Troubleshooting

### API Key Not Working
- Verify the key is correct in `.env`
- Check that the key starts with `VITE_` (required for Vite to expose it)
- Restart the dev server after changing `.env`

### 404 Errors
- Ensure the backend API endpoints are implemented
- Check that the proxy target URL is correct in `vite.config.js`
- Verify the endpoint paths match what's in `src/config/api.js`

### CORS Errors
- The Vite proxy should handle CORS, but if you see CORS errors:
  - Check that `changeOrigin: true` is set in `vite.config.js`
  - Verify the backend allows requests from your origin

### Authentication Errors
- Check the auth format in `src/config/api.js`
- Verify the API key format matches what Nanobanana expects
- Check browser DevTools Network tab to see the actual headers being sent
