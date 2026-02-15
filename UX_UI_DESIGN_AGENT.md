# UX/UI Design Agent - Townhall Frontend

> A comprehensive design reference system inspired by world-class designers including Ryo Lu (Cursor, Notion), Rasmus Andersson (Figma, Spotify), Julie Zhuo (Facebook), and the design philosophies of Linear, Vercel, and Stripe.

---

## Core Design Philosophy

### 1. Invisible Interface Principle
*"The best interface is no interface."* - Golden Krishna

- **Reduce cognitive load**: Every element must earn its place
- **Progressive disclosure**: Show only what's needed, when it's needed
- **Anticipate user intent**: Design should feel predictive, not reactive

### 2. Emotional Design Hierarchy
Following Don Norman's three levels:
1. **Visceral**: Immediate visual appeal (colors, typography, spacing)
2. **Behavioral**: Usability and function (interactions, feedback, flow)
3. **Reflective**: Long-term satisfaction (brand identity, trust, delight)

### 3. The Ryo Lu Approach (Cursor/Notion)
- **Clarity over cleverness**: Never sacrifice understanding for aesthetics
- **Systematic consistency**: Every decision should be part of a larger system
- **Purposeful whitespace**: Let content breathe; density ≠ value
- **Micro-interactions matter**: Small animations create polish and feedback
- **Dark mode as first-class**: Not an afterthought but a parallel design

---

## Design Tokens - VFJC Brand System

### Color Palette

```scss
// Primary Colors
$primary-500: #5B99D3;        // Main brand blue - trust, stability
$primary-600: #4A87C1;        // Hover state
$primary-700: #3A75AF;        // Active/pressed state
$primary-400: #7CAEE0;        // Light variant
$primary-100: #E8F2FA;        // Subtle backgrounds

// Secondary Colors (VFJC Green)
$secondary-500: #6BA660;      // Nature, growth, food justice
$secondary-600: #5A9550;      // Hover state
$secondary-700: #4A8440;      // Active state
$secondary-400: #85B77C;      // Light variant
$secondary-100: #EDF5EC;      // Subtle backgrounds

// Accent Colors
$accent-500: #E17C34;         // Warmth, energy, calls-to-action
$accent-600: #D06A22;         // Hover state
$accent-400: #E99558;         // Light variant

// Neutral Colors
$neutral-900: #000000;        // Primary text
$neutral-800: #1A1A1A;        // Secondary text
$neutral-700: #343A40;        // Tertiary text, icons
$neutral-600: #6B7280;        // Placeholder text
$neutral-400: #9CA3AF;        // Disabled text
$neutral-200: #E5E7EB;        // Borders, dividers
$neutral-100: #F5F5F0;        // Off-white backgrounds
$neutral-50: #FAFAFA;         // Subtle backgrounds
$white: #FFFFFF;              // Pure white

// Semantic Colors
$success-500: #22C55E;
$warning-500: #F59E0B;
$error-500: #EF4444;
$info-500: #3B82F6;

// Dark Mode Variants
$dark-bg-primary: #0D0D0D;    // Main background
$dark-bg-secondary: #1A1A1A;  // Card backgrounds
$dark-bg-tertiary: #262626;   // Elevated surfaces
$dark-border: #333333;        // Borders
$dark-text-primary: #FFFFFF;
$dark-text-secondary: #A1A1AA;
$dark-text-tertiary: #71717A;
```

### Typography System

**Font Families:**
- **Headlines**: `'Nobile', system-ui, sans-serif` - Strong, distinctive presence
- **Body**: `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif` - Clean, readable

**Type Scale (based on 1.25 Major Third ratio):**

```scss
// Headings
$heading-1: 40px / 55px;      // Bold, letter-spacing: -0.02em
$heading-2: 32px / 40px;      // Bold, letter-spacing: -0.01em
$heading-3: 26px / 32px;      // Bold
$heading-4: 24px / 32px;      // SemiBold
$heading-5: 22px / 24px;      // Medium
$heading-6: 20px / 24px;      // Medium

// Subheadings
$subheading-1: 18px / 24px;   // Medium
$subheading-2: 16px / 24px;   // Medium

// Body
$body-1: 16px / 24px;         // Regular - primary content
$body-2: 14px / 20px;         // Regular - secondary content

// Small
$caption: 12px / 16px;        // Regular - labels, timestamps
$overline: 11px / 16px;       // Medium, uppercase, letter-spacing: 0.08em
```

