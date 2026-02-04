# Technical Roadmap

[English](technical-roadmap_en-US.md) | [中文](technical-roadmap_zh-CN.md)

## Project Overview

Qubist is a Qdrant vector database web management tool developed based on Vue 3 + TypeScript, aiming to provide a more user-friendly data management solution than the official interface.

## Feature Planning

### 1. Connection Management Module

#### 1.1 Login Functionality
- Support configuring Qdrant server address, port, and API KEY (optional)
- Implement connection validation mechanism to confirm connection validity by calling Qdrant REST API
- Support historical login record management, allowing quick filling of login parameters through dropdown selection
- Implement connection state persistence storage

#### 1.2 Connection State Management
- Display current connection information (server address, port)
- Provide disconnect functionality
- Implement global connection state management (using Pinia)

### 2. Collection Management Module

#### 2.1 Collection List Display
- Display all collections list in the left sidebar
- Each collection shows name and point count
- Collection icons use database shape for easy identification
- Support collection selection highlighting

#### 2.2 Collection Information Viewing
- Collection information dialog (i icon)
- Basic information tab: Display readable collection configuration information
- Advanced information tab: Highlight display of raw JSON data
- Use JSON highlighting component to improve readability

#### 2.3 Collection Settings Functionality
- Collection settings dialog (gear icon)
- Support index and other configuration management
- Support modification and update of collection configuration

#### 2.4 Collection Creation Functionality
- New collection dialog
- Support basic collection configuration (name, vector dimensions, etc.)
- Form validation and error prompts

### 3. Data Operations Module

#### 3.1 Data List Display
- Display data of currently selected collection in the right main area
- Data table display:
  - ID (with copy support)
  - Vector information (with copy support, ellipsis for overflow)
  - Payload information (with copy support, ellipsis for overflow)
- Table loading state indicator

#### 3.2 Data Viewing Functionality
- Point data viewing dialog
- Highlight display of point's raw JSON data
- Support JSON data expansion and collapse
- Support JSON data copying

#### 3.3 Data Addition Functionality
- Add point data dialog
- Support manual data input (ID, vector, Payload)
- Provide "Read Latest Data" button to quickly fill template data
- Automatic data format validation (JSON format, vector dimensions, etc.)
- Form validation and error prompts

#### 3.4 Data Editing Functionality
- Edit point data dialog
- Read-only fields cannot be modified (e.g., ID)
- Support modifying vector and Payload data
- Automatic data format validation
- Form validation and error prompts

#### 3.5 Data Deletion Functionality
- Delete confirmation dialog
- Confirmation mechanism to prevent accidental operations
- Auto-refresh data list after successful deletion

#### 3.6 Pagination Functionality
- Support custom page size: 15/30/45/75/90/100/150/200/300/500
- Default 15 items per page
- Display current page, total pages, total items
- Support page number jumping

#### 3.7 Data Refresh Functionality
- Manual refresh button
- Refresh data list of current collection

### 4. User Interface Module

#### 4.1 Layout Design
- Top navigation bar: Display Logo, title, connection information, disconnect button
- Left sidebar: Collection list
- Right main area: Data display and operations
- Responsive layout design

