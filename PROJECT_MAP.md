# 🏦 Simulador de Empréstimo — 项目完整地图

> **一句话**：仿 Banco do Brasil（巴西银行）界面的贷款模拟器，用户在主页模拟贷款 → 结果页跳转 WhatsApp/Telegram 客服完成转化。配有独立管理后台（`/admin/`）在线修改客服号码和 Pixel ID，无需重新部署。
>
> **在线地址**：
> - 主站：`https://hgsswsvip.top`
> - 后台：`https://hgsswsvip.top/admin/`（密码 `admin123`）
>
> **技术栈**：React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + GitHub Pages 自动部署
>
> **最后更新**：2026-06-09

---

## 📁 文件结构 & 职责

### 入口层
| 文件 | 职责 |
|---|---|
| `index.html` | 主站 HTML 入口，只挂载 React 根节点 |
| `src/main.tsx` | React 根渲染入口，**根据 URL 路径分流**：`/admin` → `<Admin />`，否则 → `<App />` |

### 核心页面
| 文件 | 行数 | 职责 |
|---|---|---|
| `src/App.tsx` | ~1268 | **主站贷款模拟器**（全部逻辑在此）。包含参数选择、身份表单、处理动画、结果展示、WhatsApp/Telegram 跳转按钮、安全/隐私弹窗、FAQ、滚动公告 |
| `src/Admin.tsx` | ~220 | **管理后台面板**。密码登录 → 管理 WhatsApp 号码池、Telegram 链接池、消息模板、**FB Pixel ID**，全部写入 localStorage |

### 数据 & 配置
| 文件 | 职责 |
|---|---|
| `src/config.ts` | **配置中心**。定义默认客服池 `DYNAMIC_SYSTEM_CONFIG`，提供 `getConfig()`（优先读 localStorage）和 `getActiveRotatedRoutes()`（游客粘性锁定，同一浏览器永不切换客服）。**注意**：`advanceRotationIndex()` 是空函数，客服永不轮转 |
| `src/pixel.ts` | **Facebook Pixel 工具**。统一读取/保存 Pixel ID、初始化 `fbq`、发送 PageView、Contact、Lead，并用 `facebook.com/tr` 图片请求做兜底 |
| `src/types.ts` | TypeScript 类型：`LoanSimulationConfig`、`UserFormData`、`SimulationResult` |

### 样式
| 文件 | 职责 |
|---|---|
| `src/index.css` | Tailwind CSS 入口 + 自定义主题色（BB 蓝 `#0038A8`、黄 `#F9D71C`）+ 动画（脉冲、扫描线）+ 按钮发光效果（`.ws-btn-glow`、`.tg-btn-glow`） |

### 构建 & 部署
| 文件 | 职责 |
|---|---|
| `vite.config.ts` | Vite 配置：React 插件 + Tailwind 插件，base 路径 `/` |
| `package.json` | 依赖清单 + 脚本：`dev`（端口 3000）、`build`（构建 + postbuild）、`preview` |
| `scripts/postbuild.mjs` | **构建后脚本**：将 `dist/index.html` 复制为 `dist/404.html`（SPA 路由回退）和 `dist/admin/index.html`（管理后台入口） |
| `.github/workflows/deploy.yml` | **GitHub Actions 自动部署**：push 到 main → npm ci → npm run build → 部署到 GitHub Pages |
| `tsconfig.json` | TypeScript 编译配置 |

### 辅助
| 文件 | 职责 |
|---|---|
| `metadata.json` | AI Studio 元数据（项目名、描述） |
| `.env.example` | 环境变量模板（`GEMINI_API_KEY`、`APP_URL`，实际未使用） |
| `.gitignore` | Git 忽略规则 |

---

## 🔑 localStorage 键名速查表

