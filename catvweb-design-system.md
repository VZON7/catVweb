# catvweb journal.html — 新拟态设计系统参考文档
> 更新于 第84次 update｜用于和 Claude 沟通时指定颜色、阴影、效果

---

## 一、基础颜色变量

| 变量名 | 色值 | 用途 |
|---|---|---|
| `--lavender` | `#E8EBF1` | **全站背景色**，所有结构性元素同色 |
| `--dark` | `#2d2b3d` | 主文字色 |
| `--mid` | `#888888` | 辅助文字（最浅不低于此值） |
| `--purple` | `#266ea7` | **主强调色**（蓝），按钮、active文字、链接 |
| `--pink` / `--danger` | `#E53935` | 删除红，危险操作 |
| `--cyan` | `#42C6FF` | 备用青色（暂未大量使用） |

### 功能性固定色（不走变量）
| 用途 | 色值 |
|---|---|
| 新纪录/保存按钮 默认暗影 | `#B8BEC8` |
| 新纪录/保存按钮 active 暗影 | `#1e5a8a` |
| 周报告按钮 默认阴影 | `#c8cedb` |
| 周报告按钮 hover 阴影 | `#B2B7C4` |

---

## 二、阴影效果速查（按「我看到的东西」命名）

### 标准凸起效果
```
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF
```
→ CSS变量：`var(--neu-raised)`
→ 用在：stat card、entry card 卡片本身

### 标准凹陷效果（sidebar 同款）
```
box-shadow: inset 6px 6px 12px #C8C8D8, inset -6px -6px 12px #FFFFFF
```
→ CSS变量：`var(--neu-inset-val)`
→ 用在：sidebar 容器、新记录/编辑表单 外层背景

### 七日效果（凹陷容器内三态）
专指凹陷容器内子元素的完整三态：
- 默认：无阴影（平贴）
- hover：`box-shadow: 3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF`
- active / 选中：`box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF`

→ 用在：日期格、周报告/项目追踪导航按钮、Note/Link 切换按钮、Cancel 按钮、跳过按钮

### 变量效果（proj-item 同款）
- 默认：无阴影
- hover：轻凸起（同七日效果 hover）
- active：按住瞬间轻凹陷（同七日效果 active）
- 无持久选中状态

→ 用在：项目列表拖拽项

### 新纪录效果（蓝底按钮专用）
```
默认：  box-shadow: 5px 5px 10px #B8BEC8, -5px -5px 10px #FFFFFF
hover：  box-shadow: 10px 10px 18px #B0B8C4, -10px -10px 18px #FFFFFF
active：  box-shadow: inset 4px 4px 9px #1e5a8a, inset -2px -2px 5px rgba(255,255,255,0.15)
```
→ 暗影用灰色系（不用蓝色），让按钮从背景长出来
→ 用在：「新纪录」按钮、「✓ 保存」按钮

### 周报告效果（灰底按钮专用）
```
默认：  box-shadow: 4px 4px 9px #c8cedb, -4px -4px 9px #FFFFFF
hover：  box-shadow: 8px 8px 18px #B2B7C4, -8px -8px 18px #FFFFFF
active：  box-shadow: inset 3px 3px 7px #c8cedb, inset -3px -3px 7px #FFFFFF
```
→ 用在：「周报告」按钮

### 横向雕刻线（待改）
```css
/* 现在（旧）*/
box-shadow: 0 1px 0 #FFFFFF, 0 -1px 0 #C8C8D8;
```
→ **待办**：改成跟竖向雕刻线一样用 border 实现

### 竖向雕刻线
```css
width: 0; height: 14px; flex-shrink: 0; align-self: center;
border-left: 1px solid #C9D0DC; border-right: 1px solid #FFFFFF;
```
→ 原理：左暗右亮，模拟刻入感
→ 用在：entry card 字段与字段之间的分隔线

