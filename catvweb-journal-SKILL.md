# catvweb — journal.html 开发 Skill

## 这个 Skill 的用途

每次开始开发 `journal.html` 前必须读这份文件。
它记录了项目的模块结构、已知代码规范、以及禁止重复踩的坑。

---

## 一、文件结构总览

```
journal.html
├── <head>
│   ├── 外部资源：Chart.js 4.4.1、docx@7.1.0（见第七节）、Google Fonts
│   └── <style> — 所有 CSS，按模块分区注释
│
├── <body>
│   ├── 装饰元素 .deco
│   ├── <nav #site-nav>
│   ├── <div .page #app>
│   │   ├── .page-header  — 含语言切换按钮 #lang-zh / #lang-en
│   │   ├── .stats-row
│   │   └── .main-layout
│   │       ├── .sidebar  — 周导航 + project 列表
│   │       └── #main-area  — journal / stats / tracker
│   └── #modal-container
│
└── <script>
    ├── 0. I18N 对象 + t() + setLang()（双语，见第十节）
    ├── 1. 顶层常量（CB_PALETTES / cbGetGroupColors / cbGetStops / getStatusLabels / triggerDownload / stripEmoji）
    ├── 2. 状态变量
    ├── 3. 数据层 (loadData / saveData / calcCoins / recalcTotalCoins)
    ├── 4. 渲染层 — Sidebar / Journal / Stats / Tracker
    ├── 5. 表单逻辑 (openForm / saveEntry / cancelForm / inline edit)
    ├── 6. Project Modal (renderModal / saveProject / deleteProject / restoreProject)
    ├── 7. Chart Builder v2
    │   ├── 7a. 顶层 palette 常量 & 工具函数（唯一来源）
    │   ├── 7b. Chart.js Plugins (CB_NumPlugin / CB_TitlePlugin / CB_DonutPlugin / CB_BgPlugin)
    │   ├── 7c. 数据预处理 (initChartBuilder / cbGetVarData)
    │   ├── 7d. 渲染函数 (cbRenderFull / cbRenderBar / cbRenderDonut)
    │   ├── 7e. UI 控制函数 (cbSetType / cbTogNum / cbTogTitles …)
    │   └── 7f. 导出函数 (cbExportDocx / cbExportPdf / exportTracker)
    ├── 8. Calendar Picker
    ├── 9. Color Picker (cp*)
    └── 10. 初始化 (事件绑定 + renderAll)
```

---

## 二、顶层常量（唯一来源规则）

以下常量**只能在 script 最顶部定义一次**，不得在函数内部重新定义。

- `CB_PALETTES` + `cbGetGroupColors()` + `cbGetStops()` — 禁止在 cbRenderBar / cbRenderDonut / CB_DonutPlugin 内重新定义
- `getStatusLabels()` — 动态从 I18N 取值，禁止在函数内定义 statusLabel 对象
- `triggerDownload()` — 所有导出统一用此函数，禁止手写 createElement('a') 下载逻辑
- `stripEmoji()` — 所有传入 docx.js TextRun 的文字必须先过此函数

> 涉及全局常量或函数重命名时，必须全文 grep 确认零残留，再输出文件。

---

## 三、CSS 规范

- 禁止重复定义同名 class
- 区块注释格式：`/* ── MODULE NAME ───── */`
- 区块顺序不打乱：Reset → NAV → LAYOUT → HEADER → STATS → SIDEBAR → MAIN AREA → ENTRY CARD → INLINE EDIT → FORM → PROJ PICKER → SELECT DROPDOWN → STATS VIEW → MODAL → CHART BUILDER → CALENDAR PICKER → COLOR PICKER → DECO

---

## 四、已知高风险区域

**renderModal()** — 整体重 render 会造成 color picker 事件监听器叠加，`cpInitPicker` 必须在结尾只调用一次。

**form 状态变量** — openForm / cancelForm / saveEntry 必须完整重置所有变量：
`formTitle, formNote, formLink, formLinkLabel, formProj, showForm, showProjPicker, formExtras, window._fv, skippedFields, openDropId`

**Chart.js plugin** — CB_NumPlugin / CB_TitlePlugin / CB_DonutPlugin / CB_BgPlugin 全局注册一次，禁止在 plugins:[] 里重复传入。

**Template literal 嵌套** — 在 template literal 里嵌套另一个 template literal 时，结尾的 backtick 容易多写或少写一个，导致 SyntaxError。写完后必须检查嵌套层数。

---

## 五、开发流程规范

### 修改前
1. 确认要改的功能属于哪个模块
2. 确认要用到的常量已在当前文件版本的顶层存在（不存在则先加入再引用）
3. 新增 CSS class 前先搜索是否已存在同名

### 修改后
1. grep 验证：无残留旧函数名、无重复定义
2. 所有 statusLabel 引用改为 getStatusLabels()，palette / getStops 引用指向顶层常量
3. 导出函数用 triggerDownload()，TextRun 传值用 stripEmoji()
4. 涉及重命名时，全文搜索确认零残留

