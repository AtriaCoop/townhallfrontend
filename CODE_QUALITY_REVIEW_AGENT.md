# Code Quality Review Agent - Townhall Frontend

> A systematic code quality review framework for the Townhall Frontend application. Run this review before any major commit or PR to ensure code quality, correctness, and maintainability for a small development team.

---

## How to Use

Tell Claude Code:
> "Review the uncommitted changes using the Code Quality Review Agent"

Or for a specific file:
> "Review `src/components/Post/Post.jsx` using the Code Quality Review Agent"

---

## Review Philosophy

### Core Principles
1. **Correctness first**: Bugs and runtime errors are the top priority
2. **Simplicity over cleverness**: Code should be easy for the whole team to understand
3. **Don't over-engineer**: Three similar lines > one premature abstraction
4. **Minimize blast radius**: Prefer small, safe changes over sweeping refactors
5. **Respect existing patterns**: New patterns need strong justification

### What This Agent Does
- Reviews code for bugs, unnecessary code, SOLID violations, and quality issues
- Categorizes findings by severity (Critical > Major > Minor)
- Runs suggestions through a **code-simplifier check** to filter out over-engineering
- Only applies changes that both agents agree on

### What This Agent Does NOT Do
- Bulk reformat files (use Prettier/ESLint for that)
- Add comments, docstrings, or type annotations to unchanged code
- Refactor architecture without explicit request
- Touch files outside the scope of the review

---

## Review Checklist

### 1. Critical - Bugs & Errors
These must be fixed. They cause runtime failures or incorrect user-facing behavior.

- [ ] **Runtime errors**: Unhandled exceptions, undefined references, null access without guards
- [ ] **State bugs**: Derived data stored in state instead of computed, stale closures
- [ ] **Rendering bugs**: Components defined inside other components (causes remount every render)
- [ ] **API bugs**: Error objects rendered as `[object Error]`, wrong HTTP methods, missing error handling at boundaries
- [ ] **UX bugs**: Wrong CSS class applied (e.g., error styled as success), buttons with no handlers, broken links
- [ ] **Performance bugs**: Redundant API calls (same fetch in parent and child), object URLs never revoked

### 2. Major - Code Quality & SOLID
These should be fixed. They make code harder to maintain or violate established patterns.

- [ ] **Dead code**: Empty callbacks, unused imports, commented-out blocks, unreachable branches
- [ ] **DRY violations**: Same constant/pattern repeated in 5+ files without a shared source
- [ ] **SRP violations**: Single component handling 5+ responsibilities (display, edit, delete, report, etc.)
- [ ] **Unnecessary state**: Values that can be derived from props or other state
- [ ] **Console leftovers**: `console.log()` statements from development (keep `console.error` for real errors)
- [ ] **Mock data inside components**: Static arrays/objects recreated every render

### 3. Minor - Style & Consistency
These are nice to fix but not urgent. Consider fixing when touching the file for other reasons.

- [ ] **Inconsistent patterns**: Mixed export styles, mixed quote styles, inconsistent naming
- [ ] **Premature optimization**: `useCallback`/`useMemo` on handlers passed to native DOM elements
- [ ] **Missing defensive coding**: `JSON.parse(localStorage)` without try-catch

---

## Project-Specific Rules

### Shared Constants
The project uses `src/constants/` for shared values:
- `src/constants/api.js` - `BASE_URL` for API calls
- `src/constants/reactions.js` - Reaction types and emojis

**Rule**: If a value is used in 3+ files, it belongs in `src/constants/`.

### Shared Utilities
The project uses `src/utils/` for shared helpers:
- `src/utils/authHelpers.jsx` - Authenticated fetch wrapper
- `src/utils/getStoredUser.js` - Safe localStorage user retrieval
- `src/utils/validateUrl.js` - URL field validation

**Rule**: If a pattern (like `JSON.parse(localStorage.getItem("user"))`) appears in 3+ files, create a utility.

