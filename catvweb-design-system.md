# catvweb journal.html — 新拟态设计系统参考文档
> 更新于 第201次 update｜用于和 Claude 沟通时指定颜色、阴影、效果
> ⚠️ 第175次起：全站颜色已变量化。数值唯一来源 = journal.html 的 `:root`，本文档为「效果名 → 变量名 → 亮色值」对照表。改颜色改变量值，不改引用处。

⚠️ **Claude 使用规则：任何 SVG 图标、阴影数值、颜色在写入代码前，必须先查本文档对应章节，不可凭记忆写入。**

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

### 功能色（第175次已全部变量化）
| 用途 | 变量名 | 亮色值 |
|---|---|---|
| 新纪录/保存按钮 默认暗影 | `--sh-btn-dark` | `#B8BEC8` |
| 新纪录/保存按钮 hover 暗影 | `--sh-btn-hover` | `#B0B8C4` |
| 新纪录/保存按钮 active 暗影 | `--sh-blue-inset` | `#1e5a8a` |
| 周报告按钮 默认阴影 | `--sh-wr-dark` | `#c8cedb` |
| 周报告按钮 hover 阴影 | `--sh-wr-hover` | `#B2B7C4` |
| 布凹外层暗影 | `--sh-cloth` | `#C0C8D8` |
| 雕刻线 暗边/亮边 | `--line-dark` / `--line-light` | `#C9D0DC` / `#FFFFFF` |
| Select 字段类型色 | `--c-select` | `#7B68EE` |
| Number 字段类型色 | `--c-number` | `#1D9E75` |
| Active 状态色 | `--c-active` | `#1D9E75`（与 number 同值分设） |
| Done 状态色 | `--c-done` | `var(--purple)` |
| Archived 状态色（归档红） | `--c-archived` | `#A32D2D` |
| 过去日期 ×½ 提示 | `--c-past-hint` | `#B87878` |
| 模糊红框警告色 | （保留字面值，动画 keyframes 内） | `rgba(229,57,53,0.55)` |
| Tracker records 数字色 | `var(--dark)` | `#2d2b3d` |
| Tracker records 文字色 | `var(--mid)` | `#888` |
| Tracker last update 色 | `--c-last` | `#9AA0A8` |
| 周报告亮点 pill 标题色 | `--c-pill-title` | `#A07850` |
| 周报告亮点 pill 内容色 | `--c-pill-body` | `#4E5568` |
| 周日历框 / 顶栏色 | `var(--purple)` | `#266ea7` |

### 真白色（夜间模式下不变）
| 变量名 | 值 | 用途 |
|---|---|---|
| `--white` | `#FFFFFF` | 蓝底白字（周日历顶栏）、toggle 滑块、选中日期白字——内容白，非阴影高光 |

### 第175次新登记变量（迁移时发现的原硬编码色）
| 变量名 | 亮色值 | 用途（你的叫法） |
|---|---|---|
| `--c-token-bg` / `--c-token-text` / `--c-token-alt` | `#FAEEDA` / `#633806` / `#854F0B` | Cat Token 金棕家族（coin-pill 底/字、tracker 猫币字） |
| `--c-tint0~3` | `#2E6090` `#5887A8` `#7FA4BE` `#3A7A9C` | 字段染色四件套（entry card 选项标签、表单字段标题、猫爪币文字） |
| `--sh-sel-out` / `--sh-sel-in` | `#FBF7FF` / `#C9B8DE` | Modal 类型卡片 紫系染色阴影 |
| `--sh-num-out` / `--sh-num-in` | `#F4FBF9` / `#B5D7CE` | Modal 类型卡片 绿系染色阴影 |
| `--sh-light-soft` | `#F4F6FA` | entry card 选项标签 内凹柔光 |
| `--c-note` / `--c-note-text` | `#7FA4BE` / `#9EA8B8` | Note 图标前缀 / note 文字 |
| `--c-coin-hint` | `#8A9BB0` | 「预计获得」文字 |
| `--c-undo` | `#B0A8FF` | 复原按钮淡紫 |
| `--c-unit-hint` | `#C8CFD8` | Modal 单位小字 |
| `--c-muted` / `--c-empty` / `--c-faint` | `#666` / `#bbb` / `#aaa` | 已归档名·chip灰字 / 周日历空格子 / 统计面板浅灰 |
| `--cb-chip-bg` / `--cb-chip-hover` / `--cb-sub-hover` | `#f5f4f9` / `#eeedf4` / `#f0f0f0` | Chart Builder 胶囊按钮底色三态 |

---

## 二、阴影效果速查（按「我看到的东西」命名）

> 📌 第175次起代码内一律引用变量：`#C8C8D8`→`var(--sh-dark)`、`#FFFFFF`(高光)→`var(--sh-light)`、`#B8BEC8`→`var(--sh-btn-dark)`、`#1e5a8a`→`var(--sh-blue-inset)`、`#c8cedb`→`var(--sh-wr-dark)`、`#B2B7C4`→`var(--sh-wr-hover)`、`#C0C8D8`→`var(--sh-cloth)`、`#C9D0DC`→`var(--line-dark)`。下方数值为亮色主题的展开值，供视觉核对。

### 标准凸起效果 — `var(--neu-raised)`
```
box-shadow: var(--neu-raised)
/* = 6px 6px 12px var(--sh-dark), -6px -6px 12px var(--sh-light)｜亮色: #C8C8D8 / #FFFFFF */
```
→ 用在：stat card、entry card、Tracker 项目卡片

### sidebar 凹陷效果 — `var(--neu-inset)`（`--neu-inset-val` 已于第175次废弃）
```
box-shadow: var(--neu-inset)
/* = inset 6px 6px 12px var(--sh-dark), inset -6px -6px 12px var(--sh-light) */
```
→ 用在：sidebar 容器、`.form-card`、modal 弹窗整体、周报告 PROJECT LOG 容器

### 七日效果（凹陷容器内三态）
- 默认：无阴影（平贴）
- hover：`box-shadow: 3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF`
- active/选中：`box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF`