### 新增界面元素时（双语强制规则）
- 必须同时在 `I18N.zh` 和 `I18N.en` 加对应 key
- 代码里用 `t('key')` 取值，禁止硬编码中文界面文字
- 遇到不确定的英文翻译，列出 2-3 个选项即时问用户，不要自行决定
- `Cat Token` 中英文都保留原文不翻译

---

## 六、文件版本管理

⚠️ **新对话开始时，必须先检查 `/mnt/user-data/outputs/journal.html` 是否存在且比上传文件更新。**
上传文件 = 用户手动上传的版本，不一定是最新。
outputs/ = Claude 输出的最新工作版本，优先使用。

```bash
# 新对话开始时先做这个检查
wc -c /mnt/user-data/uploads/journal.html /mnt/user-data/outputs/journal.html 2>/dev/null
# outputs/ 文件更大 → 用 outputs/；一样大或不存在 → 用 uploads/
cp /mnt/user-data/outputs/journal.html /home/claude/journal.html
```

- **同一对话继续开发**：直接在 `/home/claude/journal.html` 叠加改动，不需要用户重新上传
- **每次输出标注「第 N 次 update」**，让用户确认版本
- **用户上传文件时**：先 grep 检查关键函数（如 `renameField` / `stripEmoji` / `setLang`）确认是否为最新版本
- **开新对话时**：需要用户同时上传 `journal.html` 和 `catvweb-journal-SKILL.md`

---

## 七、docx.js 浏览器使用规范

⚠️ 踩了 5 次才找到的正确写法，不要改动。

```html
<script src="https://unpkg.com/docx@7.1.0/build/index.js"></script>
<script>
window.addEventListener('load', function(){
  if(typeof docx !== 'undefined') window.docx = docx;
});
</script>
```

- CDN 只用 **unpkg.com**（jsdelivr 在 GitHub Pages 上无法正确暴露全局变量）
- 版本固定 **@7.1.0**，文件用 **index.js**（非 min）
- 所有 TextRun 传值必须先过 `stripEmoji()`

---

## 八、localStorage key 一览

| key | 用途 |
|-----|------|
| `cj_projects` | 所有 project 数据 |
| `cj_entries` | 所有日记条目（按 dateKey 分组） |
| `catTokens` | Cat Token 总余额 |
| `cj_mypalette` | color picker 已保存颜色 |
| `cj_lang` | 语言设定（'zh' / 'en'，默认 'zh'） |
| `cj_theme` | 主题（'light' / 'dark'，默认 'light'） |
| `cj_view_${pid}` | 记录列表显示模式 `{mode, sort, year, month, _sortSet}`，每个项目独立 |
| `cj_keymig` | dateKey 格式迁移版本标记（当前 '2'） |
| `cj_tombs` | **删除名单 (tombstone)**，`{e:{id:时间戳},p:{id:时间戳}}`，记住「哪些是主动删的」 |

---

## 九、dateKey 格式与日期显示

**存储格式**：`dk(date)` 返回 `YYYY-MM-DD`（月日**补零**），例如 `2026-06-12`。
`dk()` 必须补零，确保字符串排序等同日期排序。旧数据通过 `migrateKeys()` 自动迁移（`cj_keymig='2'` 标记）。

**显示格式**：一律 `DD/MM/YYYY`，如 `28/06/2026`，由渲染层转换，不影响存储。


---

## 十、双语（i18n）规范

**架构：**
- `I18N` 对象在 script 最顶部（0 号模块），包含 `zh` 和 `en` 两套 key
- `t(key)` — 取当前语言的字符串，fallback 到 zh
- `setLang(l)` — 切换语言，自动存 localStorage，调用 renderAll()
- `lang` — 当前语言变量，默认 `'zh'`

**强制规则：**
- 禁止在 JS / HTML 里硬编码中文界面文字
- 新增界面元素必须同时加 I18N.zh 和 I18N.en 的 key，用 t('key') 取值
- 数据层（localStorage、field.label、entry 内容）不翻译，保持原样
- 语言切换只改显示，不动数据
- `status_archived` 英文显示为 `ARCHIVED`（全大写，印章样式）
- `Cat Token` 中英文都不翻译

**遇到不确定的翻译：** 列出 2-3 个选项即时问用户，不自行决定。

---

## 十一、Python 操作安全规则（全部中文写入场景）

⚠️ 以下规则涵盖所有 Python 写入操作，违反任何一条都可能导致乱码或文件损坏。

### 中文内容写入规则

**根本原则：** 凡是包含中文的内容，不用 Python bytes 模式拼接，改用临时文件写入。

```python
# ❌ 错误：Python bytes 模式拼接中文 — 写入的是原始字节序列，不是字符串
new_js = b"  const label='\xe6\x9c\xac\xe5\x91\xa8';"  # 浏览器读到乱码

# ✅ 正确：写临时 .js 文件，用 str 模式写中文，再 bytes 读取插入
with open('/tmp/snippet.js', 'w', encoding='utf-8') as f:
    f.write("  const label='本周';")
with open('/tmp/snippet.js', 'rb') as f:
    new_js = f.read()
```

