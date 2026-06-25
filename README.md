# Colour Scheme Generator

A browser-based tool for building complete UI colour systems from 1–3 seed colours. Designed for students learning web development, mobile application development, and UX design — and for anyone who wants to understand how colour decisions translate into code.

**Live tool:** [jesselsookha.github.io/colour-scheme-generator](https://jesselsookha.github.io/colour-scheme-generator/)

---

## Why this tool exists

When you start building an interface — a website, an Android app, a Windows desktop application — one of the first questions you face is: *which colours do I use, and why?*

Most developers pick colours that look appealing in isolation and discover too late that those colours create a flat, inaccessible, or visually confusing interface. Colours that look good as swatches often fail when placed next to each other in a real UI. Text that seems readable on a white background can become invisible against a coloured card. An accent colour that feels energetic used once becomes overwhelming used everywhere.

This tool was built to close that gap. It takes 1–3 colours that you already love or that represent your brand, and builds a *complete colour system* around them — one where every colour has a clear role, every text element has a mathematically verified on-colour, and the whole palette is shown doing real work inside simulated mobile app screens and a webpage. The generated tokens can then be copied directly into your code in the format your platform uses.

---

## What the tool does

- Generates a complete 8-role colour system (Primary, Secondary, Accent, Background, Surface, Error, Success, Warning) from 1–3 seed colours
- Calculates perceptually appropriate on-colours for every role (the text and icon colour that sits on each surface)
- Applies one of five colour harmony rules to guide generation
- Previews the palette across four mobile app screens and a full webpage layout
- Reports WCAG 2.1 contrast ratios for every colour pair with plain-English guidance
- Exports the complete palette in eight code formats for web, mobile, and desktop platforms
- Generates a dark mode variant of the palette with an explanation of how and why the hierarchy shifts

---

## What you will learn

Working through this tool intentionally — not just clicking Generate, but exploring why different seeds and rules produce different results — introduces you to several ideas that underpin professional UI development:

**Colour harmony theory.** Why certain colours feel like they belong together, and the mathematical relationships on the colour wheel that create that sense of cohesion. Complementary, analogous, triadic, and split-complementary relationships are not abstract art concepts — they are the rules that most design systems use to generate secondary and accent colours from a primary brand colour.

**The HSL colour model.** Most developers first encounter colour as hexadecimal values (such as `#008CBB`) or RGB values (red, green, blue). HSL (Hue, Saturation, Lightness) is a more useful model for colour manipulation because it separates the *type* of colour from its *vividness* and *brightness*. Understanding HSL is what makes it possible to programmatically generate a quieter secondary from a vivid primary, or a background tint from a brand colour.

**WCAG accessibility standards.** The Web Content Accessibility Guidelines define minimum contrast ratios between text and its background so that people with low vision or colour blindness can use your interface. These are not optional guidelines for professional development — they are legal requirements in many jurisdictions and the basis of accessible design practice. The tool's accessibility report shows you exactly which pairs pass or fail, and why.

**Colour roles in a design system.** Professional interfaces do not use colours arbitrarily. Each colour has a *role* — Primary is for interactive elements like buttons and active states, Accent is used sparingly as a focal point, Secondary is structural (borders, labels, dividers), Background and Surface create depth hierarchy. Understanding these roles is the bridge between having a palette and knowing how to use it.

**Cross-platform colour tokens.** The same colour system needs to be expressed differently in different codebases. A CSS variable, a Kotlin Color object, a XAML SolidColorBrush, and a Swift Color extension all represent the same value — but in the syntax of different platforms. The export section shows how a single palette translates across all of them.

---

## Key concepts

The following terms appear throughout the tool and its documentation. Each is worth researching further as you develop your skills.

**Colour harmony** — the principle that certain combinations of colours on the colour wheel feel visually coherent together. Harmony rules (complementary, analogous, triadic) describe mathematical relationships between hues that tend to produce pleasing combinations.

**HSL (Hue, Saturation, Lightness)** — a way of describing colour using three components: the hue (its position on the colour wheel, measured in degrees from 0–360), the saturation (its vividness, from 0% grey to 100% fully vivid), and the lightness (its brightness, from 0% black to 100% white).

**Relative luminance** — the WCAG measure of a colour's perceptual brightness, accounting for the fact that human eyes are much more sensitive to green than to blue. Relative luminance is not the same as HSL lightness — two colours can have the same HSL lightness value but very different perceptual brightness.

**Contrast ratio** — the WCAG measure of legibility between a foreground colour and its background. Expressed as a ratio (e.g. 4.5:1). The higher the ratio, the more readable the text. Minimum values: 3:1 for large text and UI components, 4.5:1 for normal body text, 7:1 for enhanced (AAA) accessibility.

**On-colour** — in a colour system, every colour role has a paired on-colour: the colour used for text and icons displayed *on* that surface. For example, "On Primary" is the text colour used inside a primary-coloured button. On-colours are not simply black or white — they are tonal relatives of their surface that feel like they belong there.

**Semantic colours** — colours whose meaning is defined by convention rather than brand identity. Error is red. Success is green. Warning is amber. These must remain recognisable regardless of the brand palette.

**Temperature opposition** — the principle that warm colours (reds, oranges, yellows) pair naturally with cool colours (blues, greens, purples) as accent companions. This mirrors how colour works in the physical world — warm sunlight on a cool blue ocean — and is the basis of the tool's Natural harmony rule for accent generation.

**Design token** — a named variable that stores a design decision (such as a colour value) in a way that can be used consistently across a codebase and across platforms. Design tokens are the bridge between a design system and its implementation in code.

---

## How to use the tool

See the full usage guide: [GUIDE.md](GUIDE.md)

---

## Repository structure

```
colour-scheme-generator/
├── index.html      — tool structure and layout
├── styles.css      — visual styling for the tool shell
├── script.js       — colour logic, generation, rendering, and export (fully commented)
├── README.md       — this file
└── GUIDE.md        — student usage guide
```

The JavaScript is fully commented for learning. Every function includes an explanation of what it does, why it exists, and where relevant, the mathematical principle behind it.

---

## Licence

This tool is published as an open educational resource under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/) licence.

