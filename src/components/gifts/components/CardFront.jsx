import React, { useEffect, useRef, useState } from 'react';
import { getTextStyle } from '../../../config/textStyles.js';
import { loadImage, renderCardFront, ensureFontsLoaded } from '../../../services/cardExport';

// Renders the card front (image + text overlay) to a canvas using the SAME renderer
// as the PDF, so the on-screen card matches what prints. Falls back to a plain <img>
// while the image/fonts load. Use anywhere the front image is shown.
export default function CardFront({ card, className = '', width = 600 }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const frontText = card?.frontText;

  useEffect(() => {
    let alive = true;
    if (!card?.imageUrl) return;
    (async () => {
      const img = await loadImage(card.imageUrl);
      if (frontText?.text) await ensureFontsLoaded([getTextStyle(frontText.styleId).family]);
      if (!alive || !canvasRef.current) return;
      renderCardFront(canvasRef.current, { img, frontText, width });
      setReady(true);
    })();
    return () => { alive = false; };
  }, [card?.imageUrl, frontText?.text, frontText?.styleId, frontText?.color, frontText?.placement, width]);

  if (!card?.imageUrl) return null;

  return (
    <>
      {!ready && (
        <img src={card.imageUrl} alt="" className={className} aria-hidden />
      )}
      <canvas
        ref={canvasRef}
        className={className}
        style={{ display: ready ? 'block' : 'none' }}
      />
    </>
  );
}
