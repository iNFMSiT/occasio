// Randomization helpers for the survey "Surprise Me" button and per-section dice.
// Keeps users from ever being forced to pick.

export function pickOne(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random slider values on the same 0–1 / step-0.05 scale the SliderBank uses.
export function randomSliders(sliders = []) {
  const out = {};
  sliders.forEach((s) => {
    out[s.id] = Math.round(Math.random() * 20) / 20;
  });
  return out;
}

// Build a single fully-filled mad-lib entry matching MadLibBuilder's shape
// ({ templateId, displayText, selections }).
export function randomMadLib(templates = []) {
  const template = pickOne(templates);
  if (!template) return null;

  const selections = {};
  template.fields.forEach((f) => {
    const opt = pickOne(f.options);
    if (opt) selections[f.id] = opt.value;
  });

  let displayText = template.template;
  template.fields.forEach((f) => {
    const selected = selections[f.id];
    const option = f.options.find((o) => o.value === selected);
    displayText = displayText.replace(`{${f.id}}`, option?.label || selected || `{${f.id}}`);
  });

  return { templateId: template.id, displayText, selections };
}
