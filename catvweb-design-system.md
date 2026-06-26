# catvweb journal.html — 新拟态设计系统参考文档
> 更新于 第156次 update｜用于和 Claude 沟通时指定颜色、阴影、效果

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

### 功能性固定色（不走变量）
| 用途 | 色值 |
|---|---|
| 新纪录/保存按钮 默认暗影 | `#B8BEC8` |
| 新纪录/保存按钮 active 暗影 | `#1e5a8a` |
| 周报告按钮 默认阴影 | `#c8cedb` |
| 周报告按钮 hover 阴影 | `#B2B7C4` |
| Select 字段类型色 | `#7B68EE`（紫） |
| Number 字段类型色 | `#1D9E75`（青绿） |
| Active 状态色 | `#1D9E75`（青绿） |
| Done 状态色 | `#266ea7`（蓝） |
| Archived 状态色 | `#A32D2D`（归档红） |
| 过去日期 ×½ 提示 | `#B87878`（低饱和暖红） |
| 模糊红框警告色 | `rgba(229,57,53,0.55)` |
| Tracker records 数字色 | `#2d2b3d`（最深灰，font-weight:800） |
| Tracker records 文字色 | `#888`（中等灰，font-weight:700） |
| Tracker last update 色 | `#9AA0A8` |

---

## 二、阴影效果速查（按「我看到的东西」命名）

### 标准凸起效果
```
box-shadow: 6px 6px 12px #C8C8D8, -6px -6px 12px #FFFFFF
```
→ 用在：stat card、entry card、Tracker 项目卡片

### sidebar 凹陷效果
```
box-shadow: inset 6px 6px 12px #C8C8D8, inset -6px -6px 12px #FFFFFF
```
→ 用在：sidebar 容器、`.form-card`、modal 弹窗整体

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
→ **待办**：sidebar 内分隔线仍用旧 box-shadow，待改成此 border 实现

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
→ 用在：猫爪币、「预计获得 N Cat Token」、modal 类型选择卡片选中态

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

**三态 filter（必须实现全部三态）：**
| 状态 | filter |
|---|---|
| 默认 | `drop-shadow(2.5px 2.5px 3px rgba(38,110,167,.6)) drop-shadow(-1.5px -1.5px 2px #fff)` |
| hover | `drop-shadow(3.5px 3.5px 5px rgba(38,110,167,.8)) drop-shadow(-2px -2px 3px #fff)` |
| active | `drop-shadow(.5px .5px 1px rgba(38,110,167,.3)) drop-shadow(-.5px -.5px .5px rgba(255,255,255,.7))` |

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
- hover：轻微白色高亮（`rgba(255,255,255,0.15)`）
- 已归档：`opacity: 0.8`，名称色 `#666`

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

---

## 六、圆角规则

| 元素类型 | 圆角值 |
|---|---|
| 大卡片（stat card、sidebar、modal） | `20px` / `16px` |
| 中型卡片（entry card、字段卡片、Tracker卡片） | `12–14px` |
| 小按钮（日期格、导航按钮） | `10px` |
| 胶囊形（不可改） | `999px` |

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

## 十、待办

| 项目 | 说明 |
|---|---|
| 横向雕刻线 | sidebar 内分隔线待改成 border 实现 |
| 「✓ 保存」按钮（`.ie-save`） | 仍用旧阴影 `#43688e`，待改为新纪录效果 |
| Cat Token 逻辑 | 暂搁置，待后续讨论 |

### 已完成（第122次后）
| 项目 | 完成于 |
|---|---|
| Modal 功能改动 | 第122–130次 |
| 子选项删除保护（确认行） | 第134–141次 |
| 背景关闭自动保存逻辑 | 第142次 |
| autocomplete 全站关闭 | 第143–144次 |
| Tracker 列表重设计 | 第145–156次 |

---

## 十一、沟通约定

| 说这个 | 不说这个 |
|---|---|
| 「标准凸起效果」 | 具体数值 |
| 「sidebar 凹陷效果」 | `var(--neu-inset-val)` |
| 「七日效果」 | CSS class 名 |
| 「新纪录效果」 | 具体数值 |
| 「周报告效果」 | 具体数值 |
| 「竖向雕刻线」 | `.ec-vdivider` |
| 「布凹效果」 | 复杂 box-shadow 数值 |
| 「模糊红框」 | `nameAlert` |
| 「背景关闭」 | `onmousedown` modal-bg |
| 「失焦保存」 | `onblur` |
| 「跳过按钮」 | `.skip-btn` |
| 「猫爪币」 | `.ec-coin` |
| 「颜色包」 | palette popup |

---

## 十二、多单位数字字段显示规则

**多单位**：`time: 30 min · 1 hour`（`·` 分隔）
**单单位**：`length: 23 cm`（从 `f.units[0]` 拼接单位）

---

## 十三、已知 Bug 记录（避免重犯）

| Bug | 根源 | 修法 |
|---|---|---|
| i18n 乱码 | 中文字节写入 en key | en key 只写英文 ASCII |
| `t is not a function` | `let t = DOM元素` 覆盖翻译函数 | DOM 变量改名 `_toast` |
| highlight 文字关闭 modal | `onclick` 在 mouseup 判断 target | 改 `onmousedown` |
| Save 按钮卡死 | 模板字符串 style 跟 onblur 时序冲突 | style 条件移除，只用 JS 判断 |
| Tracker isArchived 报错 | `card.className` 在 `isArchived` 定义前 | 调换定义顺序 |
