# Commit Contract

Commit Contract configures GitHub Copilot commit message generation to follow Conventional Commits with project-level consistency.

It installs a strict base instruction file in your workspace and can append your own custom styling guidance, so generated commit messages match both the spec and your team conventions.

## Features

- One-command setup for Conventional Commits instruction rules.
- Status bar indicator showing setup state at a glance.
- Optional auto-setup once per workspace.
- Workspace-level custom commit style text appended on top of base rules.
- Safe overwrite flow when instruction file already exists.
- Output channel logs for troubleshooting (`Commit Contract`).

## Quick Start

1. Open a Git workspace in VS Code.
2. Open Command Palette.
3. Run `Commit Contract: Setup Commit Instructions`.
4. Optionally set `Commit Contract > Custom Instruction Text` to add project-specific formatting guidance.

The extension writes:

- `.copilot-commit-message-instructions.md` in workspace root.
- `github.copilot.chat.commitMessageGeneration.instructions` in workspace settings.

## Extension Settings

This extension contributes the following settings:

- `commitStyle.autoSetupOnOpen`: Run setup automatically once per workspace when VS Code opens.
- `commitStyle.showStatusBar`: Show or hide the Commit Contract status bar item.
- `commitStyle.customInstructionText`: Additional plain text guidance appended to Copilot commit message instructions.

## Custom Commit Styling

Use `commitStyle.customInstructionText` to add team-specific style guidance, for example:

```text
Prefix subject with Jira ID like ABC-123 when available.
Use imperative mood and keep subject under 72 characters.
```

This custom content is applied after the strict Conventional Commits instruction, so formatting remains compliant while allowing team preferences.

## Requirements

- VS Code `1.110.0` or newer.
- GitHub Copilot Chat commit message generation support in your environment.

## Troubleshooting

- If setup fails, open the `Commit Contract` output channel.
- If status does not update, rerun `Commit Contract: Setup Commit Instructions`.
- If instruction file is missing after setup, verify workspace write permissions.

## Privacy

Commit Contract does not include telemetry. It only logs locally to the VS Code output channel.

## Known Issues

- In multi-root workspaces, setup currently targets the first workspace folder.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for version history.