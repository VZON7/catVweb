# catVweb

一个人用的项目日记网页（`journal.html`，单文件 + Supabase 云端同步）。

## 动手之前

- **改 `journal.html` 任何代码前**，先读 `catvweb-journal-SKILL.md`
  （模块结构、CSS 规范、双语规则、已知高风险区域）
- **写颜色 / 阴影 / SVG 图标前**，先查 `catvweb-design-system.md`
  ⚠️ **禁止凭记忆或模仿周围代码填数值** —— 数值唯一来源是那份文档
- 云端同步出问题，先看 `PHASE3-STATUS.md`（事故记录 + 还没修的洞）

## 铁律

- **部署分支是 `claude/amazing-bohr-zIAEL`，不是 `main`。**
  `main` 停在 2026-06 是废的，往 main 合代码线上不会有任何变化。**别删那个分支，删掉网站就下线。**
- **改 `journal.html` 必须同时给 `APP_BUILD` 和 `sw.js` 的 `VERSION` 加 1。**
  漏一个 = 手机继续用旧缓存，你会拿旧代码测新修复，白折腾好几轮。
- **界面 / CSS / 版面的改动，先 `node tools/serve.js` 让用户看渲染效果，他点头才推。**
  光读代码看不出版面问题。2026-09-19 连翻两次车。
- **起了本地服务器，当场把完整网址贴出来**（本机 + 局域网 IP），别让用户往上翻聊天记录。
- 外部供应商的时限 / 配额 / 政策（Google、Supabase 等）**不许凭印象答，查证再说**。

## 常用命令

```bash
node tools/serve.js              # 本地预览 http://localhost:8080/journal.html
node tests/test-merge.js         # 跑测试（目前 49 项）
node tools/reset-password.js 邮箱 新密码   # 管理员帮用户重设密码
```

语法检查（`journal.html` 是单文件，要先把 script 块抽出来）：

```bash
ST=$(grep -n '^<script>$' journal.html | tail -1 | cut -d: -f1)
END=$(grep -n "^</script>" journal.html | awk -F: -v s="$ST" '$1>s{print $1;exit}')
sed -n "$((ST+1)),$((END-1))p" journal.html > /tmp/main.js && node --check /tmp/main.js
```

## 环境

- Windows，**没有装 Python**。批量改文件用 Edit 工具或 `sed`，别写 python 脚本。
- 线上：https://vzon7.github.io/catVweb/journal.html
- `tools/.admin-key` 是管理员密钥（能绕过数据围栏），已 gitignore，绝不能进仓库。