→ 用在：日期格、导航按钮、Note/Link 按钮、Cancel/Delete 按钮、类型选择按钮、颜色器各按钮、Tracker 筛选标签

### 新纪录效果（蓝底按钮专用）
```
默认：  box-shadow: 5px 5px 10px #B8BEC8, -5px -5px 10px #FFFFFF
hover：  box-shadow: 10px 10px 18px #B0B8C4, -10px -10px 18px #FFFFFF
active：  box-shadow: inset 4px 4px 9px #1e5a8a, inset -2px -2px 5px rgba(255,255,255,0.15)
```
→ 暗影用灰色系，不用蓝色
→ 用在：「新纪录」「✓ 保存」「modal 保存」按钮

### 周报告效果（灰底按钮专用）
```
默认：  box-shadow: 4px 4px 9px #c8cedb, -4px -4px 9px #FFFFFF
hover：  box-shadow: 8px 8px 18px #B2B7C4, -8px -8px 18px #FFFFFF
active：  box-shadow: inset 3px 3px 7px #c8cedb, inset -3px -3px 7px #FFFFFF
```

### 竖向雕刻线
```css
width: 0; height: 14px; flex-shrink: 0; align-self: center;
border-left: 1px solid #C9D0DC; border-right: 1px solid #FFFFFF;
```

### 横向雕刻线
```css
border-top: 1px solid #C9D0DC; border-bottom: 1px solid #FFFFFF;
```

### 详细记录雕刻线（文字等宽）

与横向雕刻线不同，此线只跟文字一样长，不横跨整行。元素必须设 `display:inline-block`。

```css
display: inline-block;
border-bottom: 1px solid var(--line-dark);
box-shadow: 0 1px 0 var(--line-light);
```
→ 用在：Tracker「详细记录」标题 `.tr-detail-title`（第190次）、Journal 日期标头 `.journal-date-hdr`（第200次）

### Project 徽章效果（双层立体）
```
外层凸起框：box-shadow: 4px 4px 9px #C8C8D8, -4px -4px 9px #FFFFFF;
内层项目色：border: 1.5px solid 项目色;
            box-shadow: inset 1.5px 1.5px 3px rgba(0,0,0,.12), inset -1px -1px 2px rgba(255,255,255,.5);
```

### 布凹效果
```
box-shadow: 4px 4px 10px #C0C8D8, -4px -4px 10px #FFFFFF,
            inset 0 3px 8px rgba(180,190,210,0.55),
            inset 0 -1px 3px rgba(255,255,255,0.9);
```
→ 用在：猫爪币、「预计获得 N Cat Token」、modal 类型选择卡片选中态、**周报告本周亮点 pill**

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
→ 节奏：快进 → 停留 → 缓慢扩散褪去（雾气感）
→ 触发：点 Save 时 Name 为空，自动 focus 到 Name 输入框

### NAV 栏阴影
```
box-shadow: 0 4px 10px #C8C8D8, 0 -2px 6px #FFFFFF
```

### Tracker 状态徽章
```css
box-shadow: inset 2px 2px 5px #C8C8D8, inset -2px -2px 5px #FFFFFF;
background: var(--lavender); border: none; border-radius: 999px;
```
- Active：color `#1D9E75`
- Done：color `#266ea7`
- Archived：印章效果，`border: 1.5px solid #A32D2D; border-radius: 3px; transform: rotate(-7deg); box-shadow: none;`

### 周日历格子（三态）
```css
/* 有记录 — 凹陷 + 淡染 + 数字凸起 */
box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF;
color: #266ea7;
text-shadow: 1px 1px 2px #FFFFFF, -0.5px -0.5px 1px rgba(38,110,167,0.3);
/* 淡染用 ::before 伪元素 */
background: #266ea7; opacity: 0.12;

/* 无记录 — 凸起空白 */
box-shadow: 3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF;
color: #bbb;
```
→ 数字加粗（font-weight:800），颜色 `#266ea7`，text-shadow 模拟凸起感
→ 无记录格子不显示数字，只显示凸起空格

### Toggle 开关（两态）
```css
/* 容器轨道 — 关闭态 */
width: 32px; height: 18px; border-radius: 999px;
box-shadow: inset 2px 2px 5px #C8C8D8, inset -2px -2px 5px #FFFFFF;
background: var(--lavender);

/* 容器轨道 — 开启态 */
background: #266ea7;
box-shadow: inset 2px 2px 5px #1e5a8a, inset -1px -1px 3px rgba(255,255,255,0.15);

/* 滑块 */
width: 12px; height: 12px; border-radius: 50%;
background: #fff; box-shadow: 1px 1px 3px #B8BEC8;
left: 3px（关闭） / left: 17px（开启）; transition: left 0.2s;
```
→ 用在：周报告「显示使用提示」开关

### 键帽效果（双层立体按钮，可复用）

通用键帽组件——外层深色底座 + 内层浅色键面，模拟物理按键。中间文字可替换（如 `SPACE`、`ESC`、`TAB`），右侧可放图标。

**结构**
```
button.tr-space-key（底座）
  └── span.tr-sk-face（键面）
      ├── span.tr-sk-label（文字，如 SPACE）
      └── span.tr-sk-arrow（图标区，如 ↑ 箭头 SVG）
```

**尺寸**
```
底座：width 66px · height 34px · border-radius 8px
键面：left 3px · top 2px · right 3px · height 28px · border-radius 6px
文字：Nunito 9px 800 · letter-spacing 0.6px
图标：12×12 SVG · stroke-width 2.2 · stroke currentColor
```

**CSS 自定义属性**
| 属性 | 亮色值 | 暗色值 | 用途 |
|---|---|---|---|
| `--sk-base` | `#C8CDD6` | `#1E2028` | 底座背景 |
| `--sk-face` | `var(--lavender)` | `var(--lavender)` | 键面背景 |
| `--sk-text` | `#999` | `#6B717E` | 文字/图标色 |

