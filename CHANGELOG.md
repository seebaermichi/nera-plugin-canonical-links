# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-21

### Changed

-   raised minimum Node from 18 to 20; Node 18 reached end-of-life on
    2025-04-30 and the dev toolchain requires Node 20+


## [2.1.0] - 2026-07-19

### Fixed

-   no longer emits `<link rel="canonical" href="undefined/...">` on every page
    when no origin is configured. That markup was worse than none — it told
    search engines the authoritative URL was a broken string, and nothing was
    printed to warn about it. The plugin now warns once and leaves pages
    untouched

### Added

-   `publish-template` command (`npx nera-canonical-links`), so the shipped
    templates can be copied into `views/vendor/` like every other plugin.
    Previously there was no publish path at all and the README worked around it
    by including straight out of `node_modules/`
-   `--force` to re-publish over existing templates, discarding local edits

### Changed

-   `@nera-static/plugin-utils` range widened to `^1.2.0`, which is what makes
    `partials/` publish alongside `index.pug`
-   config is resolved per call rather than at module load
-   README: `app_origin` was documented as overriding `app.origin`. It is the
    other way round — `app.origin` wins. The docs now match the code
-   README: documents that omitting `available_languages` silently disables
    alternate links

### Removed

-   dead `if (!config)` guard — `getConfig` returns `{}`, so it never fired

## [2.0.1] - 2025-07-19

### Added

-   Complete CHANGELOG.md with full version history
-   Enhanced package.json keywords for better discoverability
-   Compatibility section in README.md

### Changed

-   Improved documentation with Nera v4.1.0+ compatibility notes
-   Enhanced keywords for NPM search optimization
-   Better structured development and deployment information

### Fixed

-   Documentation consistency and clarity improvements

## [2.0.0] - 2025-07-19

### Breaking Changes

-   Updated for compatibility with Nera v4.1.0+
-   Requires Node.js >= 18

### Added

-   Support for Nera's enhanced plugin architecture
-   Improved error handling and logging compatibility
-   Full compatibility with Nera's parallel plugin loading

### Changed

-   Updated dependencies to latest versions
-   Enhanced test coverage and reliability
-   Improved documentation and development setup

### Technical

-   Compatible with Nera's new plugin data merging system
-   Optimized for parallel execution performance
-   Enhanced development tooling with Husky and ESLint

## [1.x] - Previous Versions

### Features

-   Canonical link generation for SEO optimization
-   Multi-language alternate link support
-   Configurable page identifier and language detection
-   Pug template integration for head section

### Configuration

-   Flexible origin URL configuration
-   Support for multiple available languages
-   Customizable page identifier field
-   YAML-based configuration system

[2.0.1]: https://github.com/seebaermichi/nera-plugin-canonical-links/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/seebaermichi/nera-plugin-canonical-links/compare/v1.0.0...v2.0.0
