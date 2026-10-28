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

- FR01 (MVP): The system shall require users to sign in with their email and password before accessing any project and allow them to sign out.

- FR02 (MVP): The system shall allow users to create, view, edit and delete tasks, asking for confirmation before deletion.

- FR03 (MVP): The system shall display tasks on a Kanban board with To Do, In Progress, Review and Done columns, and allow users to change a task’s status.

- FR04 (MVP): The system shall allow users to classify each task as a feature or a bug, shown with a distinct colour and icon.

- FR05 (MVP): The system shall allow users to assign, reassign or unassign tasks, display the assignee’s initials on each assigned task card, and provide feedback when the assignment changes.

- FR06 (MVP): The system shall allow users to set an optional due date and shall distinguish overdue, due-today and due-soon tasks.

- FR07 (MVP): The system shall allow users to record useful AI prompts, their results and supporting context against a task, and show when this was last updated.

- FR08: The system shall pre-fill new task context with the headings Background, Constraints, Tried so far and Pick up.

- FR09: The system shall allow users to record which AI tool the context relates to.

- FR10: The system shall allow users to copy a task’s title, description and context as Markdown from the card or task form, confirming when the copy succeeds.

- FR11 (MVP): The system shall allow users to create milestones with a title and optional target date, mark them complete and see overall progress.

- FR12: The system shall allow users to save, open and remove links to the Presentation, Demo, Report and Documentation in a dedicated Deliverables view, showing which links are missing. This view is separate from the board to keep the board uncluttered.

- FR13: The system shall allow users to filter tasks by assignee, type and overdue status and search them by title. Search and the type and overdue filters were added to help users find tasks as a project grows.

- FR14: The system shall show the tasks assigned to each member, with counts of unfinished and overdue tasks.

- FR15: The system shall allow users to add members to a project and remove them, retaining their tasks and allowing those tasks to be reassigned or left unassigned.

- FR16: The system shall allow users to edit their own name, email and GitHub username, while other members’ profiles are view-only. This was added because sign-in introduces personal accounts that users must maintain.

- FR17: The system shall allow users to create, rename and switch between projects, each with its own tasks, milestones, deliverables and project membership.

- FR18: The system shall display tasks in a monthly calendar by due date. This was added to give an overview of deadlines over time, supporting the brief’s aim of tracking tasks over time.

### Non-functional requirements

- NFR01 (MVP): All features shall be operable by keyboard alone, as the client prioritised accessibility and WCAG 2.2 requires keyboard access for users who cannot use a mouse (SC 2.1.1).

- NFR02 (MVP): Every interactive element shall show a visible focus indicator so keyboard users can see their position (WCAG 2.2 SC 2.4.7).

- NFR03 (MVP): Information shown by colour, such as task type and due-date status, shall also be shown by text or an icon, because users with colour-vision deficiency cannot rely on colour (WCAG 2.2 SC 1.4.1).

- NFR04 (MVP): All controls and form fields shall have programmatically determinable accessible names so screen readers can identify them (WCAG 2.2 SC 4.1.2).

- NFR05 (MVP): The interface shall use consistent layouts, familiar conventions and appropriate feedback on user actions and their outcomes, supporting the client’s request for an intuitive interface (Nielsen, 1994).

- NFR06 (MVP): Forms shall identify required fields and describe validation errors in text (WCAG 2.2 SC 3.3.1, 3.3.2). Entered information shall be retained when validation fails so users do not have to re-enter it.

- NFR07 (MVP): Project details, memberships, user profile information, tasks, context, milestones and deliverable links shall remain available after the page is refreshed or reopened, so users can continue their work without losing saved information.

- NFR08 (MVP): Project boards and their data shall only be accessible after signing in, so that project content is not publicly available, as requested by the client.

- NFR09 (MVP): The system shall run in current desktop browsers without installation, as the client asked for mainstream web technologies.

### Data requirements

- DR01 (MVP): User account: ID, name, email, password and GitHub username, entered by users when registering or editing their profile; needed for sign-in and to identify task owners.

- DR02 (MVP): Project: ID, name and member user IDs, created by users; needed to group a team’s work and control access.

- DR03 (MVP): Task: ID, project ID, title, description, type, status, optional assignee user ID, optional due date and created date, entered by users with IDs and dates generated by the system; needed to display and track tasks.

- DR04 (MVP): Task context: text, optional AI tool name and last-updated timestamp, written by users from their AI sessions; needed to preserve prompts and results for later reuse.

- DR05 (MVP): Milestone: ID, project ID, title, optional target date and completion status, entered by users; needed to track project progress.

- DR06: Deliverable link: project ID, deliverable type and URL, pasted by users from tools such as GitHub or Google Drive; needed to keep final outputs in one place.


*PRD version: hackathon-starter v1 · maintained by Prof. Dr. Ignacio Alvarez*