**str_replace 写中文时可直接写：** str_replace 工具内部处理 UTF-8，不需要额外转换。

### en key 不得写入中文

```python
# ❌ 错误：en key 写入中文字节
new_en = "cp_my:'我的颜色包',".encode()  # 中文写进 en → 乱码

# ✅ 正确：en key 只用英文 ASCII
new_en = b"cp_my:'My Color Bag',"
```

### 边界查找规则

禁止用 `find('}};')` 找代码块结束点（会意外包含后续代码）。
正确做法：用函数名或注释作为边界：

```python
# ✅ 正确
s = c.find(b'function renderStats()')
e = c.find(b'\nfunction renderMonth()')
```

### 禁止使用的字符

Python 写入 JS 字符串时，禁止使用 Unicode 弯引号（`\u2018` `\u2019`）和 Unicode 省略号（`\u2026`）。
正确做法：省略号用 `'...'`，引号用直引号 `'` 或 `"`。

### CSS class 改动前置检查
改任何 CSS class 的样式之前，先 grep 该 class 在 JS/HTML 里的使用处——断言只证明字符串改了，不证明有人在用（`.cb-exp-*` 死规则事故教训）。

### I18N 块保护

Python 做字符串全局替换时，先定位 I18N 块边界再操作：
```python
i18n_start = content.find('const I18N={')
i18n_end = content.find('\nlet lang=', i18n_start)
# 只在 content[:i18n_start] + content[i18n_end:] 范围内替换
```
不排除会把 I18N 内部的字符串值替换成 `t('key')` 调用，造成循环依赖崩溃。

---

## 十二、Canvas 坐标系规则

Chart.js doughnut 的圆心是 `chartArea` 中心，`arc.outerRadius` 基于 `chartArea` 计算。
边界检测用 canvas 的 `W/H`（`ch.canvas.width` / `ch.canvas.height`）。

**两者不能混用：**
- `cx/cy` 必须用 `chartArea` 中心
- 边界计算时，`(limitX - cx) / cosA` 里的 `cx` 和 `limitX` 必须在同一坐标系
- `layout.padding` 会让 `chartArea` 比 canvas 小，偏移量 = padding 值

---

## 十三、I18N 操作安全规则

⚠️ 以下三条各踩过一次，直接导致页面崩溃：

**全局替换前必须排除 I18N 块**（见第十一节）

**Template literal 里禁用字符串拼接语法**
在 backtick template literal 内取 I18N 值，只能用 `${t('key')}`，绝对不能用 `'+t('key')+'`：
```js
// ✅ 正确：template literal 内用 ${}
`<button>${t('form_save')}</button>`
// ❌ 错误：字符串拼接语法在 template literal 内是 SyntaxError
`<button>'+t('form_save')+'</button>`
```

**I18N 必须是 script 最顶部第一段代码**
`const I18N` 使用 `const` 声明，有 Temporal Dead Zone。任何在 I18N 定义前调用 `t()` 的代码都会报 `ReferenceError: Cannot access 'I18N' before initialization`。每次移动代码块后，验证 `const I18N=` 仍然是 script 的第一行有效代码。

---

## 十四、UI 整改安全规则

- `cb-canvas-${pid}` id 和父容器结构不能动，CB_DonutPlugin / CB_BgPlugin 靠它定位
- `cb-side-panel` class 名不能改，统计面板展开动画依赖它
- `.proj-status.active / .done / .archived` class 名不能改，只改 CSS 属性值
- 按钮文字改动必须改 I18N.zh + I18N.en，不能硬编码 HTML
- `border-radius:999px` 保留例外：`.coin-pill` / `.proj-badge` / color 色点 / `#lang-zh` `#lang-en`
- 改颜色先改 `--purple` 等变量的值，不删变量名，全部验证后再清理
- 每次大改后用 Node `--check` 验证 script 块语法无误再输出

---

## 十五、新拟态（Neumorphism）开发规则

⚠️ 凹陷容器内子元素 box-shadow 失效是高频踩坑，务必遵守：

- **凹陷容器内子元素**：阴影缩小为 3px（非 6px），具体数值查设计文档第二节「七日效果」
- **蓝底按钮 active**：只用单向 `inset var(--sh-blue-inset)`，不加白色高光（穿帮）
- **白纸卡片**（`.cb-chart-area`/`.cb-side-panel`）：用 `--paper-shadow`；纸内文字禁用 `--dark`/`--mid` 主题翻转变量
- **浅凹托盘**（`.cb-wrap`）：3px inset，背景跟随 `--lavender`
- **纯色背景元素**：不用 `overflow:hidden` 裁切，外层容器背景=顶栏色，内容区单独设背景
- **阴影数值唯一来源**：查 `catvweb-design-system.md`，不凭记忆填写

---

## 十六、SVG 图标规则

⚠️ **任何 SVG 图标写入代码前，必须先查 `catvweb-design-system.md` 第三节**，包含：
- path 数据、width / height / viewBox 尺寸
- stroke 颜色和粗细
- filter drop-shadow 三态数值（默认 / hover / active）

**不可凭记忆写入，即使「看起来差不多」也必须核对。**

