# Changelog

[English](CHANGELOG.md) | [中文](CHANGELOG_zh-CN.md)

This document records all significant changes to the project.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/en-US/).

## [Unreleased]

### Planned
- Vector similarity search functionality
- Data statistics functionality

## [0.2.1] - 2026-02-04

### Added
- Index management functionality: Added index management TAB page in collection settings dialog
- Index list display: Display all payload indexes for current collection, including field name, field schema, and points count
- Create index functionality: Support creating payload indexes with selectable field types (keyword, integer, float, uuid, datetime, text, geo, bool)
- Delete index functionality: Support deleting payload indexes with confirmation dialog
- Index points count display: Read and display points count for each index field directly from payload_schema

### Improved
- Improved collection settings interface: Added index management TAB for convenient management of collection index fields
- Optimized index management experience: Auto-load index list, auto-refresh after create/delete operations

## [0.2.0] - 2026-02-04

### Added
- Batch delete functionality: multi-select support in points table with checkbox selection
- Data import functionality: import points from JSON and CSV files with format validation and preview
- Data export functionality: export points to JSON and CSV formats with multiple export options:
  - Export current page
  - Export selected points
  - Export query results (all data in collection)
  - Export all data (all data in collection)
- Export format selection dialog with visual icon buttons (JSON and CSV)
- Progress indication for large data exports with loading status

### Changed
- Improved export workflow: format selection dialog appears after choosing export scope
- Enhanced data loading: export operations load data in batches (500 points per request) to avoid timeouts
- Optimized export performance: added delays between requests to prevent server overload
- Improved UI: wider form fields in create collection dialog to prevent label text wrapping

### Fixed
- Fixed connection state check: prevent loading collections when not connected
- Fixed API error handling: improved error messages and connection validation
- Fixed import dialog: proper internationalization for file format tip text

### Improved
- Better error handling for batch operations
- Enhanced user experience for data import/export operations
- Improved code organization for import/export utilities

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
