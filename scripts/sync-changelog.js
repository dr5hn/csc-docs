#!/usr/bin/env node

/**
 * GitHub Changelog Sync Script for Country State City Documentation
 * Fetches releases from GitHub API and updates the changelog.mdx file
 * 
 * Usage: GITHUB_TOKEN=your_token node scripts/sync-changelog.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const REPO = 'dr5hn/countries-states-cities-database';
const CHANGELOG_PATH = path.join(__dirname, '../changelog.mdx');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    console.log('Usage: GITHUB_TOKEN=your_token node scripts/sync-changelog.js');
    process.exit(1);
}

/**
 * Fetch GitHub releases using the GitHub API
 */
function fetchGitHubReleases() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${REPO}/releases`,
            method: 'GET',
            headers: {
                'User-Agent': 'CSC-Docs-Sync/1.0',
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error(`Failed to parse JSON: ${error.message}`));
                    }
                } else {
                    reject(new Error(`GitHub API error: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Parse release body and extract meaningful content
 */
function parseReleaseBody(body, tagName) {
    if (!body) return { features: [], improvements: [], fixes: [], breaking: false };

    const lines = body.split('\n').map(line => line.trim()).filter(line => line);
    let breaking = false;
    const features = [];
    const improvements = [];  
    const fixes = [];

    // Check for breaking changes
    if (body.toLowerCase().includes('breaking change') || body.toLowerCase().includes('!!breaking')) {
        breaking = true;
    }

    // Extract bullet points and categorize them
    for (const line of lines) {
        if (line.startsWith('* ') || line.startsWith('- ')) {
            const item = line.substring(2).trim();
            
            // Skip contributor lines
            if (item.includes('made their first contribution') || 
                item.includes('@') && item.includes('in #') ||
                item.includes('Full Changelog')) {
                continue;
            }

            // Categorize based on keywords
            const lowerItem = item.toLowerCase();
            if (lowerItem.includes('fix') || lowerItem.includes('resolve') || lowerItem.includes('solved')) {
                fixes.push(item);
            } else if (lowerItem.includes('add') || lowerItem.includes('new') || 
                      lowerItem.includes('support') && !lowerItem.includes('fix')) {
                features.push(item);
            } else {
                improvements.push(item);
            }
        }
    }

    return { features, improvements, fixes, breaking };
}

/**
 * Generate Mintlify Update component from release data
 */
function generateUpdateComponent(release) {
    const { features, improvements, fixes, breaking } = parseReleaseBody(release.body, release.tag_name);
    const date = formatDate(release.published_at);
    
    let content = `<Update label="${release.tag_name}" description="Released ${date}">\n`;

    // Add breaking change warning
    if (breaking) {
        // Extract breaking change description from body
        const breakingMatch = release.body?.match(/BREAKING CHANGE[:\s]*(.*?)$/im);
        const breakingDesc = breakingMatch ? breakingMatch[1].trim() : 'This release contains breaking changes.';
        
        content += `<Warning>\n${breakingDesc}\n</Warning>\n\n`;
    }

    // Add sections if they have content
    if (features.length > 0) {
        content += `## New Features\n`;
        features.slice(0, 8).forEach(feature => {
            content += `- ${feature}\n`;
        });
        content += '\n';
    }

    if (improvements.length > 0) {
        content += `## Improvements\n`;
        improvements.slice(0, 8).forEach(improvement => {
            content += `- ${improvement}\n`;
        });
        content += '\n';
    }

    if (fixes.length > 0) {
        content += `## Bug Fixes\n`;
        fixes.slice(0, 8).forEach(fix => {
            content += `- ${fix}\n`;
        });
        content += '\n';
    }

    content += `</Update>\n`;
    return content;
}

/**
 * Generate complete changelog content
 */