### Project 徽章效果（双层立体）
```
外层凸起框：
  background: var(--lavender); padding: 4px;
  box-shadow: 4px 4px 9px #C8C8D8, -4px -4px 9px #FFFFFF;

内层项目色：
  background: rgba(项目色,.16); color: 项目色;
  border: 1.5px solid 项目色;
  box-shadow: inset 1.5px 1.5px 3px rgba(0,0,0,.12), inset -1px -1px 2px rgba(255,255,255,.5);
```
→ 用在：entry card 左上角项目名徽章、inline edit 顶部项目名

### 布凹效果（猫爪币专用）
```
box-shadow:
  4px 4px 10px #C0C8D8,                    /* 外轮廓轻凸 */
  -4px -4px 10px #FFFFFF,
  inset 0 3px 8px rgba(180,190,210,0.55),   /* 中央布面下沉 */
  inset 0 -1px 3px rgba(255,255,255,0.9);   /* 底部高光 */
```
→ 外层轻凸 + 内层从上方打入暗影，模拟布料中央凹陷的弧面感
→ 用在：entry card 右上角猫爪币（`🐾 +N`）

### NAV 栏阴影
```
box-shadow: 0 4px 10px #C8C8D8, 0 -2px 6px #FFFFFF
```
→ 用在：顶部导航栏底边

---

## 三、SVG 图标系统（无方框，drop-shadow 贴合轮廓）

### 导航箭头（左 / 右）

| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="14" height="12" viewBox="0 0 14 12"` |
| 左箭头 path | `M8 1L2 6L8 11M2 6H13` |
| 右箭头 path | `M6 1L12 6L6 11M12 6H1` |
| 颜色 | `#266ea7`，`stroke-width="2"` |
| 端点 | `stroke-linecap="round" stroke-linejoin="round"` |
| 默认阴影 | `drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px #fff)` |
| hover 阴影 | `drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px #fff)` |
| active 阴影 | `drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7))` |

### 日历图标（动态日期）

| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="26" height="26" viewBox="0 0 26 26"` |
| 外框 | `rect x=2 y=4 w=22 h=20 rx=3`，`stroke="#266ea7" stroke-width="1.8"` |
| 顶栏 | `rect x=2 y=4 w=22 h=5 rx=2`，`fill="#266ea7"` |
| 横分隔线 | `line y1=9 y2=9`，`stroke="#266ea7" stroke-width="1.8"` |
| 左挂钩 | `line x=8 y1=2 y2=6`，`stroke-width="2" stroke-linecap="round"` |
| 右挂钩 | `line x=18 y1=2 y2=6`，`stroke-width="2" stroke-linecap="round"` |
| 日期文字 | `x="13" y="17"`，`dominant-baseline="central"` |
| 日期字体 | `font-size="10" font-weight="800" fill="#266ea7" font-family="Nunito,sans-serif"` |
| 动态注入 | `id="cal-icon-day"`，`renderAll()` 内写入 `today.getDate()` |
| 阴影 | 同导航箭头完全一致 |

### 编辑铅笔图标（entry card 右侧）

| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="15" height="15" viewBox="0 0 20 20"` |
| path | `M13.5 2.5L17.5 6.5L7 17H3V13L13.5 2.5Z` + 笔尖线 `M11.5 4.5L15.5 8.5` |
| 默认 | `var(--mid)`，`drop-shadow(1.5px 1.5px 2px rgba(0,0,0,.12))` |
| hover | 蓝色 `#266ea7`，`drop-shadow(2px 2px 3px rgba(38,110,167,.5))` |

### 删除 X 图标（entry card 右侧 + 跳过按钮）

| 属性 | 数据 |
|---|---|
| entry card 尺寸 | `width="14" height="14" viewBox="0 0 18 18"` |
| 跳过按钮尺寸 | `width="11" height="11" viewBox="0 0 18 18"` |
| path | `M3 3L15 15M15 3L3 15`，`stroke-width="2.6"` |
| entry card hover（默认） | 颜色变蓝 `#266ea7` |
| entry card hover（按住 Shift） | 颜色变红 `#E53935`，触发条件 `body.shift-down` |
| 跳过按钮 hover | 颜色变蓝 + tooltip「跳过/Skip」，无红色 |