**定案图标速查：**

| 图标 | 尺寸 | 关键数据 |
|---|---|---|
| 左箭头 | `14×12` | path: `M8 1L2 6L8 11M2 6H13`，stroke `#266ea7`，width 2 |
| 右箭头 | `14×12` | path: `M6 1L12 6L6 11M12 6H1`，stroke `#266ea7`，width 2 |
| 日历 | `26×26` | 顶栏 h=5，横线 y=9，数字 x=13 y=17，`dominant-baseline="central"` |

**图标阴影（统一三态）：**
```css
/* 默认 */
filter: drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px #fff);
/* hover */
filter: drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px #fff);
/* active */
filter: drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7));
```

三态 filter 通过 CSS class 实现，不写在 SVG inline style 里。

---

## 十七、多单位数字字段规则

数字字段（`type:'number'`）可以拥有多个子单位（如 time → min / hour），数据结构和改动范围分散在 5 处，改动前必须确认全部位置：

**数据结构：**
```js
f.units = ['min','hour']   // 字段定义，数组，可为空
f.unit = ''                 // 旧版单一字符串，保留向后兼容，不删
```

**记录值存储格式：**
- 单单位 / 旧数据：`fields[f.id] = "30"`（字符串）
- 多单位（`f.units.length > 1`）：`fields[f.id] = [{unit:'min',val:'30'}, {unit:'hour',val:'1'}]`（数组）

**改动涉及的 5 个位置，缺一不可：**
1. **项目设置 Modal**（renderModal）— 单位列表 UI：`addUnitInModal` / `removeUnit` / `renameUnit`
2. **填写记录表单**（buildNewForm / saveEntry）— 每个单位一行独立 input，保存时遍历 units 收集数组
3. **Inline Edit**（buildInlineEdit / saveEdit）— 同上，从 DOM 读取多个 `edf-${f.id}-${unit}` input
4. **显示层**（Entry Card / Tracker 卡片）— 数组必须 `.map(o=>o.val+' '+o.unit).join(' · ')`，禁止直接 `${v}` 插值（会变成 `[object Object]`）
5. **统计/计算**（calcCoins / Weekly Stats projStats / Chart Builder `_varData`）— 必须判断 `Array.isArray(v)`，按单位分别处理，不可不同单位直接相加

**Chart Builder 专属规则：**
多单位字段在 `initChartBuilder` 的 `vars` 构建时，拆分成多个独立变量，`key = f.id+'::'+unit`，`label = f.label+' ('+unit+')'`，让颜色分配/图例/统计天然走现有单变量逻辑，不需要改下游渲染代码。

**默认勾选规则：**
- 字段只有 1 个或 0 个单位 → 默认勾选（不变）
- 字段有 ≥2 个单位（拆分后的每个子变量）→ 不默认勾选，用户手动选

**每次改动后必须 grep 确认：**
```bash
grep -n "f.id\]" journal.html   # 确认所有读取点都判断了 Array.isArray
```

---

## 十八、Unicode 转义排查规则

⚠️ 硬编码中文文字可能以 Unicode 转义形式存在（如 `'\u6b21'` = 「次」），**普通 grep 中文字符搜不到**，必须额外排查。

**排查双语硬编码时，同时跑两次搜索：**
```bash
grep -n "次" journal.html          # 搜原始字符
grep -nE "\\\\u[0-9a-fA-F]{4}" journal.html  # 搜转义形式
```
找到后人工确认是否为中文转义，逐一替换为 `t('key')`。

---

## 十九、Script 块语法检查固定流程

⚠️ journal.html 含 4 处 `<script>` 标签：CDN 引用小脚本（docx包装）、主逻辑块、以及**字符串内嵌**的 print 用假标签（在 cbExportPdf/exportTracker 函数里，不是真正的 HTML 标签）。

**注意：文件是 CRLF 换行**（`\r\n`），必须用 `-P` 模式 + `\r?$`。

```bash
START=$(grep -nP "^<script>\r?$" journal.html | sed -n '2p' | cut -d: -f1)
END=$(grep -nP "^</script>\r?$" journal.html | sed -n '2p' | cut -d: -f1)
sed -n "$((START+1)),$((END-1))p" journal.html | tr -d '\r' > /tmp/check.js && node --check /tmp/check.js
```

每次大改后用此固定流程跑一次。

---

## 二十、大块函数替换安全规则

⚠️ 替换整个函数时（如 renderStats、renderMonth），必须遵守以下流程，否则容易产生重复定义。

**替换前：确认边界**
```bash
# 确认目标函数存在且唯一
grep -c "function renderStats" journal.html  # 应该输出 1
```

**替换后：立即验证唯一性**
```bash
grep -c "function renderStats" journal.html  # 必须仍是 1，若为 2 说明追加了重复定义
```

**str_replace 找不到目标时会静默失败**，新内容不会替换旧内容，而是不做任何事。
此时若用 Python bytes 模式写入，新内容可能被追加到文件末尾，导致两套函数并存。