You are free to use, adapt, and share this tool for educational and non-commercial purposes, provided you give appropriate credit.

**Created by:** Jessel Sookha — Lecturer in Information Technology, Emeris  
**Contact:** jsookha@emeris.ac.za

---

## References

The following sources informed the design decisions, mathematical logic, and conceptual framework of this tool. Cited in Harvard (Anglia) style.

Caldwell, B., Cooper, M., Guarino Reid, L. and Vanderheiden, G. (eds.) (2008) *Web Content Accessibility Guidelines (WCAG) 2.0*. W3C Recommendation. World Wide Web Consortium. Available at: https://www.w3.org/TR/WCAG20/ (Accessed: 25 June 2026).

Google (2024) *Colour roles — Material Design 3*. Available at: https://m3.material.io/styles/color/roles (Accessed: 25 June 2026).

Google (2024) *Colour system overview — Material Design 3*. Available at: https://m3.material.io/styles/color/overview (Accessed: 25 June 2026).

Itten, J. (1961) *The art of color: the subjective experience and objective rationale of color*. Translated by E. van Haagen. New York: Reinhold Publishing Corporation.

Kirkpatrick, A., Cooper, M., Nihei, J. and Adams, C. (eds.) (2023) *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation. World Wide Web Consortium. Available at: https://www.w3.org/TR/WCAG22/ (Accessed: 25 June 2026).

Kline, A., Adams, C., Cooper, M. and Guarino Reid, L. (eds.) (2018) *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation. World Wide Web Consortium. Available at: https://www.w3.org/TR/WCAG21/ (Accessed: 25 June 2026).

Nielsen Norman Group (2020) *Color in UX: building accessible, meaningful color systems*. Available at: https://www.nngroup.com/articles/color-enhance-design/ (Accessed: 25 June 2026).

Smith, A.R. (1978) 'Color gamut transform pairs', *ACM SIGGRAPH Computer Graphics*, 12(3), pp. 12–19. Available at: https://doi.org/10.1145/965139.807361.

W3C Web Accessibility Initiative (2024) *WCAG 2 overview*. Available at: https://www.w3.org/WAI/standards-guidelines/wcag/ (Accessed: 25 June 2026).
