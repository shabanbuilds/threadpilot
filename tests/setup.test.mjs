import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, cp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialize, validate, doctor, exportPublic, PUBLIC_FILES } from '../scripts/setup.mjs';

const source = fileURLToPath(new URL('../', import.meta.url));
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'threadpilot-test-'));
  for (const file of PUBLIC_FILES) {
    await mkdir(resolve(root, file, '..'), { recursive: true });
    await cp(join(source, file), join(root, file));
  }
  return root;
}
const load = async path => JSON.parse(await readFile(path, 'utf8'));

test('onboarding includes the full portable rule set but initializes modules disabled', async () => {
  const root = await fixture();
  await initialize(root);
  const core = await readFile(join(root, 'runtime/Knowledgebase-core.md'), 'utf8');
  const details = await readFile(join(root, 'runtime/Knowledgebase-details.md'), 'utf8');
  const templates = await readFile(join(root, 'runtime/Templates.md'), 'utf8');
  assert.ok(core.includes('{{SUPPORT_EMAIL}}'));
  assert.ok(details.includes('{{TAX_RULE_AND_JURISDICTION}}'));
  for (const id of ['T1', 'T2', 'T3', 'T6']) assert.ok(templates.includes(id));
  const state = await load(join(root, 'runtime/state.json'));
  assert.equal(state.w5Enabled, false);
  assert.equal(state.invoiceFormatApproved, false);
  assert.deepEqual((await load(join(root, 'runtime/onboarding.json'))).modules, {});
  assert.deepEqual(state.openItems, []);
});

test('initialization seeds the import window and never resets customer state or config', async () => {
  const root = await fixture();
  await initialize(root, '2026-11-05T00:00:00Z');
  assert.equal((await load(join(root, 'config.local.json'))).policy.ingestFrom, '2026-11-05T00:00:00Z');
  await writeFile(join(root, 'runtime/state.json'), '{"items":["keep-me"]}');
  await writeFile(join(root, 'runtime/Knowledgebase-core.md'), 'My private approved rules');
  await initialize(root, '2026-11-06T00:00:00Z');
  assert.deepEqual((await load(join(root, 'runtime/state.json'))).items, ['keep-me']);
  assert.equal(await readFile(join(root, 'runtime/Knowledgebase-core.md'), 'utf8'), 'My private approved rules');
  assert.equal((await load(join(root, 'runtime/onboarding.json'))).knowledgeReviewed, false);
  assert.equal((await load(join(root, 'config.local.json'))).policy.ingestFrom, '2026-11-05T00:00:00Z');
});

test('doctor rejects example values and live mode without recorded owner authorization', async () => {
  const root = await fixture();
  await initialize(root);
  assert.ok((await doctor(root)).some(x => x.includes('mailbox')));
  const c = await load(join(root, 'config.local.json'));
  c.business = { name: 'Test Company', mailbox: 'support@test.invalid', website: 'https://test.invalid', signature: 'Test Team' };
  c.slack = { channelId: 'C1234567890', approverIds: ['U1234567890'] };
  assert.deepEqual(validate(c), []);
  c.policy.mode = 'live';
  await writeFile(join(root, 'config.local.json'), JSON.stringify(c));
  assert.ok((await doctor(root)).some(x => x.includes('owner instruction')));
  c.schedule.timezone = 'No/Such_Zone';
  c.schedule.start = '20:00'; c.schedule.end = '08:00';
  c.policy.autoSend = true;
  assert.ok(validate(c).length >= 3);
});

test('public export excludes local data and uses a fresh directory on every run', async () => {
  const root = await fixture();
  await initialize(root);
  await writeFile(join(root, 'runtime/customer-secret.txt'), 'PRIVATE');
  await writeFile(join(root, 'runtime/Templates.md'), 'PRIVATE CUSTOMER TEMPLATE');
  await writeFile(join(root, '.env'), 'TOKEN=PRIVATE');
  const first = await exportPublic(root);
  await writeFile(join(first, 'accidental-secret.txt'), 'PRIVATE');
  const second = await exportPublic(root);
  assert.notEqual(first, second);
  async function files(dir, prefix = '') {
    const entries = await readdir(dir, { withFileTypes: true });
    return (await Promise.all(entries.map(e => e.isDirectory() ? files(join(dir, e.name), prefix + e.name + '/') : prefix + e.name))).flat();
  }
  assert.deepEqual((await files(second)).sort(), [...PUBLIC_FILES].sort());
});
