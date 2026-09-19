---
name: journal-dev
description: 改 catVweb 的 journal.html 之前必读。包含文件结构、顶层常量的唯一来源规则、CSS 规范、双语(i18n)强制规则、已知高风险区域、UI 整改安全规则、SVG 图标规则、语法检查流程，以及一长串不许重复踩的坑。凡是要编辑 journal.html 的代码、样式、文案，动手前先调用。
---

完整规范在仓库根目录的 `catvweb-journal-SKILL.md`。**现在就把它读完再动手。**

```
Read c:\Users\User\Documents\GitHub\catVweb\catvweb-journal-SKILL.md
```

几条最容易漏的，先记住：

- 新增任何界面文字 → **必须同时在 `I18N.zh` 和 `I18N.en` 加 key**，代码里用 `t('key')`，禁止硬编码中文
- 改完 → 抽出 script 块跑 `node --check`，再跑 `node tests/test-merge.js`
- 改 `journal.html` → `APP_BUILD` 和 `sw.js` 的 `VERSION` 一起加 1
- 新增 CSS class 前先 grep 搜一遍有没有同名的
- 颜色 / 阴影数值 → 去查 `catvweb-design-system.md`，见 `journal-design` skill
