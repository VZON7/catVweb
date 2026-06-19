# catvweb journal.html — 新拟态设计系统参考文档
> 更新于 第67次 update｜用于和 Claude 沟通时指定颜色、阴影、效果

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
| New Log 按钮暗影 | `#43688e` |
| New Log 按钮 active 暗影 | `#2a4f6e` |
| 周报告按钮暗影 | `#c8cedb` |
| coin-pill 背景 | `#FAEEDA` |
| coin-pill 文字 | `#633806` |

---

## 二、阴影系统

### 2A. 正常背景上的标准凸起（raised）
```
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF
```
→ CSS变量：`var(--neu-raised)`
→ 使用场景：stat card、nav-back 按钮、coin-pill

### 2B. 正常背景上的标准凹陷（inset）
```
box-shadow: inset 6px 6px 12px #C8C8D8, inset -6px -6px 12px #FFFFFF
```
→ CSS变量：`var(--neu-inset-val)`
→ 使用场景：sidebar 容器

### 2C. 凹陷容器内的轻凸起（子元素默认态）
```
box-shadow: 3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF
```
→ 使用场景：add-proj-btn、sb-nav-btn 默认态

### 2D. 凹陷容器内的轻凸起（子元素 hover 加强）
```
box-shadow: 4px 4px 9px #C8C8D8, -4px -4px 9px #FFFFFF
```
→ 使用场景：add-proj-btn hover、sb-nav-btn hover

### 2E. 凹陷容器内的轻凹陷（子元素 active / selected）
```
box-shadow: inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF
```
→ 使用场景：day-item active、proj-item:active、add-proj-btn:active、sb-nav-btn:active

### 「七日效果」= 2C + 2E 组合命名
专指完整三态交互组合：
- 默认：无阴影（平贴容器）
- hover：**2C**（轻凸起）
- active / selected：**2E**（轻凹陷）
→ 之后凡指定「用七日效果」即套用此三态组合，不需要重复写出具体数值。
→ 已套用元素：`.day-item`（日一至今天）、`.sb-nav-btn`（周报告 / 项目追踪）

---

## 二点五、Sidebar 交互分类详解

### 一、七日效果
**对象**：`.day-item`（日一至日六/今天，7 个日期格）

| 状态 | 触发条件 | 视觉 |
|---|---|---|
| 默认 | 平时 | 无阴影，平贴 sidebar |
| hover | 鼠标悬停 | 轻凸起（2C） |
| active / 选中 | `selDate` 等于这一天 **且** `view==='journal'` | 轻凹陷（2E）+ 文字变蓝加粗 |

**逻辑关键**：选中状态会跟着 `view` 联动——切到周报告/项目追踪时自动回弹平，回到 journal 才恢复凹陷。

---

### 二、变量效果
**对象**：`.proj-item`（PROJECTS/TASKS 列表，project 03、catVweb 等）

| 状态 | 触发条件 | 视觉 |
|---|---|---|
| 默认 | 平时 | 无阴影 |
| hover | 鼠标悬停 | 轻凸起（2C），同时显示 tooltip |
| active | 鼠标按住瞬间 | 轻凹陷（2E） |
| dragging | 拖动中 | 透明度 0.35 |
| drag-over | 拖到目标位置上方 | 轻凹陷（2E），提示可放置 |

**逻辑关键**：和七日效果几乎一样的阴影系统（2C/2E），但**没有持久选中状态**——点击只是按住瞬间凹陷，松手就弹平，不会像日期那样「记住」选中了哪个 project。另外多了拖拽排序的两个特殊状态。

---

### 三、周报告 / 项目追踪（沿用七日效果，未单独命名）
**对象**：`.sb-nav-btn`

| 状态 | 触发条件 | 视觉 |
|---|---|---|
| 默认 | 平时 | 无阴影 |
| hover | 鼠标悬停 | 轻凸起（2C） |
| active（伪类） | 鼠标按住瞬间 | 轻凹陷（2E） |
| **.active（持久）** | `view==='stats'` 或 `view==='tracker'` | 轻凹陷（2E）+ 蓝字加粗 |

