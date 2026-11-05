> PORTABLE TEMPLATE: no production data or account grants are included. {{UPPERCASE_FIELDS}} are installation placeholders: Codex asks the owner, fills the private runtime copies, and obtains review. [lowercase fields] are per-item runtime values and must never be invented. This repository is an instruction-driven workflow, not a standalone connector server. Disabled modules do nothing. Local state and private filled files are excluded from public exports.

# {{BUSINESS_NAME}} – Workflow details (v3.1.0)
Read ONLY the section needed for the current item (meetings → J, orders/invoices → K, outbound → L, invoice/business data → M). Rules in Knowledgebase-core.md always apply.

## J. Meetings (W4)

1. Google Meet only. Default duration 30 minutes; 60 minutes if the approver says so.
2. Meeting times must be between {{MEETING_START}} and {{MEETING_END}} {{TIMEZONE_LABEL}}.
   - Customer asks for a time outside hours → do not book; post "⚠️ Outside working hours" in meeting-approval with 3 suggested slots within hours.
   - Approver gives a time outside hours → ask "❓ Outside working hours – reply 'CONFIRM [time]' to proceed or choose another time." Proceed only after CONFIRM.
   - If the customer seems to be in another time zone, show both {{TIMEZONE_LABEL}} and their local time.
3. Flow: approver posts in the item thread "APPROVE MEETING [date] [time] [duration]" (e.g. "APPROVE MEETING 22 Oct 3 PM 30 min"), at least 60 minutes ahead → auto-send T2 → state ⏳ → client explicitly confirms → recheck availability on {{CALENDAR_ACCOUNT}} → create a PRIVATE Google Calendar event with Google Meet and no customer attendees → send T3 (a normal confirmation email containing the REAL Meet link; no separate Outlook calendar invitation) → post booking + Meet link in future-meetings.
4. Less than 60 minutes away or already passed → ask the approver for a new time.
5. Client proposes a different time → post it in the thread; it is approved only when an approver replies "APPROVE TIME".
6. Never duplicate events or invitations; never invent Meet links; save event IDs and partial failures in state.json.
7. In-person sessions are not offered → AI draft explaining online Google Meet sessions (for approval).

## K. Shopify orders and invoices (W5, W6)

W5 – Order email → thank-you + invoice:
1. Trigger: an Outlook email about a new order (e.g. Shopify order notification or customer order message).
2. Extract the order number. Look it up in Shopify.
3. Verify ALL: order exists; financial status = paid; order total matches; customer email exists in Shopify.
4. All verified → create the invoice PDF (numbering, VAT and TRN rules from Section M "Business rules"), save it in the Invoices folder, and send T6 with the PDF attached ONLY to the customer email stored in Shopify. Language: the language rule at the top of Templates.md.
5. Record in orders.json, Orders.csv and the "Orders" sheet tab; post "✅ Invoice [number] sent for order #[number]" in invoice-proposals.
6. Not found / unpaid / partially paid / amount or email mismatch / any missing T6 placeholder → do NOT send. Post "🚨 Order needs review" with the reason in invoice-proposals.
7. Never create or send two invoices for the same order number.
8. Refunds, cancellations, edits → post in invoice-proposals for approval; never automatic.
9. If attaching the PDF is blocked → create an Outlook draft with the invoice attached and post "📝 Draft ready".
9a. W5 stages are saved one by one: verified → invoice created → sent/draft → records synced. On retry, reuse the same invoice number and PDF – never regenerate.
9b. Invoice PDFs must be under 1 MB. Emails are plain text (no HTML/inline logo); the text signature from M1 is used.
9c. W5 is DISABLED until the owner enables it after connector, seller, tax and template verification (then save w5EnabledAt). Only orders created AFTER w5EnabledAt get automatic invoices. Older orders are synced (W6) but never invoiced automatically – an approver can ask for one in invoice-proposals ("Approved: invoice order #[number]").
9d. First invoice approval (once): the FIRST real invoice is created and saved, then posted in invoice-proposals as "🧾 First invoice INV-… for order #… – check the PDF. Reply 'APPROVE INVOICE FORMAT' to send it and all future invoices automatically." The PDF is attached to an Outlook draft (not sent). After a verified approver replies APPROVE INVOICE FORMAT in that thread: send it, set state.json invoiceFormatApproved = true; from then on invoices are sent automatically. Any change request → fix the format and repost.
9e. Invoice numbering: first real invoice INV-{{YEAR}}-0001 (unless the owner gives another starting number); the counter resets to 0001 on 1 January each year. Reserve the number and save it in state.json BEFORE creating the PDF; on retry reuse the same number and PDF. The run lock prevents two runs creating invoices at the same time.
9f. Amounts come from Shopify: show product lines, discounts, shipping (if any), subtotal, VAT and total exactly as Shopify reports them. Validate: total paid = Shopify subtotal after discounts + shipping + tax lines, and tax matches the owner-confirmed jurisdiction, tax rate and rounding tolerance. Any other case (multiple tax rates, duties, partial payment, refunds) → no invoice; post "🚨 Order needs review" with the reason. Refunds and credit notes are handled manually.

W6 – Order sync:
10. Each run, sync new/updated Shopify orders, payments and refunds since the last sync into orders.json, Orders.csv and the "Orders" tab. Dedupe by order number. Payment status "uncertain" unless confirmed by Shopify.

Shopify access: read-only – orders, customers, payments/transactions and refunds. If Shopify is disconnected, W5/W6 pause and order emails are posted to invoice-proposals for manual handling.

