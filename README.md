# Custom Cards - Personalized Deck Generator

Create a custom deck of 52 playing cards featuring your friend's images, powered by AI image generation and nanobanana integration.

## Features

### Complete Pipeline

1. **Image Upload** - Upload 1-2 full body photos of the person
2. **Vision Analysis** - Extract "The Anchor" (person description) using AI vision
3. **User Survey** - Multiple interactive survey methods:
   - Style Battles (This or That)
   - Mood Sliders (Chaos, Energy, Humor)
   - Mystery Box Roulette
   - Mad Libs Customization
   - Detailed Hobbies/Interests
4. **Art Style Selection** - Choose 1-4 art styles (Pixar, Watercolor, Hyper-realistic, etc.)
5. **Theme Selection** - Choose 1-4 themes (Celebrities, Careers, Fantasy, etc.)
6. **Testing Phase** - Preview a single card before full generation
7. **Prompt Engineering** - Smart prompt generation with:
   - Anchor description integration
   - Survey data linking
   - Diversity constraints (composition, mood, color)
   - Smart keyword matching
8. **Image Generation** - Batch generation with quality checks
9. **Quality Guard** - Auto-reject images with:
   - Mangled hands detection
   - Face match verification
   - Instant redraw for failed cards
10. **Upscaling** - Convert to print-ready 300 DPI format
11. **Download** - Download individual cards or full deck as ZIP
12. **Ordering** - Integration with Prodigi/Shopify for physical deck printing

## Project Structure

```
src/
├── components/          # UI Components
│   ├── UploadStep.js
│   ├── SurveyStep.js
│   ├── StyleThemeStep.js
│   ├── TestingStep.js
│   ├── ProgressStep.js
│   └── CardGallery.js
├── services/           # Business Logic
│   ├── api.js          # API communication
│   ├── promptEngine.js # Prompt generation
│   ├── jobManager.js   # Async job management
│   ├── qualityGuard.js # Quality checking
│   └── upscaleService.js # Print-ready upscaling
├── config/             # Configuration
│   └── constants.js    # Art styles, themes, etc.
├── utils/              # Utilities
│   └── helpers.js      # Helper functions
├── main.js             # Main application
└── style.css           # Styles
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Nanobanana API key (optional - app works in dev mode without it)

### Installation

```bash
npm install
```

### API Setup

1. **Create a `.env` file** in the root directory:
   ```bash
   # Create .env file
   touch .env
   ```

2. **Add your Nanobanana API key**:
   ```env
   VITE_NANOBANANA_API_KEY=your_api_key_here
   VITE_NANOBANANA_API_URL=https://nanobnana.com
   ```

3. See [API_SETUP.md](./API_SETUP.md) for detailed configuration instructions.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Note**: If no API key is configured, the app will automatically use mock data for development.

### Build

```bash
npm run build
```

## API Integration

The app uses a proxy to `https://nanobnana.com` for backend services. Configure the proxy in `vite.config.js`.

### Required API Endpoints

- `POST /api/vision/analyze` - Vision analysis for anchor extraction
- `POST /api/images/generate` - Single image generation
- `POST /api/images/generate/batch` - Batch image generation
- `POST /api/quality/check` - Quality checking (face match, hand quality)
- `POST /api/images/upscale` - Image upscaling to 300 DPI
- `GET /api/jobs/:id/status` - Job status polling
- `POST /api/jobs` - Create new job

## Architecture

### SOLID Principles

- **Single Responsibility**: Each component/service has one clear purpose
- **Open/Closed**: Extensible through configuration (art styles, themes)
- **Liskov Substitution**: Components follow consistent interfaces
- **Interface Segregation**: Services expose only needed methods
- **Dependency Injection**: Services are injected, not hardcoded

### Separation of Concerns

- **UI Layer**: Components handle presentation only
- **Service Layer**: Business logic in services
- **API Layer**: Centralized API communication
- **Config Layer**: Constants and configuration

## Future Enhancements

- [ ] Style Thief (Reference Library) feature
- [ ] PDF proof generation
- [ ] Full ZIP download implementation
- [ ] Prodigi API integration
- [ ] Email notifications for job completion
- [ ] User accounts and saved projects
- [ ] Community gallery

## License

Private project
