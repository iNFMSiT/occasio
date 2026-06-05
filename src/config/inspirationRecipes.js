// Inspiration / Hall of Fame seed data.
// Two tiers:
//   HALL_OF_FAME — "Make this" examples. Each has a face-agnostic `recipe`
//                  (style + theme + free-text vision + sliders) that pre-fills
//                  the image flow. recipe ids MUST match ART_STYLES / THEMES in
//                  src/config/constants.js.
//   SHOWCASE     — pure eye-candy from the BEST set. No recipe, no button.
//
// Images are imported as modules so Vite bundles only what's referenced
// (public/ is not served — see vite.config.js publicDir:false).

// "Make this" hero images — generated through the tool itself (subject: Austin),
// so each pairs with the exact recipe that produced it.
import spaceExplorer from '../assets/hall-of-fame/space-explorer.jpg';
import epicHero from '../assets/hall-of-fame/epic-hero.jpg';
import arcaneWizard from '../assets/hall-of-fame/arcane-wizard.jpg';
import animeWarrior from '../assets/hall-of-fame/anime-warrior.jpg';
import retroRockstar from '../assets/hall-of-fame/retro-rockstar.jpg';
import slamDunk from '../assets/hall-of-fame/slam-dunk.jpg';

import astronaut from '../assets/hall-of-fame/astronaut.jpg';
import jedi from '../assets/hall-of-fame/jedi.jpg';
import matrix from '../assets/hall-of-fame/matrix.jpg';
import ironman from '../assets/hall-of-fame/ironman.jpg';
import wizard from '../assets/hall-of-fame/wizard.jpg';
import firefighter from '../assets/hall-of-fame/firefighter.jpg';
import rapper from '../assets/hall-of-fame/rapper.jpg';
import southpark from '../assets/hall-of-fame/southpark.jpg';
import robot from '../assets/hall-of-fame/robot.jpg';
import superhero from '../assets/hall-of-fame/superhero.jpg';
import gorilla from '../assets/hall-of-fame/gorilla.jpg';
import centaur from '../assets/hall-of-fame/centaur.jpg';
import shark from '../assets/hall-of-fame/shark.jpg';
import actionHero from '../assets/hall-of-fame/action-hero.jpg';
import captain from '../assets/hall-of-fame/captain.jpg';
import trooper from '../assets/hall-of-fame/trooper.jpg';

// "Make this" tier — each image was generated from its own recipe, so copying
// reproduces the look faithfully (with the user's own face).
export const HALL_OF_FAME = [
  {
    id: 'space-explorer',
    image: spaceExplorer,
    title: 'Cosmic Explorer',
    occasion: 'Birthday',
    giftType: 'image',
    recipe: {
      selectedStyles: ['pixar'],
      selectedThemes: ['sci-fi'],
      freeText: 'floating in space in a sleek astronaut suit near a glowing planet, planting a flag',
      moodSliders: { chaos: 0.5, energy: 0.7, humor: 0.3 },
    },
  },
  {
    id: 'epic-hero',
    image: epicHero,
    title: 'Caped Legend',
    occasion: 'Just Because',
    giftType: 'image',
    recipe: {
      selectedStyles: ['hyper-realistic'],
      selectedThemes: ['superhero'],
      freeText: 'dramatic hero pose on a rooftop at sunset, cape flowing, neon city skyline below',
      moodSliders: { chaos: 0.5, energy: 0.7, humor: 0.3 },
    },
  },
  {
    id: 'arcane-wizard',
    image: arcaneWizard,
    title: 'Arcane Sorcerer',
    occasion: 'Graduation',
    giftType: 'image',
    recipe: {
      selectedStyles: ['oil-painting'],
      selectedThemes: ['fantasy'],
      freeText: 'wielding glowing magical energy in an enchanted library full of floating books',
      moodSliders: { chaos: 0.5, energy: 0.7, humor: 0.3 },
    },
  },
  {
    id: 'anime-warrior',
    image: animeWarrior,
    title: 'Anime Warrior',
    occasion: 'Just Because',
    giftType: 'image',
    recipe: {
      selectedStyles: ['anime'],
      selectedThemes: ['fantasy'],
      freeText: 'epic anime warrior with a glowing katana, cherry blossom petals swirling in the wind',
      moodSliders: { chaos: 0.5, energy: 0.7, humor: 0.3 },
    },
  },
  {
    id: 'retro-rockstar',
    image: retroRockstar,
    title: 'Rock Legend',
    occasion: 'Birthday',
    giftType: 'image',
    recipe: {
      selectedStyles: ['vintage-poster'],
      selectedThemes: ['careers'],
      freeText: '1980s rockstar shredding a guitar on stage under neon spotlights',
      moodSliders: { chaos: 0.5, energy: 0.7, humor: 0.8 },
    },
  },
  {
    id: 'slam-dunk',
    image: slamDunk,
    title: 'Slam Dunk',
    occasion: 'Just Because',
    giftType: 'image',
    recipe: {
      selectedStyles: ['pixar'],
      selectedThemes: ['sports'],
      freeText: 'leaping for a huge slam dunk in a packed arena, confetti and roaring crowd',
      moodSliders: { chaos: 0.5, energy: 0.7, humor: 0.3 },
    },
  },
];

export const SHOWCASE = [
  { id: 'astronaut', image: astronaut, title: 'Astronaut' },
  { id: 'superhero', image: superhero, title: 'Superhero' },
  { id: 'jedi', image: jedi, title: 'Space Knight' },
  { id: 'matrix', image: matrix, title: 'Enter the Matrix' },
  { id: 'ironman', image: ironman, title: 'Armored Hero' },
  { id: 'wizard', image: wizard, title: 'Wizard' },
  { id: 'firefighter', image: firefighter, title: 'Firefighter' },
  { id: 'rapper', image: rapper, title: 'Rap Icon' },
  { id: 'southpark', image: southpark, title: 'Cartoon Cutout' },
  { id: 'robot', image: robot, title: 'Robot Overlord' },
  { id: 'gorilla', image: gorilla, title: 'Arm Wrestle' },
  { id: 'centaur', image: centaur, title: 'Centaur' },
  { id: 'shark', image: shark, title: 'Shark Rider' },
  { id: 'action-hero', image: actionHero, title: 'Action Hero' },
  { id: 'captain', image: captain, title: 'Sea Captain' },
  { id: 'trooper', image: trooper, title: 'Trooper' },
];
