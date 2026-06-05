import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, ArrowRight, Loader } from 'lucide-react';
import heic2any from 'heic2any';
import { useGiftFlow } from '../../GiftFlowContext.jsx';
import { useToast } from '../../../../context/ToastContext.jsx';
import geminiService from '../../../../services/geminiService.js';
import { mockService } from '../../../../services/mockService.js';
import { isApiConfigured } from '../../../../config/gemini.config.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isHeic(file) {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true;
  const ext = file.name.toLowerCase().split('.').pop();
  return ext === 'heic' || ext === 'heif';
}

function validateFile(file) {
  const ext = file.name.toLowerCase().split('.').pop();
  const typeOk = ALLOWED_TYPES.includes(file.type) || ext === 'heic' || ext === 'heif';
  if (!typeOk) return 'Only JPEG, PNG, WebP, and HEIC images are allowed.';
  if (file.size > MAX_FILE_SIZE) return 'Image must be under 10MB.';
  return null;
}

async function convertHeicToJpeg(file) {
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
  const converted = Array.isArray(blob) ? blob[0] : blob;
  return new File([converted], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), {
    type: 'image/jpeg',
  });
}

function createPreview(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function ImageUploadStep() {
  const { images, settings, dispatch } = useGiftFlow();
  const { addToast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback(
    async (files) => {
      const newImages = [...images];
      for (let file of files) {
        if (newImages.length >= 2) {
          addToast({ type: 'info', message: 'Maximum 2 photos allowed.' });
          break;
        }
        const error = validateFile(file);
        if (error) { addToast({ type: 'error', message: error }); continue; }
        if (isHeic(file)) {
          try {
            addToast({ type: 'info', message: 'Converting HEIC photo...' });
            file = await convertHeicToJpeg(file);
          } catch {
            addToast({ type: 'error', message: 'Failed to convert HEIC image. Try a JPEG instead.' });
            continue;
          }
        }
        const preview = await createPreview(file);
        newImages.push({ file, preview, name: file.name });
      }
      dispatch({ type: 'SET_IMAGES', payload: newImages });
    },
    [images, dispatch, addToast]
  );

  const removeImage = (index) => {
    dispatch({ type: 'SET_IMAGES', payload: images.filter((_, i) => i !== index) });
  };

  const handleContinue = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const service = settings.devMode || !isApiConfigured() ? mockService : geminiService;
      const anchor = await service.analyzeImage(images[0].file);
      dispatch({ type: 'SET_ANCHOR', payload: anchor });
      addToast({ type: 'success', message: 'Photo analyzed! Moving to survey.' });
      dispatch({ type: 'NEXT_STEP' });
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to analyze image.' });
    } finally {
      setAnalyzing(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => {
      if (f.type.startsWith('image/')) return true;
      const ext = f.name.toLowerCase().split('.').pop();
      return ext === 'heic' || ext === 'heif';
    });
    if (files.length) addFiles(files);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Upload Your Friend's Photos</h2>
        <p className="text-text-muted">
          Add 1-2 clear photos. We'll use these to create personalized images in wild styles.
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-brand bg-brand/10'
            : 'border-surface-lighter hover:border-brand-light/50 hover:bg-surface-light/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => addFiles(Array.from(e.target.files))}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand/20 flex items-center justify-center">
            <Upload size={24} className="text-brand-light" />
          </div>
          <div>
            <p className="font-medium">Drag & drop photos here</p>
            <p className="text-sm text-text-muted mt-1">or click to browse (JPEG, PNG, WebP, HEIC · max 10MB)</p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex gap-4 justify-center">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={img.preview} alt={img.name} className="w-36 h-48 object-cover rounded-lg border-2 border-surface-lighter" />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-xs text-center py-1 rounded-b-lg">
                {i === 0 ? 'Primary' : 'Secondary'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={images.length === 0 || analyzing}
          className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {analyzing ? (
            <>
              <Loader size={18} className="animate-spin" />
              Analyzing photo...
            </>
          ) : (
            <>
              Continue to Survey
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