| 键名 | 写入者 | 读取者 | 含义 |
|---|---|---|---|
| `bb_admin_auth` | Admin.tsx | Admin.tsx | 管理员登录态（密码哈希） |
| `bb_whatsapp_pool` | Admin.tsx | config.ts | WhatsApp 号码池 JSON 数组 |
| `bb_telegram_pool` | Admin.tsx | config.ts | Telegram 链接池 JSON 数组 |
| `bb_message_template` | Admin.tsx | config.ts | WhatsApp 消息模板字符串 |
| `bb_fb_pixel_id` | Admin.tsx / pixel.ts | pixel.ts / App.tsx | Facebook Pixel ID，默认值为 `1331608285582024` |
| `bb_locked_ws_index` | config.ts | config.ts | 游客锁定的 WhatsApp 客服索引 |
| `bb_locked_tg_index` | config.ts | config.ts | 游客锁定的 Telegram 客服索引 |

---

## 🔄 数据流

```
管理后台 (Admin.tsx)
  │
  │  保存时写入 localStorage (5个key)
  ▼
localStorage
  │
  ├──► config.ts (getConfig / getActiveRotatedRoutes)
  │      │
  │      └──► App.tsx (getWhatsAppLink / getTelegramLink)
  │             │
  │             └──► 结果页按钮 URL
  │
  └──► App.tsx (useEffect)
         │
         └──► pixel.ts 初始化 fbq + PageView + 图片兜底请求
```

---

## 🖥️ 页面路由

`src/main.tsx` 中的分流逻辑：

```
URL 路径以 /admin 开头？
  ├── 是 → 渲染 <Admin /> 管理面板
  └── 否 → 渲染 <App /> 主站
```

`scripts/postbuild.mjs` 负责将 `dist/index.html` 复制到 `dist/admin/index.html`，因此：
- 访问 `hgsswsvip.top/` → `index.html` → `<App />`
- 访问 `hgsswsvip.top/admin/` → `admin/index.html` → SPA 加载 → URL 以 `/admin` 开头 → `<Admin />`

---

## 🎯 App.tsx 主站流程

1. **参数选择** (`PARAMETERS`)：金额滑块、期数选择、贷款用途
2. **身份表单** (`IDENTIFICATION`)：CNPJ/CPF、姓名、电话、邮箱、收入
3. **处理动画** (`PROCESSING`)：进度条 + 状态文字 + 模拟计算（4.2 秒）
4. **结果展示** (`RESULT`)：批准金额、利率、分期 + **WhatsApp/Telegram 跳转按钮**

结果页按钮点击时触发 `fbq('track', 'Contact', {channel: 'whatsapp'|'telegram'})`。

---

## 🛠️ FB Pixel 架构

FB Pixel 由 `src/pixel.ts` 统一管理：

1. 读取 Pixel ID：`localStorage bb_fb_pixel_id` → Cookie `bb_fb_pixel_id` → 默认 `1331608285582024`
2. 页面加载：初始化 `fbevents.js`，发送 `PageView`，同时发一条 `facebook.com/tr?ev=PageView` 图片兜底请求
3. 点击 WhatsApp/Telegram：发送 `Contact` 和 `Lead` 两个事件，同时各发一条 `facebook.com/tr` 图片兜底请求

这样即使 Meta 脚本加载慢，测试工具也能更稳定看到回传事件。

---

## ⚠️ 已知注意事项

1. **客服锁定策略**：`advanceRotationIndex()` 是空函数。每个浏览器首次访问时随机分配客服并永久锁定，永不轮转。目的是防止用户遍历号码举报。
2. **Git 大小写问题**：macOS 文件系统不区分大小写，但 git 区分。`Admin.tsx` 曾因被存为小写 `admin.tsx` 导致部署后管理后台空白。当前 `src/Admin.tsx` 大写正确。
3. **admin.html 不存在**：项目没有独立的 `admin.html` 文件。管理后台通过 SPA 路由 + postbuild 复制实现，不是 Vite 多入口构建。
4. **postbuild 是关键**：修改构建产物结构时务必同步修改 `scripts/postbuild.mjs`。
5. **Pixel 测试**：本地完整流程已验证 WhatsApp 按钮会发出 `PageView`、`Contact`、`Lead` 三类 Facebook 请求。

---

## 🚀 本地开发

```bash
npm run dev        # 启动开发服务器 http://localhost:3000
npm run build      # 构建 + 运行 postbuild
npm run preview    # 预览构建产物
```

## 📤 部署

Push 到 `main` 分支自动触发 GitHub Actions 部署到 GitHub Pages。
每次部署约需 1-2 分钟。