**正确的大块替换流程：**
```python
# 1. 用唯一 marker 定位起点和终点
s = c.find(b'// STATS\r\nfunction renderStats()')
e = c.find(b'// CALENDAR PICKER')  # 用下一个唯一注释作为终点
print(f"s:{s} e:{e}")  # 必须都 > 0，否则停止操作

# 2. 替换
result = c[:s] + new_block + c[e:]

# 3. 写入后立即验证
```

---

## 二十一、已知的「看起来像 bug 但其实是设计」清单

避免下次对话误判成缺陷去"修复"：

- **`cb_unit_suffix` 只有 zh key，没有 en key**——英文版数字格式走 `lang==='en'?('x'+v):...` 分支，直接拼 `'x'`，不调用这个 key，所以英文不需要对应翻译。不是双语缺失。
- **`f.unit`（旧字符串单位）仍保留在多处代码里，与新的 `f.units`（数组）共存**——这是向后兼容设计，旧项目数据没有 `units` 时回退用 `unit`。不要删除 `f.unit` 相关代码。

---

## 二十二、与 ZONZON 沟通约定

效果名称、颜色用语、沟通词汇完整表见 **`catvweb-design-system.md` 第十二节**。

翻译决策：遇到不确定的英文翻译，列出 2-3 个选项问 ZONZON，不自行决定。

---

## 二十三、Tracker 模块结构（第156次 update 后）

### CSS Class 速查
| Class | 用途 |
|---|---|
| `.tracker-tabs` | 顶部筛选标签行容器 |
| `.tracker-tab` | 单个筛选标签（全部/进行中/已完成/已归档） |
| `.tracker-tab.active` | 选中态，凹陷效果 |
| `.tracker-proj-card` | 每个项目的卡片容器，标准凸起 |
| `.tracker-proj-card.archived` | 已归档卡片（opacity 0.8） |
| `.tracker-proj-header` | 卡片头部（可点击，展开/收起） |
| `.tracker-proj-header:hover` | 轻微白色高亮 |
| `.tracker-proj-archived` | 已归档头部（opacity + 名称灰色） |
| `.tracker-proj-name` | 项目名称文字 |
| `.tracker-proj-meta` | 右侧信息区（records + last） |
| `.tracker-proj-records` | 记录数文字，12px，数字 800/深色，文字 700/灰 |
| `.tracker-proj-last` | last · 日期，9px，#9AA0A8 |
| `.tracker-proj-chevron` | 展开箭头容器，含三态 filter CSS |
| `.tracker-proj-chevron.open` | 展开时 rotate(90deg) |
| `.tracker-proj-body` | 展开区容器，横向雕刻线分隔 |
| `.tracker-entry-row` | 单条记录行 |
| `.tracker-date` | 记录日期，11px，灰色，min-width:44px |
| `.tracker-entry-content` | 记录内容区 |
| `.tracker-entry-title` | 记录标题，12px，600 |
| `.tracker-entry-fields` | 字段标签行 |
| `.tracker-field-tag` | 字段值标签，紫色系胶囊 |
| `.tracker-entry-note` | Note 文字，11px，斜体 |
| `.tracker-empty` | 空状态提示 |
| `.cb-wrap` | Chart Builder 容器（每个项目展开区底部） |
| `.tr-space-key` | 键帽收起按钮（分页排右侧），含 `--sk-base/face/text` 自定义属性 |
| `.tr-sk-face / .tr-sk-label / .tr-sk-arrow` | 键帽内部结构（键面/文字/图标） |
| `.tr-date-area` | 记录行日期跳转容器（包裹日期+图标+tooltip） |
| `.tr-date-icon` | 跳转返回图标（↩），默认 opacity .3 |
| `.tr-date-tip` | 跳转 tooltip（「回到当天」），position absolute |
| `.tr-detail-title` | 详细记录标题（带详细记录雕刻线） |
| `.tr-view-panel` | View 面板容器（显示模式+排序） |
| `.journal-date-hdr` | Journal 日期标头（统计卡片和记录之间） |
| `.cb-canvas-wrap` | 图表 canvas 容器（主题感知背景） |

### JS 函数速查
| 函数 | 用途 |
|---|---|
| `renderTracker()` | 整体渲染 Tracker 视图，读 `window._trackerTab` 和 `window._trackerOpenId` |
| `window._trackerTab` | 当前筛选标签（'all'/'active'/'done'/'archived'） |
| `window._trackerOpenId` | 当前展开的项目 id（null = 全收起） |
| `applyChartTheme()` | 更新 Chart.js 全局默认值（颜色/网格线），在 `applyTheme()` 内调用 |
| `mkSpaceKey()` | 创建键帽收起按钮 DOM 元素 |

### 展开区结构（重要：不要破坏 Chart Builder）
```
.tracker-proj-body
  ├── .tr-view-panel（View 面板，仅 _vsOpen 时）
  ├── dtrow（含 .tr-detail-title + View 按钮）
  ├── entry rows（peF.slice 渲染，每行含 .tr-date-area 跳转区）
  ├── 空筛选提示（peF 为空但 pe 有记录时）
  ├── pagination bar + .tr-space-key / 独立 skRow + .tr-space-key
  ├── 已归档操作按钮行（仅 isArchived）
  └── .cb-wrap（Chart Builder，id="cb-{p.id}"）
```
⚠️ Chart Builder 在每个项目展开区底部，改动展开区时不要误删或破坏 `.cb-wrap`。