**三态（亮色）**
```css
/* 默认 — 键面凸起，侧壁可见 */
底座  box-shadow: 3px 3px 6px var(--sh-btn-dark), -3px -3px 6px var(--sh-light)
键面  top: 2px; box-shadow: inset 0 -2px 1px rgba(0,0,0,0.06), 0 -1px 1px rgba(255,255,255,0.9)
文字  color: #999

/* hover — 阴影加深，文字变蓝 */
底座  background: #BEC4CF; box-shadow: 4px 4px 8px var(--sh-btn-hover), -4px -4px 8px var(--sh-light)
文字  color: var(--purple)

/* active — 键面微沉 2px，侧壁缩窄 */
底座  box-shadow: 2px 2px 4px var(--sh-btn-dark), -2px -2px 4px var(--sh-light)
键面  top: 4px; height: 27px; background: #E6E9F0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06)
```

**三态（暗色）**
```css
/* 默认 */
底座  background: #1E2028
键面  box-shadow: inset 0 -2px 1px rgba(0,0,0,0.15), 0 -1px 1px rgba(255,255,255,0.05)
文字  color: #6B717E

/* hover */
底座  background: #1A1C23
文字  color: var(--purple)

/* active */
键面  background: #292C34; box-shadow: inset 0 1px 2px rgba(0,0,0,0.15)
```

**设计要点**
- 按下 ≠ 凹陷：键面保持平面，只是位置下沉（top 2→4），模拟真实键帽行程
- 底座位置不动，按下时外阴影缩小（立体感降低）
- 键面底部高光（`inset 0 -2px`）在按下时消失，换成顶部微 inset（底座边缘挡光）
→ 用在：Tracker 分页排右侧「SPACE ↑」收起按钮（第187次）

---

### 凹陷 vs 凸起 决策规则（第215–218次确立）

⚠️ 这是**选哪种阴影**的唯一判断依据，凭感觉决定会造成同一界面内规则打架。

| 元素类型 | 效果 | 例子 |
|---|---|---|
| **容器 / 凹槽** | 凹陷 | 统计块、项目列表托盘、输入框、modal 本体 |
| **可点控件** | 凸起 | 主按钮、折叠 toggle、状态芯片 |
| **控件被激活** | 凹陷 | 当前选中的 All/None、已展开的折叠按钮、当前 tab |
| **容器内的行** | **平面**，hover 才浮起 | 项目行、记录行 |

**最多两层凹陷。** `.modal` 本身已是 `inset 6px`，所以：

```
modal（凹陷）→ 托盘（凹陷）→ 内容（必须平面）  ✅
modal（凹陷）→ 托盘（凹陷）→ 文本框（凹陷）    ❌ 三层，视觉浑浊
```

托盘里的 textarea 写法：`background:transparent; box-shadow:none; border:none`，靠托盘提供容器感。

**强调色同理要稀缺。** `--purple` 实心只留给：主按钮、关键统计数字、被激活的控件。次要控件用 `--mid`，语义色（如归档红）独占其语义，不外借。

---

## 三、SVG 图标系统

⚠️ **写 SVG 前必须对照此节，不可凭记忆写 path 或 filter 数值。**

### 导航箭头 / Tracker 展开箭头（统一规格）
```html
<!-- 右箭头 -->
<svg width="14" height="12" viewBox="0 0 14 12" fill="none"
     style="filter: drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6))
                    drop-shadow(-1.5px -1.5px 2px #fff)">
  <path d="M6 1L12 6L6 11M12 6H1"
        stroke="#266ea7" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<!-- 左箭头 -->
<svg width="14" height="12" viewBox="0 0 14 12" fill="none" ...>
  <path d="M8 1L2 6L8 11M2 6H13" stroke="#266ea7" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**三态 filter（第175次起用组合变量，必须实现全部三态）：**
| 状态 | 变量 | 亮色展开值 |
|---|---|---|
| 默认 | `var(--icon-shadow)` | `drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px var(--sh-light))` |
| hover | `var(--icon-shadow-hover)` | `drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px var(--sh-light))` |
| active | `var(--icon-shadow-active)` | `drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7))` |

⚠️ SVG 的 `stroke=` / `fill=` **属性**不支持 `var()`，保持字面值（如 `stroke="#266ea7"`）——夜间模式蓝色不变，无影响。

→ Tracker 展开箭头用 CSS `.tracker-proj-chevron` + parent hover/active 实现三态
→ 展开时 `transform: rotate(90deg)`

### 日历图标（动态日期）
```
SVG 尺寸：width="26" height="26" viewBox="0 0 26 26"
动态注入：id="cal-icon-day"，renderAll() 内写入 today.getDate()
阴影：与导航箭头三态完全一致
```

### 编辑铅笔图标
```html
<svg width="15" height="15" viewBox="0 0 20 20" fill="none">
  <path d="M13.5 2.5L17.5 6.5L7 17H3V13L13.5 2.5Z"
        stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.5 4.5L15.5 8.5" stroke="currentColor" stroke-width="1.6"/>
</svg>
```
- 默认：`var(--mid)`
- hover：`#266ea7`

### 删除 X 图标
```html
<!-- entry card -->
<svg width="14" height="14" viewBox="0 0 18 18" fill="none">
  <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="2.6"
        stroke-linecap="round"/>
</svg>
<!-- 跳过按钮 -->
<svg width="11" height="11" viewBox="0 0 18 18" fill="none"> ... </svg>
```
- entry card hover（默认）：蓝色 `#266ea7`
- entry card hover（Shift）：红色 `#E53935`

### Note 图标（折角便签）
```html
<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
  <path d="M2 2h7l3 3v7H2V2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M9 2v3h3" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="4" y1="9.5" x2="8" y2="9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>
```
→ entry card note 前缀颜色：`#7FA4BE`

### Link 图标（链条环）
```html
<svg width="13" height="13" viewBox="0 0 14 14" fill="none">
  <path d="M5.5 8.5a3 3 0 0 0 4.243 0l1.5-1.5a3 3 0 0 0-4.243-4.243L6.25 4"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M8.5 5.5a3 3 0 0 0-4.243 0l-1.5 1.5a3 3 0 0 0 4.243 4.243L7.75 10"
        stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>
```

