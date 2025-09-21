#!/usr/bin/env node

/**
 * Script to fetch database statistics from GitHub repository and update overview.mdx
 * Usage: node scripts/update-database-stats.js
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const GITHUB_README_URL = 'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/README.md';
const OVERVIEW_FILE = path.join(__dirname, '../database/overview.mdx');

/**
 * Fetch content from GitHub README
 */
async function fetchGitHubReadme() {
  return new Promise((resolve, reject) => {
    https.get(GITHUB_README_URL, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: Failed to fetch README`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parse statistics from README content
 */
function parseStatistics(readmeContent) {
  const stats = {
    regions: null,
    subregions: null,
    countries: null,
    states: null,
    cities: null
  };

  // The GitHub README has statistics in the "Insights" section with this format:
  // Total Regions : 6 <br>
  // Total Sub Regions : 22 <br>
  // Total Countries : 250 <br>
  // Total States/Regions/Municipalities : 5,038 <br>
  // Total Cities/Towns/Districts : 151,024 <br>

  const patterns = [
    /Total\s+Regions?\s*:\s*(\d+(?:,\d+)*)/i,
    /Total\s+Sub\s+Regions?\s*:\s*(\d+(?:,\d+)*)/i,
    /Total\s+Countries?\s*:\s*(\d+(?:,\d+)*)/i,
    /Total\s+States?(?:\/Regions?\/Municipalities?)?\s*:\s*(\d+(?:,\d+)*)/i,
    /Total\s+Cities?(?:\/Towns?\/Districts?)?\s*:\s*(\d+(?:,\d+)*)/i
  ];

  // Parse each statistic
  const regionMatch = readmeContent.match(patterns[0]);
  const subregionMatch = readmeContent.match(patterns[1]);
  const countryMatch = readmeContent.match(patterns[2]);
  const stateMatch = readmeContent.match(patterns[3]);
  const cityMatch = readmeContent.match(patterns[4]);
  
  if (regionMatch) stats.regions = parseInt(regionMatch[1].replace(/,/g, ''));
  if (subregionMatch) stats.subregions = parseInt(subregionMatch[1].replace(/,/g, ''));
  if (countryMatch) stats.countries = parseInt(countryMatch[1].replace(/,/g, ''));
  if (stateMatch) stats.states = parseInt(stateMatch[1].replace(/,/g, ''));
  if (cityMatch) stats.cities = parseInt(cityMatch[1].replace(/,/g, ''));

  return stats;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Get current date in the format used in the file
 */
function getCurrentDate() {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  // Add ordinal suffix
  const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 || Math.floor(day / 10) === 1 ? 0 : day % 10];
  
  return `${day}${suffix} ${month} ${year}`;
}

/**
 * Update the overview.mdx file with new statistics
 */
async function updateOverviewFile(stats) {
  try {
    let content = await fs.readFile(OVERVIEW_FILE, 'utf8');
    let updated = false;

    // Update each statistic if we found it
    if (stats.regions !== null) {
      content = content.replace(
        /<div className="text-2xl font-bold text-blue-600">\d+(?:,\d+)*<\/div>/,
        `<div className="text-2xl font-bold text-blue-600">${formatNumber(stats.regions)}</div>`
      );
      updated = true;
    }

    if (stats.subregions !== null) {
      content = content.replace(
        /<div className="text-2xl font-bold text-green-600">\d+(?:,\d+)*<\/div>/,
        `<div className="text-2xl font-bold text-green-600">${formatNumber(stats.subregions)}</div>`
      );
      updated = true;
    }

    if (stats.countries !== null) {
      content = content.replace(
        /<div className="text-2xl font-bold text-purple-600">\d+(?:,\d+)*<\/div>/,
        `<div className="text-2xl font-bold text-purple-600">${formatNumber(stats.countries)}</div>`
      );
      updated = true;
    }

    if (stats.states !== null) {
      content = content.replace(
        /<div className="text-2xl font-bold text-orange-600">\d+(?:,\d+)*<\/div>/,
        `<div className="text-2xl font-bold text-orange-600">${formatNumber(stats.states)}</div>`
      );
      updated = true;
    }

    if (stats.cities !== null) {
      content = content.replace(
        /<div className="text-2xl font-bold text-red-600">\d+(?:,\d+)*<\/div>/,
        `<div className="text-2xl font-bold text-red-600">${formatNumber(stats.cities)}</div>`
      );
      updated = true;
    }

    // Update the last updated date
    if (updated) {
      const currentDate = getCurrentDate();
      content = content.replace(
        /Last Updated: [^<]+/,
        `Last Updated: ${currentDate}`
      );

      // Also update the description in frontmatter if numbers changed significantly
      if (stats.countries !== null && stats.states !== null && stats.cities !== null) {
        const countriesK = Math.floor(stats.countries / 50) * 50; // Round down to nearest 50
        const statesK = Math.floor(stats.states / 500) * 500; // Round down to nearest 500  
        const citiesK = Math.floor(stats.cities / 1000) * 1000; // Round down to nearest 1000
        
        content = content.replace(
          /description: "Complete geographical database with \d+\+ countries, \d+\+ states, and \d+\+ cities in multiple formats"/,
          `description: "Complete geographical database with ${countriesK}+ countries, ${Math.floor(statesK/1000)}k+ states, and ${Math.floor(citiesK/1000)}k+ cities in multiple formats"`
        );
      }

      await fs.writeFile(OVERVIEW_FILE, content, 'utf8');
      console.log('✅ Successfully updated overview.mdx with new statistics');
    } else {
      console.log('ℹ️  No statistics found to update');
    }

    return updated;
  } catch (error) {
    throw new Error(`Failed to update overview file: ${error.message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔍 Fetching database statistics from GitHub...');
    
    const readmeContent = await fetchGitHubReadme();
    console.log('✅ Successfully fetched README content');
    
    const stats = parseStatistics(readmeContent);
    console.log('📊 Parsed statistics:');
    console.log(`   Regions: ${stats.regions || 'Not found'}`);
    console.log(`   Subregions: ${stats.subregions || 'Not found'}`);
    console.log(`   Countries: ${stats.countries || 'Not found'}`);
    console.log(`   States: ${stats.states || 'Not found'}`);
    console.log(`   Cities: ${stats.cities || 'Not found'}`);
    
    // Check if we found any statistics
    const foundStats = Object.values(stats).filter(v => v !== null).length;
    if (foundStats === 0) {
      console.log('❌ No statistics found in README. The format may have changed.');
      console.log('📝 README preview:');
      console.log(readmeContent.substring(0, 500) + '...');
      return;
    }
    
    console.log(`\n📝 Updating overview.mdx file...`);
    const updated = await updateOverviewFile(stats);
    
    if (updated) {
      console.log(`\n🎉 Successfully updated database statistics!`);
      console.log(`📅 Updated date: ${getCurrentDate()}`);
    } else {
      console.log('\n⚠️  No updates were made to the file');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchGitHubReadme, parseStatistics, updateOverviewFile };
