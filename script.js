/* ═══════════════════════════════════════════════════════════════════
   script.js — Colour Scheme Generator 2026
   ───────────────────────────────────────────────────────────────────
   SECTIONS:
   1.  STATE          — global variables
   2.  UI CONTROLS    — mode, seed, harmony, theme handlers
   3.  COLOUR MATH    — hex/RGB/HSL conversions, luminance, contrast
   4.  SEED ANALYSIS  — extreme value detection, temperature, fitness
   5.  PALETTE GEN    — light palette builder (1/2/3 seed logic)
   6.  DARK THEME     — dark palette derivation
   7.  GENERATE       — main entry point, orchestrates everything
   8.  RENDER COLS    — draws colour pair columns + semantic strip
   9.  DETAIL PANEL   — swatch click → detail card
   10. MOBILE SCREENS — four screen builders (Home/Analytics/Settings/Profile)
   11. WEB PREVIEW    — webpage preview builder
   12. A11Y REPORT    — accessibility contrast grid
   13. EXPORT         — eight format exporters
   14. UTILITIES      — copy to clipboard
═══════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════
   1. STATE
═══════════════════════════════════ */

let currentMode    = 'explore';  // 'explore' | 'build'
let currentHarmony = 'natural';  // harmony rule key
let currentTheme   = 'light';    // 'light' | 'dark'
let seedCount      = 1;          // number of seed inputs visible

let palette      = {};  // active palette (switches with theme toggle)
let lightPalette = {};  // light theme palette
let darkPalette  = {};  // dark theme palette

// Default hex values pre-loaded into extra seed inputs
const SEED_DEFAULTS = ['#008CBB', '#ED982A', '#5E902D'];


/* ═══════════════════════════════════
   2. UI CONTROLS
   Handlers wired to buttons and inputs
   in the HTML.
═══════════════════════════════════ */

/**
 * setMode — switches between Explore and Build.
 *
 * Explore: 1 seed only. The tool has full creative control over all
 *   generated colours. Harmony rule affects everything.
 *
 * Build: 2–3 seeds. User anchors their brand colours. The tool
 *   only generates the fills (background, surface) and semantic
 *   colours. Harmony rule affects background tint direction only.
 */
function setMode(m) {
  currentMode = m;
  document.getElementById('btn-explore').classList.toggle('active', m === 'explore');
  document.getElementById('btn-build').classList.toggle('active', m === 'build');

  // Update the descriptive paragraph under the mode bar
  document.getElementById('mode-desc').textContent = m === 'explore'
    ? 'Enter one colour and the tool generates a complete harmonious palette around it. Try different harmony rules to explore variations.'
    : 'Enter 2–3 of your brand colours. The tool completes the system around them without changing your seeds. With 3 colours, harmony only affects the background tint.';

  document.getElementById('seed-lbl').textContent  = m === 'explore' ? 'Seed colour' : 'Your brand colours';
  document.getElementById('add-wrap').style.display = m === 'build'   ? 'block'       : 'none';

  // Update the harmony scope note
  updateHarmonyScope();

  // Remove extra seeds if switching back to Explore
  if (m === 'explore' && seedCount > 1) {
    seedCount = 1;
    rebuildExtraSeeds();
  }
}

/**
 * addSeed — adds a second or third seed input (max 3 total).
 */
function addSeed() {
  if (seedCount >= 3) return;
  seedCount++;
  rebuildExtraSeeds();
  updateHarmonyScope();
  if (seedCount >= 3) document.getElementById('add-wrap').style.display = 'none';
}

/**
 * rebuildExtraSeeds — injects seed-grp-1 and seed-grp-2 directly into
 * the seed-row flex container so all seeds appear in one row.
 *
 * Critically: we remove any previously injected groups first, then
 * insert new ones BEFORE the add-wrap div. This keeps the row order
 * correct: Primary | Secondary | Accent | [+ Add colour].
 */
function rebuildExtraSeeds() {
  // Remove previously injected groups (indices 1 and 2)
  ['seed-grp-1', 'seed-grp-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const row     = document.getElementById('seed-row');
  const addWrap = document.getElementById('add-wrap');

  // Seed 2 = Secondary (always, in Build mode)
  if (seedCount >= 2) {
    const grp = makeSeedGroup(1, 'Secondary', SEED_DEFAULTS[1]);
    row.insertBefore(grp, addWrap);
  }

  // Seed 3 = Accent (always, in Build mode)
  if (seedCount >= 3) {
    const grp = makeSeedGroup(2, 'Accent', SEED_DEFAULTS[2]);
    row.insertBefore(grp, addWrap);
  }

  // Show add button only when fewer than 3 seeds
  document.getElementById('add-wrap').style.display = seedCount < 3 ? 'block' : 'none';
}

/**
 * makeSeedGroup — creates a labelled seed input group element.
 * @param {number} i     — seed index (1 or 2)
 * @param {string} label — "Secondary" or "Accent"
 * @param {string} def   — default hex value
 */
function makeSeedGroup(i, label, def) {
  const grp = document.createElement('div');
  grp.className = 'seed-grp';
  grp.id = `seed-grp-${i}`;
  grp.innerHTML = `
    <label class="seed-name">${label}</label>
    <div class="seed-pair">
      <input type="color" id="p${i}-picker" value="${def}" oninput="syncPicker(${i})">
      <input type="text"  id="p${i}-text"   value="${def}" oninput="syncText(${i})"
             maxlength="7" placeholder="#000000">
      <button class="rm" onclick="removeSeed(${i})" aria-label="Remove seed">×</button>
    </div>`;
  return grp;
}

/**
 * removeSeed — removes seeds from index i onward.
 */
function removeSeed(i) {
  seedCount = i;
  rebuildExtraSeeds();
  updateHarmonyScope();
}

/**
 * syncPicker — colour picker changed → update the text input.
 * Always stores uppercase hex.
 */
function syncPicker(i) {
  const v = document.getElementById(`p${i}-picker`).value;
  document.getElementById(`p${i}-text`).value = v.toUpperCase();
  checkSeedWarning();
}

/**
 * syncText — text input changed → update the colour picker.
 * Enforces uppercase and only syncs on a complete valid hex.
 */
function syncText(i) {
  const el = document.getElementById(`p${i}-text`);
  el.value = el.value.toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(el.value)) {
    document.getElementById(`p${i}-picker`).value = el.value;
    checkSeedWarning();
  }
}

/**
 * setH — activates a harmony pill.
 */
