import React from 'react';
import { MeshGradient, StaticMeshGradient } from '@paper-design/shaders-react';
import { useTheme } from './ThemeContext.jsx';
import { useAllowMotion } from './useAllowMotion.js';

// A fixed, full-viewport shader gradient that sits behind all app content.
// Zero-dependency canvas shader (no three.js) — cheap and smooth on mobile.
// Animated drift when motion is allowed; a still gradient otherwise.
//
// Rendered at low opacity and blended over the theme's base background (set in CSS),
// so it reads as an atmospheric wash rather than a loud backdrop.
export default function AmbientBackground() {
  const { theme } = useTheme();
  const allowMotion = useAllowMotion();

  const common = {
    colors: theme.shaderColors,
    style: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      // Slightly stronger on light themes so the wash stays visible over cream.
      style={{ opacity: theme.isLight ? 0.55 : 0.42 }}
    >
      {allowMotion ? (
        <MeshGradient
          {...common}
          speed={0.18}
          distortion={theme.distortion}
          swirl={theme.swirl}
          grainOverlay={0.04}
        />
      ) : (
        <StaticMeshGradient {...common} grainOverlay={0.04} />
      )}
    </div>
  );
}
