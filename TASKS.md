# Jira Planner — Build Tasks

Work through these tasks in order. Find the first unchecked task and implement it. Each task description contains enough detail to proceed without asking for clarification.

---

- [x] **Step 1 — Project scaffold**
  - Run `forge create` to scaffold a new Forge app named `super-planner` using the `custom-ui` template
  - Set up the Custom UI (`/static/ui`) with React + TypeScript + Tailwind CSS
  - Confirm `forge tunnel` starts without errors
  - Update devcontainer.json with relevant VS Code extensions (ESLint, Tailwind IntelliSense)

- [x] **Step 2 — Deploy and verify end-to-end**
  - Register the app with Atlassian: run `forge register` to assign a real app ID, then update `manifest.yml` with the returned ID
  - Build the frontend (`npm run build` in `/static/ui`) and deploy: `forge deploy`
  - Install the app on the target Jira site: `forge install` (select the site and `jira:projectPage` module)
  - Open the installed page in Jira and confirm the "Jira Planner / Loading planning grid…" placeholder renders without errors
  - Confirm `forge logs` shows no runtime errors after the page load

- [x] **Step 3 — Fetch and display a raw list of epics**
  - Add `read:jira-work` scope to `manifest.yml`
  - Write a single resolver in `/src/index.js` that fetches all epics (issue type = Epic) for a hardcoded project key (pick the first available project)
  - In the frontend, call the resolver on load and render the results as a plain unstyled list: just the epic summary and key for each one
  - Goal: confirm data flows from Jira → resolver → frontend

- [x] **Step 4 — Project selector**
  - Write a resolver to fetch all available Jira projects (key + name)
  - Add a `<select>` dropdown at the top of the page populated with those projects
  - When the user picks a project, re-fetch epics for that project key and re-render the list from Step 3
  - Goal: the hardcoded project key is gone; the user controls which project is shown

- [x] **Step 5 — Grid shell**
  - Replace the plain list with a CSS grid: columns = Q1, Q2, Q3, Q4, Backlog; rows = Highest, High, Medium, Low, Lowest
  - No data yet — just the visual shell with correct labels and CSS grid structure
  - Goal: the grid structure is visible and correct before any cards are placed in it

- [x] **Step 6 — Place epics in the grid**
  - Extend the `getEpics` resolver to also return `priority` and `fixVersions` fields
  - Exclude epics with status = Done
  - Map each epic to a grid cell: column derived from the earliest `fixVersions` release date (fall back to Backlog if none), row from the epic's `priority` (fall back to the lowest row if no priority set)
  - Render each epic as a small card in its cell showing summary and key
  - Goal: epics appear in the correct cells based on their Jira data
  - NOTE: fixVersions-based placement is temporary. Once issue properties are in place (Step 10), the grid position will be the source of truth and all epics will default to Backlog on first load.

- [x] **Step 7 — Expand epics to show child issues**
  - For each epic card, add a click toggle to expand/collapse it
  - When expanded, fetch child issues for that epic and display them as a sub-list beneath the epic card (summary + key is enough)
  - Also exclude child issues with status = Done
  - Goal: the hierarchy is visible inside the grid

- [x] **Step 8 — Switch grid columns from quarters to sprints**
  - Add a `getSprints` resolver that fetches active and future sprints from a hardcoded Jira board ID (the "super board" that owns sprint definitions for all projects)
  - Columns become sprint names in chronological order, plus a Backlog column at the end for unassigned epics
  - Store both sprint ID and sprint name — ID is used as the stable identifier, name is displayed
  - Remove the Q1–Q4 column definitions; derive columns dynamically from the sprint list
  - Goal: grid columns reflect real sprints from Jira, not hardcoded quarters

- [x] **Step 9 — Multi-project mode**
  - Remove the project selector dropdown
  - Change `getEpics` to fetch epics across all projects in a single JQL query
  - Discuss with the user what field or label to use as an inclusion filter so that only relevant epics are shown (e.g. a specific label, component, or custom field) — do not implement the filter until agreed
  - Goal: the grid shows a unified cross-project view

- [x] **Step 10 — Drag epics between cells**
  - Install `@dnd-kit/core` and wire up drag-and-drop on epic cards
  - Dragging an epic to a new cell updates its column (sprint) and row (priority) in local React state immediately
  - No persistence yet — refreshing the page resets positions
  - Goal: epics can be moved around the grid freely

- [x] **Step 11 — Persist positions via Jira issue properties**
  - Add `write:jira-work` scope to `manifest.yml` (requires upgrade install)
  - Add a resolver that writes a Jira issue property to an epic: key = `super-planner`, value = `{ sprintId: number, sprintName: string, priority: string }`
  - On drop, call the resolver to write the property to the epic in Jira
  - Extend `getEpics` to also fetch the `super-planner` issue property for each epic; epics with a saved property go to that cell, all others default to Backlog
  - Remove the fixVersions/priority-based placement logic — the issue property is now the sole source of truth for grid position
  - Goal: positions survive page refresh and live on the Jira ticket itself

- [x] **Step 12 — Loading and empty states**
  - Show a spinner or skeleton while data is being fetched
  - Show a subtle "empty" indicator for cells that have no epics
  - Goal: the app feels responsive and complete at all grid states

- [x] **Step 13 — Priority colour coding**
  - Give each priority row (and its cards) a distinct colour: Highest = red, High = orange, Medium = yellow, Low = blue, Lowest = grey
  - Goal: priority is immediately readable at a glance

- [ ] **Step 14 — Sprint dates in column headers**
  - Extend the `getSprints` resolver to also return `startDate` and `endDate` for each sprint
  - Update column headers to show the sprint name on one line and the date range beneath it (e.g. "Mar 3 – Mar 14") in a smaller, lighter font
  - Format dates as short locale strings (day + month, no year unless the year differs from today)
  - The Backlog column has no dates — leave its header as-is
  - Goal: columns read like a calendar so sprint boundaries are immediately visible

- [ ] **Step 15 — Open epic in Jira**
  - Each epic card's key (e.g. T0-123) should be a clickable link that opens the Jira issue in a new tab
  - Use `router.open()` from `@forge/bridge` to navigate to the issue URL: `/browse/{epicKey}`
  - Goal: one click from planner card to Jira ticket

- [ ] **Step 16 — Epic status badge**
  - `getEpics` already fetches the `status` field — surface it on each card as a small inline badge
  - Show the status category name (To Do / In Progress / Done) rather than the raw workflow status, since status names vary by project
  - Colour the badge to match the category: To Do = grey, In Progress = blue, Done = green
  - Goal: workflow state is visible at a glance without opening the ticket

- [ ] **Step 17 — Assignee avatars**
  - Extend `getEpics` to also fetch the `assignee` field (displayName + avatarUrl)
  - Render the assignee's avatar as a small (20px) circle in the bottom-right of each card; show their display name in a tooltip on hover
  - Show a neutral placeholder icon for unassigned epics
  - Goal: load distribution across team members is visible in the grid

- [ ] **Step 18 — Filter selector fallback**
  - The board auto-matches a filter by project key in JQL — this covers most cases but can fail if the JQL doesn't contain the key
  - Add a small secondary `<select>` dropdown next to the board selector that lists all available filters, pre-selected to the auto-matched one
  - Changing the filter dropdown re-fetches epics using the new filter ID
  - Goal: users can manually override the filter if auto-matching picks the wrong one