function setH(h) {
  currentHarmony = h;
  document.querySelectorAll('.h-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('h-' + h).classList.add('active');
}

/**
 * updateHarmonyScope — shows a contextual note beside the Harmony Rule
 * label explaining how much influence the rule has given the seed count.
 */
function updateHarmonyScope() {
  const el = document.getElementById('harmony-scope');
  if (!el) return;
  if (currentMode === 'explore') {
    el.textContent = '— shapes the entire palette';
  } else if (seedCount === 2) {
    el.textContent = '— shapes background tint and secondary hue';
  } else if (seedCount >= 3) {
    el.textContent = '— shapes background tint only';
  } else {
    el.textContent = '';
  }
}

/**
 * setTheme — toggles light/dark and re-renders all sections.
 */
function setTheme(t) {
  currentTheme = t;
  document.getElementById('btn-light').classList.toggle('active', t === 'light');
  document.getElementById('btn-dark').classList.toggle('active', t === 'dark');
  palette = t === 'light' ? lightPalette : darkPalette;
  document.getElementById('dark-callout').style.display = t === 'dark' ? 'flex' : 'none';

  // Re-render everything that reflects palette colours
  renderCols();
  renderA11y();
  const activeTab = document.querySelector('.prev-tab.active');
  renderPrev(activeTab && activeTab.textContent.trim().startsWith('Mobile') ? 'mobile' : 'web');

  // Re-export if the export panel is currently visible
  const expOut = document.getElementById('exp-out');
  if (expOut.style.display !== 'none' && expOut.dataset.fmt) {
    doExport(expOut.dataset.fmt);
  }
}


/* ═══════════════════════════════════
   3. COLOUR MATH
   Pure conversion functions. No side
   effects — take values, return values.
═══════════════════════════════════ */

/**
 * hexToRgb — "#RRGGBB" → { r, g, b } (each 0–255)
 * parseInt with base 16 extracts each 2-char hex pair.
 */
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * rgbToHex — { r, g, b } → "#RRGGBB" (uppercase)
 * Clamps to 0–255 and zero-pads each channel.
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * rgbToHsl — r,g,b (0–255) → { h, s, l }
 *
 * HSL is far more useful for colour manipulation than RGB:
 *   h (hue)        0–360°  position on the colour wheel
 *   s (saturation) 0–100%  0 = grey, 100 = fully vivid
 *   l (lightness)  0–100%  0 = black, 50 = pure hue, 100 = white
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if      (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    h = ((h * 60) + 360) % 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * hslToRgb — h (0–360), s (0–100), l (0–100) → { r, g, b }
 * Standard mathematical formula for HSL → RGB conversion.
 */
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

/** hslToHex — convenience wrapper */
function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/** hexToHsl — convenience wrapper */
function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

/**
 * relativeLuminance — WCAG relative luminance (0 = black, 1 = white).
 *
 * This is NOT the same as HSL lightness. It accounts for the fact that
 * human eyes perceive green as much brighter than blue:
 *   weights: R=21.26%  G=71.52%  B=7.22%
 *
 * The linearisation step (the Math.pow) undoes the gamma correction
 * applied when the colour was stored as sRGB.
 */
function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * contrastRatio — WCAG contrast ratio between two colours.
 *
 * Always ≥ 1 (same colour = 1:1, black on white = 21:1).
 * WCAG thresholds:
 *   3.0:1  AA Large (large text + UI components)
 *   4.5:1  AA      (normal body text)
 *   7.0:1  AAA     (enhanced — aim for body copy)
 */
function contrastRatio(hexA, hexB) {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}


/* ═══════════════════════════════════
   4. SEED ANALYSIS
   Functions that characterise a seed
   colour before palette generation.
═══════════════════════════════════ */

/**
 * colourTemperature — classifies a hue as warm, cool, or neutral.
 *
 * Warm colours (reds, oranges, yellows, warm pinks) → 0–90° and 300–360°
 * Cool colours (greens, cyans, blues, purples)       → 100–270°
 * Neutral (yellow-greens and blue-violets)           → 91–99° and 271–299°
 *
 * This drives the accent selection logic: a cool primary gets a warm
 * accent (amber/orange), a warm primary gets a cool accent (teal/cyan).
 * This mirrors how light and shadow work in the physical world.
 */
function colourTemperature(h) {
  if (h <= 90 || h >= 300) return 'warm';
  if (h >= 100 && h <= 270) return 'cool';
  return 'neutral';
}

/**
 * onColour — generates a legible tonal text colour for a given background.
 *
 * Rather than choosing between pure black and pure white, we generate a
 * very dark or very light version of the SAME hue as the background.
 * This makes text feel like it belongs on its surface.
 *
 * Decision threshold: WCAG relative luminance > 0.18 = "light" background.
 * (0.18 is roughly the luminance of a mid-grey — empirically the point
 * at which dark text becomes more readable than light text.)
 */
function onColour(bgHex) {
  const { h, s } = hexToHsl(bgHex);
  const lum = relativeLuminance(bgHex);
  if (lum > 0.18) {
    // Light background → dark tonal text (retains a fraction of the hue's saturation)
    return hslToHex(h, Math.min(s * 0.55, 50), 11);
  } else {
    // Dark background → light tonal text
    return hslToHex(h, Math.min(s * 0.2, 18), 93);
  }
}

/**
 * detectExtremeSeed — checks whether the primary seed is near-black or
 * near-white and returns a warning message + adjusted hex if needed.
 *
 * Near-black (luminance < 0.03): works as text/heading colour but not
 *   as a button/action colour. We generate a usable lighter tint.
 * Near-white (luminance > 0.85): works as background but not as action
 *   colour. We generate a usable deeper version of the same hue.
 *
 * @returns { warning: string|null, adjusted: string }
 */
function detectExtremeSeed(hex) {
  const lum = relativeLuminance(hex);
  const { h, s, l } = hexToHsl(hex);

  if (lum < 0.03) {
    // Very dark — generate a usable mid-tone from the same hue
    const usable = s > 5
      ? hslToHex(h, Math.max(s, 40), 42)   // has a hue — lighten to mid-tone
      : hslToHex(0, 0, 30);                 // near-black neutral — use dark grey
    return {
      warning: `Your seed is very dark (luminance ${lum.toFixed(3)}). Dark colours work well as text or structural elements but are hard to read as button or active-state colours. We've generated a lighter tint of the same hue for interactive elements like buttons.`,
      adjusted: usable,
    };
  }

  if (lum > 0.85) {
    // Very light — generate a usable mid-tone from the same hue
    const usable = s > 5
      ? hslToHex(h, Math.max(s, 50), 44)   // has a hue — deepen to mid-tone
      : hslToHex(0, 0, 55);                 // near-white neutral — use mid-grey
    return {
      warning: `Your seed is very light (luminance ${lum.toFixed(3)}). Light colours work well as backgrounds or surfaces but disappear against white. We've generated a deeper version of the same hue for interactive elements.`,
      adjusted: usable,
    };
  }

  return { warning: null, adjusted: hex };
}

/**
 * checkSeedWarning — reads the current primary seed and shows or hides
 * the warning banner in the input card.
 */
function checkSeedWarning() {
  const el = document.getElementById('p0-text');
  if (!el) return;
  const val = el.value.trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(val)) return;

  const { warning } = detectExtremeSeed(val);
  const banner = document.getElementById('seed-warning');
  const text   = document.getElementById('seed-warning-text');
  if (warning) {
    text.textContent = warning;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

/**
 * harmonySecondaryHue — returns the secondary hue based on the harmony rule.
 *
 * In 1-seed Explore mode this shapes the secondary colour's hue.
 * In Build mode it shapes the background tint direction.
 *
 * Rule → degrees of hue rotation from primary:
 *   natural        0°   (same hue family — secondary is just a muted tint)
 *   complementary  180° (opposite on the wheel — strong contrast)
 *   analogous      30°  (neighbouring hue — gentle, harmonious)
 *   triadic        120° (one-third of the wheel — balanced variety)
 *   split          150° (softer alternative to complementary)
 */
function harmonySecondaryHue(h, rule) {
  const offsets = { natural: 0, complementary: 180, analogous: 30, triadic: 120, split: 150 };
  return (h + (offsets[rule] || 0) + 360) % 360;
}

/**
 * deriveAccentHue — chooses the accent hue.
 *
 * For Natural rule: temperature opposition.
 *   Cool primary (blues, greens, purples) → warm accent (amber/orange, ~20–55°)
 *   Warm primary (reds, oranges, yellows) → cool accent (teal/cyan, ~190–220°)
 *
 * Why temperature opposition? Because warm/cool pairings mirror how
 * light and shadow behave in the physical world — sunlit blue water
 * has warm amber highlights. This feels natural in a way that pure
 * hue-wheel rotation (e.g. Golden Angle) often does not.
 *
 * For other rules: use the same rotation as the secondary hue.
 */
function deriveAccentHue(h, temp, rule) {
  if (rule === 'natural') {
    if (temp === 'cool')    return 28 + (h % 22);   // amber family 28–50°
    if (temp === 'warm')    return 198 + (h % 24);  // teal/cyan family 198–222°
    return (h + 150 + 360) % 360;                   // neutral → split-comp
  }
  return harmonySecondaryHue(h, rule);
}


/* ═══════════════════════════════════
   5. PALETTE GENERATION
   Builds the complete 8-role colour
   system. Logic differs by seed count.
═══════════════════════════════════ */

/**
 * buildLightPalette — core generation function.
 *
 * ROLE OWNERSHIP (how colours are used in UI):
 *
 *   primary    — app header/hero background, nav active state, filled buttons
 *   secondary  — section labels (as text), borders, dividers, outline buttons
 *                NOTE: secondary is almost never a fill colour — it is structural
 *   accent     — EXACTLY ONE full-surface element per screen (a card, a stat
 *                block, the hero CTA button). Used sparingly for maximum impact.
 *   background — page/screen fill (the "floor" — furthest from the eye)
 *   surface    — cards, modals, list containers (slightly "closer" than background)
 *   error      — error text, error borders, destructive action buttons
 *   success    — confirmation states, positive feedback
 *   warning    — caution states, pending/advisory elements
 *
 * ON-COLOURS:
 *   Every colour has a paired "on-colour" — the text/icon colour used
 *   when content is displayed ON that colour's background. On-colours
 *   are tonal relatives of their surface (same hue, very different lightness).
 *
 * @param {string}   primaryHex  — primary seed colour
 * @param {string}   rule        — harmony rule
 * @param {string[]} seeds       — all user seeds (for Build mode anchoring)
 */
function buildLightPalette(primaryHex, rule, seeds = []) {
  // Run extreme seed detection and use adjusted hex for generation if needed
  const { adjusted: usablePrimary } = detectExtremeSeed(primaryHex);
  const { h, s, l } = hexToHsl(usablePrimary);
  const temp = colourTemperature(h);

  /* ── Secondary ──
     In 1-seed Explore: hue shifts by rule amount, saturation ~22% of primary,
     lightness pushed into the 58–74% range. Reads as "quieter brand colour".
     In 2-seed Build: user's seed 2 IS the secondary (anchored below). */
  const secH = harmonySecondaryHue(h, rule);
  const secondary = hslToHex(
    secH,
    Math.max(6, Math.round(s * 0.22)),
    Math.min(74, Math.max(58, l + 16))
  );

  /* ── Accent ──
     In 1-seed Explore: temperature opposition (Natural) or rule rotation.
     Saturation kept high (62–88%) and lightness at mid-range (40–56%) so
     it reads as vivid and energetic against both light surfaces and primary.
     In 3-seed Build: user's seed 3 IS the accent (anchored below). */
  const aH = deriveAccentHue(h, temp, rule);
  const accent = hslToHex(
    aH,
    Math.min(88, Math.max(62, s + 8)),
    Math.min(56, Math.max(40, l - 2))
  );

  /* ── Background ──
     Near-white with a very subtle tint from the harmony rule's hue direction.
     Saturation 2–8%, lightness 94–96%. Tinted so it feels "in the palette"
     rather than being a generic white. */
  const bgH = harmonySecondaryHue(h, rule); // background tint follows rule
  const background = hslToHex(bgH, Math.max(2, Math.round(s * 0.07)), 95);

  /* ── Surface ──
     Even closer to white than background (lightness 97–99%), minimal tint.
     The difference between surface and background is subtle in isolation
     but creates clear card "lift" when placed in context. */
  const surface = hslToHex(h, Math.max(1, Math.round(s * 0.03)), 98);

  /* ── Semantic colours ──
     Generated independently of brand colours — their semantic meaning
     (red=danger, green=safe, amber=caution) must never be compromised.
     We then check hue separation: if primary is close to any semantic hue,
     we shift that semantic colour to maintain clear distinction. */
  let eH = 4, suH = 128, wH = 38;
  if (Math.abs(h -   4) < 28 || h > 338) eH  = 352; // shift error if primary is red-ish
  if (Math.abs(h - 128) < 28)            suH = 150; // shift success if primary is green-ish
  if (Math.abs(h -  38) < 22)            wH  =  52; // shift warning if primary is amber-ish

  const error   = hslToHex(eH,  70, 42);
  const success = hslToHex(suH, 56, 34);
  const warning = hslToHex(wH,  86, 44);

  /* ── Assemble role objects ── */
  const mk = (hex, role, usage) => ({ hex, role, usage, on: onColour(hex) });

  const p = {
    primary:    mk(usablePrimary, 'Primary',    'Filled buttons, active states, links, app header'),
    secondary:  mk(secondary,     'Secondary',  'Section labels, borders, dividers, outline buttons'),
    accent:     mk(accent,        'Accent',     'One focal element per screen — hero CTA, key stat, badge'),
    background: mk(background,    'Background', 'Main page or app background fill'),
    surface:    mk(surface,       'Surface',    'Cards, modals, list containers, drawers'),
    error:      mk(error,         'Error',      'Error text, error borders, destructive actions'),
    success:    mk(success,       'Success',    'Confirmations, positive states, success messages'),
    warning:    mk(warning,       'Warning',    'Caution states, pending actions, advisory text'),
  };

  /* ── Build mode anchoring ──
     In Build mode the user's seeds ARE their brand colours.
     Seed 1 = Primary (already used above as usablePrimary).
     Seed 2 = Secondary (always — the structural/quieter partner).
     Seed 3 = Accent   (always — the highlight/energy colour).
     We override the generated values with the user's exact seeds. */
  if (seeds.length >= 2) {
    p.secondary.hex = seeds[1].toUpperCase();
    p.secondary.on  = onColour(seeds[1]);
  }
  if (seeds.length >= 3) {
    p.accent.hex = seeds[2].toUpperCase();
    p.accent.on  = onColour(seeds[2]);
  }

  return p;
}


/* ═══════════════════════════════════
   6. DARK THEME
   Derives a dark-mode palette from
   the light palette. NOT just "darker"
   — the hierarchy inverts.
═══════════════════════════════════ */

/**
 * buildDarkPalette — generates the dark mode variant.
 *
 * KEY PRINCIPLE: In dark mode, backgrounds become near-black and
 * surfaces become very dark. BUT primary must become LIGHTER and
 * less saturated — a vivid blue that reads perfectly on white
 * becomes harsh and aggressive on near-black.
 *
 * Material Design calls this "dark theme primary" — a lighter tint
 * of the brand colour (typically 65–72% lightness) that sits
 * comfortably on a dark surface.
 *
 * Semantic colours (error/success/warning) also need lightening
 * because their standard mid-tone values disappear on near-black.
 */
function buildDarkPalette(light) {
  const { h: pH, s: pS } = hexToHsl(light.primary.hex);
  const { h: aH, s: aS } = hexToHsl(light.accent.hex);
  const { h: sH, s: sS } = hexToHsl(light.secondary.hex);
  const { h: eH }        = hexToHsl(light.error.hex);
  const { h: suH }       = hexToHsl(light.success.hex);
  const { h: wH }        = hexToHsl(light.warning.hex);

  const mk = (hex, role, usage) => ({ hex, role, usage, on: onColour(hex) });

  return {
    // Primary: lighter tint (68% lightness) — vivid colours are harsh on dark surfaces
    primary: mk(hslToHex(pH, Math.min(pS, 72), 68), 'Primary', light.primary.usage),

    // Secondary: slightly lightened to remain visible on dark background
    secondary: mk(hslToHex(sH, Math.min(sS * 1.4, 35), 56), 'Secondary', light.secondary.usage),

    // Accent: slight lightness boost while retaining vivid character
    accent: mk(hslToHex(aH, Math.min(aS, 80), Math.min(62, aS > 60 ? 58 : 66)), 'Accent', light.accent.usage),

    // Background: near-black with subtle brand hue tint (avoid pure #000000)
    background: mk(hslToHex(pH, 8, 8), 'Background', light.background.usage),

    // Surface: slightly lighter than background — creates card lift in dark mode
    surface: mk(hslToHex(pH, 6, 14), 'Surface', light.surface.usage),

    // Semantic colours: lightened so they remain visible on near-black backgrounds
    error:   mk(hslToHex(eH,  74, 62), 'Error',   light.error.usage),
    success: mk(hslToHex(suH, 60, 55), 'Success', light.success.usage),
    warning: mk(hslToHex(wH,  84, 60), 'Warning', light.warning.usage),
  };
}


/* ═══════════════════════════════════
   7. GENERATE
   Main entry point — called when the
   user clicks "Generate colour system".
═══════════════════════════════════ */

/**
 * getSeedValues — reads and validates all visible seed input fields.
 * Returns only valid 6-digit hex strings, in order.
 */
function getSeedValues() {
  const out = [];
  for (let i = 0; i < seedCount; i++) {
    const el = document.getElementById(`p${i}-text`);
    if (!el) continue;
    const v = el.value.trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(v)) out.push(v);
  }
  return out;
}

/**
 * generate — orchestrates palette creation and rendering.
 */
function generate() {
  const seeds = getSeedValues();
  if (!seeds.length) {
    alert('Please enter a valid hex colour — e.g. #008CBB');
    return;
  }

  // Build both theme variants
  lightPalette = buildLightPalette(seeds[0], currentHarmony, seeds);
  darkPalette  = buildDarkPalette(lightPalette);

  // Set active palette
  palette = currentTheme === 'light' ? lightPalette : darkPalette;

  // Generate a human-readable palette name from the primary hue
  const { h } = hexToHsl(seeds[0]);
  const hueNames = [
    'Red','Red-orange','Orange','Amber','Yellow','Yellow-green',
    'Green','Green-teal','Teal','Cyan','Sky','Blue',
    'Indigo','Violet','Purple','Magenta','Pink','Rose'
  ];
  const hueName = hueNames[Math.round(h / 20) % 18];

  // Describe the seed count context
  const seedDesc = seeds.length === 1 ? '1 seed' : seeds.length === 2 ? '2 seeds anchored' : '3 seeds anchored';

  document.getElementById('pal-title').textContent = hueName + ' system';
  document.getElementById('pal-meta').textContent  =
    `${currentHarmony} harmony · ${seedDesc} · seed ${seeds[0]}`;

  // Show seed colour dots in palette header
  const dotsEl = document.getElementById('seed-dots');
  dotsEl.innerHTML = '';
  seeds.forEach(s => {
    const d = document.createElement('div');
    d.style.cssText = `width:26px;height:26px;border-radius:6px;background:${s};border:0.5px solid rgba(0,0,0,0.1);title="${s}"`;
    dotsEl.appendChild(d);
  });

  // Render all result sections
  renderCols();
  renderPrev('mobile');
  renderA11y();

  // Reset UI state
  document.querySelectorAll('.prev-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.getElementById('results').classList.add('on');
  document.getElementById('det').style.display = 'none';
  document.getElementById('exp-out').style.display = 'none';
  // No auto-scroll — per feedback
}


/* ═══════════════════════════════════
   8. RENDER COLUMNS
   Draws the five main colour pair
   columns and the semantic strip.
═══════════════════════════════════ */

/**
 * renderCols — builds the colour columns and semantic strip from
 * the current active palette.
 */
function renderCols() {
  const colsEl = document.getElementById('cols');
  colsEl.innerHTML = '';

  ['primary', 'secondary', 'accent', 'background', 'surface'].forEach(key => {
    const c     = palette[key];
    const ratio = contrastRatio(c.hex, c.on).toFixed(1);

    const pair = document.createElement('div');
    pair.className = 'col-pair';
    pair.innerHTML = `
      <div class="col-top" style="background:${c.hex};color:${c.on}" onclick="showDetail('${key}')">
        <div class="col-role">${c.role}</div>
        <div class="col-usage">${c.usage}</div>
        <div class="col-hex">${c.hex}</div>
        <div class="col-cr">${ratio}:1 contrast</div>
      </div>
      <div class="col-bot" style="background:${c.on};color:${c.hex}" onclick="showDetail('on-${key}')">
        <div class="col-role">On ${c.role}</div>
        <div class="col-hex">${c.on}</div>
      </div>`;
    colsEl.appendChild(pair);
  });

  // Semantic strip
  const semEl = document.getElementById('sem');
  semEl.innerHTML = '';
  ['error', 'success', 'warning'].forEach(key => {
    const c   = palette[key];
    const col = document.createElement('div');
    col.className = 'sem-col';
    col.style.cssText = `background:${c.hex};color:${c.on}`;
    col.innerHTML = `
      <div class="sem-role">${c.role}</div>
      <div class="sem-usage">${c.usage}</div>
      <div class="sem-hex">${c.hex}</div>`;
    col.onclick = () => showDetail(key);
    semEl.appendChild(col);
  });
}


/* ═══════════════════════════════════
   9. DETAIL PANEL
   Shown when a swatch is clicked.
═══════════════════════════════════ */

/**
 * showDetail — populates and reveals the detail card below the columns.
 * Handles both main roles (e.g. "primary") and on-colour keys ("on-primary").
 */
function showDetail(key) {
  let c;
  if (key.startsWith('on-')) {
    const base = key.slice(3);
    c = {
      hex:   palette[base].on,
      role:  'On ' + palette[base].role,
      usage: 'Text and icons displayed on ' + palette[base].role.toLowerCase() + ' backgrounds',
    };
  } else {
    c = palette[key];
  }

  const { h, s, l } = hexToHsl(c.hex);
  const { r, g, b } = hexToRgb(c.hex);
  const lum  = relativeLuminance(c.hex);
  const vsW  = contrastRatio(c.hex, '#FFFFFF').toFixed(2);
  const vsB  = contrastRatio(c.hex, '#000000').toFixed(2);
  const temp = colourTemperature(h);

  document.getElementById('d-name').textContent  = c.role;
  document.getElementById('d-usage').textContent = c.usage;
  document.getElementById('d-sw').style.background = c.hex;

  document.getElementById('d-grid').innerHTML = [
    ['Hex',             c.hex],
    ['RGB',             `${r}, ${g}, ${b}`],
    ['HSL',             `${h}°  ${s}%  ${l}%`],
    ['Luminance',       lum.toFixed(4)],
    ['vs White',        `${vsW}:1`],
    ['vs Black',        `${vsB}:1`],
    ['Temperature',     temp],
    ['Perceptual weight', lum > 0.5 ? 'Light' : 'Dark'],
  ].map(([label, val]) => `
    <div class="d-item">
      <div class="d-lbl">${label}</div>
      <div class="d-val">${val}</div>
    </div>`).join('');

  document.getElementById('det').style.display = 'block';
}


/* ═══════════════════════════════════
   10. MOBILE SCREENS
   Four screen builders. Each screen
   demonstrates a different context
   for the palette's colour hierarchy.

   COLOUR OWNERSHIP RULES applied
   consistently across all screens:
   ─────────────────────────────────
   Primary    → header/hero background (text = on-primary)
   Accent     → ONE full-surface element per screen (text = on-accent)
   Secondary  → used as TEXT/BORDER colour, rarely as fill
   Background → page/screen fill (text = on-background)
   Surface    → cards, list containers (text = on-surface)
   Error      → destructive actions, error states
   Success    → positive/confirmation states
═══════════════════════════════════ */

function renderMobile() {
  document.getElementById('prev-area').innerHTML = `
    <div class="phone-tray">
      ${[['Home', screenHome()], ['Analytics', screenAnalytics()],
         ['Settings', screenSettings()], ['Profile', screenProfile()]]
        .map(([lbl, html]) => `
          <div class="phone-wrap">
            <div class="phone-frame"><div class="phone-screen">${html}</div></div>
            <div class="phone-lbl">${lbl}</div>
          </div>`).join('')}
    </div>`;
}

/**
 * screenHome — Dashboard.
 * Primary: full-bleed hero background.
 * Accent: the single "View full report" CTA button.
 * Surface: activity cards.
 * Secondary: used as text colour for "PENDING" value label.
 * Success: used as text colour for positive activity item.
 */
function screenHome() {
  const P = palette;
  return `
    <div style="background:${P.primary.hex};padding:12px 12px 18px;flex-shrink:0">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:11px;color:${P.primary.on};opacity:.65;font-family:'Fira Mono',monospace">9:41</span>
        <span style="font-size:11px;color:${P.primary.on};opacity:.5;font-family:'Inter',sans-serif">●●●</span>
      </div>
      <div style="font-size:11px;color:${P.primary.on};opacity:.65;font-family:'Inter',sans-serif">Dashboard</div>
      <div style="font-size:30px;color:${P.primary.on};font-family:'Inter',sans-serif;font-weight:500;line-height:1;margin-top:2px">2,841</div>
      <div style="font-size:11px;color:${P.primary.on};opacity:.6;font-family:'Inter',sans-serif;margin-top:2px">total events this month</div>
    </div>

    <div style="background:${P.background.hex};flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;overflow:hidden">

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div style="background:${P.surface.hex};border-radius:10px;padding:10px;border:0.5px solid rgba(0,0,0,.05)">
          <div style="font-size:10px;color:${P.surface.on};opacity:.5;font-family:'Inter',sans-serif;margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">Active</div>
          <div style="font-size:22px;color:${P.primary.hex};font-family:'Inter',sans-serif;font-weight:500">94%</div>
        </div>
        <div style="background:${P.surface.hex};border-radius:10px;padding:10px;border:0.5px solid rgba(0,0,0,.05)">
          <div style="font-size:10px;color:${P.surface.on};opacity:.5;font-family:'Inter',sans-serif;margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">Pending</div>
          <div style="font-size:22px;color:${P.secondary.hex};font-family:'Inter',sans-serif;font-weight:500">12</div>
        </div>
      </div>

      <div style="background:${P.surface.hex};border-radius:10px;padding:10px;border:0.5px solid rgba(0,0,0,.05)">
        <div style="font-size:11px;color:${P.surface.on};font-weight:500;margin-bottom:6px;font-family:'Inter',sans-serif">Recent activity</div>
        ${[['Payment received','$240.00', P.success.hex],
           ['Review pending',  'Invoice #2', P.secondary.hex],
           ['File uploaded',   'Report.pdf', P.primary.hex]]
          .map(([a, b, col]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(0,0,0,.05)">
            <span style="font-size:11px;color:${P.surface.on};font-family:'Inter',sans-serif">${a}</span>
            <span style="font-size:11px;color:${col};font-family:'Fira Mono',monospace">${b}</span>
          </div>`).join('')}
      </div>

      <!-- ACCENT used here as the single focal CTA per this screen -->
      <div style="background:${P.accent.hex};border-radius:10px;padding:11px;text-align:center;margin-top:auto">
        <span style="font-size:12px;color:${P.accent.on};font-family:'Inter',sans-serif;font-weight:500">View full report →</span>
      </div>

    </div>

    <div style="background:${P.surface.hex};border-top:0.5px solid rgba(0,0,0,.08);padding:8px 0;display:flex;justify-content:space-around;flex-shrink:0">
      ${[['ti-home','Home',true],['ti-chart-bar','Stats',false],['ti-search','Explore',false],['ti-user','Profile',false]]
        .map(([ic, lb, act]) => `
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <i class="ti ${ic}" style="font-size:18px;color:${act ? P.primary.hex : P.surface.on};opacity:${act ? 1 : 0.4}" aria-hidden="true"></i>
            <span style="font-size:11px;color:${act ? P.primary.hex : P.surface.on};opacity:${act ? 1 : 0.4};font-family:'Inter',sans-serif">${lb}</span>
          </div>`).join('')}
    </div>`;
}

/**
 * screenAnalytics — Data/chart screen.
 * Primary: page header background.
 * Accent: the hero stat block (full background = accent, text = on-accent).
 *         This is the ONE accent region on this screen.
 * Surface: chart card and summary stat cards.
 * Primary hex used as bar fill for chart bars (partial opacity for non-peak).
 */
function screenAnalytics() {
  const P = palette;
  const bars = [55, 72, 48, 88, 63, 94];
  const peakIdx = bars.indexOf(94);
  const maxH = 50;

  return `
    <div style="background:${P.primary.hex};padding:12px 12px 14px;flex-shrink:0">
      <div style="font-size:11px;color:${P.primary.on};opacity:.6;margin-bottom:6px;font-family:'Fira Mono',monospace">9:41</div>
      <div style="font-size:16px;color:${P.primary.on};font-family:'Inter',sans-serif;font-weight:500">Analytics</div>
    </div>

    <!-- ACCENT block — the one focal region on this screen -->
    <div style="background:${P.accent.hex};padding:14px 12px;flex-shrink:0">
      <div style="font-size:10px;color:${P.accent.on};opacity:.8;font-family:'Inter',sans-serif;text-transform:uppercase;letter-spacing:.08em">Peak this week</div>
      <div style="font-size:34px;color:${P.accent.on};font-family:'Inter',sans-serif;font-weight:500;line-height:1;margin-top:3px">94%</div>
      <div style="font-size:11px;color:${P.accent.on};opacity:.75;font-family:'Inter',sans-serif;margin-top:2px">↑ 12% from last week</div>
    </div>

    <div style="background:${P.background.hex};flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;overflow:hidden">

      <div style="background:${P.surface.hex};border-radius:10px;padding:10px;border:0.5px solid rgba(0,0,0,.05)">
        <div style="font-size:11px;color:${P.surface.on};font-weight:500;margin-bottom:8px;font-family:'Inter',sans-serif">Daily events</div>
        <div style="display:flex;align-items:flex-end;gap:4px;height:${maxH}px">
          ${bars.map((v, i) => `
            <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%">
              <div style="width:100%;height:${Math.round((v / 100) * maxH)}px;background:${i === peakIdx ? P.accent.hex : P.primary.hex};border-radius:3px 3px 0 0;opacity:${i === peakIdx ? 1 : 0.5}"></div>
            </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:5px">
          ${['M','T','W','T','F','S'].map(d =>
            `<span style="font-size:10px;color:${P.surface.on};opacity:.4;flex:1;text-align:center;font-family:'Inter',sans-serif">${d}</span>`).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${[['Sessions','1,284', P.primary.hex], ['Bounce','32%', P.success.hex]]
          .map(([lb, v, col]) => `
            <div style="background:${P.surface.hex};border-radius:10px;padding:10px;border:0.5px solid rgba(0,0,0,.05)">
              <div style="font-size:10px;color:${P.surface.on};opacity:.5;font-family:'Inter',sans-serif;margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">${lb}</div>
              <div style="font-size:20px;color:${col};font-family:'Inter',sans-serif;font-weight:500">${v}</div>
            </div>`).join('')}
      </div>

    </div>`;
}

/**
 * screenSettings — Settings list screen.
 * Surface: header and list container backgrounds.
 * Secondary: section label text (structural role — labels hierarchy).
 * Background: page fill between sections.
 * Error: sign-out button border and text (destructive action).
 * No accent used — demonstrates that not every screen needs the accent.
 */
function screenSettings() {
  const P = palette;
  return `
    <div style="background:${P.surface.hex};padding:12px;border-bottom:0.5px solid rgba(0,0,0,.07);flex-shrink:0">
      <div style="font-size:11px;color:${P.surface.on};opacity:.5;margin-bottom:6px;font-family:'Fira Mono',monospace">9:41</div>
      <div style="font-size:16px;color:${P.surface.on};font-family:'Inter',sans-serif;font-weight:500">Settings</div>
    </div>

    <div style="background:${P.background.hex};flex:1;padding:10px;display:flex;flex-direction:column;gap:10px;overflow:hidden">

      ${[['Account',['Profile & name','Email address','Password']],
         ['Preferences',['Notifications','Appearance','Language']]]
        .map(([sec, items]) => `
          <div>
            <!-- Secondary as section label text — structural, not a fill -->
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:${P.secondary.hex};font-weight:500;margin-bottom:4px;padding-left:2px;font-family:'Inter',sans-serif">${sec}</div>
            <div style="background:${P.surface.hex};border-radius:10px;overflow:hidden;border:0.5px solid rgba(0,0,0,.05)">
              ${items.map((item, ii) => `
                <div style="padding:9px 10px;display:flex;justify-content:space-between;align-items:center;${ii < items.length - 1 ? 'border-bottom:0.5px solid rgba(0,0,0,.05)' : ''}">
                  <span style="font-size:12px;color:${P.surface.on};font-family:'Inter',sans-serif">${item}</span>
                  <i class="ti ti-chevron-right" style="font-size:14px;color:${P.surface.on};opacity:.3" aria-hidden="true"></i>
                </div>`).join('')}
            </div>
          </div>`).join('')}

      <!-- Error colour for destructive action — border + text only, no fill -->
      <div style="border:0.5px solid ${P.error.hex};border-radius:10px;padding:10px;text-align:center;margin-top:auto">
        <span style="font-size:12px;color:${P.error.hex};font-family:'Inter',sans-serif;font-weight:500">Sign out</span>
      </div>

    </div>`;
}

/**
 * screenProfile — User profile screen.
 * Primary: hero header background.
 * Accent: avatar ring — the ONE focal accent element on this screen.
 * Surface: stat cards and recent list.
 * Secondary: used as outline button border/text for "Edit profile".
 * Background: page fill.
 */
function screenProfile() {
  const P = palette;
  return `
    <div style="background:${P.primary.hex};padding:18px 12px 20px;flex-shrink:0">
      <div style="font-size:11px;color:${P.primary.on};opacity:.6;margin-bottom:10px;font-family:'Fira Mono',monospace">9:41</div>
      <div style="display:flex;align-items:center;gap:10px">
        <!-- ACCENT as avatar ring — the focal point of this screen -->
        <div style="width:44px;height:44px;border-radius:50%;background:${P.accent.hex};display:flex;align-items:center;justify-content:center;border:2.5px solid ${P.primary.on};flex-shrink:0">
          <span style="font-size:14px;color:${P.accent.on};font-weight:500;font-family:'Inter',sans-serif">JD</span>
        </div>
        <div>
          <div style="font-size:15px;color:${P.primary.on};font-family:'Inter',sans-serif;font-weight:500">Jordan Dev</div>
          <div style="font-size:11px;color:${P.primary.on};opacity:.65;font-family:'Inter',sans-serif">UI Designer</div>
        </div>
      </div>
    </div>

    <div style="background:${P.background.hex};flex:1;padding:10px;display:flex;flex-direction:column;gap:8px;overflow:hidden">

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">
        ${[['12','Projects'], ['84','Exports'], ['4.9','Rating']]
          .map(([v, lb]) => `
            <div style="background:${P.surface.hex};border-radius:10px;padding:8px;text-align:center;border:0.5px solid rgba(0,0,0,.05)">
              <div style="font-size:20px;color:${P.primary.hex};font-family:'Inter',sans-serif;font-weight:500">${v}</div>
              <div style="font-size:10px;color:${P.surface.on};opacity:.5;font-family:'Inter',sans-serif">${lb}</div>
            </div>`).join('')}
      </div>

      <div style="background:${P.surface.hex};border-radius:10px;padding:10px;border:0.5px solid rgba(0,0,0,.05)">
        <div style="font-size:11px;color:${P.surface.on};font-weight:500;margin-bottom:6px;font-family:'Inter',sans-serif">Recent palettes</div>
        ${[['Ocean Calm','5 colours', P.accent.hex],
           ['Warm Dusk', '4 colours', P.secondary.hex],
           ['Monochrome','6 colours', P.primary.hex]]
          .map(([name, count, dot]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(0,0,0,.04)">
              <div style="display:flex;align-items:center;gap:6px">
                <div style="width:10px;height:10px;border-radius:3px;background:${dot}"></div>
                <span style="font-size:11px;color:${P.surface.on};font-family:'Inter',sans-serif">${name}</span>
              </div>
              <span style="font-size:11px;color:${P.surface.on};opacity:.45;font-family:'Inter',sans-serif">${count}</span>
            </div>`).join('')}
      </div>

      <!-- Secondary as outline button — structural, not accent -->
      <div style="border:0.5px solid ${P.secondary.hex};border-radius:10px;padding:10px;text-align:center;margin-top:auto">
        <span style="font-size:12px;color:${P.secondary.hex};font-family:'Inter',sans-serif;font-weight:500">Edit profile</span>
      </div>

    </div>`;
}


/* ═══════════════════════════════════
   11. WEB PREVIEW
   Full webpage preview demonstrating
   the same colour ownership rules as
   the mobile screens.
═══════════════════════════════════ */

/**
 * renderWeb — builds the webpage preview.
 *
 * Nav:     surface background, primary for active link/logo
 * Hero:    primary full-bleed background
 * Accent:  used ONCE — the main CTA "Start building" button
 * Cards:   surface on background fill
 * Footer:  primary background (wraps the design with the brand colour)
 */
function renderWeb() {
  const P = palette;
  document.getElementById('prev-area').innerHTML = `
    <div class="web-outer">
      <div class="web-chrome">
        <div class="web-dot" style="background:#ff5f57"></div>
        <div class="web-dot" style="background:#febc2e"></div>
        <div class="web-dot" style="background:#28c840"></div>
        <div class="web-url">yourapp.com</div>
      </div>
      <div>
        <!-- Nav: surface bg, primary for active, secondary for outline button -->
        <div style="background:${P.surface.hex};padding:0 28px;height:52px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid rgba(0,0,0,.07)">
          <span style="font-size:17px;color:${P.primary.hex};font-family:'Inter',sans-serif;font-weight:500">Studio</span>
          <div style="display:flex;gap:22px;align-items:center">
            ${['Work','About','Pricing'].map((label, i) => `
              <span style="font-size:13px;color:${i === 0 ? P.primary.hex : P.surface.on};font-family:'Inter',sans-serif;opacity:${i === 0 ? 1 : 0.6};${i === 0 ? `border-bottom:2px solid ${P.primary.hex};padding-bottom:3px` : ''}">${label}</span>`).join('')}
          </div>
          <div style="border:0.5px solid ${P.secondary.hex};border-radius:7px;padding:6px 14px">
            <span style="font-size:12px;color:${P.secondary.hex};font-family:'Inter',sans-serif">Sign in</span>
          </div>
        </div>

        <!-- Hero: primary full-bleed -->
        <div style="background:${P.primary.hex};padding:44px 32px;text-align:center">
          <div style="font-size:28px;color:${P.primary.on};font-family:'Inter',sans-serif;font-weight:500;line-height:1.2;margin-bottom:12px">Design systems<br>that feel right</div>
          <div style="font-size:13px;color:${P.primary.on};opacity:.72;font-family:'Inter',sans-serif;margin-bottom:24px;max-width:380px;margin-left:auto;margin-right:auto;line-height:1.6">
            Build harmonious colour palettes grounded in perception, not just theory.
          </div>
          <div style="display:flex;gap:10px;justify-content:center">
            <!-- ACCENT: the one CTA on this page -->
            <div style="background:${P.accent.hex};border-radius:8px;padding:10px 22px">
              <span style="font-size:13px;color:${P.accent.on};font-family:'Inter',sans-serif;font-weight:500">Start building</span>
            </div>
            <!-- Ghost button: on-primary with border, no accent -->
            <div style="border:0.5px solid ${P.primary.on};border-radius:8px;padding:10px 22px;opacity:.65">
              <span style="font-size:13px;color:${P.primary.on};font-family:'Inter',sans-serif">See examples</span>
            </div>
          </div>
        </div>

        <!-- Feature section: background fill, surface cards -->
        <div style="background:${P.background.hex};padding:30px 28px">
          <div style="font-size:17px;color:${P.background.on};font-family:'Inter',sans-serif;font-weight:500;text-align:center;margin-bottom:18px">How it works</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
            ${[['Seed','Enter 1–3 colours you love','ti-color-swatch'],
               ['Generate','Get a full system instantly','ti-wand'],
               ['Preview','See it in a real interface','ti-device-mobile']]
              .map(([title, desc, icon]) => `
                <div style="background:${P.surface.hex};border-radius:10px;padding:16px;border:0.5px solid rgba(0,0,0,.06)">
                  <i class="ti ${icon}" style="font-size:20px;color:${P.primary.hex};margin-bottom:8px;display:block" aria-hidden="true"></i>
                  <div style="font-size:13px;color:${P.surface.on};font-weight:500;margin-bottom:4px;font-family:'Inter',sans-serif">${title}</div>
                  <div style="font-size:12px;color:${P.surface.on};opacity:.6;font-family:'Inter',sans-serif;line-height:1.5">${desc}</div>
                </div>`).join('')}
          </div>
        </div>

        <!-- Footer: primary background mirrors hero -->
        <div style="background:${P.primary.hex};padding:18px 28px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:${P.primary.on};opacity:.5;font-family:'Inter',sans-serif">© 2026 Studio</span>
          <div style="display:flex;gap:18px">
            ${['Privacy','Terms','Contact'].map(l =>
              `<span style="font-size:11px;color:${P.primary.on};opacity:.5;font-family:'Inter',sans-serif">${l}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

/* Preview tab switcher */
function setPrev(type, btn) {
  document.querySelectorAll('.prev-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderPrev(type);
}
function renderPrev(type) {
  type === 'mobile' ? renderMobile() : renderWeb();
}


/* ═══════════════════════════════════
   12. ACCESSIBILITY REPORT
═══════════════════════════════════ */

/**
 * renderA11y — builds the WCAG contrast grid.
 *
 * Each card shows the pair on its ACTUAL background colour so the user
 * sees the real visual experience, not an abstract number.
 *
 * Failing pairs get:
 *   - Red border (CSS class .fail-item)
 *   - "Fail" badge styled in red
 *   - Plain-English "Action needed" note with specific suggestion
 */
function renderA11y() {
  const pairs = [
    { label: 'Primary',    bg: palette.primary.hex,    fg: palette.primary.on    },
    { label: 'Secondary',  bg: palette.secondary.hex,  fg: palette.secondary.on  },
    { label: 'Accent',     bg: palette.accent.hex,     fg: palette.accent.on     },
    { label: 'Background', bg: palette.background.hex, fg: palette.background.on },
    { label: 'Surface',    bg: palette.surface.hex,    fg: palette.surface.on    },
    { label: 'Error',      bg: palette.error.hex,      fg: palette.error.on      },
    { label: 'Success',    bg: palette.success.hex,    fg: palette.success.on    },
    { label: 'Warning',    bg: palette.warning.hex,    fg: palette.warning.on    },
  ];

  const grid = document.getElementById('a11y');
  grid.innerHTML = '';

  pairs.forEach(({ label, bg, fg }) => {
    const ratio  = contrastRatio(bg, fg);
    const isAAA  = ratio >= 7;
    const isAA   = ratio >= 4.5;
    const isLg   = ratio >= 3;
    const isFail = ratio < 3;

    const badge      = isAAA ? 'AAA' : isAA ? 'AA' : isLg ? 'AA Large' : 'Fail';
    const badgeClass = isAAA ? 'b-aaa' : isAA ? 'b-aa' : isLg ? 'b-lg' : 'b-fail';

    const note = isAAA ? 'Excellent — passes for all text sizes and UI components.'
               : isAA  ? 'Passes for normal text (16px+) and UI components.'
               : isLg  ? 'Passes for large text only (24px+). Too low for small body text.'
               :         'Does not meet WCAG minimum. Adjust before deploying.';

    let suggestion = '';
    if (isFail) {
      const bgLum = relativeLuminance(bg);
      suggestion = bgLum > 0.5
        ? `Try darkening the on-colour (${fg}) — push lightness toward 8–14%.`
        : `Try lightening the on-colour (${fg}) — push lightness toward 90–95%.`;
    }

    const item = document.createElement('div');
    item.className = `a11y-item${isFail ? ' fail-item' : ''}`;
    item.style.cssText = `background:${bg};color:${fg}`;
    item.innerHTML = `
      <div class="a11y-top">
        <span class="a11y-name">${label}</span>
        <span class="a11y-badge ${badgeClass}" style="color:${fg}">${badge}</span>
      </div>
      <div class="a11y-ratio">${ratio.toFixed(2)}:1</div>
      <div class="a11y-note">${note}</div>
      ${isFail ? `<div class="a11y-action">⚠ Action needed: ${suggestion}</div>` : ''}`;

    grid.appendChild(item);
  });
}


/* ═══════════════════════════════════
   13. EXPORT — eight format builders
═══════════════════════════════════ */

/** paletteEntries — returns ordered [key, value] pairs for all roles */
function paletteEntries() {
  return ['primary','secondary','accent','background','surface','error','success','warning']
    .map(k => [k, palette[k]]);
}

/** toKebab — camelCase → kebab-case (e.g. "onPrimary" → "on-primary") */
function toKebab(k) {
  return k.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function doExport(fmt) {
  const builders = { css: expCSS, scss: expSCSS, tailwind: expTailwind, json: expJSON,
                     xaml: expXAML, swift: expSwift, kotlin: expKotlin, java: expJava };
  const output = builders[fmt]();
  const outEl  = document.getElementById('exp-out');
  document.getElementById('exp-text').textContent = output;
  outEl.style.display   = 'block';
  outEl.dataset.fmt     = fmt;
}

function expCSS() {
  const tag = currentTheme === 'dark' ? ' — dark theme' : '';
  let o = `/* Colour system — Colour Scheme Generator 2026${tag} */\n\n:root {\n`;
  paletteEntries().forEach(([k, v]) => {
    const { r, g, b } = hexToRgb(v.hex);
    const { h, s, l } = hexToHsl(v.hex);
    o += `  --color-${toKebab(k)}: ${v.hex};  /* rgb(${r} ${g} ${b}) · hsl(${h} ${s}% ${l}%) */\n`;
    o += `  --color-on-${toKebab(k)}: ${v.on};\n`;
  });
  return o + '}';
}

function expSCSS() {
  let o = `// Colour system — Colour Scheme Generator 2026\n\n`;
  paletteEntries().forEach(([k, v]) => {
    o += `$color-${toKebab(k)}: ${v.hex};\n$color-on-${toKebab(k)}: ${v.on};\n`;
  });
  return o;
}

function expTailwind() {
  let o = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
  paletteEntries().forEach(([k, v]) => {
    o += `        '${toKebab(k)}': '${v.hex}',\n        'on-${toKebab(k)}': '${v.on}',\n`;
  });
  return o + `      },\n    },\n  },\n};`;
}

function expJSON() {
  const obj = {};
  paletteEntries().forEach(([k, v]) => {
    const { r, g, b } = hexToRgb(v.hex);
    const { h, s, l } = hexToHsl(v.hex);
    obj[k] = { value: v.hex, on: v.on, rgb: { r, g, b }, hsl: { h, s, l }, role: v.role, usage: v.usage };
  });
  return JSON.stringify(obj, null, 2);
}

function expXAML() {
  let o = `<!-- Colour system — Colour Scheme Generator 2026 -->\n`;
  o    += `<!-- WPF: paste into App.xaml ResourceDictionary -->\n`;
  o    += `<!-- WinUI / .NET MAUI: Resources/Styles/Colors.xaml -->\n\n`;
  o    += `<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"\n`;
  o    += `                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">\n\n`;
  paletteEntries().forEach(([k, v]) => {
    const name = k.charAt(0).toUpperCase() + k.slice(1);
    o += `  <!-- ${v.role}: ${v.usage} -->\n`;
    o += `  <Color x:Key="${name}Color">#FF${v.hex.slice(1)}</Color>\n`;
    o += `  <Color x:Key="On${name}Color">#FF${v.on.slice(1)}</Color>\n`;
    o += `  <SolidColorBrush x:Key="${name}Brush" Color="{StaticResource ${name}Color}" />\n`;
    o += `  <SolidColorBrush x:Key="On${name}Brush" Color="{StaticResource On${name}Color}" />\n\n`;
  });
  return o + `</ResourceDictionary>`;
}

function expSwift() {
  let o = `// Colour system — Colour Scheme Generator 2026\nimport SwiftUI\n\nextension Color {\n`;
  paletteEntries().forEach(([k, v]) => {
    const { r, g, b }    = hexToRgb(v.hex);
    const { r: or, g: og, b: ob } = hexToRgb(v.on);
    const name  = 'brand' + k.charAt(0).toUpperCase() + k.slice(1);
    const onName = 'onBrand' + k.charAt(0).toUpperCase() + k.slice(1);
    o += `\n    // ${v.role}: ${v.usage}\n`;
    o += `    static let ${name}   = Color(red: ${(r/255).toFixed(3)}, green: ${(g/255).toFixed(3)}, blue: ${(b/255).toFixed(3)})\n`;
    o += `    static let ${onName} = Color(red: ${(or/255).toFixed(3)}, green: ${(og/255).toFixed(3)}, blue: ${(ob/255).toFixed(3)})\n`;
  });
  return o + `}\n`;
}

function expKotlin() {
  let o = `// Colour system — Colour Scheme Generator 2026\npackage com.yourapp.ui.theme\n\nimport androidx.compose.ui.graphics.Color\n\nobject AppColors {\n`;
  paletteEntries().forEach(([k, v]) => {
    const name = k.charAt(0).toUpperCase() + k.slice(1);
    o += `\n    // ${v.role}: ${v.usage}\n`;
    o += `    val ${name}   = Color(0xFF${v.hex.slice(1)})\n`;
    o += `    val On${name} = Color(0xFF${v.on.slice(1)})\n`;
  });
  return o + `}\n`;
}

function expJava() {
  let o = `// Colour system — Colour Scheme Generator 2026\npackage com.yourapp.ui;\n\nimport android.graphics.Color;\n\npublic final class AppColors {\n    private AppColors() {}\n\n`;
  paletteEntries().forEach(([k, v]) => {
    const name = k.replace(/([A-Z])/g, '_$1').toUpperCase();
    o += `    // ${v.role}: ${v.usage}\n`;
    o += `    public static final int ${name}    = Color.parseColor("${v.hex}");\n`;
    o += `    public static final int ON_${name} = Color.parseColor("${v.on}");\n\n`;
  });
  return o + `}\n`;
}


/* ═══════════════════════════════════
   14. UTILITIES
═══════════════════════════════════ */

/**
 * copyExp — copies export output to clipboard with visual feedback.
 */
function copyExp() {
  const text = document.getElementById('exp-text').textContent;
  navigator.clipboard.writeText(text)
    .then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
    })
    .catch(() => alert('Please select and copy the text manually.'));
}