### 项目行内容格式
```
● 项目名  [状态徽章]  [N records · last · DD/MM/YY]  [→箭头]
```
- 日期格式：DD/MM/YY（如 22/06/26），从 `pe[0].dateKey` 取最新记录日期
- 数字加粗深色，records 中等灰，last · 日期浅灰小字
- 已归档行额外显示 ARCHIVED 印章（rotate -7deg，红框）

### 状态徽章规格
- Active/Done：凹陷胶囊（inset 2px），`.proj-status.active/.done`
- Archived：印章，`border: 1.5px solid #A32D2D; border-radius: 3px; transform: rotate(-7deg); box-shadow: none;`

---

## 二十四、暗色模式硬编码审计规则

⚠️ 本次开发（#195–197）同类错误出现 5 次以上，每次创建新 UI 时硬编码颜色都会溜进去。

**输出前必须跑以下 grep，每个命中必须确认是否需要替换为主题变量：**

```bash
# 排除 CSS 变量定义行、I18N 块、注释行，只看渲染逻辑
grep -n "#fff\|#333\|#444\|#555\|#666" journal.html | grep -v "var(\|I18N\|//\|--"
grep -n "rgba(255,255,255" journal.html | grep -v "var(\|sh-light\|line-light\|inset\|sk-face"
grep -n "rgba(0,0,0" journal.html | grep -v "var(\|sh-dark\|tooltip\|inset"
```

**canvas 特别规则：**
- `ctx.fillStyle` 和 `ctx.strokeStyle` 禁止硬编码 `#fff`、`#333` 等，必须用 `theme==='dark'?暗色值:亮色值` 三元
- 图表背景：亮 `#fff` / 暗 `#2C2F38`
- 标签浮框背景：亮 `rgba(255,255,255,0.97)` / 暗 `rgba(44,47,56,0.95)`
- 标签浮框文字：亮 `#333` / 暗 `#C8CDD6`

**导出特别规则：**
- DOCX / PDF 导出前必须临时 `theme='light'; applyChartTheme(); chart.update('none');`，截图后还原
- 不要让暗色主题的图表颜色泄漏到导出文件里

---

## 二十五、CSS 暗色模式优先级规则

⚠️ `[data-theme="dark"] .class`（0-1-1）和 `.class:hover`（0-1-1）权重相同，后写的覆盖先写的。

**一条规则：** 写暗色模式覆盖（`[data-theme="dark"] .xxx`）时，必须同时重新声明所有 hover / active 状态会改变的 CSS 自定义属性，不能只覆盖基础值。

```css
/* ❌ 错误：只覆盖基础值，hover 的 --sk-text 被暗色默认值覆盖 */
.tr-space-key:hover { --sk-text: var(--purple); }  /* 0-1-1 */
[data-theme="dark"] .tr-space-key { --sk-text: #6B717E; }  /* 0-1-1，后写，覆盖 hover */

/* ✅ 正确：暗色 hover 显式重新声明 */
[data-theme="dark"] .tr-space-key:hover { --sk-text: var(--purple); }
```

**速记：** 暗色默认改了什么属性 → 暗色 hover/active 必须重新设回交互态的值。

---

## 二十六、i18n 完整性检查规则

⚠️ 双语数组/标签只定义了中文版、到处使用却没有 lang 判断，是高频遗漏。

**每次更新后，跑以下检查：**

```bash
# 找 I18N.zh 块以外的渲染代码中的中文字符（排除注释和字符串定义）
START=$(grep -nP "^let lang=" journal.html | head -1 | cut -d: -f1)
sed -n "${START},\$p" journal.html | grep -nP "[\x{4e00}-\x{9fff}]" | grep -v "//\|I18N\|console\|t('"
```

**每个命中必须确认：**
- 是否在 `lang==='zh'` 分支内（✅ 正确）
- 还是在无 lang 判断的通用路径内（❌ 需要加三元或 t() 调用）

**高风险区域：**
- 天/月名数组（如 `['日','一','二','三','四','五','六']`）必须有 `lang==='zh'?中文:英文` 三元
- 日期格式化字符串（如 `年`、`月`、`日`、`星期`）必须走 lang 分支
- canvas 内绘制的文字（不走 DOM，无法用 CSS 变量，必须 JS 层判断）

## 二十七、内联确认弹窗规范

⚠️ **永远不使用** `confirm()` / `alert()` / `prompt()` — 它们与 neumorphic 风格不一致。所有用户确认统一使用 `modal-container` 内联弹窗。

**三按钮模板（导航离开时）：**
用于 form 有内容时用户要切换日期/视图。调用 `_showNavConfirm(callback)`。
- ✓ 先保存再离开（紫色主按钮，全宽）— 调用 `saveEntry()` 后执行 callback；未选 project 时点击会关闭弹窗并闪烁 project 按钮
- 继续编辑（灰色副按钮）— 关闭弹窗，回到 form
- 放弃（红色副按钮）— 调用 `cancelForm()` 后执行 callback

