# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

`<A calm, minimal workspace that feels organised and intuitive.>`

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- `<https://culturedcode.com/things/>`
- `<https://linear.app/docs/my-issues>`
- `<https://www.notion.com>`

Anti-references — what we are explicitly **not** trying to look like:

- `<https://www.awwwards.com/sites/era-residence>`

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#1D1D1F` | Header, "+" button, focus rings |
| `brand-accent` | `#F5772D` | Highlights, hover states, links |
| `surface-page` | `#F5F5F7` | Page background |
| `surface-card` | `#FFFFFF` | Card background |
| `text-primary` | `#1D1D1F` | Body text |
| `text-muted` | `#6E6E73` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#28C840` | Feature icon; task card borders stay neutral |
| `type-bug` | `#FF5F57` | Bug icon; task card borders stay neutral |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#28C840` | More than 2 days out |
| `due-warning` | `#FEBC2E` | Less than 24 hours |
| `due-overdue` | `#FF5F57` | Past due |
| `due-neutral` | `#E5E5EA` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | A system sans-serif keeps headings clean and familiar. |
| Body | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | The same system font keeps task details readable and consistent. |
| Monospace (tags, badges, code) | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | A system monospace makes code and technical labels easy to distinguish. |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** `White cards with a thin light-grey border, rounded corners and a subtle shadow on hover; colour stays in small type and status indicators.` (e.g. "Light, almost weightless; the only weight is from a 1px border, no shadow except on hover.")
- **Buttons:** `Black primary buttons with white text, neutral secondary buttons and a restrained Cosmic Orange-inspired accent; reserve traffic-light colours for small status or destructive controls.` (e.g. "Solid fill, no gradient, generous padding, rounded-md.")
- **Modal:** `A centred white panel with rounded corners, max-width-md and a black backdrop at 50% opacity.` (e.g. "Centered, max-width-md, slate-900 backdrop at 50% opacity.")
- **Empty states:** `A light-grey dashed border with a short, muted instruction.` (e.g. "Dashed border, muted text, never sad.")
- **Drag affordance (if used):** `None; use a status dropdown.` (e.g. "None — we use a status dropdown.")

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `+ Task` (e.g. "+ Task" or "Add task" or "New") |
| Empty column placeholder | `No tasks yet.` (e.g. "Nothing here yet — keep going.") |
| Toast after "Copy as Prompt Context" | `Copied. Paste into your AI tool.` (e.g. "Copied. Now paste it into the AI.") |
| Confirm-delete message | `Delete this task? This cannot be undone.` (e.g. "Delete this task? You can't undo.") |
| Handoff toast (M7 `task-owner`) | `Assigned to {name}.` (e.g. "Handed off to {name}. They've got it.") |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `Project Tracker` (match PRD §11 team identity)
- **Wordmark style:** `Project Tracker in the heading font, semibold and brand-primary, with no icon.` (e.g. "Just the name in the heading font, brand-primary color, no icon.")

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
