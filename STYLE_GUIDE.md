
# Birthday Scrapbook Style Guide

## Design Philosophy

This app should feel like a **handcrafted digital scrapbook**—warm, tactile, personal, and slightly imperfect. Every screen, including admin tools, should feel like part of the same lovingly-made experience. Think "cozy craft room" not "corporate dashboard."

---

## Color Palette

### Primary Colors
```css
--color-cream: #FDF8F3;           /* Main background - warm off-white */
--color-cream-dark: #F5EDE4;      /* Cards, elevated surfaces */
--color-coral: #E8846E;           /* Primary accent - buttons, highlights */
--color-coral-light: #FCEAE6;     /* Coral tint for subtle backgrounds */
--color-coral-dark: #D66B54;      /* Hover states, emphasis */
```

### Secondary Colors
```css
--color-sage: #9DB4A0;            /* Secondary accent - success, nature */
--color-sage-light: #E8F0E9;      /* Sage tint */
--color-dusty-blue: #8FA5B3;      /* Tertiary accent - links, info */
--color-dusty-blue-light: #E5ECF0;
--color-warm-gold: #D4A853;       /* Highlights, stars, special */
--color-warm-gold-light: #FBF5E6;
```

### Neutral Colors
```css
--color-text-primary: #3D3531;    /* Main text - warm dark brown, NOT black */
--color-text-secondary: #7D746D;  /* Secondary text - warm gray */
--color-text-muted: #A89F97;      /* Muted text, placeholders */
--color-border: #E8DFD6;          /* Borders - warm, subtle */
--color-border-dark: #D4C8BC;     /* Emphasized borders */
```

### Semantic Colors
```css
--color-success: #9DB4A0;         /* Use sage for success */
--color-warning: #D4A853;         /* Use warm gold for warnings */
--color-error: #D66B54;           /* Use coral-dark for errors */
```

---

## Typography

### Font Stack
```css
/* Headers and display text - handwritten/script feel */
--font-display: 'Caveat', cursive;

/* Body text - friendly, rounded, readable */
--font-body: 'Nunito', sans-serif;

/* Monospace for tokens/codes - but friendly */
--font-mono: 'IBM Plex Mono', monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;      /* 12px - labels, captions */
--text-sm: 0.875rem;     /* 14px - secondary text */
--text-base: 1rem;       /* 16px - body text */
--text-lg: 1.125rem;     /* 18px - emphasized body */
--text-xl: 1.25rem;      /* 20px - section headers */
--text-2xl: 1.5rem;      /* 24px - page subtitles */
--text-3xl: 2rem;        /* 32px - page titles */
--text-4xl: 2.5rem;      /* 40px - hero headers */
--text-5xl: 3.5rem;      /* 56px - display headers */
```

### Typography Rules

1. **Page titles** (e.g., "Vincent's Memories", "Dashboard"): Use `--font-display` at `--text-4xl` or `--text-5xl` in `--color-coral`

2. **Section headers** (e.g., "Quick Actions", "My Photos"): Use `--font-body` at `--text-xl`, weight 700, in `--color-text-primary`

3. **Body text**: Use `--font-body` at `--text-base`, weight 400, in `--color-text-primary`

4. **Labels and captions**: Use `--font-body` at `--text-sm`, weight 500, in `--color-text-secondary`

5. **Tokens and codes**: Use `--font-mono` at `--text-sm` with a subtle background pill

---

