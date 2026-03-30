## Plan: Publish-Ready Commit Contract Extension

Transform the current single-command MVP into a production-grade VS Code extension by improving UX (status bar, progress, clearer messaging), hardening runtime behavior (auto-setup option, idempotency, robust error handling + output channel logs), and completing publish requirements (rebrand, metadata, docs, icon, license, tests, packaging flow). Recommended approach: ship this as a cohesive v1.0.0 with explicit scope boundaries and verifiable acceptance checks.

**Steps**
0. Allow user to customize the text/content in commit message instruction to allow user-specific commit message styling on top of the instruction file
1. Phase 1 - Rebrand and manifest hardening (blocks most later steps)
1.1 Update extension identity in package manifest: rename package to commit-contract, set displayName, set publisher to satvikvirmani, fill description, categories, keywords, repository/homepage/bugs/license metadata, and icon path.
1.2 Replace activation strategy from onStartupFinished to onCommand + workspace-aware activation to reduce startup cost and only load when relevant.
1.3 Add contributes.configuration schema for optional auto-setup and status bar visibility controls, with defaults and markdownDescription.
1.4 Add command category/title polish and command palette discoverability metadata.
2. Phase 2 - Runtime UX and reliability in extension entrypoint (depends on Phase 1)
2.1 Refactor activation flow to initialize an output channel and a status bar item with dynamic states: Not configured, Ready, Setup needed, Error.
2.2 Introduce configuration/service helpers for reading and writing Copilot commit instruction settings in an idempotent way (avoid duplicate entries).
2.3 Improve setup command UX: withProgress notification, actionable prompts, detailed success text including target path, and clearer recoverable error messages.
2.4 Implement optional auto-setup behavior gated by user setting: run only once per workspace unless user resets state.
2.5 Persist lightweight workspace state/version flag in extension context to support migrations and avoid repeated prompts.
3. Phase 3 - Validation and tests (parallelizable after core runtime structure exists)
3.1 Replace placeholder tests with integration-style tests for command registration, no-workspace handling, overwrite decision branches, configuration updates, and idempotency.
3.2 Add test coverage for status bar lifecycle and output channel creation/disposal where feasible.
3.3 Add negative-path tests for fs/config update failures and verify surfaced user messages + logs.
4. Phase 4 - Publish assets and documentation (parallel with portions of Phase 3)
4.1 Rewrite README to production quality: value proposition, quick start, command usage, settings table, status bar behavior, troubleshooting, privacy statement (no telemetry), and screenshots/GIF placeholders.
4.2 Replace changelog template with Keep a Changelog style entries and a v1.0.0 release section.
4.3 Add LICENSE file and align license field in package metadata.
4.4 Add marketplace icon asset and ensure path consistency.
4.5 Add CI workflow for lint, compile, and test on PR/push, plus optional tagged-release packaging.
5. Phase 5 - Release readiness gate
5.1 Run lint, compile, and tests locally; fix regressions.
5.2 Validate package with vsce packaging dry-run and inspect .vsix contents.
5.3 Final checklist: manifest completeness, docs links valid, activation events minimal, extension host startup unaffected.

**Relevant files**
- /Users/satvik/Documents/conventional-commit-generation/package.json - rebrand, metadata, activation events, commands, settings schema.
- /Users/satvik/Documents/conventional-commit-generation/src/extension.ts - status bar, command UX, logging, auto-setup, state handling.
- /Users/satvik/Documents/conventional-commit-generation/src/test/extension.test.ts - replace placeholder with behavior-focused tests.
- /Users/satvik/Documents/conventional-commit-generation/README.md - full user-facing docs and privacy/logging statement.
- /Users/satvik/Documents/conventional-commit-generation/CHANGELOG.md - structured release notes for v1.0.0.
- /Users/satvik/Documents/conventional-commit-generation/.vscodeignore - verify publish artifact composition after adding icon/assets.
- /Users/satvik/Documents/conventional-commit-generation/.github/workflows/ci.yml - add CI for lint/build/test.
- /Users/satvik/Documents/conventional-commit-generation/LICENSE - add license text.
- /Users/satvik/Documents/conventional-commit-generation/resources/icon.png - marketplace icon asset.

**Verification**
1. Run npm run lint, npm run compile, npm test and confirm all pass.
2. Execute command from Command Palette in a fresh workspace and verify instruction file creation + config update.
3. Re-run setup command to confirm idempotent behavior and overwrite prompt accuracy.
4. Toggle auto-setup setting and verify one-time workspace behavior.
5. Confirm status bar state transitions across: no workspace, unconfigured workspace, configured workspace, and setup errors.
6. Inspect output channel logs for actionable diagnostics without telemetry.
7. Package with npx @vscode/vsce package (or npm script wrapper) and validate generated .vsix includes expected assets/docs only.

**Decisions**
- Publisher: satvikvirmani.
- Rebrand: use commit-contract as extension name/display identity baseline.
- Telemetry: excluded; output-channel logging only.
- Scope: include full publish hardening in this release.
- Behavior: add optional auto-setup setting (opt-in).

**Further Considerations**
1. Naming consistency: confirm whether displayName should be Commit Contract or Commit Contract for Copilot before final publish copy.
2. Auto-setup default: recommended OFF by default to avoid unexpected workspace writes.
3. CI publishing: recommended to start with CI validation only, then add manual marketplace publish after first stable release.
