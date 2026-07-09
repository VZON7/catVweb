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