function generateChangelogContent(releases) {
    const frontMatter = `---
title: "Changelog"
description: "Track the latest updates, improvements, and changes to the Country State City ecosystem including API, database, and tools."
icon: "clock"
---

# Changelog

Stay up-to-date with the latest improvements, new features, and changes across the Country State City ecosystem.

<Info>
This changelog is automatically synced from [GitHub releases](https://github.com/dr5hn/countries-states-cities-database/releases). For detailed technical information, visit the repository.
</Info>

`;

    let content = frontMatter;
    
    // Group releases by year
    const releasesByYear = {};
    releases.forEach(release => {
        const year = new Date(release.published_at).getFullYear();
        if (!releasesByYear[year]) {
            releasesByYear[year] = [];
        }
        releasesByYear[year].push(release);
    });

    // Generate content by year (newest first)
    const years = Object.keys(releasesByYear).sort((a, b) => b - a);
    
    years.forEach(year => {
        content += `## ${year}\n\n`;
        
        // Sort releases within year by date (newest first)
        const yearReleases = releasesByYear[year].sort((a, b) => 
            new Date(b.published_at) - new Date(a.published_at)
        );

        yearReleases.forEach(release => {
            content += generateUpdateComponent(release);
            content += '\n';
        });
    });

    // Add footer content
    content += `## Release Information

<Tip>
Our releases follow semantic versioning (SemVer) with the following format:
- **Major.Minor.Patch** (e.g., 3.0.0)
- **Major**: Breaking changes requiring migration
- **Minor**: New features with backward compatibility  
- **Patch**: Bug fixes and minor improvements
</Tip>

## Stay Updated

<CardGroup cols={2}>
<Card title="GitHub Releases" icon="github" href="https://github.com/dr5hn/countries-states-cities-database/releases">
  Get notified about new releases and download assets directly from GitHub.
</Card>

<Card title="API Portal" icon="globe" href="https://countrystatecity.in">
  Access the API and get your developer key for integration.
</Card>
</CardGroup>

## Contributing to Updates

We welcome community contributions to keep our geographical data accurate and up-to-date.

<Steps>
<Step title="Identify Changes">
  Notice outdated or incorrect geographical information? Check our data against official government sources.
</Step>

<Step title="Use Update Tool">
  Submit changes through our [Update Tool](/tools/update-tool) with proper documentation and sources.
</Step>

<Step title="Review Process">
  Our team reviews all submissions for accuracy and integrates approved changes into the next release.
</Step>
</Steps>

<Info>
All major data updates are tested extensively before release to ensure accuracy and maintain API compatibility.
</Info>
`;

    return content;
}

/**
 * Main sync function
 */
async function syncChangelog() {
    try {
        console.log('🔄 Fetching releases from GitHub...');
        const releases = await fetchGitHubReleases();
        
        console.log(`📦 Found ${releases.length} releases`);
        
        // Create backup
        if (fs.existsSync(CHANGELOG_PATH)) {
            const backupPath = CHANGELOG_PATH + '.backup';
            fs.copyFileSync(CHANGELOG_PATH, backupPath);
            console.log(`💾 Backup created: ${backupPath}`);
        }
        
        // Generate new changelog content
        const changelogContent = generateChangelogContent(releases);
        
        // Write to file
        fs.writeFileSync(CHANGELOG_PATH, changelogContent, 'utf8');
        
        console.log('✅ Changelog synced successfully!');
        console.log(`📝 Updated ${path.relative(process.cwd(), CHANGELOG_PATH)} with ${releases.length} releases`);
        
        // Display latest releases
        console.log('\n📋 Latest releases synced:');
        releases.slice(0, 5).forEach(release => {
            const indicator = release.prerelease ? '🧪' : '🏷️';
            console.log(`   ${indicator} ${release.tag_name} - ${formatDate(release.published_at)}`);
        });
        
    } catch (error) {
        console.error('❌ Error syncing changelog:', error.message);
        
        if (error.message.includes('401')) {
            console.log('\n💡 Make sure your GitHub token has the correct permissions.');
        }
        
        process.exit(1);
    }
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(__filename);
if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
}

// Run the sync when called directly
if (require.main === module) {
    syncChangelog();
}

module.exports = { syncChangelog, fetchGitHubReleases };
