#!/usr/bin/env node

/**
 * Tier Matrix Sync Script for Country State City Documentation
 *
 * Reads field-access mappings from csc-app's source-of-truth files and
 * rewrites the marker-delimited "Tier-Based Field Availability" tables
 * in api/endpoints/*.mdx, so docs stay in sync with the live filtering logic.
 *
 * Sources read (from csc-app/api/src):
 *   services/dataAccessService.ts → FIELD_ACCESS (entity → level → fields)
 *   config/pricingTiers.ts        → TIER_DEFAULTS (plan → dataAccessLevel)
 *
 * Markers expected in each MDX file:
 *   <!-- AUTOGEN:tier-matrix:<entity> START -->
 *   ...generated table...
 *   <!-- AUTOGEN:tier-matrix:<entity> END -->
 *
 * Files without a marker are skipped, so docs that use inline tier annotations
 * (regions, subregions) are unaffected.
 *
 * Usage:
 *   node scripts/sync-tier-matrices.js              # rewrite in place
 *   node scripts/sync-tier-matrices.js --check      # exit 1 if drift (for CI)
 *   node scripts/sync-tier-matrices.js --source X   # explicit csc-app/api/src path
 *
 * Source path resolution (first match wins):
 *   --source <path>       CLI arg
 *   CSC_APP_SRC env var   Environment override
 *   ../csc-app/api/src    Default (sibling checkout of csc-app)
 */

const fs = require('fs');
const path = require('path');

const MARKER_START = /<!--\s*AUTOGEN:tier-matrix:(\w+)\s+START\s*-->/;
const MARKER_END = /<!--\s*AUTOGEN:tier-matrix:(\w+)\s+END\s*-->/;

const KNOWN_TIERS = ['community', 'starter', 'supporter', 'professional', 'business', 'legacy'];
const ACCESS_LEVELS = ['basic', 'coordinates', 'full'];

/**
 * Parse the FIELD_ACCESS object literal in dataAccessService.ts.
 *
 * The source structure is well-known:
 *   const FIELD_ACCESS: ... = {
 *     <entity>: {
 *       basic: ['id', 'name', ...],
 *       coordinates: [...],
 *       full: [...],
 *     },
 *     ...
 *   };
 *
 * We use a targeted regex rather than a TS parser to keep the script
 * dependency-free. Brittle if the literal shape changes — paired with
 * --check in CI, drift surfaces quickly.
 */
function parseFieldAccess(tsContent) {
    const entityRegex = /(\w+):\s*\{\s*basic:\s*\[([^\]]+)\][\s,]*coordinates:\s*\[([^\]]+)\][\s,]*full:\s*\[([^\]]+)\][\s,]*\}/g;
    const result = {};
    for (const m of tsContent.matchAll(entityRegex)) {
        const [, entity, basicRaw, coordRaw, fullRaw] = m;
        result[entity] = {
            basic: parseFieldList(basicRaw),
            coordinates: parseFieldList(coordRaw),
            full: parseFieldList(fullRaw),
        };
    }
    if (Object.keys(result).length === 0) {
        throw new Error('Could not parse any entities from FIELD_ACCESS — has dataAccessService.ts changed shape?');
    }
    return result;
}

/**
 * Turn a raw array-literal body like "\n  'id',\n  'name',\n" into ['id', 'name'].
 */
function parseFieldList(raw) {
    return raw
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
}

/**
 * Parse the TIER_DEFAULTS object in pricingTiers.ts to extract
 * each plan's dataAccessLevel. We use [^{}] to stay inside one tier
 * block at a time and not bleed into the nested features object.
 */
