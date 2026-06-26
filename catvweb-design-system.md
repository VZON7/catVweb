# catvweb journal.html — 新拟态设计系统参考文档
> 更新于 第130次 update｜用于和 Claude 沟通时指定颜色、阴影、效果

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
| Select 字段类型色（徽章/标签） | `#7B68EE`（紫） |
| Number 字段类型色（徽章/标签） | `#1D9E75`（青绿） |
| Active 状态色 | `#1D9E75`（青绿） |
| Done 状态色 | `#266ea7`（蓝） |
| Archived 状态色 | `#A32D2D`（归档红） |
| 过去日期 ×½ 提示 | `#B87878`（低饱和暖红） |
| 模糊红框警告色 | `rgba(229,57,53,0.55)`（低透明度红） |

---

## 二、阴影效果速查（按「我看到的东西」命名）

### 标准凸起效果
```
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF
```
→ CSS变量：`var(--neu-raised)`
→ 用在：stat card、entry card 卡片本身

### sidebar 凹陷效果
```
box-shadow: inset 6px 6px 12px #C8C8D8, inset -6px -6px 12px #FFFFFF
```
→ CSS变量：`var(--neu-inset-val)`
→ 用在：sidebar 容器、新记录/编辑表单外层（`.form-card`）、modal 弹窗整体

### 七日效果（凹陷容器内三态）
专指凹陷容器内子元素的完整三态：
- 默认：无阴影（平贴）
- hover：`box-shadow: 3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF`
- active / 选中：`box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF`

→ 用在：日期格、周报告/项目追踪导航按钮、Note/Link 切换按钮、Cancel 按钮、跳过按钮、modal 内 Cancel/Delete 按钮、modal 内字段类型选择按钮、颜色选择器各按钮

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
→ 用在：「新纪录」按钮、「✓ 保存」按钮、modal「保存」按钮

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
→ 用在：entry card 左上角项目名徽章、inline edit / new form 顶部项目名

### 布凹效果
```
box-shadow:
  4px 4px 10px #C0C8D8,                    /* 外轮廓轻凸 */
  -4px -4px 10px #FFFFFF,
  inset 0 3px 8px rgba(180,190,210,0.55),   /* 中央布面下沉 */
  inset 0 -1px 3px rgba(255,255,255,0.9);   /* 底部高光 */
```
→ 用在：entry card 右上角猫爪币、「预计获得 N Cat Token」胶囊、modal 字段类型选择卡片（数字/选项）选中态

### 模糊红框
```css
@keyframes nameAlert {
  0%   { box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF; }
  15%  { box-shadow: inset 0 0 0 rgba(229,57,53,0), inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF; }
  25%  { box-shadow: inset 0 0 10px rgba(229,57,53,0.55), inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF; }
  50%  { box-shadow: inset 0 0 10px rgba(229,57,53,0.55), inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF; }
  100% { box-shadow: inset 0 0 28px rgba(229,57,53,0), inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF; }
}
.m-name-highlight { animation: nameAlert 1.1s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
```
→ 触发方式：点 Save 时 Name 为空，输入框触发动画并自动 focus
→ 节奏：快进（0.1s）→ 停留（0.15s）→ 缓慢向外扩散褪去（雾气感）
→ 用在：modal Name 输入框必填警告
→ 复用原则：凡需要引导用户目光到某个输入框的场景，可套用此动画

### NAV 栏阴影
```
box-shadow: 0 4px 10px #C8C8D8, 0 -2px 6px #FFFFFF
```

---

## 三、SVG 图标系统

### 导航箭头（左 / 右）
| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="14" height="12" viewBox="0 0 14 12"` |
| 左箭头 path | `M8 1L2 6L8 11M2 6H13` |
| 右箭头 path | `M6 1L12 6L6 11M12 6H1` |
| 颜色 | `#266ea7`，`stroke-width="2"` |
| 默认阴影 | `drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px #fff)` |
| hover 阴影 | `drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px #fff)` |
| active 阴影 | `drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7))` |

### 日历图标（动态日期）
| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="26" height="26" viewBox="0 0 26 26"` |
| 动态注入 | `id="cal-icon-day"`，`renderAll()` 内写入 `today.getDate()` |
| 阴影 | 同导航箭头完全一致 |

### 编辑铅笔图标
| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="15" height="15" viewBox="0 0 20 20"` |
| path | `M13.5 2.5L17.5 6.5L7 17H3V13L13.5 2.5Z` + `M11.5 4.5L15.5 8.5` |
| 默认 | `var(--mid)`，淡阴影 |
| hover | 蓝色 `#266ea7` |

### 删除 X 图标
| 属性 | 数据 |
|---|---|
| entry card 尺寸 | `width="14" height="14" viewBox="0 0 18 18"` |
| 跳过按钮尺寸 | `width="11" height="11" viewBox="0 0 18 18"` |
| path | `M3 3L15 15M15 3L3 15`，`stroke-width="2.6"` |
| entry card hover（默认） | 蓝色 `#266ea7` |
| entry card hover（Shift） | 红色 `#E53935` |

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

