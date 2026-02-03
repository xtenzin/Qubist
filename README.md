# Qubist

[English](README.md) | [中文](README_zh-CN.md)

A Qdrant vector database web management tool developed with Vue 3 + TypeScript, providing a more user-friendly data management solution than the official interface.

## Version

**Current Version**: 0.1.0

## Copyright

Copyright © 2026 xtenzin. All rights reserved.

**Contact**: xtenzin  
**Email**: code@xtenzin.com  
**Code Committer**: xtenzin <code@xtenzin.com>

## Overview

Qubist is a web-based management interface for Qdrant vector database, designed to simplify common data management operations. While the official Qdrant interface provides similar functionality, this tool aims to offer a more intuitive and user-friendly experience, especially for scenarios requiring quick data addition and management.

## Features

### Connection Management
- Configure Qdrant server address, port, and optional API KEY
- Connection validation through Qdrant REST API
- Historical login record management with quick selection
- Connection state persistence

### Collection Management
- Display all collections in a sidebar list
- View collection information (basic and advanced)
- Collection settings management (indexes, etc.)
- Create new collections

### Data Operations
- Complete CRUD operations for point data
- Data list display with ID, vector, and Payload information
- View, add, edit, and delete point data
- Pagination support with customizable page sizes
- Data refresh functionality

### User Interface
- Clean and modern UI design
- Color scheme inspired by Qdrant official interface
- Responsive layout
- Intuitive user experience

## Technology Stack

### Core Framework
- **Vue 3**: Progressive JavaScript framework for building user interfaces
- **TypeScript**: Type-safe JavaScript superset for better development experience
- **Vite**: Fast development server and build tool

### UI Component Library
- **Element Plus**: A Vue 3 based component library providing rich UI components

### HTTP Client
- **Axios**: Promise-based HTTP client for making API requests

### State Management
- **Pinia**: Official state management solution for Vue 3, lightweight and type-safe

### Routing Management
- **Vue Router**: Official router for Vue.js, supporting route guards and navigation

### Code Quality
- **ESLint**: Code linting tool for maintaining code quality
- **Prettier**: Code formatter for consistent code style

## Project Structure

```
Qubist/
├── src/                    # Source code directory (Vue project)
│   ├── api/               # API encapsulation
│   ├── components/        # Vue components
│   ├── views/             # Page views
│   ├── stores/            # State management (Pinia)
│   ├── router/            # Route configuration
│   ├── utils/             # Utility functions
│   ├── index.html         # Entry HTML file
│   ├── package.json       # Project configuration
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── tsconfig.app.json  # TypeScript app configuration
│   ├── tsconfig.node.json # TypeScript node configuration
│   ├── App.vue            # Root component
│   └── main.ts            # Entry file
├── docs/                   # Documentation directory
│   ├── zh-CN/             # Chinese documentation
│   ├── en-US/             # English documentation
│   ├── README.md          # Documentation guide (English)
│   └── README_zh-CN.md    # Documentation guide (Chinese)
├── LICENSE                # License file
├── README.md              # This file (English)
└── README_zh-CN.md        # Project description (Chinese)
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/xtenzin/Qubist.git
cd Qubist
```

2. Navigate to the source code directory:
```bash
cd src
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:16333` (default port, paying tribute to Qdrant)

**Note**: All Vue project files (including `package.json`, `vite.config.ts`, etc.) are located in the `src/` directory. You need to run npm commands from within the `src/` directory.

## Configuration

On first access, you need to configure the Qdrant server connection information:

- **Server**: Qdrant server address (default: localhost)
- **Port**: Qdrant service port (default: 6333)
- **API KEY**: Optional, required if Qdrant is configured with authentication

### Login History

The system automatically records the last successful login configuration. You can quickly fill login parameters through dropdown selection, making it convenient to switch between different Qdrant instances.

## Documentation

For detailed documentation, please refer to the [docs](docs/) directory:

- [Documentation Guide (English)](docs/README.md)
- [文档指南（中文）](docs/README_zh-CN.md)
- [Technical Roadmap (English)](docs/en-US/technical-roadmap_en-US.md)
- [技术路线（中文）](docs/zh-CN/technical-roadmap_zh-CN.md)

## Development

### Code Comments
All code comments are bilingual:
- Chinese comments above
- English comments below

### Commit Standards
- Follow project Git commit conventions
- Commit messages use Chinese
- Commit by feature module

## License

See [LICENSE](LICENSE) file for details.

## Contact

**Author**: xtenzin  
**Email**: code@xtenzin.com
