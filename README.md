# catVweb

猫主题的项目日记本。单文件网页应用（`journal.html`），可离线使用（PWA），
登录后在设备之间自动同步（Supabase）。

---

## 常用命令

在**任意终端**里跑，先 `cd` 到这个文件夹。不一定要用 VS Code。

### 帮忘记密码的用户重设密码

```bash
node tools/reset-password.js                       # 忘了怎么用？敲这一行，它会告诉你
node tools/reset-password.js --setkey              # 存管理员密钥，每台电脑做一次
node tools/reset-password.js 他的邮箱 临时密码       # 真的改密码
node tools/reset-password.js --who 他的邮箱         # 只查 UUID，不改任何东西
```

**记不住就敲 `node tools/reset-password.js`（不带任何参数）**，用法会自己打出来。

改完把临时密码私下给他，让他登录后自己进「改密码」换掉。日记数据一条不动。

> `--who` 是只查不改。看到「✓ 密码已经改成」才是真的改了。

### 跑回归测试

```bash
node tests/test-merge.js
```

### 本地预览

用任意静态服务器指到这个文件夹，然后开 `http://localhost:8080/journal.html`。

---

## ⚠️ 改了 `journal.html` 必须做的事

把两个版本号**一起加 1**：

- `journal.html` 里的 `const APP_BUILD=...`
- `sw.js` 里的 `const VERSION = ...`

不加的话 Service Worker 会继续给浏览器送旧代码，你会拿着旧代码测新修复 ——
这是这个项目踩过最深的坑。浏览器控制台第一行会打印当前版本号，
**排查任何同步问题之前，先确认版本号对得上**。

---

## ❗️ 部署在哪（别搞错）

线上网址：https://vzon7.github.io/catVweb/journal.html 
GitHub Pages 服务的分支是 **`claude/amazing-bohr-zIAEL`**。

**`main` 不是主干，它停在 2026-06-17，没有 PWA、没有同步地基，是废的。**
往 `main` 上合代码，线上不会有任何变化。

那个分支名是 Claude 在 GitHub 上干活时自动生成的一次性工作分支，
历史原因变成了事实主干。**看到这名字别删它 —— 删掉网站就下线。**
来龙去脉见 `PHASE3-STATUS.md` 的「部署真相」一节。

---

## 密钥安全

`tools/.admin-key` 存的是管理员密钥，**能绕过数据围栏 (RLS)，等于所有人的全部数据**。

- 已写进 `.gitignore`，不会被提交
- 换一台电脑要重新跑 `--setkey`（密钥不跟着仓库走，这是故意的）
- 也可以改用环境变量 `CJ_ADMIN_KEY`，脚本优先读它

---

## 文档

| 文件 | 讲什么 |
|---|---|
| `PHASE3-STATUS.md` | 云端同步的进度、踩过的坑、上线清单 |
| `catvweb-design-system.md` | 视觉规范、沟通约定、历次 update 记录 |
| `catvweb-journal-SKILL.md` | 功能说明与数据库对账 SQL |
