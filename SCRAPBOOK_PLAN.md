# Scrapbook Editor Enhancements

## Overview

This document outlines enhancements to the scrapbook page editor. The goal is to transform it from a basic photo arrangement tool into something that feels like crafting a real scrapbook page—intuitive, delightful, and producing beautiful results without requiring design skills.

The current editor supports: photo upload, text blocks, stickers (emojis/text stamps), background colors, undo/redo, autosave, and basic layout templates (grid, collage, hero, freeform).

Implement these enhancements in three phases, completing each phase before moving to the next.

---

## Phase 1: Core Craft Features

### 1.1 Alignment Guides & Snapping

Implement smart guides that appear when dragging elements on the canvas.

**Requirements:**
- Show vertical guide lines when an element's left edge, center, or right edge aligns with another element's left, center, or right edge
- Show horizontal guide lines when an element's top, middle, or bottom aligns with another element's top, middle, or bottom
- Show guides when element aligns with canvas center (both axes)
- Guides should be a subtle color (use `--color-coral` at 50% opacity)
- Elements should "snap" to guides when within 8px of alignment
- Snapping can be toggled off with a keyboard modifier (hold Alt/Option while dragging)

**Visual style:**
```
Guide line: 1px solid, coral color at 50% opacity
Extend guides slightly beyond the aligned elements (about 20px)
```

**Implementation notes:**
- Calculate guide positions on drag start for all elements
- Check proximity during drag move events
- Debounce guide calculations for performance
- Clear guides on drag end

---

### 1.2 Photo Frame Styles

Allow users to apply different visual treatments to individual photos.

**Frame options to implement:**

| Frame ID | Name | Description |
|----------|------|-------------|
| `none` | Simple | Just the photo with subtle rounded corners (current default) |
| `polaroid` | Polaroid | White border (8px sides, 8px top, 32px bottom), subtle shadow, optional caption area in bottom margin |
| `torn` | Torn Edge | Irregular white edge effect like ripped paper (can use SVG mask or clip-path) |
| `taped` | Taped | Photo with washi tape pieces at top-center or at two corners |
| `circle` | Circle Crop | Circular crop, good for portraits |
| `rounded` | Rounded | More pronounced rounded corners (16px radius) with white border |

**UI for frame selection:**
- When a photo is selected, show a frame picker in the toolbar or in a popover
- Display frame options as visual thumbnails showing the effect
- Clicking a frame option applies it immediately
- Frame selection is stored with the photo element data

