# Country State City Documentation

> Comprehensive documentation for the Country State City (CSC) ecosystem - your complete solution for geographical data integration.

[![Documentation Status](https://img.shields.io/badge/docs-online-brightgreen)](https://docs.countrystatecity.in)
[![API Status](https://img.shields.io/badge/api-live-brightgreen)](https://countrystatecity.in)
[![GitHub](https://img.shields.io/badge/github-dr5hn%2Fcountries--states--cities--database-blue)](https://github.com/dr5hn/countries-states-cities-database)

## About the CSC Ecosystem

The Country State City ecosystem is a complete geographical data solution that provides developers with:

- **REST API**: Access to 247+ countries, 5,000+ states/provinces, and 150,000+ cities
- **Database**: Ready-to-use geographical data in multiple database formats
- **Tools**: Export and update tools for data management
- **SDKs**: Official libraries for popular programming languages

## Documentation Structure

This documentation covers four main areas:

### 🌐 API Documentation
- Authentication and security
- Countries, states, and cities endpoints
- SDKs and integration examples
- Request/response specifications

### 🗄️ Database Documentation  
- Schema and data structure
- Installation guides for major databases:
  - MySQL, PostgreSQL, SQLite
  - MongoDB, SQL Server, DuckDB
- Contributing guidelines

### 🛠️ Tools Documentation
- **Update Tool**: Submit data corrections and additions
- **Export Tool**: Download data in various formats (JSON, CSV, SQL, XML)
- Integration workflows

### 🤖 AI Tools Integration
- Claude Code integration
- Cursor AI setup
- Windsurf configuration

## Quick Links

- 🌍 **[API Portal](https://countrystatecity.in)** - Get your API key
- 📚 **[Live Documentation](https://docs.countrystatecity.in)** - Browse the docs online  
- 🔧 **[GitHub Repository](https://github.com/dr5hn/countries-states-cities-database)** - Source code
- 💝 **[Support the Project](https://docs.countrystatecity.in/donate)** - Help us maintain the service

## Development Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone [repository-url]
   cd docs
   npm install
   ```

2. **Install Mintlify CLI globally:**
   ```bash
   npm install -g mint
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   # or
   mint dev
   ```

4. **View documentation:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build documentation for production
- `npm run sync-changelog` - Sync changelog from API

## Contributing

We welcome contributions to improve the documentation! Here's how you can help:

### Documentation Improvements
1. Fork this repository
2. Create a feature branch (`git checkout -b improve-docs`)
3. Make your changes following our [writing guidelines](.cursor/rules/technical-writing.mdc)
4. Test locally with `npm run dev`
5. Submit a pull request

### Data Updates
For geographical data corrections or additions, please use our [Update Tool](https://docs.countrystatecity.in/tools/update-tool) rather than direct pull requests.

## Documentation Guidelines

This documentation follows industry-standard technical writing practices:

- **Clear, direct language** appropriate for technical audiences
- **Second person voice** ("you") for instructions
- **Active voice** and present tense
- **Progressive disclosure** from basic to advanced concepts
- **Complete, runnable code examples**
- **Proper error handling** in all examples

All documentation is built with [Mintlify](https://mintlify.com) and uses MDX format with YAML frontmatter.

## Support & Contact

- 📧 **Email**: [api@countrystatecity.in](mailto:api@countrystatecity.in)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/dr5hn/countries-states-cities-database/issues)
- 💬 **Community**: Join our community discussions
- 📖 **Documentation Issues**: Open an issue in this repository

## Deployment

Documentation is automatically deployed to production when changes are pushed to the main branch via GitHub integration with Mintlify.

### Manual Deployment
If needed, you can trigger a manual build:
```bash
npm run build
```

## License

This documentation is released under the [MIT License](LICENSE).

---

**Made with ❤️ by the Country State City Team**

[Get your API key](https://countrystatecity.in) • [View Documentation](https://docs.countrystatecity.in) • [GitHub](https://github.com/dr5hn/countries-states-cities-database)