### 颜色选择器加号
```html
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <line x1="7" y1="2" x2="7" y2="12" stroke="#266ea7" stroke-width="2" stroke-linecap="round"/>
  <line x1="2" y1="7" x2="12" y2="7" stroke="#266ea7" stroke-width="2" stroke-linecap="round"/>
</svg>
```
→ 裸 + 号，无包围框

---

## 四、交互状态规则

### 背景关闭（modal 蒙层）
- 全站所有 modal 背景统一用 `onmousedown`（不用 `onclick`）
- 原因：`onclick` 在 highlight 文字时鼠标松开落在背景上会误触关闭
- 逻辑：有 name → saveProject()；有字段无 name → 模糊红框；无字段无 name → 静默关闭

### 失焦保存
- 子选项编辑态 `onblur` 自动保存当前输入值并退出编辑态

### Entry card 三态
- 默认：标准凸起
- hover：凸起加强（8px）
- 编辑中：sidebar 凹陷

### Tracker 项目卡片三态
- 默认：标准凸起（`6px 6px 12px`）
- hover：白色叠加 `rgba(255,255,255,0.35)` + 轻凸阴影 `2px 2px 5px var(--sh-dark), -2px -2px 5px var(--sh-light)`（第194次）
- active（非 archived）：`inset 2px 2px 5px var(--sh-dark), inset -1px -1px 3px var(--sh-light)`（第193次）
- 已归档：`opacity: 0.8`，名称色 `#666`

### Tracker 筛选标签四态（第192次）
| 状态 | 效果 |
|---|---|
| 默认 | 凸起 `3px 3px 7px` |
| hover | 加深 `4px 4px 9px` + 文字变亮 `var(--dark)` |
| 点击瞬间 | 七日效果凹陷 `inset 3px 3px 7px` |
| 选中 `.active` | 蓝底 `var(--purple)` + `inset 3px 3px 7px rgba(0,0,0,.25), inset -2px -2px 5px rgba(255,255,255,.1)` |

### 胶囊按钮选中态（统一，第191次）
所有 `.on` 选中态统一使用有色底 + inset 阴影：
```css
box-shadow: inset 3px 3px 7px rgba(0,0,0,.25), inset -2px -2px 5px rgba(255,255,255,.1);
```
→ 用在：`.cb-var-chip.on`、`.cb-type-btn.on`、`.cb-tog.on`、`.tracker-tab.active`

### 记录行「回到当天」跳转（第199次）
```
.tr-date-area 容器 — 包裹日期 + 图标 + tooltip
  ├── .tracker-date — 默认 var(--mid)
  ├── .tr-date-icon — ↩ SVG 12×12，默认 opacity .3
  └── .tr-date-tip — tooltip「回到当天」/ 「Jump to date」
```
- 默认：日期原色 `var(--mid)`，图标淡灰
- hover（整个 .tr-date-area）：日期 + 图标同步变 `var(--purple)`，tooltip 从上方浮出
- tooltip：`position:absolute; bottom:calc(100% + 5px); border:.5px solid var(--purple); border-radius:5px`，带小三角箭头
- 点击：`selDate = record.dateKey → view='journal' → renderAll()`

### Modal Status 按钮
| 状态 | 效果 | 文字色 |
|---|---|---|
| 未选中 | 七日效果凸起 | 灰色 |
| Active 选中 | 七日效果凹陷 | `#1D9E75` |
| Done 选中 | 七日效果凹陷 | `#266ea7` |
| Archived 选中 | 七日效果凹陷 | `#A32D2D` |

### Modal 字段类型卡片
| 状态 | 卡片 | 图标 |
|---|---|---|
| 未选中 | 轻凸起（3px） | 轻凸起 |
| 选中 | 布凹效果（inset 4px） | 凹陷 |

### 凹陷中的凹陷（层级规则）
当一个元素处于 sidebar 凹陷容器内，且需要进一步区分为「已归档/非激活」状态时，使用内层凹陷：
```css
/* 外层容器：sidebar 凹陷效果 */
box-shadow: inset 6px 6px 12px #C8C8D8, inset -6px -6px 12px #FFFFFF;

/* 内层已归档元素：再凹陷 + 降低透明度 */
box-shadow: inset 4px 4px 8px #C8C8D8, inset -4px -4px 8px #FFFFFF;
opacity: 0.75;
```
→ 用在：周报告 PROJECT LOG 容器内的已归档项目卡片
→ 语义：凹陷 = 信息性/非交互；凹陷中的凹陷 = 降级/归档

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
| Tracker records 数字 | `Nunito` | 12px | **800**，`#2d2b3d` |
| Tracker records 文字 | `Nunito` | 12px | **700**，`#888` |
| Tracker last update | `Nunito` | 9px | —，`#9AA0A8` |
| 周报告亮点 pill 标题 | `Nunito` | 14px | **800**，`#A07850` |
| 周报告亮点 pill 内容 | `Nunito` | 11px | **700**，`#4E5568` |
| 周日历顶栏主文案 | `Nunito` | 12px | **800**，`#fff` |
| 周日历顶栏日期范围 | `Nunito` | 10px | **700**，`#fff` opacity 0.8 |
| 周日历星期标题 | `Nunito` | 10px | **800**，`#266ea7` opacity 0.75 |
| 周日历格子数字 | `Nunito` | 11.5px | **800**，`#266ea7` |

---

## 六、圆角规则

| 元素类型 | 圆角值 |
|---|---|
| 大卡片（stat card、sidebar、modal） | `20px` / `16px` |
| 中型卡片（entry card、字段卡片、Tracker卡片） | `12–14px` |
| 小按钮（日期格、导航按钮） | `10px` |
| 胶囊形（不可改） | `999px` |
| 周日历框 | `18px` |
| 周日历格子 | `8px` |

---

## 七、Select 下拉组件

### 收起状态
```css
background: var(--lavender); border: none; border-radius: 8px;
padding: 0 10px; height: 34px;
box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF;
```

### 展开列表
```css
background: var(--lavender); border: none; border-radius: 10px; padding: 6px;
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF;
```