### 颜色选择器加号（+ 添加进颜色包）
```html
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <line x1="7" y1="2" x2="7" y2="12" stroke="#266ea7" stroke-width="2" stroke-linecap="round"/>
  <line x1="2" y1="7" x2="12" y2="7" stroke="#266ea7" stroke-width="2" stroke-linecap="round"/>
</svg>
```
→ 裸 + 号，无包围框

---

## 四、交互状态规则

### Entry card
- 默认：标准凸起效果
- hover：凸起加强（8px）
- 编辑中：sidebar 凹陷效果

### 跳过按钮（表单字段右边 ×）
| 状态 | 效果 |
|---|---|
| 默认 | 七日效果轻凸起 |
| hover | 轻凸起加强 + 蓝色 + tooltip「跳过/Skip」 |
| active | 轻凹陷 + 蓝色 |
| 已跳过 | 持久凹陷 + 蓝色 |

### Note / Link 切换按钮
| 状态 | 效果 |
|---|---|
| 默认 | 无阴影平贴 |
| hover | 轻凸起（七日效果） |
| 点击激活 | 凹陷持久 + 蓝字加粗 |

### 语言切换按钮（ZH / EN）
| 状态 | 阴影 | 文字色 |
|---|---|---|
| 当前语言 | 凹陷 `inset 3px 3px 7px` | 蓝色 |
| 非当前语言 | 凸起 `3px 3px 7px` | 灰色 |

### Modal Status 按钮（Active / Done / Archived）
| 状态 | 效果 | 文字色 |
|---|---|---|
| 未选中 | 七日效果凸起 | 灰色 |
| Active 选中 | 七日效果凹陷 | `#1D9E75` 青绿 |
| Done 选中 | 七日效果凹陷 | `#266ea7` 蓝 |
| Archived 选中 | 七日效果凹陷 | `#A32D2D` 归档红 |

### Modal 字段类型卡片（文字选择项 / 数字栏位）
| 状态 | 卡片 | 图标方块 |
|---|---|---|
| 未选中 | 轻凸起（3px） | 轻凸起 |
| 选中 | 布凹效果（inset 4px） | 凹陷 |

### 背景关闭（modal 蒙层点击）
- 点击 modal 弹窗外的半透明背景区域，弹窗关闭（等同点 Cancel）
- **实现用 `onmousedown` 而非 `onclick`**
- 原因：`onclick` = mousedown + mouseup 在同一元素。用户在输入框内 highlight 文字时，mousedown 在输入框，mouseup 可能落在背景上，触发误关闭。改成 `onmousedown` 后只判断按下瞬间的 target，highlight 拖动不再误触
- 全站所有 modal 背景（包括删除确认弹窗）统一使用 `onmousedown`

---

## 四点五、Entry Card 内容层级

### 字段显示顺序
1. select 字段（全部，字段间加竖向雕刻线）
2. number 字段（全部，前面加竖向雕刻线与 select 组分隔）

### 选项标签颜色规则
按 select 字段在项目中的顺序轮流分配：
| 第几个 | 颜色 |
|---|---|
| 第 1 个 | `#2E6090`（深蓝） |
| 第 2 个 | `#5887A8`（中蓝） |
| 第 3 个 | `#7FA4BE`（浅蓝灰） |
| 第 4 个 | `#3A7A9C`（中深青蓝） |
| 第 5 个起 | 循环 |

### 表单字段 label 颜色规则
同上，按字段在 `p.fields` 中的顺序分配。

### Note 文字样式
- 字号 11px，斜体，颜色 `#9EA8B8`
- 前面带折角便签图标（蓝色 `#7FA4BE`）

### 猫爪币
- 布凹效果，蓝灰字色 `#2E6090`

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
| 大卡片（stat card、sidebar、modal） | `20px` / `16px` |
| 中型卡片（entry card、字段卡片） | `12–14px` |
| 小按钮（日期格、导航按钮） | `10px` |
| 胶囊形（不可改） | `999px` |

胶囊形元素：猫爪币、项目徽章、语言切换、新纪录按钮、返回按钮、entry card 选项标签、跳过按钮、Note/Link 按钮、字段类型徽章（选项/数字）

---

## 七、Select 下拉组件

### 收起状态
```css
background: var(--lavender); border: none; border-radius: 8px;
padding: 0 10px; height: 34px;
box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF;
overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
```

### 展开列表
```css
background: var(--lavender); border: none; border-radius: 10px; padding: 6px;
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF;
```

### 选项三态
```
默认：无背景
hover：background: rgba(38,110,167,0.03)
已选中：background: rgba(38,110,167,0.08)，蓝色文字，加粗
```

### 下拉内新增选项区
- 分隔线：上暗下亮（横向雕刻线）
- 输入框：lavender 底凹陷
- + 按钮：蓝底圆形，新纪录效果阴影

---

## 八、Modal（Edit Task / New Task）