### Spacing System

Following an 8-point grid system with 4px for fine adjustments:

```scss
$spacing-xs: 4px;     // Tight internal padding
$spacing-sm: 8px;     // Small gaps, icon padding
$spacing-md: 16px;    // Default component padding
$spacing-lg: 24px;    // Section spacing
$spacing-xl: 32px;    // Large section breaks
$spacing-2xl: 40px;   // Page section gaps
$spacing-3xl: 48px;   // Major section divisions
$spacing-4xl: 64px;   // Page-level spacing
```

### Border Radius

```scss
$radius-none: 0;
$radius-sm: 4px;      // Subtle rounding (tags, small buttons)
$radius-md: 8px;      // Default (cards, inputs, buttons)
$radius-lg: 12px;     // Prominent cards, modals
$radius-xl: 16px;     // Large cards, hero sections
$radius-2xl: 24px;    // Feature cards
$radius-full: 9999px; // Pills, avatars
```

### Shadows & Elevation

```scss
// Light Mode
$shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

// Dark Mode - subtle glow effect
$shadow-dark-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
$shadow-dark-md: 0 4px 6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
$shadow-dark-lg: 0 10px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
```

---

## Component Design Patterns

### Buttons

**Hierarchy (by visual weight):**
1. **Primary**: Solid fill, main CTA - ONE per viewport
2. **Secondary**: Outlined or subtle fill - supporting actions
3. **Tertiary**: Text-only or ghost - minimal emphasis
4. **Destructive**: Red variant for irreversible actions

**States:**
- Default → Hover (darken 10%) → Active (darken 15%) → Disabled (40% opacity)

**Sizing:**
- Small: 32px height, 12px horizontal padding
- Medium: 40px height, 16px horizontal padding (default)
- Large: 48px height, 24px horizontal padding

**Best Practices:**
- Minimum touch target: 44×44px (mobile)
- Button text: Sentence case, action verbs ("Create post" not "Submit")
- Icons: 20px for medium buttons, 8px gap from text
- Loading state: Replace text with spinner, maintain width

### Cards

**Principles:**
- Clear visual boundary (subtle border OR shadow, not both)
- Consistent internal padding: 16px (mobile), 24px (desktop)
- Interactive cards: subtle hover lift (translateY -2px + shadow increase)
- Group related information within cards

**Card Variants:**
1. **Flat**: Border only, no shadow (lists, tables)
2. **Elevated**: Shadow, no border (standalone content)
3. **Interactive**: Hover effects, cursor pointer

### Forms & Inputs

**Input States:**
- Default: 1px neutral-200 border
- Hover: 1px neutral-400 border
- Focus: 2px primary-500 border (ring effect)
- Error: 2px error-500 border + error message below
- Disabled: neutral-100 background, 50% opacity

**Best Practices:**
- Labels always visible (never placeholder-only)
- Error messages: specific, actionable ("Email must include @")
- Success feedback: checkmark icon, green border briefly
- Required fields: asterisk after label, not before

### Navigation

**Sidebar Navigation (Desktop):**
- Fixed width: 240-280px
- Full height, sticky positioning
- Clear active state (background highlight + text color change)
- Icon + label for each item
- Hover: subtle background change

**Mobile Navigation:**
- Bottom tab bar for primary actions (max 5 items)
- Hamburger menu for secondary/settings
- Swipe gestures for common actions

**Breadcrumbs:**
- Use for deep hierarchies (3+ levels)
- Truncate middle items on mobile
- Current page is not clickable

### Modals & Overlays

**Principles:**
- Backdrop: rgba(0,0,0,0.5) - subtle blur optional
- Modal: centered, max-width 480px (small), 640px (medium), 800px (large)
- Close button: top-right corner OR escape key
- Focus trap: keyboard focus stays within modal
- Scroll: content scrolls, header/footer fixed

**Best Practices:**
- Don't nest modals
- Destructive actions require explicit confirmation
- Loading states show within modal, don't close

