# ResuForge AI

一个基于 Next.js 的智能简历生成平台。

## 功能特性

- 🤖 **AI 智能优化**：基于 Deepseek AI 的智能优化引擎，自动提升简历专业度
- ✨ **实时编辑**：直观的编辑器，实时预览，所见即所得
- 📄 **多模板支持**：多种专业简历模板，适配不同行业和职位
- 🔐 **安全认证**：基于 JWT 的用户认证系统
- 💾 **云端存储**：使用 Supabase 存储简历数据

## 技术栈

- **前端框架**：Next.js 15 (App Router)
- **UI 库**：React 19, TailwindCSS
- **状态管理**：Zustand
- **表单验证**：React Hook Form + Zod
- **AI 引擎**：Deepseek API
- **数据库**：Supabase (PostgreSQL)
- **认证**：JWT (jose)

## 快速开始

### 1. 安装依赖

```bash
npm install --legacy-peer-deps
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`，并填写以下配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Deepseek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_BASE=https://api.deepseek.com/v1

# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET=your_jwt_secret_key

# API 配置
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 初始化数据库

在 Supabase 控制台中执行 `lib/db/schema.sql` 中的 SQL 脚本。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
resuforge-ai/
├── app/                      # Next.js App Router
│   ├── api/                 # API 路由
│   │   ├── auth/           # 认证相关 API
│   │   ├── resumes/        # 简历 CRUD API
│   │   └── ai/             # AI 优化 API
│   ├── login/              # 登录页面
│   ├── register/           # 注册页面
│   ├── dashboard/          # 仪表盘
│   └── editor/             # 简历编辑器
├── components/              # React 组件
├── lib/                     # 工具库
│   ├── api/                # API 客户端
│   ├── db/                 # 数据库配置
│   ├── auth.tsx            # 认证工具
│   └── utils.ts            # 通用工具
├── store/                   # Zustand 状态管理
├── types/                   # TypeScript 类型定义
└── public/                  # 静态资源
```

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 简历管理
- `GET /api/resumes` - 获取简历列表
- `GET /api/resumes/:id` - 获取单个简历
- `POST /api/resumes` - 创建简历
- `PUT /api/resumes/:id` - 更新简历
- `DELETE /api/resumes/:id` - 删除简历

### AI 优化
- `POST /api/ai/optimize` - AI 优化内容

## 开发指南

### 添加新页面

1. 在 `app/` 目录下创建新文件夹
2. 创建 `page.tsx` 文件
3. 使用 TypeScript 和 React Server Components

### 添加新 API

1. 在 `app/api/` 目录下创建路由文件夹
2. 创建 `route.ts` 文件
3. 导出 GET/POST/PUT/DELETE 等方法

### 状态管理

使用 Zustand 进行状态管理，示例：

```typescript
import { create } from 'zustand';

interface State {
  data: any;
  setData: (data: any) => void;
}

export const useStore = create<State>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 环境变量设置

确保在 Vercel 中配置所有 `.env.local` 中的环境变量。

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。