### 整体
- 背景：`var(--lavender)` + sidebar 凹陷效果
- 输入框：凹陷
- 背景关闭：`onmousedown`（见第四节）

### 功能规则
- **默认类型**：打开时默认选「文字选择项」（select）
- **Enter 创建栏位**：在栏位名称输入框按 Enter，等同点「+ Add」按钮
- **失焦保存**：子选项编辑态失焦后自动保存当前输入值并退出编辑态
- **必填保护**：Project Name 为空时 Save 按钮逻辑拦截，同时触发模糊红框提示并 focus 到 Name 输入框

### 字段卡片（每个字段独立凸起卡片）
- 外框：标准凸起（`6px 6px 12px`），`border-radius:12px`
- 字段类型徽章（选项/数字）：布凹效果，紫色/青绿色
- 子选项：
  - **显示态**：圆点（蓝灰色/灰色）+ 文字，整体凸起方框（`3px 3px 7px`，`border-radius:8px`）
  - **编辑态**（点铅笔）：凹陷输入框，无圆点，铅笔变蓝色
  - Enter 或再点铅笔保存，失焦也自动保存（失焦保存）

### 字段类型选择卡片（新建区）
- 并排两张，固定宽度 `118px`，居中
- 未选中：轻凸起（`3px`）
- 选中：布凹效果（`inset 4px`），文字变色，图标凹陷
- 文字选择项：紫色系，`Aa` 图标，说明「建立一组选项，记录时从中勾选，如工具、状态、项目阶段」
- 数字栏位：青绿色系，`#` 图标，说明「记录可量化的数据，例如时间、距离、次数」

### 按钮
- Cancel / Delete：七日效果三态
- Save：新纪录效果三态，Name 为空时触发模糊红框
- Status 按钮：七日效果 + 各自颜色（见第四节）

### 颜色选择器
- hex 输入框：凹陷，Nunito 字体，`font-weight:700`
- RGB 数值框：凹陷
- Similar Color 区域：凹陷容器，hover 淡蓝 3%
- 「+ 添加进我的颜色包」按钮：裸 SVG + 号，tooltip「添加进我的颜色包 / Add to my Color Bag」
- 「我的颜色包」面板：标准凸起，tooltip「我的颜色包 / My Color Bag」
- 「+ More Colors」文字：彩虹渐变（红→橙→黄→绿→蓝→紫）

---

## 九、待办 / 未完成项目

| 项目 | 说明 |
|---|---|
| 横向雕刻线 | sidebar 内分隔线，目前用 box-shadow 实现，待改成跟竖向雕刻线一样用 border 实现 |
| Step 6：Tracker 卡片 | 状态标签、按钮待统一 |
| 「✓ 保存」编辑模式按钮 | 仍用旧蓝色阴影 `#43688e`，待统一为新纪录效果 |

### 已完成
| 项目 | 完成于 |
|---|---|
| Step 1–3：CSS变量、NAV、stat cards、sidebar | 第46次前 |
| Step 4：Entry Card + Inline Edit | 第55–75次 |
| Step 5：Form + Modal 全面新拟态化 | 第85–121次 |
| Modal 功能改动（默认select、Enter创建、失焦保存、必填保护） | 第122–125次 |
| 模糊红框（必填警告动画） | 第123–124次 |
| 背景关闭改 onmousedown（修复 highlight 误触） | 第129–130次 |
| showUndoToast 变量名冲突修复（t 被覆盖） | 第126次 |

---

## 十、与 ZONZON 沟通约定

| 说这个 | 不说这个 |
|---|---|
| 「标准凸起效果」 | `var(--neu-raised)` |
| 「sidebar 凹陷效果」 | `var(--neu-inset-val)` |
| 「七日效果」 | CSS class 名 |
| 「新纪录效果」 | 2G |
| 「周报告效果」 | 2H |
| 「竖向雕刻线」 | `.ec-vdivider` |
| 「布凹效果」 | 复杂 box-shadow 数值 |
| 「模糊红框」 | `.m-name-highlight` / `nameAlert` |
| 「背景关闭」 | `onmousedown` modal-bg |
| 「失焦保存」 | `onblur` auto-save |
| 「entry card 选项标签」 | `.ec-selval` |
| 「表单字段标题颜色」 | `.var-label` |
| 「跳过按钮」 | `.skip-btn` |
| 「Note/Link 切换按钮」 | `.extra-toggle` |
| 「新记录/编辑表单外层背景」 | `.form-card` |
| 「entry card 字段分隔线」 | `.ec-vdivider` |
| 「猫爪币」 | `.ec-coin` |
| 「字段类型徽章」 | `.badge` in modal |
| 「字段卡片」 | modal 内字段独立卡片 |
| 「颜色包」 | palette popup |

---

## 十一、多单位数字字段显示规则

**多单位**：`time: 30 min · 1 hour`（`·` 分隔）
**单单位**：`length: 23 cm`（从 `f.units[0]` 或 `f.unit` 拼接单位）
