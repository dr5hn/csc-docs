# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Mintlify-based documentation site for the Country State City (CSC) ecosystem. The ecosystem includes:
- **CSC API**: REST API for 247+ countries, 5,000+ states, 150,000+ cities
- **Database**: Self-hosted geographical data in multiple formats
- **Update Tool**: Community data submission and corrections
- **Export Tool**: Data export in JSON, CSV, SQL, XML formats
- **AI Tools**: Integration guides for Claude Code, Cursor, Windsurf

## Development Commands

### Local Development
```bash
# Install dependencies (if needed)
npm install

# Start local dev server (opens on localhost:3000)
npm run dev
# or
mint dev
```

### Production Build
```bash
npm run build
```

### Utility Scripts
```bash
# Sync changelog from API
npm run sync-changelog

# Update database statistics from GitHub
npm run update-database-stats

# Regenerate per-tier field-availability tables from csc-app sources
npm run sync-tier-matrices

# CI-friendly drift check (exits 1 on drift, no writes)
npm run check-tier-matrices
```

## Architecture & Structure

### Documentation Platform
- **Framework**: Mintlify (MDX with YAML frontmatter)
- **Configuration**: `docs.json` controls navigation, theme, integrations
- **Auto-deployment**: Pushes to `main` branch automatically deploy to production

### Content Organization
Documentation is organized into 4 main tabs (configured in `docs.json`):

1. **Home** (`index.mdx`, `changelog.mdx`)
   - Landing page and changelog

2. **API** (`api/` directory)
   - `introduction.mdx`, `authentication.mdx`, `rate-limits.mdx`, `faq.mdx`
   - `endpoints/` - Individual endpoint documentation
   - `sdks.mdx`, `examples.mdx` - Integration examples

3. **Tools** (`tools/` directory)
   - `overview.mdx`
   - `update-tool/` - Data submission workflow docs
   - `export-tool/` - Data export functionality docs

4. **Database** (`database/` directory)
   - `overview.mdx`, `schema.mdx`, `contributing.mdx`
   - `installation/` - Platform-specific installation guides (MySQL, PostgreSQL, SQLite, MongoDB, SQL Server, DuckDB)

5. **AI Tools** (`ai-tools/` directory)
   - `claude-code.mdx`, `cursor.mdx`, `windsurf.mdx`

### Scripts Architecture
Located in `scripts/` directory:

- **sync-changelog.js**: Fetches and synchronizes changelog data
- **update-database-stats.js**: Fetches latest stats from GitHub repo and updates `database/overview.mdx`
- **sync-tier-matrices.js**: Reads `services/dataAccessService.ts` and `config/pricingTiers.ts` from csc-app and rewrites `<!-- AUTOGEN:tier-matrix:<entity> -->` blocks in `api/endpoints/*.mdx`. Source path defaults to `../csc-app/api/src` (sibling checkout); override with `--source <path>` or `CSC_APP_SRC` env. Run `--check` mode in CI to fail on drift.

All scripts use Node.js 18+ built-in fetch and include comprehensive error handling.

### Tier-Matrix Drift Workflow

The "Tier-Based Field Availability" tables in each endpoint doc are generated from csc-app's source-of-truth files. After any change to `dataAccessService.ts` (which fields each access level returns) or `pricingTiers.ts` (which plans map to which `dataAccessLevel`), regenerate the docs:

```bash
cd /path/to/csc-docs
npm run sync-tier-matrices
git diff   # inspect the regenerated tables
```

To add a tier matrix to a new endpoint doc, wrap a placeholder with the markers and run the generator:

```mdx
<!-- AUTOGEN:tier-matrix:countries START -->
<!-- AUTOGEN:tier-matrix:countries END -->
```

Valid entity names: `countries`, `states`, `cities`, `regions`, `subregions` (whatever keys exist in `FIELD_ACCESS` in csc-app).

## Writing Guidelines

### Technical Writing Standards
All documentation follows strict technical writing standards (defined in `.cursor/rules/`):

- **Voice**: Second person ("you") for instructions, active voice, present tense
- **Structure**: Progressive disclosure (basic → advanced), inverted pyramid
- **Components**: Use Mintlify components appropriately (see below)

### Consistent Data Examples
Always use these examples when documenting:

**Countries:**
- United States (US), India (IN), United Kingdom (GB)

**States:**
- California (US-CA), Maharashtra (IN-MH), England (GB-ENG)

**Cities:**
- Los Angeles, Mumbai, London

**API Details:**
- Base URL: `https://api.countrystatecity.in/v1`
- Header: `X-CSCAPI-KEY` for authentication

### Required Page Structure
Every MDX file must start with YAML frontmatter:

```yaml
---
title: "Clear, specific title"
description: "Concise description of page purpose"
icon: "icon-name"  # Optional
---
```

### Mintlify Components Guide

**Callouts:**
- `<Note>` - Supplementary information
- `<Tip>` - Best practices
- `<Warning>` - Critical cautions
- `<Info>` - Contextual information
- `<Check>` - Success confirmations

**Code:**
- Single code blocks: Specify language and filename
- `<CodeGroup>` - Multiple language examples
- `<RequestExample>` / `<ResponseExample>` - API documentation

**Structure:**
- `<Steps>` + `<Step>` - Sequential procedures
- `<Tabs>` + `<Tab>` - Platform-specific content
- `<AccordionGroup>` + `<Accordion>` - Collapsible content
- `<Card>` / `<CardGroup>` - Feature highlights

**API Documentation:**
- `<ParamField>` - Document parameters (path, body, query, header)
- `<ResponseField>` - Document response fields
- `<Expandable>` - Nested object properties

**Media:**
- `<Frame>` - Wrap all images

### Terminology Standards
- "Country State City API" (not "CSC API")
- "geographical data" (not "geo data")
- "API key" (not "API token")
- "endpoint" (not "API call")
- "rate limit" (not "throttling")

## Code Example Standards

All code examples must:
- Be complete and runnable
- Include proper error handling
- Use realistic CSC data (not placeholders)
- Show expected outputs
- Never include real API keys (use `YOUR_API_KEY` placeholder)
- Include comments for complex logic

## Cross-Product Integration

When documenting features:
- Explain how components relate across the ecosystem (API ↔ Database ↔ Tools)
- Include migration paths between data formats
- Reference related tools and workflows
- Maintain data consistency examples

## Important Files

- `docs.json` - Navigation structure, theme, integrations (GA4, social links)
- `.cursor/rules/project-specs.mdc` - CSC-specific writing guidelines
- `.cursor/rules/technical-writing.mdc` - General Mintlify technical writing rules
- `llms.txt` - LLM-optimized project context summary

## Testing Documentation Changes

1. Run `npm run dev` (or `mint dev`)
2. Navigate to `localhost:3000`
3. Verify:
   - Navigation works correctly
   - Code examples are formatted properly
   - Components render as expected
   - Links are not broken
   - Images load correctly

## Deployment

- **Auto-deploy**: Changes pushed to `main` branch deploy automatically via Mintlify GitHub integration
- **Manual build**: Run `npm run build` if needed for local verification