### 选项三态
- 默认：无背景
- hover：`rgba(38,110,167,0.03)`
- 选中：`rgba(38,110,167,0.08)`，蓝色文字，加粗

---

## 八、Modal（Edit Task / New Task）

### 功能规则
- 默认类型：select（文字选择项）
- Enter 创建栏位：等同点「+ Add」
- 失焦保存：子选项编辑态失焦自动保存
- 必填保护：Name 空 → 模糊红框 + focus

### 子选项
- 显示态：圆点 + 文字，凸起方框（`3px`，`border-radius:8px`）
- 编辑态：点铅笔 → 凹陷输入框，Enter/铅笔/失焦保存
- 删除已使用选项：原地变确认行（淡红背景），显示使用次数 + 无法复原提示

### 字段类型选择卡片
- 文字选择项：紫色系，`Aa` 图标
- 数字栏位：青绿色系，`#` 图标
- 选中：布凹效果（`inset 4px`）

### 颜色选择器
- hex 输入框：凹陷，Nunito，`font-weight:700`
- RGB 数值框：凹陷
- Similar Color：凹陷容器
- 「+ More Colors」：彩虹渐变文字（红→橙→黄→绿→蓝→紫）
- 颜色包面板：标准凸起

---

## 九、Tracker 项目列表

### 项目行结构
`● 项目名 [状态徽章] [N records · last · 22/06/26] [SVG箭头]`

### 状态徽章
- Active/Done：凹陷胶囊（`inset 2px`），各自颜色
- Archived：印章效果，`rotate(-7deg)`，红框，无凹陷

### 日期格式
`DD/MM/YY`，如 `22/06/26`

### 已归档行
- `opacity: 0.8`，名称色 `#666`
- 展开后底部右对齐显示「↩ 复原」（青绿描边）和「🗑 永久删除」（红描边）

### 展开箭头
- 必须使用第三节规格（含三态 filter）
- 展开时 `rotate(90deg)`
- 通过 CSS `.tracker-proj-chevron` + parent hover/active 实现，不在 SVG inline 写 filter

---

## 十、周报告（Week in Review）

### 整体结构
```
猫咪横幅（sidebar 凹陷）
本周亮点 pills（布凹，横排撑满）
周日历框
  └── 蓝色顶栏（「2026年的第N个星期，你好！」+ 日月范围）
  └── 星期标题行（Su Mo Tu We Th Fr Sa）
  └── 格子行（有记录凹陷淡染 / 无记录凸起）
PROJECT LOG 容器（sidebar 凹陷）
  └── 标题行 + toggle 开关（同行，标题左，开关右）
  └── 横向雕刻线
  └── 项目卡片（平，无阴影）× N
      └── 已归档项目（凹陷中的凹陷）
```

### 本周亮点 pill
- 效果：布凹效果
- 标题：14px 800 `#A07850`（「最活跃的一天」「最常回来的项目」「首次登场」）
- 内容：11px 700 `#4E5568`（日期、项目名）
- 三个 pill 等宽横排（`flex:1`），不换行
- 条件显示：有数据才显示对应 pill，没有则不占位

### 周日历框
- 外层背景色：`#266ea7`（不用 border，背景即框）
- 圆角：`border-radius: 18px`
- 阴影：`box-shadow: 4px 4px 12px #C8C8D8, -4px -4px 12px #FFFFFF`
- 顶部两个挂钩：`width:11px height:16px background:#266ea7 border-radius:5px 5px 3px 3px`
- 格子区域背景：`var(--lavender)`，`border-radius: 0 0 15px 15px`

### 周日历格子（见第二节）

### 周数计算
```js
// ISO 8601 标准，准确
const getISOWeek = d => {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
};
```

### 项目卡片（PROJECT LOG 内）
- 正常项目：平的，无阴影，`background: var(--lavender)`
- 已归档项目：凹陷中的凹陷（见第四节），`opacity: 0.75`，ARCHIVED 印章 `rotate(-5deg)` 红框，`vertical-align: middle`

### 调皮提示词规则
- toggle 默认关闭，state 存 `window._wrHintsOn`
- 门槛：select 字段某选项出现 ≥2 次 → 「秘密武器」类语气；1 次 → 「这周试了一下 X，感觉怎么样？」
- 三个模板轮换（按项目顺序 idx % 3）

---

## 主题系统（第176–179次）

**机制**：`[data-theme="dark"]` 覆盖 `:root` 变量子集；🌙 按钮（`#stats-btn`）toggle；`cj_theme` 持久化；`color-scheme` 让原生控件（日历下拉）跟随主题；防闪白：脚本顶部即时设 attribute。

### 暗色 palette（方案A · 表面 #2C2F38）
| 变量 | 暗色值 | 备注 |
|---|---|---|
| `--lavender` | `#2C2F38` | 全站表面 |
| `--dark` / `--mid` | `#E6E9F0` / `#8B919E` | 文字层级 |
| `--sh-dark` / `--sh-light` | `#202228` / `#3A3E48` | 高光=比表面略亮的同色系，非白 |
| `--sh-btn-dark/hover` | `#1D1F26` / `#1A1C23` | |
| `--sh-wr-dark/hover` | `#1F2129` / `#1B1D24` | |
| `--sh-cloth` / `--sh-light-soft` | `#1E2028` / `#363A44` | |
| `--sh-sel-out/in` | `#3A3948` / `#232030` | |
| `--sh-num-out/in` | `#323C39` / `#1E2825` | |
| `--line-dark/light` | `#1F2128` / `#3A3E48` | |
| `--c-pill-body` | `#ABB2C0` | 文字层级强制提亮 |
| `--c-muted` / `--c-empty` / `--c-faint` / `--c-unit-hint` | `#9299A6` / `#6B717E` / `#767D8A` / `#6A7180` | |
| `--c-token-bg/text/alt` | `#3A342A` / `#E5C285` / `#C99B54` | 金棕翻转 |
| `--cb-chip-bg/hover/sub-hover` | `#343842` / `#3A3E49` / `#383C46` | |
| `--c-tint0~3` | `#7FA6C9` `#8FB4D1` `#A3C2D8` `#7FABC4` | 第177次提亮 |
| `--cloth-wash/sheen` | `rgba(0,0,0,.38)` / `rgba(255,255,255,.07)` | 真凹陷（第177次） |
| `--cloth-wash-sm/sheen-sm` | `rgba(0,0,0,.30)` / `rgba(255,255,255,.06)` | Modal badge 小号 |
| `--cal-sel-bg` / `--c-other-month` | `rgba(0,0,0,0.25)` / `rgba(230,233,240,0.28)` | 第178次 |
| `--badge-shade/sheen` | `rgba(0,0,0,.35)` / `rgba(255,255,255,.08)` | 第179次 |
| `--c-icon-idle/edit` | `#767D8A` / `#7FA6C9` | 第179次 |
| `--icon-shadow(/-hover)` | 黑系投影 `rgba(0,0,0,.55/.7)` | 第178次去蓝晕 |
| `color-scheme` | `dark` | 原生控件 |

