# 贡献指南

[English](CONTRIBUTING.md) | [中文](CONTRIBUTING_zh-CN.md)

感谢您对 Qubist 项目的关注！我们欢迎所有形式的贡献。

### 如何贡献

#### 报告问题

如果您发现了 bug 或有问题建议，请通过 GitHub Issues 报告：

1. 检查问题是否已经存在

2. 如果不存在，创建新 issue，包含：
   - 清晰的问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（浏览器、Node.js 版本等）

#### 提交代码

1. Fork 本仓库

2. 创建功能分支
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. 进行更改

4. 确保代码符合项目规范
   - 运行 `npm run lint` 检查代码
   - 运行 `npm run format` 格式化代码

5. 提交更改
   ```bash
   git commit -m "你的中文提交信息
   Your English commit message"
   ```
   
   **注意**：提交信息必须包含中文和英文两行

6. 推送到您的 Fork
   ```bash
   git push origin feature/your-feature-name
   ```

7. 创建 Pull Request

### 代码规范

#### 代码注释

所有代码注释必须为双语格式：

```typescript
// 这是中文注释
// This is English comment
const example = 'value'
```

#### 提交信息格式

提交信息必须遵循以下格式：

```
中文提交信息
---
English commit message

- 详细说明（中文）
- Detailed description (English)
```

#### 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 组合式 API 风格
- 组件名使用 PascalCase
- 函数和变量使用 camelCase

### 开发环境设置

1. 克隆仓库
   ```bash
   git clone https://github.com/xtenzin/Qubist.git
   cd Qubist
   ```

2. 进入源代码目录
   ```bash
   cd src
   ```

3. 安装依赖
   ```bash
   npm install
   ```

4. 启动开发服务器
   ```bash
   npm run dev
   ```

5. 构建项目
   ```bash
   npm run build
   ```

### Pull Request 流程

1. 确保您的 PR 描述清晰说明更改内容

2. 确保所有检查通过

3. 等待代码审查

4. 根据反馈进行修改

### 问题

如有疑问，请通过以下方式联系：

- GitHub Issues
- Email: code@xtenzin.com