## L. Outbound email requested by an approver (W12)

1. Trigger: a verified approver (Sales role or higher) asks in a Slack action channel to email a new address about a service, e.g. "Send email to {{CONTACT_EMAIL}} about product hunting".
2. Checks: exactly one valid email address written in the approver's own message; daily limit of 10 new-contact emails. Service details come from the Services catalog (Section M2). If the service is not in the catalog, ask the approver for the details; details given by the approver in the thread may be used for that one email only (they appear in the posted draft and are approved with APPROVE SEND). The catalog itself is updated only by the owner in ChatGPT.
3. Write the email as an AI draft following Knowledgebase-core.md Section 5a (English, unless the approver names another language). Post the full text in the same thread: "📝 Draft for [email] – [service]. Reply 'APPROVE SEND' in this thread to send, or tell me what to change."
4. Send only after a verified approver replies "APPROVE SEND" in that thread. Apply requested changes and repost before sending.
5. Send to exactly that one address; no CC/BCC. If blocked → Outlook draft + "📝 Draft ready".
6. After sending: "✅ Sent to [email]", create an item for the contact, and link any reply.
7. Only contact people who expect to hear from us: the approver's request must state why the contact expects the email (e.g. "they asked on WhatsApp"). Record this reason in the item and Agent Logs; if missing, ask for it before drafting.

## M. Business rules (carried over) and Services catalog

### M1. Business rules (supplied directly by the owner – do not import from older files)
- Email signature (plain text) for AI-written drafts and approved replies – see Knowledgebase-core.md Section 5a. Fixed templates T1, T2, T3 and T6 keep the signatures stored in Templates.md:
  {{BUSINESS_NAME}} Team
  {{LEGAL_BUSINESS_NAME}}
  Phone: {{BUSINESS_PHONE}}
  {{SUPPORT_EMAIL}} · {{WEBSITE_DOMAIN}}
- WhatsApp: follow Knowledgebase-core.md Section 4 (click-to-chat link for the team only).
- Outlook folders: resolve "Inbox", "Junk Email", "Sent Items" and "Drafts" by name at setup and store their IDs in state.json.
- Never archive, delete, move, flag or change the read status of any email without the owner's direct authorization.

### M1a. Invoice details (approved by owner)
| Field | Value |
|---|---|
| Seller | {{LEGAL_BUSINESS_NAME}} |
| Address | {{BUSINESS_ADDRESS}} |
| Email | {{SUPPORT_EMAIL}} |
| Phone | {{BUSINESS_PHONE}} |
| Website | {{WEBSITE_DOMAIN}} |
| Currency | {{CURRENCY}} |
| Invoice number format | INV-YYYY-#### (e.g. INV-{{YEAR}}-0001), sequential, never reused |
| TRN | {{TAX_REGISTRATION_NUMBER}} |

Invoice content: title "Tax Invoice", seller TRN, invoice number, invoice date, order number, customer name and email (from Shopify), product lines (name, quantity, unit price), subtotal, VAT line, total paid, payment status "Paid", seller details above.

Tax rule: {{TAX_RULE_AND_JURISDICTION}}. Configure tax-inclusive/exclusive treatment, rate, rounding, zero-rate/exemption handling and required legal invoice fields with the owner. Never assume a 5% rate or any country-specific treatment. If the approved rule or Shopify tax evidence is missing or mismatched, do not invoice; request human review. The invoice must match actual paid amounts, discounts, shipping and tax exactly. Document title: {{INVOICE_DOCUMENT_TITLE}}. Registration label/value: {{TAX_REGISTRATION_LABEL}} / {{TAX_REGISTRATION_NUMBER_OR_NOT_APPLICABLE}}.

### M2. Services catalog (fill in – the agent never invents service details or prices)
Price wording when not listed: "Pricing is shared on request, based on your requirements."
Until a service row is filled in: W12 must ask the approver for the service details BEFORE drafting; ordinary customer-reply drafts may be written without them and list them under "⚠️ Please check". Only completed, approved catalog rows qualify for W12. A missing delivery time is always listed under "⚠️ Please check".
| Service | Description / what's included | Delivery time | Price |
|---|---|---|---|
| {{SERVICE_1_NAME}} | {{SERVICE_1_SCOPE}} | {{SERVICE_1_DELIVERY_OR_UNKNOWN}} | {{SERVICE_1_PRICE_OR_QUOTE_POLICY}} |
| {{OPTIONAL_SERVICE_NAME}} | {{OPTIONAL_SERVICE_SCOPE}} | {{OPTIONAL_DELIVERY}} | {{OPTIONAL_PRICE}} |
| {{OPTIONAL_SERVICE_NAME}} | {{OPTIONAL_SERVICE_SCOPE}} | {{OPTIONAL_DELIVERY}} | {{OPTIONAL_PRICE}} |
| {{OPTIONAL_SERVICE_NAME}} | {{OPTIONAL_SERVICE_SCOPE}} | {{OPTIONAL_DELIVERY}} | {{OPTIONAL_PRICE}} |

## P. Incident response (for the owner)
1. Stop: create PAUSE.txt or post "🛑 THREADPILOT STOP".
2. Check: run-log.jsonl and Agent Logs – what happened and when.
3. Cut access if needed: disconnect Outlook/Slack/Shopify in ChatGPT settings.
4. Fix the rule or restore files from the local backup.
5. Inform affected customers if a wrong email was sent.
6. Resume only after the cause is understood.