**其他新变量（两主题同值）**
| `--paper-shadow` | 亮：`0 1px 6px rgba(0,0,0,.08)` / 暗：`0 2px 8px rgba(0,0,0,.35)` | 白纸卡片投影 |
| `--cb-radio` | `#6E7B96`（两主题同值） | Chart Builder 单选组选中填充 |
| `--cb-multi` | `#5A6270`（两主题同值） | Chart Builder 多选组选中填充 |

**沿用亮色值（ZONZON 决定）**：`--purple` `--danger` `--cyan` `--white` `--sh-blue-inset` `--c-select` `--c-number` `--c-active` `--c-done` `--c-archived` `--c-past-hint` `--c-note` `--c-last` `--c-coin-hint` `--c-undo`。

### 亮色专属新变量（第177–179次，亮色值）
`--cloth-wash:rgba(180,190,210,0.55)` `--cloth-sheen:rgba(255,255,255,0.9)`（-sm: 0.45/0.85）、`--cal-sel-bg:rgba(255,255,255,0.9)`、`--c-other-month:rgba(90,88,112,0.35)`、`--badge-shade:rgba(0,0,0,.12)`、`--badge-sheen:rgba(255,255,255,.5)`、`--c-icon-idle:#C8C8D8`、`--c-icon-edit:#266ea7`

### 项目自定义色暗色规则
`.proj-badge` 走 `--pc` 自定义属性；暗色：`color-mix(in srgb, var(--pc) 55%, white)` 提亮文字和边框。纯 CSS，不重渲染。

### 导出按钮规格（`.tracker-export-btn`）
新拟态表面凸起 + 蓝字（`var(--purple)`）+ `border-radius:10px` + `padding:9px 20px` + `font-size:13px`；hover 阴影加强，按下凹陷。两主题同款。

### Chart Builder 胶囊四组语言
| 组 | Class | 选中填充 | 语义 |
|---|---|---|---|
| 变量（多选） | `.cb-var-chip` | `t-sel`→紫 `#7B68EE` / `t-num`→绿 `#1D9E75` | 复用 Modal 字段类型色 |
| 单选（Palette+图表类型） | `.cb-type-btn` | 灰蓝 `--cb-radio` | 互斥单选 |
| 视图开关+数据操作（多选） | `.cb-tog` | 深灰 `--cb-multi` | 非破坏性多选 |
| 导出（操作按钮） | `.tracker-export-btn` | 新拟态表面+蓝字 | 动作不是状态 |

三态：闲置 3px 轻凸 → hover 4px → 按下凹陷 → 选中填充。图标固定不切换。

### 暗色专属 CSS 规则
`[data-theme="dark"] .proj-badge`（color-mix）、`.page-title` 三态（黑系投影替换蓝晕）。

---

## 记录列表系统（第183–186次）

### 分页规格
每页 10 条；总页数 ≤ 7 显示全部页码，> 7 用省略号；首末页始终显示；「跳至」输入框 Enter 确认。
分页箭头：字符 `⮜` / `⮞`，class `.tr-pg-btn.arr`，到边界 `disabled + opacity:.3`，无外框。

### View 面板结构
```
未展开：[详细记录（详细记录雕刻线）]          [👁 View]
展开后：[DISPLAY 模式胶囊]
        [月份切换器（按月模式）]
        [SORT 排序]
        ──── View panel 底部 padding 14px ────
        [详细记录（详细记录雕刻线）]          [👁 View]
        记录列表...
        [分页 / SPACE 键帽按钮]
```
View panel 用 `.tr-view-panel` class；胶囊复用 `.cb-type-btn`（灰蓝选中，inset 凹陷）。
第188次移除了 VIEW 标签行，展开后直接显示显示模式和排序。

### 空筛选状态（第198次）
当 View 筛选（如「近一周」）导致 peF 为空但 pe 有记录时：
- 显示居中提示「当前筛选「{模式名}」下没有记录」
- 附带「显示全部」蓝色链接按钮（重置 vs.mode='all'）
- 自动展开 View 面板（`_vsOpen[p.id]=true`）

### 显示模式
| mode | 逻辑 | 默认排序 |
|---|---|---|
| `all` | 全量 | desc（新→旧） |
| `week` | 近7天 | desc |
| `month` | 选定年月 | asc（旧→新） |
| `n10/n20/n50` | 排序后取前N条 | desc |

状态存 `cj_view_${pid}`；月份切换器 A+E：`⮜ YYYY年 ⮞ · N records` + 有记录月份胶囊。

### 日期格式
- 存储：`YYYY-MM-DD`（`dk()` 补零，用于排序）
- 显示：`DD/MM/YYYY`（渲染层转换，如 `28/06/2026`）

### Journal 日期标头（第200次）
位于统计卡片和记录列表之间，使用「详细记录雕刻线」样式。
```css
.journal-date-hdr { font-size:13px; font-weight:700; color:var(--purple); display:inline-block; }
/* + 详细记录雕刻线 */
```
- 中文：`2026年7月7日·星期二·今天`
- 英文：`Tue, 07/07/2026 · Today`

