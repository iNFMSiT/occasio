// Print Specifications
export const PRINT_SPECS = {
  DPI: 300,
  CARD_SIZE: { width: 2.5, height: 3.5 }, // inches (legacy playing-card)
  BLEED: 0.125, // inches
  MIN_RESOLUTION: { width: 3000, height: 4500 }, // pixels at 300 DPI
};

// Printable greeting-card export. All sizes in inches; rendered at PRINT_SPECS.DPI.
export const CARD_EXPORT = {
  DPI: 300,
  panelMargin: 0.2, // safe inner margin so home printers don't clip artwork
  guide: { color: '#c8c8c8', dash: [6, 6], width: 1 }, // fold/cut guide styling (px @ DPI)

  paper: {
    letter: { id: 'letter', label: 'US Letter', width: 8.5, height: 11 },
    a4: { id: 'a4', label: 'A4', width: 8.27, height: 11.69 },
  },

  formats: {
    // ONE sheet, single-sided, fold twice → 4.25 × 5.5 portrait card.
    quarterFold: {
      id: 'quarterFold',
      label: 'Quarter-fold (print at home)',
      pages: 1,
      finished: { width: 4.25, height: 5.5 },
      usesPaper: true, // page = chosen paper size
    },
    // 2-page spread (outside / inside), double-sided → folds to 5 × 7 portrait card.
    halfFold5x7: {
      id: 'halfFold5x7',
      label: '5×7 (print shop / double-sided)',
      pages: 2,
      finished: { width: 5, height: 7 },
      spread: { width: 10, height: 7 }, // flat page size for each side
      usesPaper: false,
    },
  },
};
