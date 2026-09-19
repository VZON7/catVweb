---
name: journal-design
description: catVweb 的新拟态(Neumorphism)设计系统。写任何颜色、阴影、圆角、SVG 图标、按钮或卡片样式之前必读——数值的唯一来源是这份文档，禁止凭记忆或模仿周围代码填写。改 CSS、加界面元素、调外观时先调用。
---

完整对照表在仓库根目录的 `catvweb-design-system.md`。**写数值之前先查对应章节。**

```
Read c:\Users\User\Documents\GitHub\catVweb\catvweb-design-system.md
```

这份文档开头就写着：

> ⚠️ **任何 SVG 图标、阴影数值、颜色在写入代码前，必须先查本文档对应章节，不可凭记忆写入。**

**「照着旁边的代码抄」也算违规** —— 抄对了是运气，抄错了没人发现。
2026-09-19 就是这么把 `rgba(123,104,238,0.07)` 硬写进 CSS 的。

颜色全部变量化，唯一来源是 `journal.html` 的 `:root`。
**改颜色改变量的值，不改引用处，也不新增裸色值。**
