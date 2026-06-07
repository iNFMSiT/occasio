import type { ArtStyle } from '../types';

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'hand-animated',
    label: 'Hand Animated',
    description: 'Classic 2D animation style',
    promptInstruction: 'classic 2D hand-animated style with visible brushstrokes, cel-shading outlines, and soft painted backgrounds reminiscent of Studio Ghibli. Organic, slightly imperfect linework.',
  },
  {
    id: 'pixar',
    label: 'Pixar 3D',
    description: '3D animated movie style',
    promptInstruction: 'Pixar 3D CGI with smooth subsurface scattering on skin, large expressive eyes, slightly exaggerated proportions, and cinematic volumetric lighting.',
  },
  {
    id: 'hyper-realistic',
    label: 'Hyper Realistic',
    description: 'Photorealistic rendering',
    promptInstruction: 'photorealistic, shot on a Canon EOS R5 with 85mm f/1.4 lens. Natural skin texture with pores, realistic soft lighting, shallow depth of field, lifelike eyes with catchlights.',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    description: 'Soft, painted watercolor style',
    promptInstruction: 'delicate watercolor on cold-pressed paper. Soft wet-on-wet gradients, visible paint blooms, translucent layers, white paper showing through highlights.',
  },
  {
    id: 'oil-painting',
    label: 'Oil Painting',
    description: 'Classic oil painting aesthetic',
    promptInstruction: 'classical oil painting with rich impasto brushwork, chiaroscuro lighting inspired by Rembrandt, deep saturated colors, and visible canvas texture.',
  },
  {
    id: 'digital-art',
    label: 'Digital Art',
    description: 'Modern digital illustration',
    promptInstruction: 'modern digital illustration trending on ArtStation. Clean shapes with painterly rendering, vibrant saturated colors, and strong graphic composition.',
  },
  {
    id: 'sketch',
    label: 'Hand-Drawn Sketch',
    description: 'Pencil/charcoal sketch style',
    promptInstruction: 'hand-drawn pencil and charcoal sketch on ivory paper. Visible hatching, smudged shadows, confident linework, with partial unfinished edges.',
  },
  {
    id: 'anime',
    label: 'Anime',
    description: 'Japanese animation style',
    promptInstruction: 'Japanese anime style with sharp clean lineart, large detailed eyes with highlight reflections, dynamic hair strands, and flat color shading with precise shadow cutoffs.',
  },
  {
    id: 'comic-book',
    label: 'Comic Book',
    description: 'Classic comic book art',
    promptInstruction: 'bold comic book art with thick ink outlines, Ben-Day dot halftone shading, flat primary colors, and dramatic foreshortening.',
  },
  {
    id: 'vintage-poster',
    label: 'Vintage Poster',
    description: 'Retro poster design',
    promptInstruction: 'retro 1950s-60s poster design with a limited bold color palette, screen-print halftone texture, and Art Deco typography influence.',
  },
];

export const STYLE_INSTRUCTIONS: Record<string, string> = Object.fromEntries(
  ART_STYLES.map((s) => [s.id, s.promptInstruction])
);