---

## Layout Principles

### Grid System

**12-Column Grid:**
- Gutter: 24px (desktop), 16px (mobile)
- Margins: 24px (desktop), 16px (mobile)
- Max content width: 1280px (centered)

**Common Layouts:**
- Single column: content max-width 720px (reading)
- Two column: sidebar 280px + main fluid
- Three column: sidebar 240px + main + aside 320px

### Responsive Breakpoints

```scss
$breakpoint-sm: 640px;   // Small phones landscape
$breakpoint-md: 768px;   // Tablets portrait
$breakpoint-lg: 1024px;  // Tablets landscape, small laptops
$breakpoint-xl: 1280px;  // Desktops
$breakpoint-2xl: 1536px; // Large desktops
```

**Mobile-First Approach:**
1. Design for 375px width first
2. Add complexity at larger breakpoints
3. Test at: 375px, 768px, 1024px, 1440px

### Responsive Rules

**Navigation:**
- < 768px: Hidden sidebar, hamburger menu + bottom tabs
- ≥ 768px: Collapsed sidebar (icons only, 80px)
- ≥ 1024px: Full sidebar (240px)

**Content:**
- < 768px: Single column, full width
- ≥ 768px: Add sidebar navigation
- ≥ 1024px: Add secondary sidebar (upcoming events, activity)

**Typography:**
- Scale down headings by ~15% on mobile
- Body text stays 16px minimum for readability

---

## Interaction Design

### Transitions & Animations

**Timing Functions:**
```scss
$ease-out: cubic-bezier(0.16, 1, 0.3, 1);     // Primary - feels responsive
$ease-in-out: cubic-bezier(0.45, 0, 0.55, 1); // For emphasis
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); // Playful bounce
```

**Duration Guidelines:**
- Micro-interactions (hover, focus): 150ms
- Small transitions (dropdown, tooltip): 200ms
- Medium transitions (modal, sidebar): 300ms
- Large transitions (page, view change): 400-500ms

**Principles:**
- Enter: Start from below/scaled down, ease-out
- Exit: Fade out quickly (150ms), no movement
- Avoid: Excessive bouncing, delays, sequential animations

### Feedback Patterns

**Loading:**
- Skeleton screens > spinners (maintains layout)
- Button loading: spinner inside, disabled state
- Progressive loading: show content as available

**Success:**
- Inline confirmation (checkmark, green flash)
- Toast notification for actions
- Optimistic updates where safe

**Errors:**
- Inline errors near source
- Shake animation (subtle, 2-3 cycles)
- Red border + icon + message

---

## Accessibility Standards

### Color Contrast
- Normal text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum
- Test with: WebAIM Contrast Checker

### Focus States
- Never remove outline entirely
- Custom focus: 2px ring, offset 2px, primary color
- Focus-visible: keyboard only, not mouse clicks

### Keyboard Navigation
- All interactive elements reachable via Tab
- Logical tab order (left→right, top→bottom)
- Escape closes modals/dropdowns
- Arrow keys for lists/menus

### Screen Readers
- Semantic HTML (nav, main, aside, article)
- ARIA labels for icon-only buttons
- Live regions for dynamic content
- Alt text for meaningful images

---

## Page-Specific Guidelines

### Dashboard (Combined with News Feed)

**Layout:**
- Three-column on desktop: Sidebar | Feed | Activity
- Two-column on tablet: Feed | Activity (sidebar collapsed)
- Single column on mobile: Feed only (activity in tabs)

**Post Card Design:**
- Avatar (40px) + Name + Timestamp
- Content (text, images, links)
- Actions (like, comment, bookmark, share)
- Clear visual hierarchy: author > content > actions

**Sidebar Components:**
- "Create Post" CTA prominently placed
- Upcoming Events widget (max 3, "View All" link)
- Activity Overview (recent interactions)

### Profile Page

**Layout:**
- Cover image: 16:5 aspect ratio, full width
- Avatar: 120px, overlapping cover by 50%, border ring
- Info: Name large, role/org secondary, location tertiary
- Tabs: About, Posts, Events, Organizations

**Sections:**
- Basic Information (card)
- About/Bio (card)
- Organizations (list with logos)
- Past Events (list with dates)