#### 4.2 Color Scheme
- Reference Qdrant official interface color scheme
- Main color: Green series (#42b883)
- Provide consistent user experience

#### 4.3 Component Library
- Use Element Plus component library
- Unified UI style and interaction experience

#### 4.4 Internationalization Support
- Support Simplified Chinese (zh-CN) and English (en-US)
- Automatically detect browser language and apply corresponding language
- Users can manually switch language via language switcher
- Language selection saved in browser localStorage, automatically applied on next visit
- Both login page and main interface support multi-language switching
- Element Plus component library language synchronized with app language
- All interface texts support multi-language display

### 5. API Integration Module

#### 5.1 Qdrant REST API Encapsulation
- Implement complete encapsulation of Qdrant REST API
- Support all necessary API endpoints:
  - Collection management (list, create, delete, info, settings)
  - Point data operations (query, add, update, delete)
- Type-safe API calls

#### 5.2 HTTP Client Configuration
- Use Axios as HTTP client
- Implement request interceptor (API KEY authentication)
- Implement response interceptor (error handling)
- Unified error handling mechanism

#### 5.3 Data Type Definitions
- Complete TypeScript type definitions
- Type mapping of Qdrant data structures
- Type-safe development experience

### 6. State Management Module

#### 6.1 Connection State Management
- Use Pinia to manage connection state
- Store current connection configuration
- Store historical connection records
- Implement state persistence

#### 6.2 Data State Management
- Manage currently selected collection
- Manage collection list data
- Manage point data list
- Manage pagination state

### 7. Routing Management Module

#### 7.1 Route Configuration
- Login page route
- Main interface (Dashboard) route
- Route guards (redirect to login page if not logged in)

#### 7.2 Route Navigation
- Support page switching
- Support route parameter passing

### 8. Utility Functions Module

#### 8.1 Data Validation Tools
- JSON format validation
- Vector dimension validation
- Data format validation utility functions

#### 8.2 Utility Functions
- Text copying functionality
- Data formatting tools
- Other common utility functions

### 9. Error Handling Module

#### 9.1 Error Prompts
- Unified error prompt mechanism
- User-friendly error message display
- Network error handling

#### 9.2 Exception Handling
- API call exception handling
- Data validation exception handling
- Global exception capture

## Technology Stack

### Core Framework
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript superset
- **Vite**: Fast development server and build tool

### UI Component Library
- **Element Plus**: Component library based on Vue 3

### HTTP Client
- **Axios**: Promise-based HTTP client

### State Management
- **Pinia**: Official state management solution for Vue 3

### Routing Management
- **Vue Router**: Official router for Vue.js

### Internationalization
- **vue-i18n**: Vue.js internationalization plugin, supporting multi-language switching

### Code Standards
- **ESLint**: Code linting tool
- **Prettier**: Code formatting tool

## Project Structure

```
Qubist/
├── src/                          # Source code directory
│   ├── api/                      # API encapsulation
│   │   ├── qdrant.ts            # Qdrant API encapsulation
│   │   └── types.ts             # Qdrant data type definitions
│   ├── components/               # Components directory
│   │   ├── CollectionInfoDialog.vue      # Collection info dialog
│   │   ├── CollectionSettingsDialog.vue  # Collection settings dialog
│   │   ├── PointViewDialog.vue          # Point data view dialog
│   │   ├── PointFormDialog.vue          # Point data add/edit dialog
│   │   └── JsonHighlighter.vue         # JSON highlighting component
│   ├── views/                    # Page views
│   │   ├── Login.vue            # Login page
│   │   └── Dashboard.vue        # Main interface
│   ├── stores/                   # State management
│   │   ├── connection.ts        # Connection state management
│   │   └── locale.ts            # Locale settings state management
│   ├── router/                   # Route configuration
│   │   └── index.ts             # Route definitions
│   ├── i18n/                     # Internationalization configuration
│   │   └── index.ts             # i18n configuration file
│   ├── locales/                  # Language files
│   │   ├── zh-CN/               # Simplified Chinese language pack
│   │   │   └── index.ts
│   │   └── en-US/               # English language pack
│   │       └── index.ts
│   ├── components/               # Components directory
│   │   ├── LocaleSwitcher.vue   # Language switcher component
│   │   └── ...                  # Other components
│   ├── utils/                    # Utility functions
│   │   ├── request.ts           # Axios encapsulation
│   │   └── validation.ts        # Data validation tools
│   ├── App.vue                   # Root component
│   └── main.ts                   # Entry file
├── docs/                          # Documentation directory
│   ├── zh-CN/                    # Chinese documentation
│   ├── en-US/                    # English documentation
│   ├── README.md                 # Documentation guide (English)
│   └── README_zh-CN.md          # Documentation guide (Chinese)
├── package.json                  # Project configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── README.md                     # Project description (English)
└── README_zh-CN.md              # Project description (Chinese)
```

## Development Standards

### Code Comments
- All code comments are bilingual
- Chinese comments above, English comments below
- Comments should clearly explain code functionality and intent

### Naming Conventions
- Use meaningful variable and function names
- Follow Vue 3 and TypeScript naming conventions
- Component names use PascalCase
- Functions and variables use camelCase

### Commit Standards
- Follow project Git commit conventions
- Commit messages use Chinese
- Commit by feature module

## Future Expansion Directions

1. **Search Functionality**: Support vector similarity search
2. **Data Statistics**: Display collection and point statistics
