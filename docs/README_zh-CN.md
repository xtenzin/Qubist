# 文档 / Documentation

[English](README.md) | [中文](README_zh-CN.md)

## 目录结构 / Directory Structure

文档采用双语格式组织，中文和英文版本分别存储在单独的目录中：

The documentation is organized in bilingual format, with Chinese and English versions stored in separate directories:

```
docs/
├── zh-CN/                    # 中文文档 / Chinese documentation
│   └── *.md                 # 中文 Markdown 文件 / Chinese markdown files
├── en-US/                    # 英文文档 / English documentation
│   └── *.md                 # 英文 Markdown 文件 / English markdown files
├── README.md                 # 本文件（英文）/ This file (English)
└── README_zh-CN.md          # 本文件（中文）/ This file (Chinese)
```

## 文档命名约定 / Document Naming Convention

所有文档文件遵循一致的命名模式：

All documentation files follow a consistent naming pattern:

- **中文版本**: `document-name_zh-CN.md`
- **英文版本**: `document-name_en-US.md`

例如：
For example:

- `technical-roadmap_zh-CN.md` - 技术路线（中文）
- `technical-roadmap_en-US.md` - Technical roadmap (English)

## 可用文档 / Available Documents

### 技术路线 / Technical Roadmap

- **中文**: [technical-roadmap_zh-CN.md](zh-CN/technical-roadmap_zh-CN.md)
- **English**: [technical-roadmap_en-US.md](en-US/technical-roadmap_en-US.md)

该文档概述了项目的功能规划、技术栈、项目结构和开发规范。

This document outlines the project's feature planning, technology stack, project structure, and development standards.

## 文档用途 / Document Purpose

`docs/` 目录包含所有项目文档，包括：

The `docs/` directory contains all project documentation, including:

- **技术文档**: 架构、API 参考、开发指南
- **Technical Documentation**: Architecture, API references, development guides
- **规划文档**: 路线图、功能规范、设计文档
- **Planning Documents**: Roadmaps, feature specifications, design documents
- **用户指南**: 安装、使用、配置指南
- **User Guides**: Installation, usage, configuration guides

每个文档都维护中文和英文版本，以服务于国际和本地开发人员。

Each document is maintained in both Chinese and English to serve both international and local developers.

## 贡献 / Contributing

添加新文档时：

When adding new documentation:

1. 创建中文和英文版本
2. Create both Chinese and English versions
3. 遵循命名约定：`document-name_zh-CN.md` 和 `document-name_en-US.md`
4. Follow the naming convention: `document-name_zh-CN.md` and `document-name_en-US.md`
5. 在此 README 中添加两个版本的链接
6. Add links to both versions in this README
7. 确保两个版本同步且最新
8. Ensure both versions are synchronized and up-to-date
