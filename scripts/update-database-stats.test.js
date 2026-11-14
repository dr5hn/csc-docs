const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { parseRelease, renderOverview } = require('./update-database-stats');
const release = {
  draft: false, prerelease: false, tag_name: 'v5.2.0-export.1', published_at: '2026-11-03T08:18:19Z',
  body: '- **Regions**: 6\n- **Subregions**: 22\n- **Countries**: 250\n- **States**: 5327\n- **Cities**: 156169',
};

/** Release-note parsing replaces the obsolete README format. */
test('uses one published release and preserves its publication date', () => {
  const stats = parseRelease(release);
  assert.equal(stats.states, 5327);
  assert.equal(stats.cities, 156169);
  assert.equal(stats.publishedAt, '2026-11-03T08:18:19Z');
});

/** Partial, ambiguous or malformed upstream data must fail before any write. */
test('rejects missing, duplicate, zero and unsafe counts', () => {
  for (const body of [release.body.replace('- **Cities**: 156169', ''), release.body+'\n- **Cities**: 100', release.body.replace('156169', '0'), release.body.replace('156169', '9007199254740992')]) {
    assert.throws(() => parseRelease({ ...release, body }), /release count/);
  }
});

/** Publication metadata is rendered as Markdown and must be safe and complete. */
test('rejects prereleases, drafts, unsafe tags and missing dates', () => {
  for (const patch of [{prerelease:true},{draft:true},{tag_name:'v1](https://example.com)'},{published_at:null},{published_at:'not-a-date'}]) {
    assert.throws(() => parseRelease({ ...release, ...patch }), /published stable release/);
  }
});

/** A refresh should preserve provenance and be safe to repeat. */
test('refresh is idempotent and refuses a changed template', () => {
  const content=fs.readFileSync(require.resolve('../database/overview.mdx'),'utf8');
  const stats=parseRelease(release);
  const updated=renderOverview(content,stats);
  assert.match(updated,/published 3 November 2026/);
  assert.match(updated,/text-orange-600">5,327</);
  assert.match(updated,/text-red-600">156,169</);
  assert.equal(renderOverview(updated,stats),updated);
  assert.throws(()=>renderOverview(content.replace('text-red-600','text-other-600'),stats),/Expected one cities statistic/);
});
