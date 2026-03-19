# Super Planner — Tasks

Work through these tasks in order. Find the first unchecked task and implement it. Each task description contains enough detail to proceed without asking for clarification.

Before starting any task, read `AGENTS.md` for project conventions and critical gotchas.

---

## Backlog

No pending tasks. See "Future Ideas" below for potential next steps.

---

## Future Ideas

These are not prioritised — just captured for reference.

- **Refresh button** — re-fetch epics without a full page reload
- **Epic create** — create a new epic directly from the planner (sets sprint + priority on creation)
- **Assignee filter** — toolbar chip to show only epics assigned to a specific person
- **Sprint column collapse** — collapse past sprints to reclaim horizontal space
- **Keyboard shortcuts** — e.g. `B` to toggle backlog, `Esc` to close modal
- **Multi-select drag** — select several epics and move them together
- **Epic notes/description** — show/edit the epic description field in the detail modal

---

## Completed

<details>
<summary>Steps 1–22 (original build-out) + post-launch fixes</summary>

- [x] **Step 1** — Project scaffold (Forge Custom UI + React + Tailwind)
- [x] **Step 2** — Deploy and verify end-to-end
- [x] **Step 3** — Fetch and display a raw list of epics
- [x] **Step 4** — Project selector dropdown
- [x] **Step 5** — Grid shell (columns × rows)
- [x] **Step 6** — Place epics in the grid by priority + fixVersions
- [x] **Step 7** — Expand epics to show child issues
- [x] **Step 8** — Switch grid columns from quarters to sprints
- [x] **Step 9** — Multi-project mode (single cross-project JQL filter)
- [x] **Step 10** — Drag epics between cells (local state only)
- [x] **Step 11** — Persist positions via Jira sprint field + priority field
- [x] **Step 12** — Loading and empty states
- [x] **Step 13** — Priority colour coding
- [x] **Step 14** — Calendar-style column headers (Quarter → Month → Day → Sprint)
- [x] **Step 15** — Fix grid width and constrain layout
- [x] **Step 16** — Backlog side panel (collapsible, drag in/out)
- [x] **Step 17** — Focus Area tabs (custom Jira Select field grouping)
- [x] **Step 18** — Manage Focus Area options from the app (add/delete/reorder)
- [x] **Step 19** — Open epic in Jira (`router.open`)
- [x] **Step 20** — Epic status badge
- [x] **Step 21** — Assignee avatars on cards
- [x] **Step 22** — Filter selector fallback (manual override dropdown)
- [x] **Post-launch** — Within-cell ordering via Jira LexoRank API
- [x] **Post-launch** — Project filter chip in toolbar (client-side, query param)
- [x] **Post-launch** — Epic detail modal (replaces inline expansion)
- [x] **Modal Step 1** — Progress bar (client-side from loaded children)
- [x] **Modal Step 2** — Sprint label on child tickets
- [x] **Modal Step 3** — Sprint + assignee picker per child ticket
- [x] **Modal Step 4** — Child ticket keys clickable to open in Jira
- [x] **Modal Step 5** — Mark epic Done from modal
- [x] **Post-launch** — Priority filter chips in toolbar
- [x] **Post-launch** — Year shown in Quarter and Month calendar headers
- [x] **Post-launch** — Paginate `getEpics` (was silently capped at 100 by Jira API)
- [x] **Post-launch** — GitHub Actions CI/CD (auto-deploy main to production)

</details>