### Component Patterns
- **Export style**: `export default function ComponentName()` (preferred)
- **State management**: Props from `_app.jsx` for app-wide state, local state for component-specific
- **API calls**: Use `authenticatedFetch()` wrapper, import `BASE_URL` from constants
- **Icons**: Use `<Icon name="..." />` component with aliases from `src/icons/Icons.js`
- **Styling**: CSS Modules (`.module.scss`) with variables from `src/styles/_variables.scss`
- **SCSS imports**: Use `@use '@/styles/variables' as *;` and `@use '@/styles/mixins' as *;`

### CSRF Handling
CSRF cookies are fetched once in `_app.jsx`. **Do NOT add CSRF fetches in individual components.**

### File Organization
```
src/
├── components/     # Reusable UI components
├── constants/      # Shared constants (api, reactions, etc.)
├── icons/          # Icon system (lucide-react based)
├── pages/          # Next.js pages
├── styles/         # Global styles, variables, mixins
└── utils/          # Shared utility functions
```

---

## Code-Simplifier Gate

Every suggestion MUST pass the code-simplifier check before being applied:

### APPROVE criteria (apply the change)
- Fixes a real bug users would encounter
- Removes genuinely dead/unreachable code
- Eliminates a concrete DRY violation (5+ repetitions)
- Prevents a runtime crash
- Is a one-line or few-line change

### REJECT criteria (don't apply)
- Creates more files than the problem warrants
- Adds abstraction layers for theoretical future benefit
- Bulk reformats files (use tooling instead)
- Extracts components that are tightly coupled to parent state
- Adds error handling for scenarios that can't realistically happen
- "Improves" code that already works fine and is readable

### Gray Area Decision Framework
When unsure, ask:
1. Would a new team member understand the change without explanation?
2. Does this reduce total lines of code across the project?
3. Could this change break existing functionality?
4. Would reverting this change be easy if it causes problems?

If answers are Yes, Yes, No, Yes → **APPROVE**. Otherwise → **REJECT**.

---

## Review Output Format

When running a review, organize findings as:

```
## Critical (Must Fix)
1. [File:Line] - Description → Suggested fix

## Major (Should Fix)
1. [File:Line] - Description → Suggested fix

## Minor (Nice to Fix)
1. [File:Line] - Description → Suggested fix

## Rejected by Code-Simplifier
1. Description → Reason for rejection
```

---

## Common Issues Reference

### React-Specific
| Issue | Bad | Good |
|-------|-----|------|
| Derived state | `useState` + `useEffect` to compute value from props | `const x = prop1 === prop2` |
| Component in component | `function Inner() {}` inside render | Define `Inner` outside or in its own file |
| Unnecessary memo | `useCallback(() => ref.current.click(), [])` on native element | `const handleClick = () => ref.current.click()` |
| Object URL leak | `URL.createObjectURL()` in render | Create once, revoke on cleanup |

### JavaScript-Specific
| Issue | Bad | Good |
|-------|-----|------|
| Error in UI | `setError(err)` (renders `[object Error]`) | `setError(err.message \|\| "Something went wrong")` |
| Unsafe parse | `JSON.parse(localStorage.getItem("x"))` | Use `getStoredUser()` helper or wrap in try-catch |
| Magic strings | `process.env.NEXT_PUBLIC_API_BASE \|\| ""` in every file | Import `BASE_URL` from `@/constants/api` |

### SCSS-Specific
| Issue | Bad | Good |
|-------|-----|------|
| Old import | `@import '@/styles/mixins.scss'` | `@use '@/styles/mixins' as *` |
| Hardcoded colors | `color: #5B99D3` | `color: $primary-500` or `color: var(--primary)` |
| Magic numbers | `padding: 17px` | `padding: $spacing-4` |

---

*This agent should be consulted before every major commit or PR. When in doubt, prioritize correctness and simplicity over theoretical best practices.*