## Spacing & Layout

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.375rem;   /* 6px - buttons, inputs */
--radius-md: 0.5rem;     /* 8px - cards */
--radius-lg: 0.75rem;    /* 12px - larger cards */
--radius-xl: 1rem;       /* 16px - modals, feature cards */
--radius-2xl: 1.5rem;    /* 24px - hero elements */
--radius-full: 9999px;   /* Pills, avatars */
```

### Shadows
```css
/* Soft, warm shadows - never harsh or blue-tinted */
--shadow-sm: 0 1px 2px rgba(61, 53, 49, 0.05);
--shadow-md: 0 4px 6px rgba(61, 53, 49, 0.07), 0 2px 4px rgba(61, 53, 49, 0.05);
--shadow-lg: 0 10px 15px rgba(61, 53, 49, 0.08), 0 4px 6px rgba(61, 53, 49, 0.05);
--shadow-photo: 2px 3px 8px rgba(61, 53, 49, 0.15); /* For photos specifically */
```

---

## Texture & Background

### Paper Texture
Apply a subtle paper texture overlay to backgrounds for tactile feel:

```css
.textured-bg {
  background-color: var(--color-cream);
  background-image: url('/textures/paper-grain.png');
  background-blend-mode: multiply;
  background-size: 200px 200px;
}
```

Use a subtle noise/grain texture at 3-5% opacity. Can use CSS noise generators or a tileable paper texture image.

### Background Variations
- **Main app background**: `--color-cream` with paper texture
- **Cards/elevated surfaces**: `--color-cream-dark` solid (no texture, creates contrast)
- **Canvas/scrapbook page**: Offer multiple options (pink construction paper, kraft paper, etc.)

---

## Component Styles

### Cards

**Standard Card:**
```css
.card {
  background: var(--color-cream-dark);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```

**Elevated Card (for stats, featured items):**
```css
.card-elevated {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}
```

**Interactive Card (for guest pages, clickable items):**
```css
.card-interactive {
  /* ...base card styles... */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Buttons

**Primary Button:**
```css
.btn-primary {
  background: var(--color-coral);
  color: white;
  font-family: var(--font-body);
  font-weight: 600;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full); /* Pill shape */
  border: none;
  box-shadow: var(--shadow-sm);
  transition: background 0.2s ease, transform 0.1s ease;
}
.btn-primary:hover {
  background: var(--color-coral-dark);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: white;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-weight: 600;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-dark);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.btn-secondary:hover {
  background: var(--color-cream);
  border-color: var(--color-coral);
}
```

**Ghost Button:**
```css
.btn-ghost {
  background: transparent;
  color: var(--color-coral);
  font-weight: 600;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
}
.btn-ghost:hover {
  background: var(--color-coral-light);
}
```

### Inputs

```css
.input {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-coral);
  box-shadow: 0 0 0 3px var(--color-coral-light);
}
.input::placeholder {
  color: var(--color-text-muted);
}
```

### Badges/Pills

**Status Badge:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}
.badge-success {
  background: var(--color-sage-light);
  color: #5A7A5E;
}
.badge-warning {
  background: var(--color-warm-gold-light);
  color: #8B7028;
}
.badge-neutral {
  background: var(--color-cream-dark);
  color: var(--color-text-secondary);
}
```

**Token Display:**
```css
.token-display {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--color-cream);
  border: 1px dashed var(--color-border-dark);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
}
```

### Tabs

```css
.tab-list {
  display: flex;
  background: var(--color-cream-dark);
  border-radius: var(--radius-full);
  padding: var(--space-1);
  gap: var(--space-1);
}
.tab {
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-full);
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}
.tab:hover {
  color: var(--color-text-primary);
}
.tab-active {
  background: white;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}
```

---

## Photos & Media

### Photo Frames

**Standard Photo:**
```css
.photo {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-photo);
}
```

**Polaroid Style:**
```css
.photo-polaroid {
  background: white;
  padding: var(--space-2) var(--space-2) var(--space-6) var(--space-2);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-photo);
}
.photo-polaroid img {
  border-radius: 2px;
}
```

**Taped Photo (slight rotation + tape element):**
```css
.photo-taped {
  position: relative;
  transform: rotate(-2deg); /* Vary between -3deg and 3deg */
  box-shadow: var(--shadow-photo);
}
.photo-taped::before {
  /* Washi tape piece - use an actual image or pseudo-element */
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  background: var(--color-warm-gold);
  opacity: 0.7;
}
```

### Photo Grid (Admin/Upload view)

Apply slight random rotation to photos in grid view for visual interest:
```css
.photo-grid-item:nth-child(4n+1) { transform: rotate(-1deg); }
.photo-grid-item:nth-child(4n+2) { transform: rotate(0.5deg); }
.photo-grid-item:nth-child(4n+3) { transform: rotate(-0.5deg); }
.photo-grid-item:nth-child(4n) { transform: rotate(1deg); }
```

---

## Specific Screen Guidelines

### Guest Upload Page

**Header:**
- "[Name]'s Memories" in `--font-display`, `--text-5xl`, `--color-coral`
- Subtitle in `--font-body`, `--text-lg`, `--color-text-secondary`

**Upload Dropzone:**
- Background: Dashed border using `--color-border-dark`, but style it like stitching or torn paper edge
- Add a friendly illustration (camera icon, photo stack, or envelope)
- "Drop photos or videos here" in `--font-display`, `--text-xl`
- Background should be slightly different texture (like a lighter kraft paper)

**Photo Grid:**
- Use masonry or varied grid if possible
- Apply slight rotations to photos
- Show a subtle border or polaroid frame

### Scrapbook Editor

**Canvas:**
- Paper texture background (selectable by user)
- Subtle shadow around edge to make it feel like a physical page

**Toolbar:**
- Keep compact but warm
- Buttons should use `--radius-full` for pill shapes
- Icons should be slightly playful (consider using a hand-drawn icon set)

**Photos on Canvas:**
- Always have a subtle shadow
- Support different frame styles (plain, polaroid, taped)
- Slight rotation adds life

### Admin Dashboard

**Page Header:**
- "Dashboard" in `--font-display`, `--text-4xl`, `--color-coral`
- Keep the subtitle simple

**Stat Cards:**
- Use `card-elevated` style
- Add a subtle icon or illustration to each card
- The number should be in `--font-display`, `--text-4xl`
- Consider adding a subtle background pattern or gradient

**Example stat card enhancement:**
```
┌─────────────────────────────┐
│  📬  Total Tokens           │  <- Icon adds personality
│                             │
│  12                         │  <- Large, display font
│  3 unused                   │  <- Subtle secondary text
└─────────────────────────────┘
```

**Quick Actions:**
- Buttons should be prominent, pill-shaped
- Consider making them look like "stamps" or adding a subtle paper texture

**Getting Started:**
- Style like a handwritten checklist
- Use checkbox-style indicators
- Maybe add a subtle notebook paper background

### Invite Tokens Page

**Token List:**
- Each token row should feel like a little "ticket" or "voucher"
- Add a subtle perforated edge effect or stamp visual
- The token code in monospace but with warm styling
- "Used/Unused" status as a colored badge

**Example token row:**
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  🎟️  WKTCG2-119Dg     [Used]    Vincent
                                  [Copy Link]
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
     ^ dashed border like a ticket stub
```