### Messages Page

**Layout:**
- Two-panel: Conversation list | Active chat
- Mobile: Single panel with navigation between

**Conversation List:**
- Avatar + Name + Last message preview + Time
- Unread indicator (dot or bold)
- Active conversation highlight

**Chat View:**
- Messages grouped by sender, time-based breaks
- Own messages: right-aligned, primary color background
- Their messages: left-aligned, neutral background
- Input: sticky bottom, emoji picker, send button

### Members Page

**Layout:**
- Search/filter bar at top
- Grid of member cards (3-4 columns desktop)
- Card: Avatar, Name, Role, Quick actions (message, view)

---

## Dark Mode Implementation

### Principles
- Not just inverted colors - thoughtfully designed palette
- Reduce pure white (#FFFFFF → #F5F5F5 or lighter)
- Shadows become glows or are removed
- Primary colors may need slight saturation adjustments

### Color Mapping
```scss
// Background layers
Light #FFFFFF → Dark #0D0D0D (base)
Light #F5F5F0 → Dark #1A1A1A (cards)
Light #E5E7EB → Dark #262626 (elevated)

// Text
Light #000000 → Dark #FFFFFF
Light #343A40 → Dark #A1A1AA
Light #6B7280 → Dark #71717A

// Borders
Light #E5E7EB → Dark #333333
```

### Toggle Behavior
- System preference detection on first visit
- User preference saved to localStorage
- Smooth transition (150ms on all colors)
- Toggle in profile/settings + quick access in nav

---

## Quality Checklist

Before shipping any design:

### Visual
- [ ] Consistent spacing using 8-point grid
- [ ] Typography hierarchy is clear
- [ ] Colors are from the defined palette
- [ ] Shadows/elevation are consistent
- [ ] Icons are consistent size and style

### Interaction
- [ ] All interactive elements have hover states
- [ ] Focus states are visible and consistent
- [ ] Loading states exist for async actions
- [ ] Error states are helpful and specific
- [ ] Success feedback is provided

### Responsive
- [ ] Works at 375px width (mobile)
- [ ] Works at 768px width (tablet)
- [ ] Works at 1024px width (laptop)
- [ ] Works at 1440px width (desktop)
- [ ] Touch targets are 44px minimum on mobile

### Accessibility
- [ ] Color contrast passes WCAG AA
- [ ] All images have alt text
- [ ] Forms have visible labels
- [ ] Keyboard navigation works
- [ ] Screen reader tested

### Performance
- [ ] Images are optimized (WebP, lazy loading)
- [ ] Animations use transform/opacity only
- [ ] No layout shifts on load
- [ ] Interactive within 100ms of visible

---

## Design Decision Framework

When making UX/UI decisions, ask:

1. **Does it reduce complexity?** If not, reconsider.
2. **Is it consistent with existing patterns?** New patterns need strong justification.
3. **Does it work on all screen sizes?** Design mobile-first.
4. **Is it accessible?** Accessibility is not optional.
5. **What's the fastest path to the user's goal?** Remove friction.

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."* - Antoine de Saint-Exupéry

---

## References & Inspiration

### Designers to Study
- **Ryo Lu** - Cursor, Notion - Systematic, thoughtful, detail-oriented
- **Rasmus Andersson** - Figma, Spotify - Typography, developer tools
- **Julie Zhuo** - Facebook - Product thinking, team leadership
- **Tobias van Schneider** - Spotify, Semplice - Bold, artistic
- **Jorn van Dijk** - Linear - Minimalism, efficiency

### Products to Reference
- **Linear** - Issue tracking done beautifully
- **Notion** - Flexible, powerful, learnable
- **Vercel** - Developer experience, dark mode
- **Stripe** - Documentation, trust, polish
- **Figma** - Collaborative design tools

### Resources
- Refactoring UI (Adam Wathan & Steve Schoger)
- Laws of UX (Jon Yablonski)
- Inclusive Design Principles (Microsoft)
- Material Design 3 (Google)
- Human Interface Guidelines (Apple)

---

*This design agent should be consulted for all UX/UI decisions in the Townhall Frontend application. When in doubt, refer to the core principles: clarity, consistency, and user-centered design.*