### Note 图标（折角便签）
```html
<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
  <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M9 2v3h3" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="4" y1="9.5" x2="8" y2="9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>
```
→ 用在：Note 切换按钮、entry card note 文字前缀（颜色 `#7FA4BE`）

### Link 图标（链条环）
```html
<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
  <path d="M5.5 8.5a3 3 0 0 0 4.243 0l1.5-1.5a3 3 0 0 0-4.243-4.243L6.25 4"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M8.5 5.5a3 3 0 0 0-4.243 0l-1.5 1.5a3 3 0 0 0 4.243 4.243L7.75 10"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>
```
→ 用在：Link 切换按钮、entry card link 前缀（替代原 ↗）

---

## 四、交互状态规则（按元素说明）

### Entry card 卡片
- 默认：标准凸起效果
- hover：凸起加强（8px）
- 编辑中：sidebar 同款凹陷效果

### 跳过按钮（表单里每个字段右边的 ×）
| 状态 | 效果 |
|---|---|
| 默认 | 七日效果中的轻凸起 |
| hover | 轻凸起加强 + 蓝色 + tooltip「跳过/Skip」 |
| active | 轻凹陷 + 蓝色 |
| 已跳过 | 持久凹陷 + 蓝色 |
→ 无红色，不区分 Shift 键

### Note / Link 切换按钮
| 状态 | 效果 |
|---|---|
| 默认 | 无阴影平贴 |
| hover | 轻凸起（七日效果） |
| 点击激活 | 凹陷持久 + 蓝字加粗（七日效果） |

### 语言切换按钮（ZH / EN）
| 状态 | 阴影 | 文字色 |
|---|---|---|
| 当前语言 | 凹陷 `inset 3px 3px 7px` | 蓝色 `var(--purple)` |
| 非当前语言 | 凸起 `3px 3px 7px` | 灰色 `var(--mid)` |

---

## 四点五、Entry Card 内容层级

### 视觉层级规则
「阴影表示层级深度，不表示内容类型」

| 层级 | 用在 | 视觉 |
|---|---|---|
| 第 1 层 — 卡片本身 | entry card | 标准凸起 |
| 第 2 层 — 项目名徽章 | 左上角项目名 | 项目色双层立体 |
| 第 2 层 — 选项标签 | select 字段的选项 | lavender底凹陷 + 蓝灰字 |
| 第 2 层 — 数字数据 | number 字段 | 纯文字，无背景无阴影 |
| 第 3 层 — 猫爪币 | 右上角 `🐾 +N` | 布凹效果 |
| 交互层 — 图标 | 铅笔/删除 X | 默认无背景，hover 才显色 |

### 字段显示顺序
1. select 字段（全部，字段间加竖向雕刻线）
2. number 字段（全部，前面加竖向雕刻线与 select 组分隔）

### 选项标签颜色规则
按 select 字段在项目中的顺序轮流分配蓝灰深浅色：
| 第几个 select 字段 | 颜色 |
|---|---|
| 第 1 个 | `#2E6090`（深蓝） |
| 第 2 个 | `#5887A8`（中蓝） |
| 第 3 个 | `#7FA4BE`（浅蓝灰） |
| 第 4 个 | `#3A7A9C`（中深青蓝） |
| 第 5 个起 | 循环重复 |

### 表单字段 label 颜色规则
按字段在项目中的顺序（含所有类型）同上规则分配，第 1 个字段深蓝，依次变浅。

### Note 文字样式
- 字号 11px，斜体，颜色 `#9EA8B8`
- 前面带折角便签图标（蓝色 `#7FA4BE`）
- 无背景、无边框、无阴影

