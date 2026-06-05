// Song Prompt Engine — builds Suno-compatible prompts from survey data
// Parallel to promptEngine.js for images

class SongPromptEngine {
  buildPrompt(surveyData, selectedGenres = [], selectedVibes = []) {
    const parts = [];

    // Genre tags
    const genres = selectedGenres.length > 0 ? selectedGenres : ['pop'];
    parts.push(`Genre: ${genres.join(', ')}`);

    // Occasion context
    if (surveyData.occasion) {
      const occasionLabel = typeof surveyData.occasion === 'object'
        ? surveyData.occasion.label
        : surveyData.occasion;
      parts.push(`Occasion: ${occasionLabel}`);
    }

    // Free-text vision — the user's own words about what the song is about
    const freeText = surveyData.freeText?.trim();
    if (freeText) {
      parts.push(`What it's about: ${freeText}`);
    }

    // Vibe/mood tags
    const vibes = selectedVibes.length > 0
      ? selectedVibes
      : this._inferVibesFromSliders(surveyData.moodSliders || {});
    parts.push(`Vibe: ${vibes.join(', ')}`);

    // Tempo/energy from sliders
    const energy = surveyData.moodSliders?.energy ?? 0.5;
    const tempo = energy > 0.7 ? 'upbeat, fast tempo' : energy < 0.3 ? 'slow, gentle tempo' : 'moderate tempo';
    parts.push(`Tempo: ${tempo}`);

    // Lyric theme from mad libs
    if (surveyData.lyricMadLibs?.length > 0) {
      const themes = surveyData.lyricMadLibs.map((ml) => ml.displayText).join('. ');
      parts.push(`Lyric themes: ${themes}`);
    }

    // Personal details for lyrics
    const personalDetails = [];
    if (surveyData.memories?.length > 0) {
      personalDetails.push(`Memories to reference: ${surveyData.memories.join(', ')}`);
    }
    if (surveyData.insideJokes?.length > 0) {
      personalDetails.push(`Inside jokes to weave in: ${surveyData.insideJokes.join(', ')}`);
    }
    if (surveyData.milestones?.length > 0) {
      personalDetails.push(`Milestones to celebrate: ${surveyData.milestones.join(', ')}`);
    }
    if (personalDetails.length > 0) {
      parts.push(personalDetails.join('\n'));
    }

    // Humor level
    const humor = surveyData.moodSliders?.humor ?? 0.5;
    if (humor > 0.7) {
      parts.push('Tone: funny, playful, comedic lyrics');
    } else if (humor < 0.3) {
      parts.push('Tone: sincere, heartfelt, meaningful lyrics');
    } else {
      parts.push('Tone: balanced mix of fun and heartfelt');
    }

    // Sentiment
    const sentiment = surveyData.moodSliders?.sentiment ?? 0.5;
    if (sentiment > 0.7) {
      parts.push('Mood: fun, lighthearted, celebratory');
    } else if (sentiment < 0.3) {
      parts.push('Mood: deeply emotional, touching, sentimental');
    }

    return {
      fullPrompt: parts.join('\n'),
      genres,
      vibes,
      tempo,
    };
  }

  createBlueprint(surveyData, selectedGenres, selectedVibes, songCount = 2) {
    const blueprints = [];
    for (let i = 0; i < songCount; i++) {
      // Vary genres slightly across songs for variety
      const rotatedGenres = this._rotateArray(selectedGenres, i);
      const rotatedVibes = this._rotateArray(selectedVibes, i);

      const prompt = this.buildPrompt(surveyData, rotatedGenres, rotatedVibes);
      blueprints.push({
        index: i,
        ...prompt,
        label: `Song ${i + 1}`,
      });
    }
    return blueprints;
  }

  _inferVibesFromSliders(sliders) {
    const vibes = [];
    const energy = sliders.energy ?? 0.5;
    const sentiment = sliders.sentiment ?? 0.5;
    const humor = sliders.humor ?? 0.5;

    if (energy > 0.6) vibes.push('energetic');
    if (energy < 0.4) vibes.push('chill');
    if (sentiment > 0.6) vibes.push('playful');
    if (sentiment < 0.4) vibes.push('heartfelt');
    if (humor > 0.6) vibes.push('silly');
    if (humor < 0.4) vibes.push('sincere');

    return vibes.length > 0 ? vibes : ['upbeat'];
  }

  _rotateArray(arr, offset) {
    if (!arr || arr.length === 0) return arr;
    const n = arr.length;
    const o = offset % n;
    return [...arr.slice(o), ...arr.slice(0, o)];
  }
}

const songPromptEngine = new SongPromptEngine();
export default songPromptEngine;
