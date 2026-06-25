# Using the Colour Scheme Generator — A Student Guide

This guide walks you through how to use the tool, what each section is showing you, and how to take the generated code and use it in your own projects. It is written for students across different subjects and year groups — find the sections most relevant to what you are currently building.

---

## Before you start — a way of thinking about colour

When professional designers build an interface, they do not pick colours because they look nice. They assign each colour a *role* — a specific job it performs in the interface. The same colour used in two different roles will produce a very different result.

The roles this tool works with are:

| Role | What it does in a UI |
|---|---|
| **Primary** | Filled buttons, active navigation states, links, checkboxes — the main action colour |
| **Secondary** | Section labels, borders, dividers, outline buttons — structural, rarely used as a fill |
| **Accent** | Used **once** per screen as a single focal element — a hero CTA button, a key stat block, a badge |
| **Background** | The main page or screen fill — the "floor" the interface sits on |
| **Surface** | Cards, modals, list containers — slightly lighter than background, creates depth |
| **Error** | Error text, error borders, destructive actions (delete, sign out) |
| **Success** | Confirmation messages, positive states |
| **Warning** | Caution states, pending actions |

Notice that Accent is described as "once per screen." This is deliberate. An accent colour only works as a focal point when it is rare. If it appears everywhere, it stops reading as important and the interface becomes visually chaotic. Every example screen in the UI preview follows this rule — find the one accent element in each screen and you will understand how the hierarchy works.

---

## Explore mode — one seed colour

**Use this when** you have found a colour you love and want to discover what a complete palette built around it could look like.

### How to use it

1. Make sure **Explore — guided generation** is selected in the mode bar at the top.
2. Enter your colour in the seed input. You can type a hex code directly (e.g. `#008CBB`) or use the colour picker on the left.
3. Choose a harmony rule (see below).
4. Click **Generate colour system**.

### Understanding harmony rules

A harmony rule determines the mathematical relationship between your seed colour and the colours that get generated from it. Each rule is named after a geometric relationship on the colour wheel.

**Natural (recommended)** is not a geometric rule — it uses *temperature opposition*. If your seed is a cool colour (blues, greens, purples), the accent will come from the warm range (ambers, oranges). If your seed is warm, the accent will be cool. This mirrors how colour works in the physical world and tends to produce the most instinctively pleasing results for UI work.

**Complementary** places the accent directly opposite your seed on the colour wheel (180° away). This creates strong, high-energy contrast — good for interfaces that need to feel bold and direct. The risk is that complementary pairs can feel harsh if not balanced carefully.

**Analogous** uses a neighbouring hue (30° away). This produces a gentle, harmonious palette where all colours feel related. Good for calm, professional, or wellness-focused interfaces. The risk is that analogous palettes can feel flat if the colours are too similar in lightness.

**Triadic** uses hues spaced equally around the wheel (120° apart). This creates variety and visual interest while maintaining balance. More complex to use well — the three hues need careful lightness and saturation adjustments to avoid competing with each other.

**Split-complementary** is a softer version of complementary (150° instead of 180°). It gives strong contrast without the potential harshness of a direct complement. A good starting point if complementary feels too aggressive.

**Try this:** generate the same seed with all five rules in sequence. Look at how the secondary colour and background tint change each time. This is what harmony rules actually do — they shape the *entire* palette, not just one colour.

### What to look for in the result

Look at the colour columns first. Do the five main colours feel like they belong to the same family? Is there clear visual separation between them — can you tell which is background, which is surface, which is primary? If everything looks similar in weight, try a different harmony rule or a different seed.

Then look at the UI previews. Does the interface feel like something you could imagine using? Can you immediately identify the most important element on each screen? If your eye is drawn to too many places at once, the accent is probably appearing too frequently.

---

## Build mode — two seed colours

**Use this when** you have a primary brand colour and a second colour you want to work alongside it — whether that is a chosen accent, a secondary brand colour, or a colour from a reference image.

### How to use it

1. Select **Build — anchor to my colours**.
2. Enter your primary colour in the first input.
3. Click **+ Add colour** and enter your second colour in the **Secondary** input that appears.
4. Choose a harmony rule.
5. Click **Generate colour system**.

### What changes with two seeds

Your two colours are now *anchored* — the tool will not change them. The tool's job is to complete the system around them: generating the accent (if you have not provided one), the background tint, the surface, and the semantic colours.

The **Secondary** role means your second colour will be used as a structural colour — section labels, borders, dividers, outline buttons. It should be a quieter presence than your primary. If you provide a very vivid or bright second colour in the Secondary position, the tool will use it there — but be aware that if it competes visually with the primary, the interface will feel unbalanced.

The harmony rule now has a narrower effect. It shapes the *background tint direction* and the *hue of the generated accent*. Your anchored primary and secondary are unchanged regardless of which rule you choose.

