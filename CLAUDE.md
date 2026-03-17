# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**jira-planner** — a project by Rijul Gupta (neblar). Application code has not yet been implemented; this repository is a bootstrap skeleton.

## Development Environment

This project uses a Docker-based dev container. The container image (`neblar/jira-planner:v1`) is Ubuntu 24.04 with `git`, `curl`, and Claude CLI pre-installed.

To start the dev container:
```
docker compose up -d
```

The workspace is mounted at `/home/workspace` inside the container. SSH keys and git config are volume-mounted from the host.