**逻辑关键**：和七日效果**完全一样的阴影逻辑**（2C/2E + 持久选中状态跟随 `view`），只是七日效果跟踪的是「选中哪一天」，这个跟踪的是「当前在哪个页面」。

→ 因逻辑与七日效果完全一致，不重新命名，直接说「用七日效果」即可。

---

### 四、箭头效果
**对象**：`.wnav-btn`（‹ › 左右切换周）

| 状态 | 视觉 |
|---|---|
| 默认 | `drop-shadow` 蓝色系，轻立体 |
| hover | `drop-shadow` 加强 |
| active | `drop-shadow` 压平 |

**逻辑关键**：不用 `box-shadow`，用 `filter: drop-shadow()`——因为图标是无方框 SVG 线条，阴影要贴合线条轮廓而不是矩形容器。没有持久选中状态（不像日期/页面那样需要记住）。

---

### 五、日历效果
**对象**：`.cal-icon-btn`（📅 日期选择器图标）

**逻辑关键**：和箭头效果**完全一样**——同样的 `drop-shadow` 数值、同样三态、同样无持久选中状态。两者唯一区别是图标本身的 SVG 形状不同。

### 2F. NAV 栏底部单向阴影
```
box-shadow: 0 4px 10px #C8C8D8, 0 -2px 6px #FFFFFF
```
→ 使用场景：#site-nav

### 2G. New Log 按钮同色系阴影（蓝底专用）
```
默认：  box-shadow: 6px 6px 14px #43688e, -6px -6px 14px #FFFFFF
hover：  box-shadow: 8px 8px 18px #43688e, -8px -8px 18px #FFFFFF
active：  box-shadow: inset 4px 4px 9px #2a4f6e   ← 只单向，不加白
```

### 2H. 周报告按钮同色系阴影（灰底，inline style）
```
默认：  box-shadow: 4px 4px 9px #c8cedb, -4px -4px 9px #FFFFFF
```

### 2I. 雕刻分隔线（carved divider）
```
border: none;
height: 2px;
background: transparent;
box-shadow: 0 1px 0 #FFFFFF, 0 -1px 0 #C8C8D8;
```
→ 使用场景：`.sb-divider`，sidebar 内的分隔

### 2J. Project 标题徽章（双层立体）
```
外层（白色凸起外框）：
background: var(--lavender);
padding: 4px;
box-shadow: 4px 4px 9px #C8C8D8, -4px -4px 9px #FFFFFF;

内层（项目色实底 + 轻凹陷）：
background: rgba(项目色,.16);
color: 项目色;
border: 1.5px solid 项目色;
box-shadow: inset 1.5px 1.5px 3px rgba(0,0,0,.12), inset -1px -1px 2px rgba(255,255,255,.5);
```
→ 使用场景：`.proj-badge-wrap` + `.proj-badge`，颜色完全沿用用户创建 project 时选的 `p.color`，不固定为紫色

---

## 三、SVG 图标系统（无方框，drop-shadow 贴合轮廓）

### 3A. 导航箭头（左 / 右）

| 属性 | 数据 |
|---|---|
| 形状 | 带尾线实心箭头，`path`，无方框 |
| SVG 尺寸 | `width="14" height="12" viewBox="0 0 14 12"` |
| 左箭头 path | `M8 1L2 6L8 11M2 6H13` |
| 右箭头 path | `M6 1L12 6L6 11M12 6H1` |
| 颜色 | `#266ea7`，`stroke-width="2"` |
| 端点 | `stroke-linecap="round" stroke-linejoin="round"` |
| 容器 | `background:none`，`padding:3px 4px` |
| 默认阴影 | `drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px #fff)` |
| hover 阴影 | `drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px #fff)` |
| active 阴影 | `drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7))` |
| 排列 | 靠右，`margin-left:auto`，与日历同组 `gap:4px` |