function parseTierDefaults(tsContent) {
    const block = tsContent.match(/TIER_DEFAULTS[^=]*=\s*\{([\s\S]+?)\n\};/);
    if (!block) {
        throw new Error('Could not find TIER_DEFAULTS in pricingTiers.ts');
    }
    const tierRegex = /(\w+):\s*\{[^{}]*dataAccessLevel:\s*'(\w+)'/g;
    const result = {};
    for (const m of block[1].matchAll(tierRegex)) {
        result[m[1]] = m[2];
    }
    if (Object.keys(result).length === 0) {
        throw new Error('Parsed TIER_DEFAULTS block but found no dataAccessLevel entries');
    }
    return result;
}

/**
 * Build the markdown table for one entity.
 *
 * Coordinates and Full rows use "All Basic **+** ..." / "All Coordinates **+** ..."
 * to avoid repeating the lower-tier fields — matches the existing hand-written style.
 */
function generateMatrix(entity, fieldAccess, tierDefaults) {
    const fields = fieldAccess[entity];
    if (!fields) {
        throw new Error(`Unknown entity '${entity}' — not present in FIELD_ACCESS`);
    }

    const plansByLevel = { basic: [], coordinates: [], full: [] };
    for (const tier of KNOWN_TIERS) {
        const level = tierDefaults[tier];
        if (!level) continue;
        if (!plansByLevel[level]) {
            throw new Error(`Tier '${tier}' has unknown dataAccessLevel '${level}'`);
        }
        plansByLevel[level].push(capitalize(tier));
    }

    const fmt = (arr) => arr.map((f) => `\`${f}\``).join(', ');
    const planList = (level) => plansByLevel[level].join(', ') || '—';

    return [
        '| Tier | Plans | Fields |',
        '|------|-------|--------|',
        `| **Basic** | ${planList('basic')} | ${fmt(fields.basic)} |`,
        `| **Coordinates** | ${planList('coordinates')} | All Basic **+** ${fmt(fields.coordinates)} |`,
        `| **Full** | ${planList('full')} | All Coordinates **+** ${fmt(fields.full)} |`,
    ].join('\n');
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Walk a file line by line, rewriting any marker-delimited blocks.
 * Returns { content, modified } so callers can decide whether to write.
 */
function rewriteFile(filePath, fieldAccess, tierDefaults) {
    const original = fs.readFileSync(filePath, 'utf8');
    const lines = original.split('\n');
    const out = [];
    let modified = false;

    let i = 0;
    while (i < lines.length) {
        const startMatch = lines[i].match(MARKER_START);
        if (!startMatch) {
            out.push(lines[i]);
            i++;
            continue;
        }

        const entity = startMatch[1];
        const startLine = lines[i];

        let j = i + 1;
        while (j < lines.length) {
            const endMatch = lines[j].match(MARKER_END);
            if (endMatch) {
                if (endMatch[1] !== entity) {
                    throw new Error(
                        `${path.basename(filePath)}: marker mismatch — START is '${entity}' but END is '${endMatch[1]}'`
                    );
                }
                break;
            }
            j++;
        }
        if (j === lines.length) {
            throw new Error(`${path.basename(filePath)}: unclosed AUTOGEN marker for '${entity}'`);
        }

        const oldBlock = lines.slice(i + 1, j).join('\n');
        const newBlock = generateMatrix(entity, fieldAccess, tierDefaults);

        out.push(startLine);
        out.push(newBlock);
        out.push(lines[j]);

        if (oldBlock.trim() !== newBlock.trim()) {
            modified = true;
        }
        i = j + 1;
    }

    return { content: out.join('\n'), modified };
}

function resolveSourcePath(args) {
    const sourceIdx = args.indexOf('--source');
    if (sourceIdx >= 0) {
        const next = args[sourceIdx + 1];
        if (!next) {
            throw new Error('--source flag requires a path argument');
        }
        return path.resolve(next);
    }
    if (process.env.CSC_APP_SRC) {
        return path.resolve(process.env.CSC_APP_SRC);
    }
    return path.resolve(__dirname, '../../csc-app/api/src');
}

function main() {
    const args = process.argv.slice(2);
    const checkMode = args.includes('--check');
    const sourcePath = resolveSourcePath(args);

    const dataAccessFile = path.join(sourcePath, 'services/dataAccessService.ts');
    const pricingFile = path.join(sourcePath, 'config/pricingTiers.ts');

    for (const f of [dataAccessFile, pricingFile]) {
        if (!fs.existsSync(f)) {
            console.error(`❌ Cannot find source file: ${f}`);
            console.error(`   Pass --source <csc-app/api/src> or set CSC_APP_SRC.`);
            process.exit(1);
        }
    }

    const fieldAccess = parseFieldAccess(fs.readFileSync(dataAccessFile, 'utf8'));
    const tierDefaults = parseTierDefaults(fs.readFileSync(pricingFile, 'utf8'));

    for (const level of ACCESS_LEVELS) {
        const found = KNOWN_TIERS.some((t) => tierDefaults[t] === level);
        if (!found) {
            console.warn(`⚠️  No plan currently has access level '${level}' — generated rows will be empty.`);
        }
    }

    const endpointsDir = path.join(__dirname, '../api/endpoints');
    const files = fs.readdirSync(endpointsDir).filter((f) => f.endsWith('.mdx'));

    let driftCount = 0;
    let touched = 0;
    const driftedFiles = [];

    for (const file of files) {
        const filePath = path.join(endpointsDir, file);
        const original = fs.readFileSync(filePath, 'utf8');
        if (!MARKER_START.test(original)) continue;

        touched++;
        const { content, modified } = rewriteFile(filePath, fieldAccess, tierDefaults);

        if (modified) {
            driftCount++;
            driftedFiles.push(file);
            if (checkMode) {
                console.error(`⚠️  Drift detected: ${file}`);
            } else {
                fs.writeFileSync(filePath, content);
                console.log(`✅ Updated: ${file}`);
            }
        }
    }

    if (touched === 0) {
        console.warn('⚠️  No files contain AUTOGEN:tier-matrix markers — nothing to do.');
        return;
    }

    if (checkMode) {
        if (driftCount > 0) {
            console.error(`\n❌ ${driftCount} file(s) have drift from source. Run \`npm run sync-tier-matrices\` to regenerate.`);
            process.exit(1);
        }
        console.log(`✅ All ${touched} tier matrices are in sync.`);
        return;
    }

    if (driftCount === 0) {
        console.log(`✅ All ${touched} tier matrices already up to date.`);
    } else {
        console.log(`\n✅ Regenerated ${driftCount} of ${touched} file(s).`);
    }
}

try {
    main();
} catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
}
