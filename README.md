# Super Planner — Jira Epic Planning Grid

> **Disclaimer:** This project is vibecoded — the vast majority of the application logic, UI, and features were built through AI-assisted development. The Jira Forge scaffolding (app registration, manifest setup, devcontainer, initial project structure) was set up manually to get things off the ground.

A sprint-based planning grid for Jira epics, built as an Atlassian Forge full-page app. Gives a cross-project calendar view of all epics with drag-and-drop planning, priority rows, Focus Area grouping, and an epic detail modal.

## Features

- **Calendar-style grid** — columns are real sprints laid out across a Quarter → Month → Day → Sprint header; auto-scrolls to the active sprint on load
- **Drag-and-drop** — move epics between sprint columns and priority rows; persists sprint assignment and priority back to Jira
- **Within-cell reordering** — drag epics within a cell to reorder; uses Jira's native LexoRank so order is consistent with the Timeline view
- **Backlog panel** — collapsible side panel showing unplanned epics grouped by priority; drag in/out of the grid
- **Focus Area tabs** — groups epics by a custom Jira Select field ("Focus Area"); manage options (add/delete/reorder) without leaving the app
- **Priority filter** — toggle chips to hide/show entire priority rows
- **Project filter** — client-side filter to narrow the view to a single project
- **Epic detail modal** — progress bar, sprint/assignee pickers per child ticket, clickable issue keys, Mark as Done button
- **Persistent state** — board and filter selection stored in URL query params for bookmarking

## Tech stack

- **Platform:** Atlassian Forge (Custom UI, `jira:fullPage`)
- **Backend:** Node.js resolvers (`src/index.js`) calling Jira REST APIs
- **Frontend:** React (`static/planner-ui/src/App.js`) with `@dnd-kit` for drag-and-drop
- **Deployment:** GitHub Actions on push to `main`

## Project structure

```
src/index.js                  # Forge resolvers (backend)
static/planner-ui/src/App.js  # React app (frontend)
manifest.yml                  # Forge app manifest
.github/workflows/deploy.yml  # CI/CD — auto-deploy to production
```

## Local development

Install dependencies:
```bash
npm install
cd static/planner-ui && npm install
```

Build the frontend:
```bash
cd static/planner-ui && npm run build
```

Deploy manually:
```bash
forge deploy -e production
```

Tunnel for local development (connects to a live Jira site):
```bash
forge tunnel
```

## CI/CD

Pushes to `main` automatically build and deploy to production via GitHub Actions.

Requires two repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `FORGE_EMAIL` | Your Atlassian account email |
| `FORGE_API_TOKEN` | API token from [id.atlassian.com](https://id.atlassian.com) → Security → API tokens |

## Jira permissions required

The app requests the following OAuth scopes (see `manifest.yml`):

- `read:jira-work`, `write:jira-work` — read/update epics, priorities, sprints
- `read:jira-user` — assignee display names and avatars
- `read:sprint:jira-software`, `write:sprint:jira-software` — sprint assignment
- `read:board-scope:jira-software`, `write:board-scope:jira-software` — board/sprint discovery
- `read:issue-details:jira`, `read:project:jira` — issue fields and project metadata
- `manage:jira-configuration` — managing Focus Area custom field options
- `write:issue:jira-software` — LexoRank reordering via the Jira Agile rank API
