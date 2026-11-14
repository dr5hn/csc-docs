#!/usr/bin/env node

/** Refresh the database overview from one published GitHub release. */
const fs = require('node:fs/promises');
const path = require('node:path');

const RELEASE_API = 'https://api.github.com/repos/dr5hn/countries-states-cities-database/releases/latest';
const RELEASES_URL = 'https://github.com/dr5hn/countries-states-cities-database/releases/tag/';
const OVERVIEW_FILE = path.join(__dirname, '../database/overview.mdx');
const FIELDS = [
  ['regions', 'Regions', 'blue'],
  ['subregions', 'Subregions', 'green'],
  ['countries', 'Countries', 'purple'],
  ['states', 'States', 'orange'],
  ['cities', 'Cities', 'red'],
];

/** Validate a complete published release before using any of its counts. */
function parseRelease(release) {
  if (!release || typeof release !== 'object' || release.draft !== false || release.prerelease !== false ||
      typeof release.tag_name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(release.tag_name) ||
      typeof release.body !== 'string' || typeof release.published_at !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T/.test(release.published_at) || !Number.isFinite(Date.parse(release.published_at))) {
    throw new Error('Expected a published stable release with a safe tag, body and publication date');
  }
  const stats = { tag: release.tag_name, publishedAt: release.published_at };
  for (const [key, label] of FIELDS) {
    const matches = [...release.body.matchAll(new RegExp(`^- \\*\\*${label}\\*\\*:[ \\t]*(\\d+(?:,\\d{3})*)[ \\t]*\\r?$`, 'gm'))];
    const value = matches.length === 1 ? Number(matches[0][1].replaceAll(',', '')) : NaN;
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`Missing or invalid release count: ${label}`);
    stats[key] = value;
  }
  return stats;
}

/** Render all counts and their provenance, rejecting an unexpected template. */
function renderOverview(content, stats) {
  const format = (value) => value.toLocaleString('en-US');
  for (const [key, , color] of FIELDS) {
    const pattern = new RegExp(`(<div className="text-2xl font-bold text-${color}-600">)[\\d,]+(</div>)`, 'g');
    if ([...content.matchAll(pattern)].length !== 1) throw new Error(`Expected one ${key} statistic in the overview`);
    content = content.replace(pattern, (_, before, after) => `${before}${format(stats[key])}${after}`);
  }
  const description = /^description: ".*"$/gm;
  const source = /<Info>\r?\n(?:Last Updated:[^\n]*|Snapshot:[\s\S]*?)\r?\n<\/Info>/g;
  if ([...content.matchAll(description)].length !== 1 || [...content.matchAll(source)].length !== 1) {
    throw new Error('Expected one overview description and snapshot source block');
  }
  const date = new Date(stats.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  content = content.replace(description, `description: "Geographic database snapshot: ${format(stats.countries)} countries, ${format(stats.states)} states and ${format(stats.cities)} city records in SQL, JSON, CSV and more"`);
  return content.replace(source, `<Info>\nSnapshot: [${stats.tag}](${RELEASES_URL}${encodeURIComponent(stats.tag)}), published ${date}. These counts describe that release; API data and package snapshots can differ.\n</Info>`);
}

/** Fetch and validate the latest release before writing the overview. */
async function main() {
  const response = await fetch(RELEASE_API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'csc-docs-stats' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`GitHub release request failed: HTTP ${response.status}`);
  const stats = parseRelease(await response.json());
  const content = await fs.readFile(OVERVIEW_FILE, 'utf8');
  const updated = renderOverview(content, stats);
  if (updated !== content) await fs.writeFile(OVERVIEW_FILE, updated, 'utf8');
  console.log(`Database overview: ${stats.tag}, published ${stats.publishedAt}`);
  console.log(`${stats.countries} countries, ${stats.states} states, ${stats.cities} city records`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Database statistics update failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseRelease, renderOverview };