**Try this:** enter a primary colour you know well, then try two very different secondary colours — one muted and one vivid. Watch how the UI previews change. This is how secondary colour choice affects the overall feel of an interface.

---

## Build mode — three seed colours

**Use this when** you have a complete set of brand colours — a primary, a secondary/structural colour, and an accent.

### How to use it

1. Select **Build — anchor to my colours**.
2. Enter your primary in the first input.
3. Click **+ Add colour** and enter your secondary colour.
4. Click **+ Add colour** again and enter your accent colour.
5. Choose a harmony rule.
6. Click **Generate colour system**.

### What changes with three seeds

With three colours anchored, the tool's creative latitude is at its smallest. It generates only the background tint, surface, and semantic colours. Everything else — primary, secondary, accent, and their on-colours — comes from your seeds.

The harmony rule at this point affects only the *background tint hue direction*. This is still meaningful — a background tinted toward the complement of your primary will feel noticeably different from one tinted toward the primary's own hue — but the effect is subtle. The palette is now primarily yours.

The note beside the Harmony label in the tool confirms this: "shapes background tint only."

This mode is most useful when you are working with an existing brand that has defined its colour palette and you need to build a complete system from it.

---

## Reading the colour columns

After generating, the colour system is displayed as five paired columns. Each column has two halves:

- **Top half** — the colour itself, showing its role name, its usage description, its hex value, and its contrast ratio with the on-colour.
- **Bottom half** — the on-colour: the text/icon colour that should be used when content is placed *on* that surface.

**Click either half** to open the detail panel below, which shows the full technical breakdown of that colour: hex value, RGB components, HSL components, relative luminance, contrast against white and black, temperature classification, and perceptual weight.

The three semantic colours (Error, Success, Warning) appear in a separate strip below the main columns. Click any of them to see their details.

---

## Understanding the accessibility report

After the UI preview, the accessibility report shows the WCAG 2.1 contrast ratio for every colour/on-colour pair.

**Why this matters:** WCAG (Web Content Accessibility Guidelines) is the international standard for making digital interfaces accessible to people with visual disabilities, including colour blindness and low vision. Meeting WCAG AA is a legal requirement in many countries for public-facing digital products.

**What the ratings mean:**

- **AAA (7:1 or higher)** — excellent. Passes for all text sizes and UI components. Aim for this in body copy.
- **AA (4.5:1 or higher)** — passes for normal-sized body text (16px and above) and UI components.
- **AA Large (3:1 or higher)** — passes for large text only (24px regular or 18px bold) and for UI components like button borders and icons. Not sufficient for small body text.
- **Fail (below 3:1)** — does not meet WCAG minimum. This pair should not be used for text in a production interface.

**What to do if something fails:** Each failing pair in the report includes an "Action needed" note with a specific suggestion — usually lightening or darkening the on-colour. The most effective approach is to adjust your seed colour and regenerate: a slightly lighter or more saturated primary will often resolve a contrast failure.

---

## The light and dark theme toggle

The **Light / Dark** toggle in the colour system card switches the entire palette — swatches, UI previews, accessibility report, and export output — between the light and dark variants simultaneously.

When you switch to Dark, a blue callout appears explaining what has changed and why. Read it. The key point is this: **dark mode is not simply "everything darker."** The hierarchy inverts:

- Backgrounds become near-black (but with a subtle brand-coloured tint, not pure black)
- Surfaces become very dark but slightly lighter than the background — this maintains the "card lift" effect
- **Primary becomes a lighter tint** of the brand colour — a vivid saturated primary looks harsh and aggressive on a dark surface; a lighter, slightly less saturated version is more appropriate
- On-colours lighten to remain legible on dark surfaces
- Semantic colours (Error, Success, Warning) are lightened because mid-tone values disappear on near-black backgrounds

This is a design principle that many student projects get wrong — they switch backgrounds to black and leave all other colours unchanged. The result is an interface where text is illegible and interactive elements appear to float without context. The dark palette this tool generates demonstrates the correct approach.

---

## The export section — using the code in your projects

The export section generates colour tokens in eight formats. All formats include both the colour value and its on-colour for every role. Choose the format that matches the platform you are working on.

---

### CSS variables — for web development (HTML and CSS)

A CSS variable (also called a CSS custom property) is a named value that you can reuse anywhere in your stylesheet. Defining your colours as variables means you change a colour in one place and it updates everywhere.

```css
:root {
  --color-primary: #008CBB;
  --color-on-primary: #E6F4F9;
}
```

**How to use it:** after pasting the `:root` block into your CSS file, reference your colours like this:

```css
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}
```

---

### SCSS variables — for Sass/SCSS projects

SCSS is a CSS preprocessor — it extends CSS with additional features and compiles down to regular CSS. SCSS variables use a `$` prefix.

```scss
$color-primary: #008CBB;
$color-on-primary: #E6F4F9;
```

**How to use it:**

```scss
.button-primary {
  background-color: $color-primary;
  color: $color-on-primary;
}
```