### 双语日期规则（第201次）
| 区域 | 中文 | 英文 |
|---|---|---|
| Journal 日期标头 | `YYYY年M月D日·星期X` | `Weekday, DD/MM/YYYY` |
| page-date 副标题 | 同上 | 同上 |
| 周报告 Most Active Day | `星期X · DD/MM/YY` | `Monday · DD/MM/YY` |
| 日历弹窗标题 | `2026年 6月` | `June 2026` |
| 日历弹窗天数表头 | `日 一 二 三 四 五 六` | `Su Mo Tu We Th Fr Sa` |
| 日历弹窗月份下拉 | `1月 2月...` | `January February...` |

---

## 备份与恢复弹窗（第210–220次）

### 四个可复用组件

| 类名 | 形态 | 用途 |
|---|---|---|
| `.bk-tray` | 凹陷托盘 | 装列表或数据的容器 |
| `.bk-tog` | 凸起按钮 | 折叠区收起态；`.sec` 变体为次要（灰字） |
| `.bk-tray-hdr` | 槽内平面标题行 | 折叠区展开后，toggle 变成托盘的标题，下方一条 `0.5px` 分隔线；`.pri` 变体为深色 |
| `.bk-chip` | 凸起小胶囊 | All / None；`.on` 变体凹陷 + 紫字表示当前状态 |
| `.bk-row` | 平面行 | 列表项，hover 浮起、按下凹陷 |

**折叠区的两态切换是固定模式：**
```
收起 → <button class="bk-tog">▼ 标题 ... 右侧信息</button>
展开 → <div class="bk-tray">
         <button class="bk-tray-hdr">▲ 标题 ... 右侧信息</button>
         内容（平面）
       </div>
```
归档区与备份数据区共用此模式，用户学会一个就懂另一个。

### 计数器规则

- **可见列表不需要计数器** —— 主统计块本身就是实时的（取消勾选后数字自己会变）
- **折叠区需要计数器** —— 内容被藏起来了，看不到选择状态
- 计数器带单位词避免误读：`已选 3/3` / `3/3 selected`（中英语序不同，需 `lang` 判断）

### 传输方式推荐阈值

| 大小 | 建议 | 颜色 |
|---|---|---|
| < 50 KB | 复制粘贴 | `--mid` |
| 50–200 KB | 粘贴走邮件 | `--c-past-hint` |
| > 200 KB | 下载文件 | `--danger` |

50 KB 依据：WhatsApp 单条消息上限约 65,536 字符，留安全余量。推荐的那个按钮会自动变成主按钮，不只是文字提示。

### 备份数据格式

```json
{ "app":"catVweb-journal", "version":1, "exportedAt":"ISO",
  "data":{ "projects":[], "entries":{}, "totalCoins":0, "palette":[] } }
```

四样缺一不可 —— 少了 `projects` 记录会变成「未知项目」孤儿，字段和颜色全丢。

---

## 十一、待办

| 项目 | 说明 |
|---|---|
| Cat Token 逻辑 | 暂搁置，待后续讨论 |
| 周报告亮点 pill 图标 | 待替换为白色德文猫 SVG 图标（跳舞/心/小树苗），图标凹陷方块内，颜色 `#A07850` |
| 侧滑导出面板 | 字段勾选 + 范围选择 + 预览 |
| Print report 主题重设计 | 默认旧紫色主题需更改，提升可读性 |
| Print 内容自定义 | 与侧滑导出面板关联，用户可选择导出哪些内容 |
| Print 加星期几 | 目前只有月/日，需补上星期 |
| PDF vs HTML 导出格式 | 确认当前 print 输出是 PDF 还是 HTML；评估两种方案的优劣 |
| Textarea 滚动条新拟态设计 | 上下/左右拖动 bar 需配合 neumorphism 风格。备份弹窗内已出现两条默认滚动条（项目列表 + JSON 框），是全 app 最明显的一处 |