---

## 五、字体系统

| 用途 | 字体 | 大小 | 字重 |
|---|---|---|---|
| 页面主标题 | `ZCOOL XiaoWei` | 28px | 默认 |
| 大数字（stat） | `Lilita One` | 28px | 默认 |
| 正文 / 按钮 | `Nunito` | 12–14px | 600–800 |
| 中文兜底 | `Noto Sans SC` | — | — |
| 标签 / 上标 | `Nunito` | 10–11px | 800，uppercase |
| 辅助说明 | `Nunito` | 11–12px | 600，color: `--mid` |
| entry card 选项标签 | `Nunito` | 10px | **550** |

---

## 六、圆角规则

| 元素类型 | 圆角值 |
|---|---|
| 大卡片（stat card、sidebar） | `20px` |
| 中型卡片（entry card、modal） | `12–14px` |
| 小按钮（日期格、导航按钮） | `10px` |
| 胶囊形（不可改） | `999px` |

胶囊形元素：猫爪币、项目徽章、语言切换按钮、新纪录按钮、返回按钮、entry card 选项标签、跳过按钮、Note/Link 按钮

---

## 七、Select 下拉组件

### 收起状态（字段输入框）
```css
background: var(--lavender); border: none; border-radius: 8px;
padding: 0 10px; height: 34px;
box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF;
/* 文字超出截断 */
overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
```
→ hover：`inset 4px 4px 9px`

### 展开列表
```css
background: var(--lavender); border: none; border-radius: 10px; padding: 6px;
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF;
```

### 选项三态
```
默认：无背景
hover：background: rgba(38,110,167,0.03)（极淡蓝）
已选中：background: rgba(38,110,167,0.08)，蓝色文字，加粗
```

---

## 八、待办 / 未完成项目

| 项目 | 说明 |
|---|---|
| 横向雕刻线 | sidebar 内分隔线，目前用 box-shadow 实现，待改成跟竖向雕刻线一样用 border 实现 |
| 新记录表单 + 项目设置弹窗 | 部分 border 边框还没换成新拟态风格 |
| 「✓ 保存」按钮（编辑模式） | 仍用旧蓝色阴影 `#43688e`，待统一为新纪录效果 |

### 已完成
| 项目 | 完成于 |
|---|---|
| Step 1–3：CSS变量、NAV、stat cards、sidebar | 第46次前 |
| Step 4：Entry Card 容器 + Inline Edit | 第55次 |
| 项目徽章双层立体 | 第56–57次 |
| 铅笔/删除图标 SVG 化 + Shift 删除机制 | 第58–59次 |
| 多单位数字字段全链路 | 第60–67次 |
| 选项标签凹陷 + 蓝灰字色 + 竖向雕刻线 | 第68次 |
| Tracker undefined bug 修复 | 第68次 |
| Select 下拉组件新拟态化 | 第69–70次 |
| Note/Link 图标 SVG 化 | 第69–70次 |
| 表单字段 label 蓝灰字色 | 第71次 |
| Note/Link 切换按钮七日效果 | 第71次 |
| 新记录/编辑表单外层背景凹陷 | 第72次 |
| Entry card 字段排序（select先number后） | 第73次 |
| Note 文字样式（斜体+图标前缀） | 第73–74次 |
| 布凹效果（猫爪币） | 第74次 |
| 跳过按钮 SVG 化 + tooltip + 蓝色三态 | 第75次 |
| 单单位 number 字段单位显示 bug 修复 | 第76次 |
| 蓝底按钮阴影改灰色系（新纪录效果） | 第78次 |
| 周报告按钮独立效果（周报告效果） | 第80–84次 |

---

## 九、多单位数字字段显示规则

**多单位**：`time: 30 min · 1 hour`（`·` 分隔）
**单单位**：`length: 23 cm`（从 `f.units[0]` 或 `f.unit` 拼接单位）
