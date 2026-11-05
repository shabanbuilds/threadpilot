# Guided onboarding — instructions for Codex

Goal: the person downloads the repo, opens it in Codex and says "Set up ThreadPilot".
You guide them; they should not have to write their own knowledge base or know IDs.
Opening the folder does not run a background program or initiate a chat by itself.

## Start or resume

Read AGENTS.md and run `npm run setup` if needed. It never overwrites prior answers,
state or customized rules. Read runtime/onboarding.json and resume at the earliest
missing stage. Persist answers there after each stage; never request credentials.
Do not dump every placeholder into one overwhelming questionnaire. Ask 3–5 related
plain-language questions per stage, accept "not sure" and list a concrete next step.

## Stage 1 — business and operating preferences

Ask for business/public name, owner name, sender email and provider (Outlook/Gmail),
website and signature/contact information. Then ask timezone, operating hours,
preferred languages and whether to process only new messages or a specified history.
Translate answers into config.local.json and runtime knowledge-base placeholders.
Never carry over another installation's identities, tax policy or authorization.

## Stage 2 — choose workflows

Explain and ask which they want. Default to inbox triage and approved replies;
keep every external write off until dry-run review and live authorization.

| Workflow | Connect/configure only if selected |
| --- | --- |
| Email triage and approved replies | Outlook Email or Gmail, private Slack channel, approvers |
| Automatic standard program reply | Owner-approved T1 text, program facts/links and auto-send scope |
| Meeting proposals and bookings | Calendar with availability/event/real Google Meet capability; times/duration |
| Shopify order sync | Read-only Shopify store; order/payment/refund access |
| Invoice generation and sending | Shopify, seller/legal/tax details, currency, PDF support and first-format approval |
| New-contact outbound emails | Catalog, expected-contact reason, approvers and daily limits |
| Spreadsheet logging/reports | Google Drive/Sheets, spreadsheet/tabs, disclosure authorization |
| Local/cloud backups | Retention, approved files, private Drive destination and data scope |
| Catch-up, reminders, pause and reports | Hours, limits, reminder intervals, report time and retention |

Explain that optional modules have instruction recipes, not bundled connector
servers. Verify real tools and dependencies before claiming a module works.
Unsupported choices stay disabled with an explicit reason; other modules proceed.
No automatic emailing just because a template is present. Record auto-send grants
separately and narrowly; approved AI replies still use in-thread approval.

## Stage 3 — build their knowledge base

Ask what they sell, what each service includes/excludes, approved pricing or quote
wording, delivery expectations, refund/cancellation policy, common questions,
escalation contacts and approved links. Ask only module-relevant information:
invoice users need legal seller/address/tax facts; others do not.

Use the supplied knowledgebase/ files as the complete starting structure; fill the
private runtime/Knowledgebase-core.md, runtime/Knowledgebase-details.md and
runtime/Templates.md. Generalize program/marketplace-specific example wording to
their actual business. Do not promise enrollment videos, online-only meetings,
mentorship, support or any other example offering without their confirmation.
Generate optional language variants only in languages the owner selects, with
owner review before activation. Preserve [customer name], [date], [order number]
and other per-item fields; these are filled only from verified runtime evidence.

Use {{UPPERCASE_FIELD}} for installation placeholders. Search the private files
for `\{\{[A-Z0-9_]+\}\}` and show unresolved fields grouped by selected module.
Use "NOT CONFIRMED — ask the team" for optional unknown facts. Required missing
facts block the affected module, not every other module. Never use that text or
an unresolved placeholder in a customer email. Maintain a services table and FAQ
in runtime/Knowledgebase-details.md. No customer data belongs in public templates.

## Stage 4 — connect tools

Tell them: "Next, connect [provider] and Slack through your app's plugin/connection
controls. Sign in to your own accounts; do not paste passwords or tokens here."
Use relevant installed plugin tools/skills to guide connection and current official
documentation if controls differ. Wait for sign-in completion; never claim it happened.
Follow docs/SETUP.md's read-only checks. Ask the user to identify their desired
private channel and approvers by name, then discover and verify actual IDs.
For enabled optional modules, repeat only their necessary connection checks.
Save verified capabilities and destination privacy evidence in runtime/setup.json.
Ask the owner to approve remote logging/backup data scope and destinations before
any customer data is written there. A public website is factual source material,
not authorization; browse only if the owner requests it, and review imported facts.

## Stage 5 — review and dry-run

Present business facts, final templates, enabled modules, recipients/destinations,
automation limits and missing facts. Ask the owner to review the concrete generated
knowledge base. Record review time and source instruction; set knowledgeReviewed
only after explicit review. Significant later policy/template changes require review.

Run the local doctor, then a read-only dry-run of selected workflows. Prefer a
fictional sample for initial demonstrations; obtain consent before reading actual
mail. Save dry-run output separately; no live cursor advancement or external writes.
Test the approval path without sending. Check invoice sample PDF layout if chosen.
Do not claim a read-only simulation is a successful live connector mutation.

## Stage 6 — activation and schedule

After review and passed checks, set stage=ready and show the precise activation
scope for approval. Record direct owner live authorization in setup.json, then
set policy.mode=live. Only explicitly approved modules become enabled. First real
invoice format approval and per-reply approvals remain separate safeguards.
If requested, create the scheduled task through the app's automation tools using
docs/AUTOMATION-PROMPT.md. Use the same local project and owner-selected timezone;
keep the computer/app available. Do not copy a previous user's schedule or IDs.

End each setup turn with: completed stages, remaining blockers and ONE next step.
When ready, explain how to approve replies, pause/resume, inspect local reports,
edit business facts and disconnect integrations. No guarantees of savings or safety.