### Guest Pages (Admin View)

**Guest Cards:**
- Should feel like mini scrapbook pages
- Photo collage preview with slight rotation on photos
- Guest name in `--font-display`
- Add a subtle "page curl" or paper edge effect

---

## Decorative Elements (for later implementation)

### Stickers
- Emoji-based stickers (🎉 🎂 ❤️ ⭐ etc.)
- Illustrated stickers (party hats, balloons, cake, hearts, stars, arrows)
- Text stamps ("Best Day Ever!", "Friends Forever", "LOL", etc.)

### Washi Tape
- Solid colors matching palette
- Patterns: stripes, dots, florals, geometric
- Semi-transparent to show layering

### Frames
- Simple rounded
- Polaroid
- Vintage ornate
- Dashed/hand-drawn

### Doodles
- Hand-drawn arrows
- Circles and underlines
- Stars and sparkles
- Hearts

---

## Animation Guidelines

Keep animations subtle and warm, never flashy:

```css
/* Standard transition for interactive elements */
--transition-fast: 0.1s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;

/* Hover lift effect */
.hover-lift {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Subtle scale on click */
.click-scale:active {
  transform: scale(0.98);
}

/* Photo wiggle on hover (subtle) */
@keyframes wiggle {
  0%, 100% { transform: rotate(var(--rotation, 0deg)); }
  50% { transform: rotate(calc(var(--rotation, 0deg) + 1deg)); }
}
.photo:hover {
  animation: wiggle 0.3s ease;
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Do First)
- [ ] Set up CSS variables for colors, typography, spacing
- [ ] Import Google Fonts (Caveat, Nunito, IBM Plex Mono)
- [ ] Apply warm background color and paper texture to body
- [ ] Update text color from black to warm brown

### Phase 2: Typography
- [ ] Apply display font to all page titles
- [ ] Update heading hierarchy throughout app
- [ ] Ensure consistent font weights

### Phase 3: Components
- [ ] Restyle buttons (pill shape, warm colors)
- [ ] Restyle cards (proper shadows, borders)
- [ ] Restyle inputs and form elements
- [ ] Restyle tabs
- [ ] Restyle badges

### Phase 4: Screen-Specific
- [ ] Enhance upload dropzone with illustration
- [ ] Add rotation to photo grids
- [ ] Style admin stat cards with icons
- [ ] Style token list as ticket stubs
- [ ] Style guest cards as mini pages

### Phase 5: Polish
- [ ] Add hover animations
- [ ] Add paper texture overlays
- [ ] Fine-tune shadows and depth
- [ ] Ensure mobile responsiveness

---

## Resources

### Fonts (Google Fonts)
- Caveat: https://fonts.google.com/specimen/Caveat
- Nunito: https://fonts.google.com/specimen/Nunito
- IBM Plex Mono: https://fonts.google.com/specimen/IBM+Plex+Mono

### Textures
- Subtle Patterns: https://www.toptal.com/designers/subtlepatterns/
- CSS Noise generators for paper grain effect

### Icons
- Lucide (already likely in use with shadcn)
- Consider: Phosphor Icons for a slightly warmer feel