**两按钮模板（Cancel 时）：**
用于 form 有内容时用户点 Cancel。调用 `safeCancelForm()`。
- 继续编辑 — 关闭弹窗
- 放弃 — 调用 `cancelForm()`

**关键函数映射：**
| 场景 | 调用 |
|---|---|
| sidebar 日期点击 | `tryNavigateDate(d)` |
| 日历弹窗选日期 | `pickCalDate` 内部调 `tryNavigateDate` |
| tracker 记录行跳转 | `tryNavigateDate(date)` |
| 视图切换（周/月/tracker） | `tryNavAway('stats'\|'month'\|'tracker')` |
| Cancel 按钮 | `safeCancelForm()` |

**新增导航入口时**，必须判断 `showForm && hasFormContent()`，走 `tryNavigateDate` 或 `tryNavAway`。

## 二十八、renderAll 后状态恢复清单

⚠️ `renderAll()` 会重建整个 DOM。以下动态状态必须在 `renderAll()` 返回后立即恢复：

| 状态 | 恢复方式 | 位置 |
|---|---|---|
| form title 值 | `el.value = formTitle` | renderAll 末尾 |
| form note 值 | `el.value = formNote` | renderAll 末尾 |
| form link/label 值 | `el.value = formLink/formLinkLabel` | renderAll 末尾 |
| **textarea 高度** | `autoGrow(el, maxRows)` | 紧跟值恢复之后 |

**规则：任何通过 JS 动态设定的 DOM 属性（style.height、scrollTop、classList），如果不在 HTML 模板里声明，renderAll 后都会丢失，必须补恢复代码。**

新增 textarea 或可变高元素时，检查：
1. 值是否在 renderAll 末尾恢复 ✓
2. autoGrow 是否在值恢复后调用 ✓
3. overflow 是否正确（≤maxRows 时 hidden，超出时 auto）✓

## 二十九、交互反馈强制清单

⚠️ **inline style 无法定义伪类** —— 用 `style="..."` 写的按钮永远不会有 hover / active 效果。

**强制规则：**
- 任何可点元素必须同时具备 `:hover` 与 `:active` 态
- 可点元素一律用 CSS 类定义，**禁止用 inline style 写按钮**
- 新增可点元素后自查：鼠标移上去有变化吗？按下去有变化吗？

**新拟态标准三态：**
```css
.x        { box-shadow:2px 2px 5px var(--sh-dark), -2px -2px 5px var(--sh-light); transition:box-shadow .15s; }
.x:hover  { box-shadow:4px 4px 8px var(--sh-dark), -4px -4px 8px var(--sh-light); }
.x:active { box-shadow:inset 3px 3px 6px var(--sh-dark), inset -2px -2px 5px var(--sh-light); }
```

**另注：** `.active` 类若由 `view` 变量驱动（如 syncNav），弹窗类入口不在其中，必须在 open/close 函数里手动加减。

## 三十、折叠展开的可见性规则

⚠️ 展开后若可视区域没有变化，用户会认为按钮坏了。

**强制规则：**
- 展开的内容**不得落入已有滚动容器内部**（否则它只是让滚动条变长，屏幕上什么都没发生）
- 展开必须在**点击位置正下方**产生可见位移
- 配 `scrollIntoView({behavior:'smooth',block:'nearest'})` 兜底
- 折叠按钮自身要有开合状态区分（凸起 ↔ 凹陷 / 箭头翻转）

**自查：** 展开后截图对比，可视区若无变化即为功能失效。

**同一容器内多个折叠区** → 考虑互斥展开，避免弹窗超过 `max-height` 后需要长距离滚动。

## 三十一、按钮与操作对象相邻规则

⚠️ 按钮离谁近，用户就认为它作用于谁。

**强制规则：**
- 主动作按钮与其作用对象之间**不得插入无关内容**
- 按钮附近若有可能被误认为对象的内容（如相邻的统计文字），该内容须设 `user-select:none`
- 按钮文案指明对象：`复制` → `复制这段数据`

**三个检查点：**
1. 按钮和对象之间有没有插入别的东西？
2. 按钮附近有没有别的东西会被误认成对象？
3. 文案有没有说清楚作用于什么？

**适用范围：** 复制、删除、保存、导出、发送 —— 任何「对某个东西做某件事」的按钮。

## 三十二、离线壳（PWA）规则

第 221 次上线。三个新文件：`manifest.json`（名片）、`sw.js`（影印员）、`icons/`（8 个图标）。

### ⚠️ 改完 journal.html 必须做的事

**把 `sw.js` 顶部的 `VERSION` 数字加 1**，否则已安装的手机会继续用旧缓存，看不到你的改动。

```js
const VERSION = 1;   // ← 每次改 journal.html 就 +1
```

### 注册代码必须写成一行

`<head>` 里的 Service Worker 注册代码是**单行** `<script>...</script>`，不可拆成多行。

