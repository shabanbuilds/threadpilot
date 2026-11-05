# Guided setup

Start with docs/ONBOARDING.md. Codex asks for business details and generates the
private knowledge base from the three supplied knowledgebase/ templates. The user
does not need to author rule files from scratch. This guide covers technical checks.

## 1. Initialize locally

Run `npm run setup`. It creates config.local.json and blank runtime files without
overwriting existing data. It also creates runtime/onboarding.json and private
copies of Knowledgebase-core.md, Knowledgebase-details.md and Templates.md.
No connector calls are made. This works with Node.js
on Windows, macOS and Linux; no Python or shell-specific script is required.

Ask for business name, sender mailbox, website/signature, timezone, operating hours,
email provider, approvers and the desired starting point. Default ingestFrom is
the initialization time, so old messages are not unexpectedly imported. The owner
can choose an earlier UTC ISO timestamp before the first run to import history.
After processing starts, never silently reset cursors. A historical replay needs
an explicit plan and deduplication against existing item IDs and sent evidence.

## 2. Connect accounts in Codex

Use the app's plugin/connection controls to install/connect Slack and Outlook Email
or Gmail. Users authorize their own accounts through the provider's sign-in screen.
Do not request passwords, exported OAuth tokens or cookies. Access may require a
workspace administrator. Use current official setup documentation if UI names vary.

Discover tools provided by those connectors and confirm capabilities separately:

| Required check | Read-only evidence to save in runtime/setup.json |
| --- | --- |
| Email identity | Connected mailbox equals configured sender |
| Folder mapping | Outlook folder IDs or Gmail label IDs resolve correctly |
| Inbox access | One bounded list request succeeds without marking read |
| Sent access | Sent search/list can support duplicate and manual-send checks |
| Slack destination | Channel ID resolves to private, non-external channel |
| Slack authors | Owner identifies approvers; resolve actual immutable user IDs |
| Slack history | Can read channel and thread replies with pagination |
| Write capability | Tool exists for posting and sending; no test send implied |

Write a capability report with timestamps, verified IDs and missing permissions.
Do not claim that a write capability was exercised merely because its tool exists.
For Gmail, never archive, label or mark read as a side effect of triage. Gmail's
date search is not an exact cursor: locally compare message UTC times and IDs,
use a time overlap, and deduplicate; paginate the entire bounded result window.

## 3. Dry-run

Run the workflow with policy.mode = dry-run. It may read authorized sources and
write runtime/dry-run.json only. It must not post, send, book, update remote logs,
or advance live cursors. Show proposed recipient, destination, full draft and
classification. Validate one inquiry and one approval example with the owner.

Run `npm run doctor` to check local configuration. Then ask Codex to report
connector verification separately. A passing local doctor is not live certification.

## 4. Enable live and schedule

After direct owner authorization, set policy.mode = live and save the precise
authorized actions, owner instruction, time and connector evidence in setup.json.
Only then perform a first live run. A scheduled run must refuse external writes if
live authorization or verified connector setup is missing.

Ask Codex to create a recurring task using docs/AUTOMATION-PROMPT.md, the local
project directory and the configured timezone/interval. This step uses the app's
automation tools; the repository does not install or modify schedules itself.
Check the schedule's timezone in the app. Keep one task per installation and the
same local project across runs. Local schedules require the machine/app available.

To pause, create runtime/PAUSE.txt. Paused runs may read sources and create local
records but perform no external writes. Resume only on a direct owner instruction;
remove the pause file and record that instruction. To disable entirely, turn off
the scheduled task in the app as well.
