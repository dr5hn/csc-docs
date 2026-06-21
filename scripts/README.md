# Documentation Scripts

This directory contains utility scripts for maintaining the documentation.

## Scripts

### update-database-stats.js

Automatically fetches the latest database statistics from the [Countries States Cities Database GitHub repository](https://github.com/dr5hn/countries-states-cities-database) and updates the `database/overview.mdx` file.

**Usage:**
```bash
# Direct execution
node scripts/update-database-stats.js

# Using npm script
npm run update-database-stats
```

**What it does:**
1. Fetches the README.md content from the GitHub repository
2. Parses the "Insights" section to extract current statistics:
   - Total Regions
   - Total Subregions
   - Total Countries
   - Total States/Regions/Municipalities
   - Total Cities/Towns/Districts
3. Updates the statistics display in `database/overview.mdx`
4. Updates the "Last Updated" date to the current date

**Example output:**
```
🔍 Fetching database statistics from GitHub...
✅ Successfully fetched README content
📊 Parsed statistics:
   Regions: 6
   Subregions: 22
   Countries: 250
   States: 5,299
   Cities: 153,765

📝 Updating overview.mdx file...
✅ Successfully updated overview.mdx with new statistics

🎉 Successfully updated database statistics!
📅 Updated date: 21st June 2026
```

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
