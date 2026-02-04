# Changelog

[English](CHANGELOG.md) | [中文](CHANGELOG_zh-CN.md)

This document records all significant changes to the project.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/en-US/).

## [Unreleased]

### Planned
- Vector similarity search functionality
- Batch operations functionality
- Data import/export functionality

## [0.1.1] - 2026-02-04

### Added
- Collection deletion functionality with warning dialog
- Auto-generated point ID based on millisecond timestamp when adding points
- Random vector generation button for quick vector creation
- Random payload generation with predefined structure (type, timestamp, content)
- "Fill with existing data" button for loading latest point data as template

### Changed
- Improved collection settings UI: moved "Fill with existing data" button to footer, aligned with Cancel/Save buttons
- Enhanced collection item layout: consistent left alignment for collection name and icon, optimized action button spacing
- Default vector dimension for new collections changed from 128 to 1024
- Improved input validation: vector and payload validation now occurs only on save, allowing free input during editing

### Fixed
- Fixed point ID format issue: changed from string timestamp to number type (unsigned integer) for Qdrant compatibility
- Fixed collection settings parameter loading: correctly reads indexed_threshold from Qdrant response
- Fixed collection settings parameter saving: correctly updates indexing_threshold and reloads values after save
- Fixed payload placeholder text: resolved Vue i18n curly brace parsing issue
- Fixed vector and payload input: removed real-time validation interference, allowing users to input freely

### Improved
- Better error handling for collection settings updates
- Enhanced type definitions for collection configuration
- Improved code organization and maintainability

## [0.1.0] - 2026-02-04

### Added
- Initial version release
- Connection management functionality
- Collection management functionality (list, view, create, settings)
- Point data CRUD operations
- Pagination functionality
- Multi-language support (Chinese, English)
- Responsive UI design
- Complete Qdrant REST API encapsulation
- TypeScript type definitions

### Technology Stack
- Vue 3 + TypeScript
- Element Plus UI component library
- Pinia state management
- Vue Router routing management
- Axios HTTP client
- vue-i18n internationalization

---

## Change Types

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related fixes
