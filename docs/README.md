# Documentation / 文档

[English](README.md) | [中文](README_zh-CN.md)

## Directory Structure / 目录结构

The documentation is organized in bilingual format, with Chinese and English versions stored in separate directories:

文档采用双语格式组织，中文和英文版本分别存储在单独的目录中：

```
docs/
├── zh-CN/                    # Chinese documentation / 中文文档
│   └── *.md                 # Chinese markdown files / 中文 Markdown 文件
├── en-US/                    # English documentation / 英文文档
│   └── *.md                 # English markdown files / 英文 Markdown 文件
├── README.md                 # This file (English) / 本文件（英文）
└── README_zh-CN.md          # This file (Chinese) / 本文件（中文）
```

## Document Naming Convention / 文档命名约定

All documentation files follow a consistent naming pattern:

所有文档文件遵循一致的命名模式：

- **English version**: `document-name_en-US.md`
- **Chinese version**: `document-name_zh-CN.md`

For example:
例如：

- `technical-roadmap_en-US.md` - Technical roadmap (English)
- `technical-roadmap_zh-CN.md` - 技术路线（中文）

## Available Documents / 可用文档

### Technical Roadmap / 技术路线

- **English**: [technical-roadmap_en-US.md](en-US/technical-roadmap_en-US.md)
- **中文**: [technical-roadmap_zh-CN.md](zh-CN/technical-roadmap_zh-CN.md)

This document outlines the project's feature planning, technology stack, project structure, and development standards.

该文档概述了项目的功能规划、技术栈、项目结构和开发规范。

### Deployment Guide / 部署指南

- **English**: [deployment_en-US.md](en-US/deployment_en-US.md)
- **中文**: [deployment_zh-CN.md](zh-CN/deployment_zh-CN.md)

This document describes how to deploy Qubist to production environments, including Nginx, Apache, Docker, and Docker Compose deployment methods.

该文档介绍如何将 Qubist 部署到生产环境，包括 Nginx、Apache、Docker 和 Docker Compose 等部署方式。

## Document Purpose / 文档用途

The `docs/` directory contains all project documentation, including:

`docs/` 目录包含所有项目文档，包括：

- **Technical Documentation**: Architecture, API references, development guides
- **技术文档**: 架构、API 参考、开发指南
- **Planning Documents**: Roadmaps, feature specifications, design documents
- **规划文档**: 路线图、功能规范、设计文档
- **User Guides**: Installation, usage, configuration guides
- **用户指南**: 安装、使用、配置指南

Each document is maintained in both Chinese and English to serve both international and local developers.

每个文档都维护中文和英文版本，以服务于国际和本地开发人员。

## Contributing / 贡献

When adding new documentation:

添加新文档时：

1. Create both Chinese and English versions
2. 创建中文和英文版本
3. Follow the naming convention: `document-name_zh-CN.md` and `document-name_en-US.md`
4. 遵循命名约定：`document-name_zh-CN.md` 和 `document-name_en-US.md`
5. Add links to both versions in this README
6. 在此 README 中添加两个版本的链接
7. Ensure both versions are synchronized and up-to-date
8. 确保两个版本同步且最新
