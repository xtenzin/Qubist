# Contributing Guide

[English](CONTRIBUTING.md) | [中文](CONTRIBUTING_zh-CN.md)

Thank you for your interest in the Qubist project! We welcome all forms of contributions.

### How to Contribute

#### Reporting Issues

If you find a bug or have a suggestion, please report it via GitHub Issues:

1. Check if the issue already exists

2. If not, create a new issue with:
   - Clear problem description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment information (browser, Node.js version, etc.)

#### Submitting Code

1. Fork this repository

2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes

4. Ensure code follows project standards:
   - Run `npm run lint` to check code
   - Run `npm run format` to format code

5. Commit your changes
   ```bash
   git commit -m "Your Chinese commit message
   Your English commit message"
   ```
   
   **Note**: Commit message must include both Chinese and English lines

6. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request

### Code Standards

#### Code Comments

All code comments must be bilingual:

```typescript
// This is Chinese comment
// This is English comment
const example = 'value'
```

#### Commit Message Format

Commit messages must follow this format:

```
Chinese commit message
---
English commit message

- Detailed description (Chinese)
- Detailed description (English)
```

#### Code Style

- Use TypeScript for type checking
- Follow Vue 3 Composition API style
- Use PascalCase for component names
- Use camelCase for functions and variables

### Development Environment Setup

1. Clone the repository
   ```bash
   git clone https://github.com/xtenzin/Qubist.git
   cd Qubist
   ```

2. Navigate to source directory
   ```bash
   cd src
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Start development server
   ```bash
   npm run dev
   ```

5. Build project
   ```bash
   npm run build
   ```

### Pull Request Process

1. Ensure your PR description clearly explains the changes

2. Ensure all checks pass

3. Wait for code review

4. Make changes based on feedback

### Questions

If you have questions, please contact via:

- GitHub Issues
- Email: code@xtenzin.com
