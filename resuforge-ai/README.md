# ResuForge AI - 智能简历生成平台

> 使用 AI 技术打造专业简历，让求职更高效

[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-blue?style=flat-square)](https://platform.deepseek.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## 📋 目录

- [项目介绍](#项目介绍)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [安装步骤](#安装步骤)
  - [环境变量配置](#环境变量配置)
- [项目结构](#项目结构)
- [主要功能说明](#主要功能说明)
- [部署指南](#部署指南)
- [开发指南](#开发指南)
- [面试亮点](#面试亮点)

---

## 🎯 项目介绍

ResuForge AI 是一款基于 AI 技术的智能简历生成平台，帮助求职者快速创建专业、精美的简历。通过 AI 优化引擎，自动提升简历内容质量，让你的求职之路更加顺畅。

### 核心价值

- **AI 智能优化**：基于 DeepSeek AI 的智能优化引擎
- **实时预览**：所见即所得的编辑体验
- **多模板支持**：5 种专业简历模板
- **数据安全**：多用户数据隔离

---

## ✨ 功能特性

### 🔐 用户认证
- JWT 无状态认证
- 3 个预设演示账号
- httpOnly Cookie 存储 Token

### 📝 简历管理
- 创建/编辑/删除简历
- 自动保存草稿
- JSON 格式备份导出

### 🤖 AI 功能
- 简历内容优化
- 技能关键词推荐
- 简历智能分析
- 流式输出展示

### 📄 预览与导出
- 5 种简历模板
- 实时预览
- 主题色自定义
- PDF/PNG 导出
- 打印支持

### 📱 响应式设计
- PC 端左右分栏布局
- 移动端 Tab 切换
- 触摸操作优化

---

## 🛠 技术栈

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 15 | React 全栈框架 |
| React | 19 | UI 库 |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 样式方案 |
| Zustand | 5 | 状态管理 |
| shadcn/ui | - | UI 组件库 |

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js API Routes | - | Serverless API |
| Supabase | - | BaaS 数据库 |
| JWT (jose) | - | 认证方案 |

### AI
| 技术 | 说明 |
|------|------|
| DeepSeek API | AI 能力支持 |
| LangChain.js | Prompt 管理 |
| 流式输出 | 实时展示生成内容 |

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm
- Supabase 账号
- DeepSeek API Key

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/resuforge-ai.git
cd resuforge-ai/resuforge-ai

# 2. 安装依赖
npm install
# 或
yarn install
# 或
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 4. 启动开发服务器
npm run dev
```

### 环境变量配置

创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# JWT 配置
JWT_SECRET=your-random-secret-string-here

# 环境
NODE_ENV=development
```

---

## 📂 项目结构

```
resuforge-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证页面组
│   │   └── login/                # 登录页
│   ├── api/                      # API Routes
│   │   ├── ai/                   # AI 相关 API
│   │   ├── auth/                # 认证 API
│   │   └── resumes/              # 简历 API
│   ├── dashboard/                # 仪表盘页
│   ├── editor/                   # 编辑器页
│   └── page.tsx                  # 首页
├── components/                    # React 组件
│   ├── ai/                       # AI 相关组件
│   ├── auth/                     # 认证组件
│   ├── layout/                   # 布局组件
│   ├── resume/                   # 简历相关组件
│   ├── templates/                # 简历模板
│   └── ui/                       # UI 基础组件
├── hooks/                        # 自定义 Hooks
├── lib/                          # 工具库
│   ├── ai/                       # AI 工具
│   ├── api/                      # API 封装
│   ├── auth/                     # 认证工具
│   ├── db/                       # 数据库工具
│   └── pdf/                      # PDF 导出
├── store/                        # Zustand 状态管理
└── types/                        # TypeScript 类型
```

---

## 📖 主要功能说明

### 登录演示账号

| 邮箱 | 密码 | User ID |
|------|------|---------|
| user1@demo.com | demo1234 | user-001 |
| user2@demo.com | demo1234 | user-002 |
| user3@demo.com | demo1234 | user-003 |

### 创建简历

1. 登录后点击"创建新简历"
2. 填写个人信息、教育背景、工作经历等
3. 使用 AI 功能优化内容
4. 选择模板并预览效果
5. 导出 PDF 或打印

### AI 优化功能

- **个人简介优化**：输入描述，AI 改写为专业语言
- **工作经历优化**：量化成果，突出业绩
- **项目经历优化**：提炼亮点和技术栈
- **技能推荐**：基于简历内容推荐相关技能

### 模板切换

支持 5 种简历模板：
- **Classic**：传统专业风格
- **Modern**：现代简洁侧边栏
- **Professional**：商务两栏布局
- **Creative**：创意设计风格
- **Minimal**：极简风格

---

## 🌐 部署指南

### Vercel 部署（推荐）

1. Fork 或克隆项目到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 环境变量

确保在 Vercel 中配置以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `JWT_SECRET`

### Supabase 设置

1. 创建 Supabase 项目
2. 创建 `users` 表
3. 配置 Row Level Security
4. 启用 Email 认证

---

## 💻 开发指南

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 组件使用 shadcn/ui 规范
- API 响应统一格式

### API 规范

```typescript
// 成功响应
{
  success: true,
  data: {...}
}

// 错误响应
{
  success: false,
  error: "错误信息"
}
```

---

## 🎓 面试亮点

### 技术亮点（简历上可以这样写）

1. **AI 工程化能力**
   > 使用 LangChain.js 构建 AI 内容生成系统，通过 Prompt 工程优化生成质量，实现流式输出提升用户体验

2. **全栈开发能力**
   > 基于 Next.js 15 App Router 实现前后端一体化架构，使用 Supabase 作为 BaaS 方案，支持多用户数据隔离

3. **现代化技术栈**
   > 采用 TypeScript + Zustand + shadcn/ui 构建类型安全的前端应用，使用 React Hook Form 实现高性能表单管理

4. **响应式设计能力**
   > 实现完整的 PC 端和移动端适配，基于 Tailwind CSS 断点系统构建 Mobile-First 响应式布局

### 可量化数据

- "支持 5 种 AI 能力（内容优化/技能推荐/简历分析等）"
- "实现了基于 Row Level Security 的多租户数据隔离"
- "使用 JWT + httpOnly Cookie 保证认证安全"
- "支持 5 种简历模板和主题色定制"
- "实现 PC 端和移动端完整适配"

### 可深挖的技术点

1. **为什么选择 Zustand 而不是 Redux？**
   - Zustand 更轻量，API 更简洁，适合中等复杂度项目
   - 不需要 Provider 包裹，减少组件嵌套

2. **如何保证 API Key 安全？**
   - API Key 存储在服务器环境变量
   - 前端通过 Next.js API Route 调用 AI
   - 使用 httpOnly Cookie 存储 JWT Token

3. **如何实现 AI 流式输出？**
   - 使用 ReadableStream API
   - 前端使用 `fetch` 的 `response.body.getReader()`
   - 逐块解析数据并更新 UI

4. **如何实现多用户数据隔离？**
   - 使用 Supabase Row Level Security
   - 在 JWT Token 中存储 userId
   - 后端中间件自动验证并注入用户上下文

---

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代
- [DeepSeek](https://platform.deepseek.com/) - AI 能力支持
- [shadcn/ui](https://ui.shadcn.com/) - 优秀的设计系统
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先 CSS 框架

---

> 最后更新：2026-09-14  
> 项目版本：v1.0