原因：第十九节的语法检查靠 `grep -nP "^<script>\r?$"` 数到**第 2 个**独占一行的 `<script>` 来定位主逻辑块。多一个独占行的 `<script>` 会让定位全部错位。

改动 `<head>` 后必须复查：

```bash
grep -cP "^<script>\r?$" journal.html   # 必须是 2
```

### 缓存策略（不要随意改）

| 资源 | 策略 | 原因 |
|---|---|---|
| `.html` | 网络优先，3 秒超时回退缓存 | 保证改完代码刷新就看到新版，不会卡在旧版本 |
| 图标 / 字体 / CDN 脚本 | 缓存优先 | 版本固定不会变，直接用缓存最快 |

CDN 三个地址（docx@7.1.0、Chart.js 4.4.1、Google Fonts）写死在 `sw.js` 的 `CDN` 数组里。
**换 CDN 版本时，`sw.js` 里的地址要同步改**，否则离线时新版本抓不到。

### 图标（第222次定案）

**底色 `#1e5a8a`（深蓝）**，四个文件在 `icons/`：

| 文件 | 尺寸 | 内容占比 | 用途 |
|---|---|---|---|
| `icon-192.png` | 192 | 92% | 安卓桌面 |
| `icon-512.png` | 512 | 92% | 高清屏 / 启动画面 |
| `icon-maskable.png` | 512 | **74%** | 安卓专用，留安全区 |
| `icon-apple.png` | 180 | 90% | iPhone（`journal.html` 里引用） |

**源图：`Pictures/journal66-clean.png`** —— 已抠好的透明 PNG，重做图标直接用这份。
（`Pictures/journal 66 -half book.png` 是原始素材，带水印和假透明格子，不要直接用。）

**改图标要同步 4 个地方：** `manifest.json`（3 处）+ `journal.html` 的 `apple-touch-icon`（1 处）+ `sw.js` 的 `CORE` 数组（4 处）+ `VERSION` 加 1。

⚠️ **maskable 内容占比不能超过 74%**：安卓会把图标裁成圆形，超了会切到耳朵或横幅上的字。
**改完必须验证**——套一个圆形遮罩渲染出来看，别凭感觉。

⚠️ **换图标后 iPhone 必须删掉桌面图标重新添加**，iOS 会死死缓存旧图标，不重装看不到新的。

## 三十三、删除名单与新旧记号（同步地基·第223次）

### 为什么存在

没有这两样，跨设备同步会出现**记录复活 (zombie records)**：A 设备删掉的记录，被 B 设备的旧副本同步回来，删一次回来一次，永远删不掉。

| 名词 | 英文 | 是什么 |
|---|---|---|
| 删除名单 | tombstone | `cj_tombs`，记住「哪些 id 是主动删的」 |
| 新旧记号 | timestamp | 每条记录/项目的 `updatedAt`，两边打架时新的赢 |

### ⚠️ 删除名单是独立的表，不要改成 `deleted` 字段

名单存在 `cj_tombs`，**没有往记录对象里加 `deleted` 标记**。这是刻意的：渲染层四千行到处读 `entries`，加字段就得审计每一个读取点（第十七节多单位字段就是这么翻车的）。用外挂表，渲染层一行都不用动。

**别把这个设计退回去。**

### 新增删除入口时必须做的事

任何新的删除路径，都要在 `filter` 掉数据的同时把 id 记进名单：

```js
entries[key]=entries[key].filter(e=>e.id!==id);
tombEntry(id);        // ← 别忘了这句
```

项目删除要连带记录一起记：`Object.values(affectedEntries).forEach(arr=>arr.forEach(e=>tombEntry(e.id)))` + `tombProj(id)`。

**有撤销功能的删除，撤销时必须 `untombEntry` / `untombProj`**，否则撤销回来的东西会在下次合并时被 `purgeTombed()` 再清一遍。

### 新增/修改记录时必须更新记号

```js
e.updatedAt=Date.now();      // saveEdit、saveProject、restoreProject 都要
```

漏了的后果不是报错，是**这条改动永远同步不出去**——静悄悄地什么都没发生。

### 合并的三条规则（`bkRun`）

1. 对方有、我没有 → 收下
2. 两边都有 → 比 `updatedAt`，新的赢
3. **我删过的 → 永远不收**

合并完跑 `purgeTombed()` 清掉对方删过的，再跑 `recalcTotalCoins()`。
**猫币不参与同步**——它是派生值，合并后重算即可，这样天然没有冲突。

### 记录 id 格式

`newEntryId()` = 毫秒 ×1000 + 随机三位，同毫秒内强制递增。

⚠️ **必须保持数字型**：排序用 `a.id-b.id`（[journal.html:1030](journal.html#L1030)），模板里是裸数字插值 `startEdit(${e.id},...)`。改成字符串会直接 SyntaxError。

### 验收方式

```
导出备份 → 删掉几条 → 导入刚才那份备份（合并模式）→ 删掉的不能回来
```

回归测试：`node tests/test-merge.js`。它抽取 journal.html 的原文来跑，不是副本，23 项场景覆盖复活、冲突、级联删除、撤销、老数据回填、id 防撞。
