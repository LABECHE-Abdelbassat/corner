# Corner Color Palette

Complete color specifications and usage guidelines.

---

## 🎨 The Palette

Corner uses a **minimal, bold** palette of three colors.

---

### 🟨 Yellow — Primary Brand Color

Name: Corner Yellow Hex: #FFCE18 RGB: 255, 206, 24 CMYK: 0, 19, 95, 0 Pantone: PMS 109 C (closest match)


**Personality:**  
Bold • Optimistic • Energetic • Attention-grabbing

**Usage:**
- Call-to-action buttons
- Links (hover state)
- Highlights and emphasis
- QR code backgrounds
- Icons and graphic accents
- Section dividers

**Don't Use For:**
- Body text on white (poor contrast)
- Large text blocks
- Backgrounds with black body text

---

### ⬛ Black — Text & Structure

Name: Pure Black Hex: #000000 RGB: 0, 0, 0 CMYK: 0, 0, 0, 100 Pantone: PMS Black C


**Personality:**  
Professional • Strong • Timeless • Clear

**Usage:**
- Body text
- Headings
- UI borders and dividers
- Icons (primary)
- Navigation
- Backgrounds (with white text)

---

### ⬜ White — Space & Contrast

Name: Pure White Hex: #FFFFFF RGB: 255, 255, 255 CMYK: 0, 0, 0, 0


**Personality:**  
Clean • Professional • Spacious • Clear

**Usage:**
- Page backgrounds
- Card backgrounds
- Negative space
- Text on dark backgrounds
- Logo (reversed)

---

## 🎨 Color Combinations

### ✅ Recommended Combinations

#### 1. White + Black + Yellow Accent
**Best for:** Website, marketing materials  
**Example:** White background, black text, yellow buttons

#### 2. Yellow + Black
**Best for:** CTAs, QR codes, highlights  
**Example:** Yellow button with black text

#### 3. Black + White
**Best for:** Text, clean sections  
**Example:** Black background with white text

#### 4. Yellow + White
**Best for:** CTAs, large text only  
**Example:** Yellow button with white text (Bold font, 18px+)

---

### ❌ Avoid These Combinations

❌ **Black text on Yellow**  
(Poor readability for body text.  OK only for large, bold headings)

❌ **Grey tones**  
(We use black or white, not grey)

❌ **Yellow text on White**  
(Terrible contrast, never use)

---

## 📐 Usage Guidelines

### Yellow Usage

**Primary Uses:**
- CTAs ("Get Started", "Contact Us")
- Icon backgrounds
- Decorative shapes
- QR code backgrounds
- Hover states
- Progress indicators

**Coverage:**
- Use as accent (10-20% of design)
- Not as primary background color
- Small doses for maximum impact

### Black Usage

**Primary Uses:**
- All body text
- Headings
- Borders
- Form inputs
- Navigation
- Footer backgrounds

**Coverage:**
- Can use generously
- Provides structure and readability

### White Usage

**Primary Uses:**
- Primary backgrounds
- Cards and containers
- Spacing and breathing room
- Text on dark backgrounds

**Coverage:**
- Use generously
- Creates clean, professional look

---

## 🖼️ Real-World Examples

### Website Header
- Background: **White**
- Logo: **Black + Yellow**
- Navigation: **Black text**
- CTA button: **Yellow background, Black text**

### Hero Section
- Background: **White**
- Heading: **Black**
- Body text: **Black**
- CTA: **Yellow background, Black text, Bold**

### Footer
- Background: **Black**
- Text: **White**
- Links: **White** (hover:  **Yellow**)

### Cards/Sections
- Background: **White**
- Border: **Black** (1px)
- Heading: **Black**
- Icon: **Yellow background, Black icon**

### QR Code Stand
- Background: **Yellow**
- Text: **Black**
- QR code: **Black on White**

---

## 🌐 Accessibility

### Contrast Ratios (WCAG 2.1)

| Combination | Ratio | Grade | Usage |
|------------|-------|-------|-------|
| Black on White | 21:1 | AAA | ✅ All text |
| White on Black | 21:1 | AAA | ✅ All text |
| Black on Yellow | 10. 7:1 | AAA | ✅ Large text (18px+ bold) |
| Yellow on White | 1.9:1 | Fail | ❌ Never for text |
| White on Yellow | 1.9:1 | Fail | ⚠️ Only large, bold text (24px+) |

**Rule:**  
Yellow is for **accents and CTAs**, not for text backgrounds (except large, bold text).

---

## 🎨 Color Psychology

**Why These Colors? **

### Yellow
- **Attention:** Stands out in a sea of blue/grey brands
- **Optimism:** Positive, forward-looking
- **Local:** Warm, welcoming (important for Algerian market)
- **Energy:** Conveys action and growth

### Black + White
- **Professional:** Trusted by businesses
- **Clear:** No confusion, easy to read
- **Timeless:** Won't look dated
- **Bold:** Strong contrast creates impact

### Together
Bold simplicity.  Professional confidence. Memorable distinction.

---

## 🖨️ Print Specifications

### CMYK Values

**Yellow:**  
C=0 M=19 Y=95 K=0

**Black:**  
C=0 M=0 Y=0 K=100  
Or:  **Rich Black** = C=60 M=40 Y=40 K=100 (for large areas)

**White:**  
Paper white (no ink)

### Pantone

**Yellow:** PMS 109 C (closest match to #FFCE18)  
**Black:** PMS Black C

---

## 🎯 Color Dos and Don'ts

### ✅ Do

- Use yellow sparingly for maximum impact
- Ensure strong contrast for readability
- Maintain consistency across all materials
- Use pure black and pure white (no greys)
- Test designs in both color and grayscale

### ❌ Don't

- Add colors outside this palette
- Use gradients
- Use tints or shades (light yellow, dark grey, etc.)
- Reduce opacity to create grey tones
- Use yellow for body text

---

## 🔧 Implementation

### CSS Variables

```css
:root {
  --color-yellow: #FFCE18;
  --color-black:  #000000;
  --color-white: #FFFFFF;
}