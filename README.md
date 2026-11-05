# ThreadPilot

From inbox to approved reply.

Turn customer inbox messages into Slack approval threads with Codex.

Maintained by [shabanbuilds](https://github.com/shabanbuilds).
Repository: https://github.com/shabanbuilds/threadpilot

Download this folder as a repository, open it as a local project in Codex, connect
your email and Slack accounts, and ask Codex to set it up for your business.
Each user connects their own accounts. No production customer records, account IDs,
tokens or production business rules are included.

**Status: portable workflow v0.2.** The local setup and export helpers are tested. Connector
behavior must be verified in each user's account before enabling live operation.
This is a Codex-operated workflow, not a server or an OAuth connector implementation.

## Quick start

1. Install Node.js 22 or later and a desktop Codex environment with local project
   access. Clone/download this repository into its own folder and open that folder.
2. In Codex, say:

   > Set up ThreadPilot for my business. Read AGENTS.md and docs/ONBOARDING.md.
   > Ask me for the details you need, build my knowledge base and templates, and
   > tell me which accounts to connect and what to do next. Start in dry-run mode.

3. Run `npm run setup` (or let Codex run it). No npm dependencies or API key are
   needed for the local helpers. Codex/account access requirements still apply.
4. Complete the connector sign-in flows and local configuration. Run
   `npm run doctor`. The doctor validates local files; it does not test connectors.
5. Ask Codex: `Run docs/WORKFLOW.md once in dry-run mode and show the result.`
6. Review the result. When ready, say:

   > Enable live mode for inbox triage and posting inquiry drafts to my configured
   > private Slack channel. Send customer emails only after my configured approvers
   > approve the exact draft inside its thread. Run once, then help me schedule it.

Follow [the setup guide](docs/SETUP.md) for connector verification and scheduling.
Do not enable live mode until both connectors and the sender identity are verified.

## What it does

| Capability | Starter behavior |
| --- | --- |
| Outlook or Gmail | Reads configured folders/labels through available connectors |
| Customer inquiries | Creates a local reply draft and, in live mode, a private Slack thread |
| Approvals | Checks actual Slack author ID, thread and exact draft version |
| Customer replies | One recipient; duplicate check and Sent verification |
| Vendor/newsletters | Records classification without replying |
| Catch-up | Persists cursors and processes a bounded backlog oldest first |
| Recurring checks | User-created Codex scheduled task using the included prompt |
| Shopify, invoices, meetings | Full instruction recipes included; disabled until configured and verified |
| Reports, reminders, backups | Full instruction recipes included; enable only selected modules |

## Your knowledge base is included

You do not need to build the rules from scratch. [Guided onboarding](docs/ONBOARDING.md)
asks about your business, services, prices, policies, languages, approvers and chosen
workflows. Codex fills private copies of the supplied complete knowledge base:

- `knowledgebase/Knowledgebase-core.md`: routing, approvals, sending limits,
  reminders, security, pause/resume, catch-up, logging, reporting and backups.
- `knowledgebase/Knowledgebase-details.md`: meetings, order sync, invoices,
  outbound email, seller/tax fields, services and incident response.
- `knowledgebase/Templates.md`: T1 program reply, T2 meeting proposal, T3 meeting
  confirmation and T6 invoice email; English, Urdu, Roman Urdu and Arabic examples.

Searchable `{{UPPERCASE_FIELDS}}` mark business settings Codex must ask you for.
Per-email fields such as `[customer name]` remain for runtime use. Codex replaces
example business assumptions with your approved facts and shows the result for
review. Unknown facts are never invented. Your filled copies live in ignored
`runtime/`; the public originals stay generic. BUSINESS.md is a brief public example.

No automatic sending is enabled initially. AI replies require exact in-thread
approval. Optional standard-template automation requires separate owner activation;
invoice automation also requires first-format approval and verified tax settings.

Downloading/opening a folder alone does not start a chat or connect accounts.
Send the one-line setup prompt above; Codex then guides you through the missing
stages and resumes saved progress. No passwords or tokens should be pasted in chat.

## Local operation, reporting and cost

Settings, drafts, state and run logs stay in your local installation. The full
workflow includes local operational summaries and optional spreadsheet logs,
daily reports and backups after you configure and authorize their destinations.
This provides MIS-style activity reporting; an interactive dashboard is not included.

Saved cursors, deduplication, gate checks and processing limits help avoid repeated
work. No separate workflow server is required. Actual costs depend on your Codex
usage and connected-service plans; savings are not guaranteed. Local operation is
not offline: relevant content is processed through Codex and connected services.
Local scheduling needs your computer and app available.

## Files and privacy

- `config.example.json`: portable example; `config.local.json`: your ignored settings.
- `runtime/`: ignored state, locks, drafts, dry-run output and logs.
- `runtime/onboarding.json`: private saved setup progress and module choices.
- `docs/ONBOARDING.md`: staged business interview and connector setup guidance.
- `docs/WORKFLOW.md`: operating instructions for Codex.
- `docs/AUTOMATION-PROMPT.md`: prompt to use when creating a scheduled task.
- `npm test`: local helper checks.
- `npm run export`: creates a fresh `dist/threadpilot-<suffix>/` from a fixed public-file list.

Publish only the exported folder as the root of a new GitHub repository. Do not
publish the parent folder of an existing business installation. Export deliberately
excludes even ignored or accidentally added runtime files; inspect it before upload.
Licensed under the MIT License. See LICENSE.

## Practical requirements

Connectors, write tools, schedules and approvals depend on the user's account,
workspace policies and app version. This repository cannot grant those permissions.
If a connector is read-only, triage can still run, but sending/posting stays blocked.
Do not work around unavailable capabilities with unapproved browser automation.

For schedules that use local files, keep the computer on and the desktop app
running. Select this same local project for every run: isolated worktrees would
not share the ignored configuration, cursors and runtime state automatically.

Official guidance checked 5 November 2026:
[plugins](https://developers.openai.com/plugins) and
[scheduled tasks](https://learn.chatgpt.com/docs/automations?surface=app).