### 3B. 日历图标（动态日期）

| 属性 | 数据 |
|---|---|
| SVG 尺寸 | `width="26" height="26" viewBox="0 0 26 26"` |
| 外框 | `rect x=2 y=4 w=22 h=20 rx=3`，`stroke="#266ea7" stroke-width="1.8"` |
| 顶栏（占25%） | `rect x=2 y=4 w=22 h=5 rx=2`，`fill="#266ea7"` |
| 横分隔线 | `line y1=9 y2=9`，`stroke="#266ea7" stroke-width="1.8"` |
| 左挂钩 | `line x=8 y1=2 y2=6`，`stroke-width="2" stroke-linecap="round"` |
| 右挂钩 | `line x=18 y1=2 y2=6`，`stroke-width="2" stroke-linecap="round"` |
| 日期文字位置 | `x="13" y="17"`，`dominant-baseline="central"` |
| 日期字体 | `font-size="10" font-weight="800" fill="#266ea7" font-family="Nunito,sans-serif"` |
| 动态注入 | `id="cal-icon-day"`，`renderAll()` 内写入 `today.getDate()` |
| 容器 | `background:none`，`padding:3px 4px` |
| 阴影 | 同 3A 完全一致 |
| 排列 | 靠右，与箭头同组 |

### 3C. 编辑铅笔图标（Entry Card）

| 属性 | 数据 |
|---|---|
| 形状 | 带笔尖分隔线，`path`，无方框 |
| SVG 尺寸 | `width="15" height="15" viewBox="0 0 20 20"` |
| path | `M13.5 2.5L17.5 6.5L7 17H3V13L13.5 2.5Z` + 笔尖线 `M11.5 4.5L15.5 8.5` |
| 默认颜色 | `var(--mid)`，`drop-shadow(1.5px 1.5px 2px rgba(0,0,0,.12))` |
| hover | 颜色变 `#266ea7`（蓝），`drop-shadow(2px 2px 3px rgba(38,110,167,.5))` |

### 3D. 删除 X 图标（Entry Card，含 Shift 双态）

| 属性 | 数据 |
|---|---|
| 形状 | 粗线 `path`，无方框 |
| SVG 尺寸 | `width="14" height="14" viewBox="0 0 18 18"` |
| path | `M3 3L15 15M15 3L3 15"`，`stroke-width="2.6"` |
| 默认颜色 | `var(--mid)` |
| hover（不按 Shift） | 颜色变蓝 `#266ea7`，`drop-shadow(2px 2px 3px rgba(38,110,167,.5))` |
| hover（按住 Shift） | 颜色变红 `#E53935`，`drop-shadow(2px 2px 3px rgba(229,57,53,.5))`，触发条件 `body.shift-down` class |
| 点击行为 | 不按 Shift → 弹出删除确认 modal；按住 Shift → 跳过确认直接删除 |
| Shift 检测 | `document.addEventListener('keydown'/'keyup')` 切换 `body.shift-down`，`window blur` 时强制清除防卡住 |

---

## 四、交互状态规则

### 正常背景上的元素
| 状态 | 效果 |
|---|---|
| 默认 | 凸起 `--neu-raised` |
| hover | 凸起加强（offset +2px）或 `translateY(-1px)` |
| active | 凸起缩小 或 单向 inset |

### 凹陷容器内的元素
| 状态 | 效果 |
|---|---|
| 默认 | 轻凸起 `3px 3px 7px`（**2C**） |
| hover | 轻凸起加强 `4px 4px 9px`（**2D**）|
| active / selected | 轻凹陷 `inset 3px 3px 7px`（**2E**）|

### SVG 图标（无方框）
| 状态 | 效果 |
|---|---|
| 默认 | `drop-shadow` 蓝色系立体 |
| hover | `drop-shadow` 加强 |
| active | `drop-shadow` 压平 |

