# Vibecoding Project Tracker — PRD

**Status:** Hackathon starter PRD · review and fill in the **`<TODO>`** sections before you tag `prd-done`.

---

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the team members, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of vibecoders taking the same class.

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

## 3. Product overview

A single-page web app with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states.
- An **Anchor Board** above it that pins the four final-project deliverables (Presentation, Demo, Report, Documentation).

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

## 4. Primary user flow

1. Open the Webapp. The board loads from local storage.
2. Click "+" to add a task. Fill in title, type, assignee, due date, prompt context.
3. Move the task across columns as you work.
4. When stuck, click "Copy as Prompt Context" on a task and paste it into Claude/ChatGPT/Cursor to continue.
5. Hand off a task to a teammate with one dropdown.
6. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,              // one of the three teammate names from §8
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'

  // Added in later milestones:
  context: string,               // M9 context — curated briefing for the next AI / teammate
  contextTool: string | null,    // M9 context — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
  contextUpdatedAt: string|null, // M9 context — ISO timestamp set automatically on save
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}
```

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + a `useLocalStorage` hook | Simple, no library needed. |
| Persistence | **localStorage** | Zero infra. Pick this. Do not switch to a backend mid-hackathon. |
| Deploy | Vercel | One-click deploy from GitHub. |

> **Decision:** localStorage, not a shared backend. If you want a shared backend later, that's M14 — out of scope for the hackathon.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

Fill these in before tagging `prd-done`:

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | `Fontaine Wong` | `fontainewong` |

These three names become the **only** allowed values for `Task.assignee`. No auth — just a dropdown.

## 9. Milestone ownership

Fill in the owner column. Recommended default in **bold**; change if your team has different strengths.

| # | Tag | Title | Suggested owner | Final owner |
|---|---|---|---|---|
| 3 | `design-done` | Design system + voice (DESIGN.md) | **B** | `<Fontaine Wong>` |
| 4 | `data-model` | Task model + board view | **A** | `<Fontaine Wong>` |
| 5 | `crud-modal` | Add / edit / delete modal | **A** | `<Fontaine Wong>` |
| 6 | `tag-style` | Feature / bug colors | **B** | `<Fontaine Wong>` |
| 7 | `task-owner` | Owner indicator + handoff | **A** | `<Fontaine Wong>` |
| 8 | `due-tint` | Due-date color tinting | **B** | `<Fontaine Wong>` |
| 9 | `context` | Context field on the task modal | **C** | `<Fontaine Wong>` |
| 10 | `copy-prompt` | "Copy as Prompt Context" button | **C** | `<Fontaine Wong>` |
| 11 | `anchors` | Deliverable Anchor Board | **B** | `<Fontaine Wong>` |
| 12 | `secret-sauce` | The one thing that makes it yours | **C / All** | `<Fontaine Wong>` |
| 13 | `pitch-ready` | Demo + pitch rehearsal | **All** | `<Fontaine Wong>` |


Track A owns the state model and task ownership. Track B owns the visuals (and design — M3 runs parallel to M2 so the team starts Phase 3 with the palette already chosen). Track C owns the differentiator features (M9 + M10 — the context field and the Copy-as-Prompt button) and usually leads on M12 secret-sauce. Put your strongest prompter on Track C.

**Dependency note.** M3 (`design-done`) runs **in parallel with M2** — Person B drafts DESIGN.md and pastes the colors into `tailwind.config.js` while the rest of the team reviews the PRD. M6 / M7 / M8 / M11 all depend on M4 + M5 being done first. While Person A builds M4+M5 (first ~60 min of Phase 3), Person C should draft the Markdown template for the "Copy as Prompt Context" output (M10). M12 `secret-sauce` is open-ended — pick whatever makes the tracker uniquely yours; constraint is "must be visible in the demo and must not break anything else."

## 10. AI / vibe coding angle

Where AI will be heavily used:
- M4, M5: scaffold the board and the modal from a single prompt each.
- M9, M10: write the Markdown serialization helper for the Context field.
- M7: animation polish for the handoff toast.

Where AI will **not** save you time:
- M2 (this PRD review) — read it yourself.
- M3 (DESIGN.md) — design taste is yours, not the model's.
- M12 (secret-sauce) — the whole point is that AI can't predict it.
- M13 (pitch) — write the script in your own voice.

Keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks — those become part of your Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

Fill in:

- **Team name:** `<Team>`
- **Tagline (one sentence):** `<Tracker for tasks, prompts, and progress together, from first idea to working prototype.>`
- **Tracker URL after deploy:** `<https://coursework-one-vibecoding-project-t.vercel.app/>` (Vercel will give it to you)

## 12. Out of scope (do not build)

- Authentication / accounts.
- Real GitHub integration.
- A real backend / shared database.
- Mobile responsive — desktop only is fine.
- Multi-team support.
- Real-time collaboration.

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- The board loads on Vercel without errors.
- The "Copy as Prompt Context" demo works on stage.
- 5 min pitch is rehearsed.


## Project requirements

### Functional requirements
- FR01:	The system shall allow users to create, view, edit and delete project tasks.
- FR02:	The system shall display tasks on a Kanban board and allow users to change their status between To Do, In Progress, Review and Done.
- FR03:	The system shall allow users to assign and reassign tasks to team members.
- FR04:	The system shall allow users to set task due dates and identify approaching and overdue tasks.
- FR05:	The system shall allow users to record and edit useful AI prompts, their results and supporting context against a task.	
- FR06:	The system shall allow users to copy a task’s details and saved context as formatted text for reuse in an AI tool.
- FR07:	The system shall allow users to record project milestones and track whether they have been completed.	
- FR08:	The system shall require users to sign in before accessing a team’s board and restrict access to authorised team members.
- FR09:	The system shall allow users to add members to the project team.
- FR10:	The system shall allow a team to manage multiple projects.

### Non-functional requirements
- NFR01: Accessibility	All core task-management actions shall be usable with a keyboard, with visible focus indicators and labelled controls.
- NFR02: Visual clarity	Task types and due-date states shall be communicated through text or icons as well as colour.
- NFR03: Usability	Forms shall clearly identify required fields, explain validation errors and preserve entered information when validation fails.
- NFR04: Persistence	Saved tasks and their associated context shall remain available after refreshing or reopening the application in the supported storage environment.
- NFR05: Access control	Access restrictions shall be enforced wherever protected project data is stored or served, rather than relying only on hiding interface elements.

### Data requirements
- DR01: Each task shall store a unique ID, title, description, type, status, assignee, creation date and optional due date. 
- DR02: Each task shall retain its AI prompts, results and supporting context, with an optional AI tool name and a last-updated timestamp.
- DR03: Each team-member record shall store a unique ID, name, email address and GitHub username.
- DR04: Each project milestone shall store a unique ID, title, optional target date and completion status. 
- DR05: Tasks, milestones and team memberships shall be associated with the relevant project or team using stable identifiers. 

*PRD version: hackathon-starter v1 · maintained by Prof. Dr. Ignacio Alvarez*