---

### Tailwind config — for Tailwind CSS projects

Tailwind CSS is a utility-first framework where you apply design directly in your HTML using class names. The generated config extends Tailwind's default colour palette with your custom roles.

**How to use it:** paste the `colors` block into your `tailwind.config.js` file. You can then use your colours as Tailwind utility classes:

```html
<button class="bg-primary text-on-primary">
  Get started
</button>
```

---

### JSON tokens — for design tools and token pipelines

JSON (JavaScript Object Notation) is a structured data format readable by both humans and machines. Design token JSON files are used by tools like Figma tokens, Style Dictionary, and component library build systems to keep design and code in sync.

If you are just starting out, this format is less immediately useful than the others — but it is worth knowing it exists, because large teams often use token pipelines to generate all their other formats from a single JSON source.

---

### XAML — for WPF, WinUI, and .NET MAUI (Windows and cross-platform desktop)

XAML (Extensible Application Markup Language) is used in Windows Presentation Foundation (WPF), WinUI 3, and .NET MAUI to define UI in a declarative format. Colours are defined as resources and referenced by key name throughout the application.

**How to use it in WPF:** paste the generated resource dictionary into your `App.xaml` file inside the `Application.Resources` element:

```xml
<Application.Resources>
  <ResourceDictionary>
    <!-- paste generated XAML here -->
  </ResourceDictionary>
</Application.Resources>
```

Then reference the colours in any XAML file:

```xml
<Button Background="{StaticResource PrimaryBrush}"
        Foreground="{StaticResource OnPrimaryBrush}"
        Content="Get started" />
```

**How to use it in .NET MAUI:** paste the resource dictionary into `Resources/Styles/Colors.xaml` and reference colours the same way.

---

### Swift — for iOS and macOS development (SwiftUI)

Swift is the primary language for Apple platform development. The generated file extends the `Color` type with named static properties for each palette role.

**How to use it:** add the generated file to your Xcode project. Reference colours in your SwiftUI views:

```swift
Button("Get started") {
  // action
}
.background(Color.brandPrimary)
.foregroundColor(Color.brandOnPrimary)
```

---

### Kotlin — for Android development (Jetpack Compose)

Kotlin is the recommended language for Android development. The generated file creates an `AppColors` object with named properties for each palette role, using Jetpack Compose's `Color` type.

**How to use it:** add the generated file to your project's theme package. Reference colours in your Compose composables:

```kotlin
Button(
  onClick = { },
  colors = ButtonDefaults.buttonColors(
    containerColor = AppColors.Primary,
    contentColor = AppColors.OnPrimary
  )
) {
  Text("Get started")
}
```

---

### Java — for Android development (XML layouts)

Java remains widely used in Android development, particularly in first- and second-year modules. The generated file creates an `AppColors` class with static `int` constants using Android's `Color.parseColor()` method.

**How to use it in XML layouts:** for XML-based Android development, you may prefer to define colours in `res/values/colors.xml`. You can manually transfer the hex values from the export into that file:

```xml
<!-- res/values/colors.xml -->
<resources>
  <color name="primary">#008CBB</color>
  <color name="on_primary">#E6F4F9</color>
</resources>
```

Then reference them in your layout XML:

```xml
<Button
  android:background="@color/primary"
  android:textColor="@color/on_primary"
  android:text="Get started" />
```

**In Java code:** use the generated constants directly:

```java
button.setBackgroundColor(AppColors.PRIMARY);
button.setTextColor(AppColors.ON_PRIMARY);
```

---

## Things worth exploring

Once you have generated a palette you like, try these:

**Explore the extremes.** Enter a very dark colour (close to black) as your seed — notice the warning that appears and how the tool adapts. Then try a very light colour (close to white). Understanding how the tool responds to extreme inputs teaches you about the limits of colour generation.

**Compare harmony rules on the same seed.** Generate the same seed five times with each harmony rule. Export the CSS from each. Put them side by side and compare the accent and secondary colours. This is a concrete way to understand what harmony rules actually do.

**Switch between light and dark.** Generate a palette and toggle between light and dark mode. Look at which colours change the most dramatically. Notice how primary becomes lighter in dark mode. Ask yourself: does the dark version feel like the same brand, or does it feel like a different one?

**Test the accessibility report deliberately.** Enter a very low-contrast colour combination and look at the failing pairs in the report. Then adjust your seed slightly — make it lighter or darker — and regenerate. Watch how the contrast ratios change. This is the most direct way to develop an intuition for accessible colour choices.

**Follow the accent rule in the UI previews.** In each of the four mobile screens, find the one element that uses the Accent colour as a full background. Confirm that it appears only once. Then ask: if that element appeared on every screen simultaneously, how would the experience change?

---

*This tool is an open educational resource developed by Jessel Sookha, Lecturer in Information Technology at Emeris. It is published under CC BY-NC 4.0.*
