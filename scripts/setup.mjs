import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUBLIC_FILES = [
  'LICENSE', 'README.md', 'AGENTS.md', 'BUSINESS.md', '.gitignore', 'package.json',
  'config.example.json', 'scripts/setup.mjs', 'tests/setup.test.mjs',
  'docs/SETUP.md', 'docs/WORKFLOW.md', 'docs/AUTOMATION-PROMPT.md',
  'docs/ONBOARDING.md', 'knowledgebase/Knowledgebase-core.md',
  'knowledgebase/Knowledgebase-details.md', 'knowledgebase/Templates.md'
];
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = value => JSON.stringify(value, null, 2) + '\n';
const load = async path => JSON.parse(await readFile(path, 'utf8'));

async function createOnly(path, contents) {
  try { await writeFile(path, contents, { flag: 'wx' }); return true; }
  catch (error) { if (error.code === 'EEXIST') return false; throw error; }
}

export async function initialize(root = ROOT, now = new Date().toISOString()) {
  const configPath = join(root, 'config.local.json');
  const example = await load(join(root, 'config.example.json'));
  example.policy.ingestFrom = now;
  await createOnly(configPath, json(example));
  // Existing configurations and runtime data are never reset.
  await mkdir(join(root, 'runtime'), { recursive: true });
  await createOnly(join(root, 'runtime/state.json'), json({
    schemaVersion: 1, createdAt: now,
    cursors: { email: {}, slack: {}, shopify: {} }, items: [], processedIds: [], backlog: [],
    openItems: [], pendingQueue: [], pendingActions: [], unsavedLogs: [],
    runLock: null, lastSuccessfulRun: null, sendingCounters: {},
    w5Enabled: false, w5EnabledAt: null, invoiceFormatApproved: false,
    invoiceCounter: {}, catchUp: {}, sourceFailures: {}, knowledgebaseVersion: '3.1.0'
  }));
  await createOnly(join(root, 'runtime/gate.json'), json({
    lastCheck: null, pendingWork: false, nextDueAt: null
  }));
  await createOnly(join(root, 'runtime/setup.json'), json({
    connectorChecks: {}, liveAuthorization: null
  }));
  await createOnly(join(root, 'runtime/onboarding.json'), json({
    stage: 'business-details', answers: {}, knowledgeReviewed: false,
    modules: {}, missing: ['Business details', 'Connectors', 'Owner review', 'Dry-run']
  }));
  for (const file of ['Knowledgebase-core.md', 'Knowledgebase-details.md', 'Templates.md']) {
    await createOnly(join(root, 'runtime', file), await readFile(join(root, 'knowledgebase', file), 'utf8'));
  }
  return 'Local files initialized; configure them and verify connectors in Codex.';
}