**Implementation notes:**
- Frames should be implemented as wrapper components or CSS classes
- The `polaroid` frame bottom area should allow optional caption text (auto-linked to the photo's caption field if present)
- The `taped` frame should use actual washi tape graphics overlaid on the photo
- The `torn` frame can use an SVG filter or mask for the irregular edge effect
- All frames should include appropriate shadows for depth

---

### 1.3 Washi Tape Elements

Add washi tape as a decorative element users can place on the canvas.

**Tape patterns to include (at minimum 12):**

Solid colors:
- Coral (matches primary accent)
- Sage green
- Dusty blue
- Warm gold
- Soft pink
- Cream/off-white

Patterns:
- Horizontal stripes (coral/white)
- Polka dots (gold on cream)
- Floral (small flowers, pink/green)
- Gingham (blue)
- Hearts (red/pink)
- Diagonal stripes (multicolor pastel)

**Tape behavior:**
- Default size: approximately 120px wide × 30px tall
- Can be resized (maintaining aspect ratio or freeform)
- Can be rotated
- Semi-transparent (85-90% opacity) so layering looks natural
- Edges should have a subtle torn/irregular look (not perfectly straight)

**UI for adding tape:**
- Add "Washi Tape" category in the Add Content menu/panel
- Show a grid of tape pattern options
- Click to add tape to canvas center, then user can drag to position
- Selected tape shows resize handles and rotation control

**Implementation notes:**
- Tape pieces can be SVG elements or images
- Create tape assets at 2x resolution for crisp display
- Store tape elements with: pattern ID, position, rotation, size, z-index

---

### 1.4 Background Textures

Replace solid color backgrounds with textured paper options.

**Background options:**

| ID | Name | Description |
|----|------|-------------|
| `cream-paper` | Cream Paper | Warm off-white with subtle paper grain texture |
| `kraft` | Kraft Paper | Brown craft paper texture |
| `pink-construction` | Pink Construction | Soft pink with visible fiber texture |
| `blue-construction` | Blue Construction | Dusty blue with visible fiber texture |
| `notebook` | Notebook | Cream/white with subtle horizontal lines |
| `corkboard` | Corkboard | Cork texture (good for "pinned photos" look) |
| `solid-cream` | Solid Cream | Flat cream color (current default, keep as option) |
| `solid-white` | Solid White | Flat white |

**Implementation:**
- Each background should be a seamless tileable texture at appropriate resolution
- Texture images should be optimized (compressed, reasonable file size)
- Background selection UI: show swatches/thumbnails in the existing background picker
- Consider providing 2-3 color-tinted variations of each texture

**Texture sourcing:**
- Use subtle paper textures from free resources (Subtle Patterns, etc.)
- Or generate procedural noise textures
- Ensure textures are licensed for use

---

### 1.5 Additional Decorative Elements

Expand the sticker/decoration library beyond emojis.

**Element categories to add:**

**Doodles (hand-drawn style SVGs):**
- Arrows (straight, curved, dotted) — at least 5 variations
- Underlines and squiggles — at least 3 variations
- Circles and ovals (like hand-drawn highlights)
- Stars and sparkles — at least 3 variations
- Hearts — at least 3 variations

**Labels and shapes:**
- Banner/ribbon shape (for text overlay)
- Ticket stub shape
- Speech bubble
- Thought bubble
- Simple shapes: rectangle, circle, heart, star (fillable with palette colors)

**Photo corner pieces:**
- Classic black photo corners
- Gold/metallic photo corners
- Kraft paper corners
- Tape corner pieces

**UI organization:**
- Organize the Add Content panel into clear categories: Photos, Text, Stickers, Washi Tape, Doodles, Shapes, Photo Corners
- Each category expands to show available options
- Show visual previews for all elements

---

## Phase 2: Layout & Organization

### 2.1 Improved Layout System

Replace the current template-based layouts with intelligent layout "recipes" that adapt to content.

**Layout recipes:**

**Hero Layout:**
- Detects the largest/highest-resolution photo and makes it the hero (50-60% of canvas width)
- Places hero with slight rotation (-2 to 2 degrees)
- Remaining photos arranged smaller, clustered near hero
- Reserves space in one corner for text/decorations
- Adapts to photo aspect ratios (portrait hero vs landscape hero)

**Grid Layout:**
- Analyzes photo count and aspect ratios
- Creates asymmetric grid where cells match photo orientations
- One cell can be designated "featured" (1.5x size)
- Small gaps between photos (12-16px)
- Slight random rotation on each photo (-1 to 1 degree)

**Scattered Layout:**
- Organic, overlapping arrangement
- Photos at varied rotations (-5 to 5 degrees)
- Creates depth with overlapping (z-index management)
- Maintains visibility of all photos (no photo more than 30% obscured)

**Timeline Layout:**
- Horizontal arrangement
- Photos sorted by date (if EXIF data available)
- Staggered vertical positions (not a straight line)
- Space between for date labels

**Layout application behavior:**
- When user clicks a layout, analyze current canvas elements
- Animate elements to new positions (300ms ease-out transition)
- User can then adjust individual elements
- "Shuffle" button re-runs the same layout with different random variations

**Implementation notes:**
- Build a layout engine that takes: array of elements, canvas dimensions, layout recipe ID
- Returns: new positions, sizes, rotations for each element
- Respect locked elements (don't move them)
- Consider photo aspect ratios when assigning positions

---

### 2.2 Layers Panel

Add a collapsible panel showing all canvas elements in z-order.

**Panel features:**
- List all elements by type with preview thumbnail
- Drag to reorder (changes z-index)
- Click to select element on canvas
- Toggle visibility (eye icon) — hidden elements are saved but not visible or printed
- Lock toggle (lock icon) — locked elements can't be moved/edited
- Delete element from panel
- Double-click text elements to edit inline

**Panel UI:**
- Collapsible sidebar (right side) or bottom drawer on mobile
- Show element type icon + thumbnail preview
- Truncate long text content
- Indicate currently selected element

**Element naming:**
- Photos: "Photo 1", "Photo 2" or filename if available
- Text: First ~20 characters of content
- Stickers: Emoji or sticker name
- Washi tape: Pattern name
- Shapes: Shape type + color

---

### 2.3 Grouping

Allow users to group multiple elements that should move together.

**Grouping behavior:**
- Multi-select elements (Shift+click on desktop, toggle multi-select mode on mobile)
- "Group" button in toolbar (or Cmd/Ctrl+G)
- Grouped elements show a combined bounding box
- Moving, rotating, or scaling the group affects all members proportionally
- "Ungroup" button to separate (Cmd/Ctrl+Shift+G)

**Visual feedback:**
- Grouped elements share a selection outline
- In layers panel, groups show as collapsible containers
- Subtle visual indicator on canvas that elements are grouped (small link icon or different selection color)

**Implementation notes:**
- Store groups as a parent-child relationship in the data model
- Group transforms are applied on top of individual element transforms
- Nested groups not required for v1

---

### 2.4 Multi-Select & Bulk Operations

Support selecting multiple elements without grouping.

**Selection methods:**
- Shift+click to add to selection
- Click+drag to create selection rectangle (marquee select)
- Cmd/Ctrl+A to select all

**Bulk operations available:**
- Move (drag any selected element, all move together)
- Delete
- Align (left edges, centers, right edges, top, middle, bottom)
- Distribute (evenly space horizontally or vertically)
- Group (convert selection to group)

**Toolbar for multi-selection:**
When multiple elements selected, show alignment/distribution controls:
```
[Align Left] [Align Center] [Align Right] [Distribute H]
[Align Top] [Align Middle] [Align Bottom] [Distribute V]
```

---

### 2.5 Element Controls Enhancement

Improve the controls shown when an element is selected.

**For all elements:**
- Resize handles (corners + midpoints)
- Rotation handle (circular handle above element)
- Delete button (small X in corner)
- Duplicate button (small + icon)

**For photos:**
- Frame style button/dropdown
- Flip horizontal/vertical

**For text:**
- Font selector
- Size adjustment
- Color picker
- Alignment (left/center/right)

**For shapes:**
- Fill color picker
- Border toggle + color

**Show small floating toolbar near selected element with relevant controls.**

---

## Phase 3: Smart Features & Polish

### 3.1 Auto-Arrange Button

Add a "magic arrange" feature that automatically creates a pleasing layout from the current elements.

**Algorithm outline:**
1. Identify element types and photo aspect ratios
2. Select the best layout recipe based on element count
3. Assign hero photo (largest or first uploaded)
4. Distribute remaining photos according to recipe
5. Place text elements in areas with negative space
6. Cluster decorative elements (stickers, tape) near photos they might relate to
7. Apply subtle rotations for organic feel
8. Ensure nothing overlaps the canvas edges

**UI:**
- Button in toolbar: "Auto-Arrange" or magic wand icon
- Shows brief loading state
- Animates elements to new positions
- Can be undone

**Variations:**
- "Shuffle" button reruns the algorithm with different random seed
- Or offer 2-3 arrangement previews to choose from

---

### 3.2 Photo Filters

Add simple photo enhancement filters.

**Filters to implement:**

| Filter | Effect |
|--------|--------|
| Original | No filter (reset) |
| Warm | Increase warmth/orange tones |
| Cool | Increase blue tones |
| Vintage | Slight sepia, reduced contrast, subtle vignette |
| B&W | Grayscale conversion |
| Faded | Lifted blacks, reduced saturation |
| Vivid | Increased saturation and contrast |

**UI:**
- When photo is selected, show filter options in toolbar/popover
- Display filter previews as thumbnails
- One-click application
- Filter is stored with photo element data
- Filters are CSS filters or canvas-based (not destructive to original)

**Implementation:**
- Use CSS filters where possible for performance
- For more complex filters (Vintage), may need canvas processing
- Store filter ID with element, apply on render

---

### 3.3 Print Preview Mode

Show users how their page will look when printed.

**Preview features:**
- Toggle "Print Preview" mode from toolbar
- Show page with print margins indicated (dashed lines)
- Warn if elements are outside safe print area
- Warn if any photos are low resolution (under 150 DPI at print size)
- Show actual print dimensions (e.g., "8.5 × 11 inches")

**Visual treatment:**
- Dim or red-highlight elements outside safe area
- Show resolution warning icon on low-res photos
- Display overall page quality score: "Print quality: Good / Fair / Low"

---

### 3.4 Copy & Paste Styles

Allow copying visual styles between elements.

**Implementation:**
- "Copy Style" option in element context menu or keyboard shortcut (Cmd/Ctrl+Shift+C)
- "Paste Style" applies copied styles (Cmd/Ctrl+Shift+V)

**Styles that copy:**
- Photos: frame style, filter, rotation, shadow
- Text: font, size, color, alignment
- Shapes: fill color, border

---

### 3.5 Keyboard Shortcuts (Desktop)

Implement standard keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| Arrow keys | Nudge selected element 1px |
| Shift + Arrow | Nudge 10px |
| Delete / Backspace | Delete selected element(s) |
| Cmd/Ctrl + D | Duplicate selection |
| Cmd/Ctrl + G | Group selection |
| Cmd/Ctrl + Shift + G | Ungroup |
| Cmd/Ctrl + A | Select all |
| Cmd/Ctrl + Z | Undo (exists) |
| Cmd/Ctrl + Shift + Z | Redo (exists) |
| [ | Send backward (z-index) |
| ] | Bring forward |
| Shift + [ | Send to back |
| Shift + ] | Bring to front |
| Escape | Deselect all |
| Cmd/Ctrl + C | Copy element(s) |
| Cmd/Ctrl + V | Paste element(s) |

**Show keyboard shortcut hints in tooltips and menus.**

---

### 3.6 Mobile UX Improvements

Ensure the editor works well on phones and tablets.

**Touch gestures:**
- Drag to move elements
- Two-finger pinch to resize
- Two-finger rotate
- Double-tap text to edit
- Long-press for context menu (delete, duplicate, etc.)

**Mobile-specific UI:**
- Larger touch targets for controls
- Bottom sheet for element properties (instead of floating toolbar)
- Full-screen mode option to maximize canvas space
- Zoom controls (+ / - buttons and pinch-to-zoom on canvas)

**Canvas adjustments:**
- Allow panning when zoomed in
- "Fit to screen" button
- Consider portrait canvas orientation as default on mobile

---

### 3.7 Zoom & Pan

Allow zooming in/out on the canvas for detailed work.

**Zoom controls:**
- Zoom in / zoom out buttons
- Zoom percentage indicator (50%, 100%, 150%, 200%)
- "Fit to canvas" button (zoom to show entire canvas)
- Pinch-to-zoom on touch devices
- Scroll wheel + modifier key (Cmd/Ctrl) on desktop

**Pan:**
- When zoomed in, drag on empty canvas area to pan
- Or hold Space + drag to pan (common in design tools)
- Two-finger drag on touch devices
- Show minimap indicator if significantly zoomed in (optional)

**Zoom range:** 25% to 400%

---

## Data Model Updates

Ensure the element data model supports new features:

```typescript
interface CanvasElement {
  id: string;
  type: 'photo' | 'text' | 'sticker' | 'washi-tape' | 'doodle' | 'shape' | 'photo-corner';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number; // degrees
  zIndex: number;
  locked: boolean;
  visible: boolean;
  groupId?: string; // if part of a group
  
  // Photo-specific
  photoId?: string;
  frameStyle?: 'none' | 'polaroid' | 'torn' | 'taped' | 'circle' | 'rounded';
  filter?: 'original' | 'warm' | 'cool' | 'vintage' | 'bw' | 'faded' | 'vivid';
  
  // Text-specific
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Sticker/doodle-specific
  assetId?: string;
  
  // Washi tape-specific
  tapePattern?: string;
  
  // Shape-specific
  shapeType?: 'rectangle' | 'circle' | 'heart' | 'star' | 'banner' | 'speech-bubble';
  fillColor?: string;
  borderColor?: string;
}

interface Group {
  id: string;
  elementIds: string[];
}

interface CanvasState {
  elements: CanvasElement[];
  groups: Group[];
  background: {
    type: 'solid' | 'texture';
    value: string; // color hex or texture ID
  };
  zoom: number;
  panOffset: { x: number; y: number };
}
```

---

## Asset Requirements

### To create or source:

**Washi tape patterns (12+):**
- Create as PNG or SVG
- ~400px wide × 100px tall at 2x
- Transparent edges with subtle torn effect
- Semi-transparent overall

**Doodles (15-20):**
- SVG format preferred
- Hand-drawn style
- Single color (can be tinted via CSS)
- Include: arrows (5), underlines (3), circles (2), stars (3), hearts (3), sparkles (2)

**Photo corners (4 sets):**
- PNG or SVG
- Classic corner shape
- Variants: black, gold, kraft, tape

**Background textures (6-8):**
- Seamless tileable
- JPG or PNG, optimized
- ~400x400px tile size
- Subtle, not overpowering

**Shape templates:**
- SVG format
- Banner/ribbon, ticket stub, speech bubble, thought bubble
- Basic shapes can be generated with code

---

## Testing Checklist

After each phase, verify:

### Phase 1
- [ ] Alignment guides appear correctly when dragging
- [ ] Snapping feels natural (not too aggressive)
- [ ] All 6 frame styles render correctly
- [ ] Frames work with various photo aspect ratios
- [ ] Washi tape can be placed, moved, rotated, resized
- [ ] Tape layering looks natural (semi-transparent)
- [ ] All background textures load and tile correctly
- [ ] New decorative elements can be added and manipulated
- [ ] All elements save and restore correctly (autosave + reload)
- [ ] Works on mobile (touch interactions)

### Phase 2
- [ ] Layout recipes produce good results with 1, 3, 5, 8 photos
- [ ] Layouts adapt to portrait vs landscape photos
- [ ] Shuffle produces visible variation
- [ ] Layers panel shows all elements in correct order
- [ ] Drag-to-reorder in layers panel works
- [ ] Visibility and lock toggles work
- [ ] Grouping works (select multiple, group, transform together)
- [ ] Ungrouping restores independent control
- [ ] Multi-select works (shift+click, marquee)
- [ ] Align and distribute operations work
- [ ] Element controls are intuitive and accessible

### Phase 3
- [ ] Auto-arrange produces pleasing layouts
- [ ] Shuffle variation is visible
- [ ] All photo filters apply correctly
- [ ] Filters don't degrade image quality
- [ ] Print preview shows accurate margins
- [ ] Low-res warnings appear appropriately
- [ ] All keyboard shortcuts work
- [ ] Mobile gestures work (pinch, rotate, pan)
- [ ] Zoom works at all levels
- [ ] Pan works when zoomed in
- [ ] No performance issues with complex pages (20+ elements)

---

## Implementation Order Summary

**Phase 1 (Core Craft):**
1. Alignment guides + snapping
2. Photo frame styles
3. Washi tape elements
4. Background textures
5. Additional decorative elements (doodles, shapes, corners)

**Phase 2 (Layout & Organization):**
1. Improved layout system with recipes
2. Layers panel
3. Grouping
4. Multi-select + bulk operations
5. Enhanced element controls

**Phase 3 (Smart Features & Polish):**
1. Auto-arrange
2. Photo filters
3. Print preview
4. Copy/paste styles
5. Keyboard shortcuts
6. Mobile UX improvements
7. Zoom & pan

Complete Phase 1 before starting Phase 2. Complete Phase 2 before starting Phase 3. Test thoroughly at each phase boundary.