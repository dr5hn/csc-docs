# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-05-28

### Added

- **Search Endpoints** group: fuzzy / typo-tolerant search (`GET /v1/search/fuzzy`) for cities, states, and countries using trigram similarity — documents `q`, `type`, `country`, `limit`, `threshold` parameters, the `match_score` / `matched_alias` response fields, native-script matching, and Professional+ tier gating

### Changed

- Updated `llms.txt` to surface the fuzzy search capability for AI assistants

## [1.2.0] - 2026-05-20

### Added

- **Field Filtering & Sorting** cross-cutting guide — documents `?fields=` and `?sort=` syntax, tier gating (Supporter+), per-entity sortable fields, behaviour rules, and error responses
- **ISO Code Endpoints** group: lookup country by alpha-2/alpha-3/numeric, lookup state by ISO 3166-2 subdivision code, convert between ISO formats
- **Phone Endpoints** group: list dial codes with reverse lookup, get dial code by country, parse E.164 phone number into country + national parts
- **Timezone Endpoints** group: timezone by country, state, and city — with DST-aware response (IANA name, abbreviation, std/DST offsets, current-DST flag)
- Per-endpoint `?fields=` / `?sort=` callout on every geographic list and detail page (12 endpoints) linking back to the cross-cutting guide

### Changed

- Updated `llms.txt` to surface the new endpoint groups for AI assistants
- Standardised the "Related Endpoints" footer pattern across the new endpoint pages

## [1.1.0] - 2026-04-03

### Added

- Regions API documentation: 3 new endpoint pages (regions, subregions, countries by subregion)
- Inline search filtering (`?q=`) parameter documented on list endpoints
- Regions Endpoints navigation group

### Changed

- Updated endpoint descriptions to mention search filtering availability (Supporter+)

## [1.0.0] - 2026-03-28

### Added

- API documentation covering endpoints, authentication, and usage
- Changelog, donation, and database documentation pages
- API FAQs section with key request instructions
- Home link to the documentation navbar
- Analytics integration for documentation site
- Custom icons and metadata configuration
- Mintlify-powered documentation site with dev and build scripts

### Changed

- Updated free tier limits from 150 to 100 requests/day and 4,500 to 3,000 requests/month
- Updated API request limits and trial credits across documentation
- Updated export pricing documentation
- Removed rate limit details from public documentation for clarity
- Updated portal links to the new API key management site
- Updated API key request instructions in FAQ
- Improved overall documentation structure and content clarity
- Removed welcome section from index page for cleaner layout

### Fixed

- Corrected documentation URLs and broken links
- Resolved miscellaneous documentation issues and formatting errors

[1.0.0]: https://github.com/dr5hn/docs/releases/tag/v1.0.0