### 已完成
| 项目 | 完成于 |
|---|---|
| Modal 功能改动 | 第122–130次 |
| 子选项删除保护（确认行） | 第134–141次 |
| 背景关闭自动保存逻辑 | 第142次 |
| autocomplete 全站关闭 | 第143–144次 |
| Tracker 列表重设计 | 第145–156次 |
| 废弃 `.ie-save` 清理、sb-divider 改 border | 第157次 |
| Night Mode 占位、月报告入口 | 第158次 |
| 周报告全面重设计 | 第159–174次 |
| 夜间模式·阶段一：全站颜色变量化（456处，17个新变量，修复 --neu-inset，废弃 -val） | 第175次 |
| 夜间模式·阶段二：方案A暗色 palette + 🌙 toggle + cj_theme + 防闪白 | 第176次 |
| 布凹真凹陷修复 + tint 四件套暗色提亮 | 第177次 |
| 图标蓝晕修复 + 日历弹窗暗色修复（下拉/邻月/color-scheme） | 第178次 |
| 项目徽章 color-mix 自体提亮 + Modal 图标语义变量（--c-icon-*） | 第179次 |
| 移除全部装饰星星；Chart Builder B+ 新拟态全迁移（浅凹托盘、白纸卡片、四组胶囊语言、SVG 图标、死规则清除） | 第180次 |
| cb-tog 家族固定 SVG 图标（8颗）；清除 JS textContent 动态替换 | 第181次 |
| ARCHIVED 印章暗色提亮（#A32D2D→#C45050）；文档结账 | 第182次 |
| 记录列表分页（每页10条，省略号，分页箭头⮜⮞，跳至输入） | 第183次 |
| 同天二级排序修复；翻页不跳图表（scrollTop 保存恢复） | 第184次 |
| 记录列表 View 面板（4+2显示模式+月份切换器A+E，localStorage持久化，dk()补零） | 第185次 |
| View 按钮+Detailed Records 结构；DD/MM/YYYY 显示；scrollIntoView 展开聚焦 | 第186次 |
| 空格键收起展开项目；双层键帽按钮（.tr-space-key，可复用组件） | 第187次 |
| VIEW 标签移除；View 面板底部 padding 增加 | 第188次 |
| 详细记录雕刻线（文字等宽 inline-block） | 第189–190次 |
| 胶囊按钮 .on 选中态统一凹陷（cb-var-chip、cb-type-btn、cb-tog） | 第191次 |
| 筛选标签四态 + 项目卡片 hover/active 反馈 | 第192–194次 |
| 夜间模式阶段三收尾：Chart.js 动态主题、统计面板、canvas 暗色、图表即时刷新 | 第195–197次 |
| 空筛选状态提示 +「显示全部」重置 + 自动展开 View | 第198次 |
| 记录行「回到当天」跳转（日期+图标+tooltip） | 第199次 |
| Journal 日期标头（详细记录雕刻线，双语格式） | 第200次 |
| i18n 修复：中文星期前缀、日历弹窗英文化、周报告英文星期名 | 第201次 |
| Form 安全确认（hasFormContent + tryNavigateDate）；title/note auto-grow textarea | 第202次 |
| 内联 modal 确认弹窗取代 browser confirm()；_pendingNav 模式 | 第203次 |
| autoGrow 修复（renderAll 后恢复高度 + overflow-y:auto 滚动） | 第204次 |
| 日期雕刻线移到 form card 上方 | 第205次 |
| 三按钮确认弹窗（保存+继续+放弃）+ 全视图切换拦截（周/月/tracker） | 第206次 |
| 方案 B 点击引导：未选 project 时闪烁引导而非 disabled | 第207次 |
| Cancel 安全锁：safeCancelForm()，有内容时弹两按钮确认 | 第208次 |
| Tracker last date 取反方向修复：pe[0] → pe[pe.length-1] | 第209次 |
| 备份与恢复功能上线（💾 侧边栏入口，导出/导入双标签，合并/覆盖模式） | 第210次 |
| 传输方式按体积自动推荐 + backup nav 激活态修复 | 第211次 |
| 选择性备份（项目勾选、孤儿记录保护）+ 双设备风险警示 | 第212次 |
| 导出页 Option 1 布局 + 方案A 同名项目自动重命名 | 第213次 |
| 交互反馈补齐（All/None 伪类、归档展开移出滚动容器） | 第214次 |
| 新拟态一致性统一 + All/None 反映实际状态 | 第215次 |
| Option B：按钮与数据绑定，统计块设 user-select:none | 第216次 |
| 「备份数据」改凸起按钮 + 颜色层级重排（强调色收敛到三处） | 第217次 |
| 消除三层凹陷嵌套，确立「最多两层凹陷」规则 | 第218次 |
| 建议语精简 + 折叠区互斥展开 | 第219次 |
| 移除冗余 10/10 + 归档计数改「已选 3/3」+ 阈值写进建议语 | 第220次 |
| 离线壳上线（PWA：`sw.js` + `manifest.json` + 猫脸图标，可加到手机主屏幕、断网可用） | 第221次 |
| 图标换成「猫 + JOURNAL 66♡ 横幅」，底色深蓝 `#1e5a8a`；旧的两套图标清除 | 第222次 |

---

## 十二、沟通约定

| 说这个 | 不说这个 |
|---|---|
| 「标准凸起效果」 | 具体数值 |
| 「sidebar 凹陷效果」 | `var(--neu-inset-val)` |
| 「七日效果」 | CSS class 名 |
| 「新纪录效果」 | 具体数值 |
| 「周报告效果」 | 具体数值 |
| 「竖向雕刻线」 | `.ec-vdivider` |
| 「布凹效果」 | 复杂 box-shadow 数值 |
| 「白纸卡片」 | `.cb-chart-area`/`.cb-side-panel` + `--paper-shadow` |
| 「浅凹托盘」 | `.cb-wrap` 的 3px inset |
| 「分页箭头」 | `.tr-pg-btn.arr`，字符 `⮜`/`⮞` |
| 「模糊红框」 | `nameAlert` |
| 「背景关闭」 | `onmousedown` modal-bg |
| 「失焦保存」 | `onblur` |
| 「跳过按钮」 | `.skip-btn` |
| 「猫爪币」 | `.ec-coin` |
| 「颜色包」 | palette popup |
| 「周日历框」 | `.wr-cal-outer` |
| 「周日历格子」 | `.wr-cal-day` |
| 「凹陷中的凹陷」 | 具体数值 |
| 「toggle 开关」 | `.wr-toggle-track` |
| 「键帽效果」 | `.tr-space-key` + `--sk-base/face/text` |
| 「详细记录雕刻线」 | `display:inline-block` + `border-bottom` + `box-shadow`（文字等宽） |
| 「横向雕刻线」 | `border-top` + `border-bottom`（整行宽度） |
| 「胶囊选中凹陷」 | `.on` 态 `inset 3px 3px 7px rgba(0,0,0,.25)` |
| 「回到当天」 | `.tr-date-area` 跳转容器 + tooltip |

---

## 十三、多单位数字字段显示规则

**多单位**：`time: 30 min · 1 hour`（`·` 分隔）
**单单位**：`length: 23 cm`（从 `f.units[0]` 拼接单位）

---

## 十四、已知 Bug 记录（避免重犯）

| Bug | 根源 | 修法 |
|---|---|---|
| i18n 乱码 | 中文字节写入 en key | en key 只写英文 ASCII |
| `t is not a function` | `let t = DOM元素` 覆盖翻译函数 | DOM 变量改名 `_toast` |
| highlight 文字关闭 modal | `onclick` 在 mouseup 判断 target | 改 `onmousedown` |
| Save 按钮卡死 | 模板字符串 style 跟 onblur 时序冲突 | style 条件移除，只用 JS 判断 |
| Tracker isArchived 报错 | `card.className` 在 `isArchived` 定义前 | 调换定义顺序 |
| 中文写入 JS 乱码 | Python bytes 模式拼接中文字符 | 用临时 .js 文件写入，或 str_replace 直接写中文 |
| 函数重复定义 | str_replace 找不到目标时静默失败，新内容追加到文件末 | 替换后立即 grep -c 验证函数唯一性 |
| 工作文件丢失 | 误用上传文件（原始版）而非 outputs/ 最新版 | 新对话优先检查 /mnt/user-data/outputs/ |
