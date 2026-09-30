# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Mintlify-based documentation site for the Country State City (CSC) ecosystem. The ecosystem includes:
- **CSC API**: REST API for 250+ countries, 5,299+ states, 153,765+ cities
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

Both scripts use Node.js 18+ built-in fetch and include comprehensive error handling.

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

## Status Tracking

All CSC status goes in one shared doc, the **CSC Ecosystem Tracker**. Never create a separate tracker, handover or
status page. If you cannot open the doc (no access or no Claude Docs connector), skip this section.

- Doc: https://claude.ai/code/artifact/3d349193-5909-4e99-9376-849c02dd7b31. Edit it only with the Claude Docs
  connector (read / update / batch). Container: `{"kind":"project","id":"3d349193-5909-4e99-9376-849c02dd7b31"}`.
- This repo's row in *Projects*: "Docs".
- **Tracker** tab (node `01507658-75c4`) has these sections:
  - *Waiting on you*: the owner's to-dos, as a checklist.
  - *Projects*: one row per repo. Update "Live now" after every deploy.
  - *Open work*: Item | Project | Priority | Status | Next step.
  - *Recently done*: Date | Project | What. Newest first, one line per merge or deploy.
- **Data accuracy** tab (node `3b635a83-1a21`): the countries-states-cities-database data-correctness audit.
- **Rollout log (26–29 Sep)**: history. Don't edit it.
- Dropdowns are set by index:
  - Priority, enum `788341cc-02a9`: 0 High, 1 Medium, 2 Low.
  - Work status, enum `fee57e4e-1681`: 0 Not started, 1 In progress, 2 Waiting on you, 3 Done.
  - Data status, enum `7d0788bc-c449`: 0 Needs decision, 1 In review, 2 Verified, 3 Found, 4 To audit, 5 Done.

Rules:
1. Update the doc after every PR opened or merged, deploy, review round, incident or customer-affecting action,
   as part of finishing that step. Don't wait to be asked.
2. Other sessions edit the doc too. Read it with `{"kind":"view","sinceRev":<your last rev>}` before writing.
   If a guard fails, keep their edit and re-apply yours on top.
3. Change only your own rows. Keep cells short and plain, and link PRs.
4. Anything the owner must do or decide goes in *Waiting on you*. Tick it when it's done.
5. Never put secrets, API keys or customer emails in the doc. Refer to customers by user ID.
