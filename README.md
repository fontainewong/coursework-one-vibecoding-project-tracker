# Project Tracker — Coursework Prototype

This is a clickable React prototype with simulated sign-in and localStorage persistence. The **Project requirements** section in [PRD.md](PRD.md) is the source of truth. Starter instructions below are archived and do not define the coursework scope.

Run `npm install` once, then `npm run dev`. Run checks with `npm run build` and `node --test src/`.

The workspace contains eight fictional A–H users, from Amy Anderson to Henry Hudson. The login screen offers only Amy, Ben and Chloe (A–C) to keep assessment simple; each account has two seeded projects with different memberships and a different default project. Their initial password is `Demo123!`; select an account to fill its credentials. Email addresses and GitHub usernames are demo data. Profile edits persist and updated demo emails are shown on the login screen. There is no registration or backend authentication.

Project data is saved under `vibetracker.workspace.v2`. Existing `vibetracker.workspace.v1` and standalone task/link data are imported without clearing the old backup keys. Only the eight demo user identities remain in the active workspace; tasks owned by removed legacy users are kept and unassigned. Amy can access imported projects. Seed project visibility follows each user's membership; newly created projects belong to their creator until other existing users are added. Sign out to switch demo accounts. The session lasts for the browser tab, while project and profile data persist in localStorage.

On a fresh browser profile, sample tasks are seeded automatically with populated Markdown context (Background, Constraints, Tried so far and Pick up). Opening the app again preserves saved work. Existing untouched sample contexts are upgraded once; user-written contexts are retained. Milestone cards open an editor for descriptions, dates and related project tasks, with a Delete milestone action. Each deliverable category supports multiple individually editable/removable links; existing single links migrate into the list.

Three seeded projects show mixed milestone completion and clickable Presentation/Demo links pointing to https://coursework-one-vibecoding-project-t.vercel.app/; Report and Documentation start empty. Amy belongs to Coursework Project and Interface Study (default: Coursework Project). Ben belongs to Coursework Project and Presentation Prep (default: Presentation Prep). Chloe belongs to Interface Study and Presentation Prep (default: Interface Study). Each team has at most six members and available users for Add Member. Every user has tasks in at least one project. The one-time seed upgrade preserves custom tasks, milestones and links; tasks assigned to removed members remain unassigned. Deleted examples stay deleted after the upgrade.

The task + button is available only in Board and disabled in Calendar, Milestones and Deliverables. Assignment changes are saved with Save changes, then confirmed in a floating notice for seven seconds. When editing through a member task dialog, a notice is also shown inside that dialog.

Manage project includes a Delete project confirmation. Enter exactly `delete PROJECT_NAME` using the saved project name, including its case. Deletion removes that project's nested tasks/context, milestones and links, retains other projects and user records, and selects another accessible project if available.

To intentionally replace all current projects, tasks and profile edits with fresh seed data, open the site with `?resetDemo=1` (for example `http://127.0.0.1:5173/?resetDemo=1`). This signs out and resets the active localStorage workspace for that browser and origin. The URL parameter is then removed so normal refreshes preserve subsequent changes. Old migration backup keys are not imported again while the active workspace exists.

## Archived starter documentation

You're forking this repo as the starting point for the **UXD Vibecoding Hackathon 2026**. The goal of the hackathon is to ship a Vibecoding Project Tracker in ~3 hours: a Kanban-style tool that tracks your vibecoding tasks and stores the prompts that produced them.

This starter gives you:

- A pre-written **PRD** (`PRD.md`) — read it. You don't write the PRD this year; your Milestone 2 is to review, fill in the team-specific TODOs, and commit.
- A pre-written **DESIGN.md** with the design-system slots Person B fills in during M3 (in parallel with M2).
- A **Vite + React + Tailwind** scaffold with the boilerplate already configured.
- The locked `Task` data model and `STAGES` constant in `src/App.jsx`.
- A `useLocalStorage` hook so persistence is one line.
- Empty TODO markers for every milestone, so AI tools can find them.

What you build, starting at M4:

- The four-column Kanban board.
- The add / edit / delete modal.
- The Prompt Context field (the differentiator).
- The "Copy as Prompt Context" button (the demo's hero moment).
- And everything else through M13.

## Quick start

```bash
# 1. Fork this repo on GitHub. Then clone YOUR fork:
git clone https://github.com/<your-team>/<your-fork>.git
cd <your-fork>

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). You should see a placeholder page with the team starter header and "Build the four-column board here · M3" in the middle. That's expected — M3 is your first build milestone.

## Milestone workflow

Every milestone ends with a git tag push. The Hackathon Portal dashboard watches your tags and updates the scoreboard in near real time.

```bash
git add .
git commit -m "<tag-name>"
git tag <tag-name>
git push --tags
```

Replace `<tag-name>` with the tag for the milestone you just finished — see the table below. Tag names are lowercase, hyphenated, exact.

| # | Tag | What it means |
|---|---|---|
| 1 | `git-linked` | Repo registered on the portal, webhook delivers test ping |
| 2 | `prd-done` | PRD reviewed, team-specific TODOs filled in |
| 3 | `design-done` | DESIGN.md filled in, color tokens pasted into `tailwind.config.js` (parallel to M2) |
| 4 | `data-model` | Four-column board renders with 3-4 mock tasks |
| 5 | `crud-modal` | Add / edit / delete tasks via a modal, persisted to localStorage |
| 6 | `tag-style` | Feature vs. bug visual distinction |
| 7 | `task-owner` | Assignee badge on each card + "Hand off to..." dropdown |
| 8 | `due-tint` | Cards change color as deadlines approach |
| 9 | `context` | Curated Context field on the task modal (paste-ready briefing) |
| 10 | `copy-prompt` | One-click copy formatted prompt to clipboard |
| 11 | `project-deliverables` | Deliverable Anchor Board pinned above the Kanban |
| 12 | `secret-sauce` | The one thing that makes your tracker uniquely yours (open-ended) |
| 13 | `pitch-ready` | Demo dataset loaded, pitch rehearsed |

## Repo map

```
.
├── PRD.md              ← READ THIS FIRST · review + fill in TODOs for M2
├── DESIGN.md           ← Person B fills this in for M3 (parallel to M2)
├── README.md           ← you are here
├── package.json
├── vite.config.js
├── tailwind.config.js  ← M3 design tokens land here too
├── postcss.config.js
├── index.html
├── .gitignore
└── src/
    ├── main.jsx        ← React entry point — don't change
    ├── index.css       ← Tailwind directives — don't change
    └── App.jsx         ← all your code goes here (or split into more files)
```

## Deploy (any time after M3)

Vercel's free tier deploys a Vite + React app in one click:

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. Import your fork.
3. Accept the defaults (Vite is auto-detected). Click Deploy.
4. Drop the resulting URL into PRD §11 and into your team chat.

Re-deploys happen automatically on every push to `main`.

## A word about prompts

Once M9 (`context`) is done, keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks on real tasks — those become part of your Module 5 "Vibe Coding History" deliverable. Free credit, just by using your own tool.

---

*UXD Vibecoding Hackathon 2026 · Prof. Dr. Ignacio Alvarez*