### 语言切换按钮（`#lang-zh` / `#lang-en`）
| 状态 | box-shadow | 文字色 |
|---|---|---|
| active（当前语言） | `inset 3px 3px 7px #C8C8D8, inset -3px -3px 7px #FFFFFF` | `var(--purple)` |
| inactive | `3px 3px 7px #C8C8D8, -3px -3px 7px #FFFFFF` | `var(--mid)` |

---

## 四点五、Entry Card 元素层级分类

新拟态原则：**阴影表示层级深度，不表示内容类型**。Entry Card 内不同元素按"站在哪一层"决定视觉处理方式，而非每种类型发明新阴影。

| 层级 | 视觉逻辑 | 适用元素 |
|---|---|---|
| 第 0 层 — 页面背景 | 平 | sidebar 外的页面底色 |
| 第 1 层 — 容器 | 凸起（**--neu-raised**） | `.entry-card` 本身 |
| 第 2 层 — 分类徽章 | 实色块，不用灰阶阴影 | `.proj-badge`（见 **2J**）、状态标签 |
| 第 2 层 — 数据标签 | 实色胶囊，无阴影 | 栏位 tag（`.ec-selval`，select 类型选项） |
| 第 2 层 — 纯文字数据 | 无背景、无阴影 | 数字+单位说明（如 `time: 30 min`） |
| 第 3 层 — 强调数字 | 实色块（暖色） | Cat Token（`.ec-coin`，🐾 +N） |
| 交互层 — 图标按钮 | 默认无背景，hover 才出现 | 编辑/删除图标（**3C / 3D**） |

**判断原则**：
1. 会变化/被切换的状态（选中/未选中）→ 用阴影
2. 代表分类/身份的徽章 → 用实色，不用阴影
3. 纯展示性文字 → 越简单越好，不需要容器感

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

---

## 六、圆角规则

| 元素类型 | 圆角值 |
|---|---|
| 大卡片（stat card、sidebar） | `20px` |
| 中型卡片（entry card、modal） | `12–14px` |
| 小按钮（sb-nav-btn、day-item） | `10px` |
| 图标容器（wnav-btn 旧版） | `7px`（现已废弃，图标改为无方框） |
| 胶囊形（**不可改**） | `999px` |

胶囊形保留元素：`.coin-pill`、`.proj-badge`、颜色色点、`#lang-zh`、`#lang-en`、`.new-btn`、`.nav-back`

---

## 七、待办 / 未完成项目

| 项目 | 说明 |
|---|---|
| Step 4：子选项视觉区分 | 目前所有种类的子选项（select 栏位 tag）全是同一种白底凹陷，未按「四点五」层级分类区分种类 |
| Step 5：Form + Modal | border 待清除，换新拟态 |
| Step 6：Tracker 卡片 | 状态标签、按钮待统一 |
| coin-pill | 目前 `--neu-raised`，待确认是否保留暖色背景 |

### 已完成
| 项目 | 完成于 |
|---|---|
| Step 4：Entry Card 容器 + Inline Edit | 第55次 update |
| Project 标题徽章双层立体（2J） | 第56–57次 update |
| 编辑/删除图标 SVG 化（3C/3D）+ 删除确认/Shift机制 | 第58–59次 update |
| 多单位数字字段（Modal/表单/显示/计算/Chart Builder 全链路） | 第60–67次 update，详见 SKILL.md 第十七节 |

---

## 八、多单位数字字段（设计要点摘要）

完整技术规则见 `catvweb-journal-SKILL.md` 第十七节。这里只记录**视觉/UX 决策**：

- 填表单时，多单位字段渲染成**多行独立输入框**（方案 1），不是单选单位+一个数字（方案 2）
- Entry Card / Tracker 显示格式：`time: 30 min · 1 hour`（`·` 分隔，无逗号）
- Chart Builder「SELECT VARIABLE」：多单位字段拆成多个独立按钮，如 `time (min)`、`time (hour)`
- **默认勾选规则**：单一单位（或无单位）的数字字段默认勾选；≥2 个单位的字段默认**不**勾选，需用户手动选
