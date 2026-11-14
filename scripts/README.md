# Documentation Scripts

This directory contains utility scripts for maintaining the documentation.

## Scripts

### update-database-stats.js

Reads the latest stable published GitHub release and refreshes the counts, description and source link in `database/overview.mdx`.

```bash
npm run update-database-stats
npm test
```

The command validates all five displayed counts, the release tag and its publication date before writing. Missing, duplicate or invalid statistics fail with a nonzero exit status and leave the page unchanged. The displayed date is the release publication date, not the day the command ran. Repeating the command for the same release leaves the page unchanged.

The source is the GitHub releases API for `dr5hn/countries-states-cities-database`. API counts and package snapshots can differ from the downloadable release. This command updates the overview only; other dataset counts need their own dated source.

### sync-changelog.js

Synchronizes changelog information across the documentation.

**Usage:**
```bash
# Direct execution
node scripts/sync-changelog.js

# Using npm script
npm run sync-changelog
```

## Adding New Scripts

When adding new utility scripts:

1. Place the script file in the `scripts/` directory
2. Add appropriate error handling and logging
3. Add the script to `package.json` scripts section
4. Document the script usage in this README
5. Test the script thoroughly before committing

## Requirements

- Node.js 18+ (for built-in fetch and modern JavaScript features)
- Internet connection (for scripts that fetch external data)
