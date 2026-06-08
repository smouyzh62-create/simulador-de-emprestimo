# 全局轮训计数器部署指南

## 步骤 1：部署 Google Apps Script（1 分钟）

1. 打开 https://script.google.com/
2. 点击 **"新建项目"**
3. 删除编辑器里的内容，粘贴以下代码：

```javascript
function doGet() {
  const props = PropertiesService.getScriptProperties();
  let counter = parseInt(props.getProperty('counter') || '0', 10);
  const result = counter;
  counter = (counter + 1) % 999999;
  props.setProperty('counter', counter.toString());
  return ContentService.createTextOutput(JSON.stringify({ value: result }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. 点击 **"部署"** → **"新部署"**
5. 类型选择 **"Web 应用"**
6. 执行身份选 **"我"**
7. 谁可以访问选 **"任何人"**
8. 点击 **"部署"**，确认权限
9. **复制生成的 URL**（格式如 `https://script.google.com/macros/s/.../exec`）

## 步骤 2：配置代码

打开 `src/config.ts`，找到下面这行：

```typescript
const COUNTER_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

把 `YOUR_SCRIPT_ID` 替换成你刚才复制的 URL。

## 步骤 3：提交部署

```bash
git add .
git commit -m "Add global round-robin counter"
git push
```

## 完成

以后每个新用户访问时，系统会：
1. 请求计数器 API 获取唯一序号
2. 序号 % 客服数量 = 分配给该用户的客服
3. 不同设备不同用户 → 不同序号 → 分配到不同客服