export function validate(config) {
  const errors = [];
  const b = config?.business, e = config?.email, s = config?.slack;
  const t = config?.schedule, p = config?.policy;
  if (config?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!b?.name?.trim() || b.name === 'Example Business') errors.push('Set business.name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b?.mailbox ?? '') ||
      /@example\.(com|org|net)$/i.test(b?.mailbox ?? '')) errors.push('Set a real business.mailbox');
  try {
    const url = new URL(b?.website);
    if (url.protocol !== 'https:' || /(^|\.)example\.(com|org|net)$/i.test(url.hostname)) throw Error();
  } catch { errors.push('Set business.website to your HTTPS website'); }
  if (!b?.signature?.trim() || b.signature.includes('Example Business')) errors.push('Set business.signature');
  if (!['outlook', 'gmail'].includes(e?.provider)) errors.push('email.provider must be outlook or gmail');
  if (!Array.isArray(e?.folders) || !e.folders.length || e.folders.some(x => typeof x !== 'string' || !x.trim())) errors.push('Configure email.folders with provider folder/label IDs');
  if (!/^[CG][A-Z0-9]{8,}$/.test(s?.channelId ?? '')) errors.push('Set the Slack channel ID');
  if (!Array.isArray(s?.approverIds) || !s.approverIds.length ||
      s.approverIds.some(id => !/^[UW][A-Z0-9]{8,}$/.test(id))) errors.push('Set real Slack approver user IDs');
  try { new Intl.DateTimeFormat('en', { timeZone: t?.timezone || 'INVALID' }).format(); }
  catch { errors.push('Set a valid IANA schedule.timezone'); }
  const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(t?.start ?? '') || !time.test(t?.end ?? '') || t.start >= t.end) errors.push('Use same-day HH:MM hours with start before end');
  for (const key of ['intervalMinutes', 'catchUpGapMinutes']) {
    if (!Number.isInteger(t?.[key]) || t[key] < 1) errors.push(`schedule.${key} must be a positive integer`);
  }
  if (!['dry-run', 'live'].includes(p?.mode)) errors.push('policy.mode must be dry-run or live');
  if (typeof p?.ingestFrom !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(p.ingestFrom) ||
      !Number.isFinite(Date.parse(p.ingestFrom))) errors.push('Set policy.ingestFrom to a UTC ISO timestamp ending in Z');
  if (p?.privateSlackOnly !== true || p?.autoSend !== false) errors.push('Starter requires privateSlackOnly=true and autoSend=false');
  if (p?.approvalPhrase !== 'APPROVE SEND') errors.push('Starter approvalPhrase must be APPROVE SEND');
  for (const key of ['maxEmailsPerRun', 'maxSendsPerRun']) {
    if (!Number.isInteger(p?.[key]) || p[key] < 1) errors.push(`policy.${key} must be a positive integer`);
  }
  return errors;
}

export async function doctor(root = ROOT) {
  let config;
  try { config = await load(join(root, 'config.local.json')); }
  catch { return ['Run npm run setup first; config.local.json must be valid JSON']; }
  const errors = validate(config);
  for (const file of ['state.json', 'gate.json', 'setup.json', 'onboarding.json']) {
    try { await load(join(root, 'runtime', file)); }
    catch { errors.push(`runtime/${file} is missing or invalid; do not reset existing state blindly`); }
  }
  if (config?.policy?.mode === 'live') {
    try {
      const setup = await load(join(root, 'runtime/setup.json'));
      if (!setup.liveAuthorization?.instruction || !setup.liveAuthorization?.authorizedAt) {
        errors.push('Live mode needs the owner instruction and authorizedAt in runtime/setup.json');
      }
      const onboarding = await load(join(root, 'runtime/onboarding.json'));
      if (onboarding.knowledgeReviewed !== true || onboarding.stage !== 'ready') {
        errors.push('Complete guided onboarding and owner knowledge-base review before live mode');
      }
    } catch { /* already reported */ }
  }
  return errors;
}

export async function exportPublic(root = ROOT) {
  // A fresh export directory prevents stale private files from surviving a rerun.
  const base = join(root, 'dist');
  await mkdir(base, { recursive: true });
  const { mkdtemp } = await import('node:fs/promises');
  const destination = await mkdtemp(join(base, 'threadpilot-'));
  for (const file of PUBLIC_FILES) {
    await access(join(root, file), constants.R_OK);
    await mkdir(dirname(join(destination, file)), { recursive: true });
    await copyFile(join(root, file), join(destination, file));
  }
  return destination;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2];
    if (command === 'init') console.log(await initialize());
    else if (command === 'doctor') {
      const errors = await doctor();
      console.log(errors.length ? errors.map(x => `- ${x}`).join('\n') :
        'Local configuration passes. Ask Codex to verify connector access separately.');
      if (errors.length) process.exitCode = 1;
    } else if (command === 'export') console.log(`Public files exported to: ${await exportPublic()}`);
    else { console.error('Usage: node scripts/setup.mjs <init|doctor|export>'); process.exitCode = 1; }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
