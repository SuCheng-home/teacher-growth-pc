# 组件契约文档（CONTRACT.md）

> 本文档定义 `teacher-growth-pc` 项目中各组件的接口契约，供并行开发的 agent 遵循。

---

## 1. 容器组件：growth-vision/index.vue

### 1.1 拥有的状态（data）

| 字段 | 类型 | 说明 |
|------|------|------|
| `selected` | Object | 已选愿景映射，如 `{ yj: true, yq: true }` |
| `cur` | String | 当前目标 key（如 `'yj'`） |
| `activeTab` | String | 当前 Tab：`'doc'` / `'cmp'` / `'sum'` / `'rpt'` |
| `ov` | Object | 教师改动映射 `{ [itemId]: { score, value, del, reason } }` |
| `pullTime` | String | 档案数据拉取时间 |
| `anaTime` | String | 分析时间 |
| `goalTime` | Object | 每个愿景的上次评估时间 `{ [key]: timeStr }` |
| `pendingAdd` | Object/null | 待添加的目标（goal-modal 使用） |
| `reports` | Object | 已生成的分析报告快照 `{ [key]: { html, at, pull, fp } }`，生成即冻结 |
| `goalModalMode` | String | 目标弹窗三态：`'setup'` / `'add'` / `'manage'` |

### 1.2 计算属性（computed）

| 名称 | 返回 | 说明 |
|------|------|------|
| `currentTarget` | Object/null | 当前目标定义 `TARGETS[cur]` |
| `hasGoals` | Boolean | 是否有已选愿景 |
| `aiContext` | Object | AI 助手上下文 `{ targetKey, targetName, gaps, totals }` |

### 1.3 容器方法（处理子组件上抛事件）

- `handleSelectTarget(key)` — 切换当前目标
- `handleTabChange(tab)` — 切换 Tab
- `handleRefresh()` — 重新拉取档案
- `handleEditScore(item)` → 打开 edit-score-dialog
- `handleEditConfirm(payload)` → 写入 `ov`
- `handleDeleteScore(item)` → 打开 delete-score-dialog
- `handleDeleteConfirm(payload)` → 写入 `ov[id] = { del: true, reason }`
- `handleRefetch(item)` → 打开 refetch-dialog
- `handleRefetchConfirm(payload)` → 删除 `ov[id]`
- `handleSimAction({ item, type })` → 打开 sim-action-dialog
- `handleRefreshTarget(key)` → 卡片「重新评估」：`$confirm` 确认后刷新 `goalTime[key]` 与数据时点
- `handleGenerateReport()` → 按当前 `scoreTotals` 生成报告快照写入 `reports[cur]`（内联展示，不走弹框）
- `handleDownloadDoc(doc)` → toast 提示
- `handleGotoStandard()` → 「查看标准库」入口（演示 `$alert`）
- `toast(msg)` — 轻提示（使用原始 `.mini-toast` 自定义样式）

---

## 2. 四个 Pane 组件统一接口

### 2.1 Props

| Prop | 类型 | 适用 | 说明 |
|------|------|------|------|
| `target` | Object | 全部 pane | 当前目标定义（完整 TARGETS[key] 对象） |
| `targetKey` | String | 全部 pane | 当前目标 key（`cur`）。因 `scoreRows/scoreTotals(target, targetKey, ov)` 需显式 key 生成匹配 `ov` 的 id，容器必传，pane 不得依赖对象引用反查 |
| `ov` | Object | 全部 pane | 教师改动映射 |
| `pullTime` | String | 仅 pane-rpt | 档案数据拉取时间（报告页脚与系统说明） |
| `report` | Object/null | 仅 pane-rpt | 已生成的报告快照 `{ html, at, pull, fp }`，为空时只展示生成入口 |

### 2.2 Events（上抛给容器处理，pane 自身不改状态）

| Event | Payload | 触发组件 | 说明 |
|-------|---------|----------|------|
| `edit-score` | `item` (row对象) | pane-cmp | 打开修改弹窗 |
| `delete-score` | `item` (row对象) | pane-cmp | 打开剔除弹窗 |
| `refetch` | `item` (row对象) | pane-cmp | 打开重新取数弹窗 |
| `sim-action` | `{ item, type }` | pane-cmp | type ∈ `auto2` / `pick` / `fill` / `school` |
| `generate` | — | 仅 pane-rpt | 生成 / 重新生成分析报告（报告入口在分析报告页，其它 pane 不触发） |
| `download-doc` | `doc` (文档对象) | pane-doc | 下载标准原文 |
| `goto-standard` | — | pane-doc | 评估文件列表底部「查看标准库」入口 |
| `goto-archive` | `item` | pane-cmp | 跳转电子档案袋（预留） |

### 2.3 内部计算

- pane 内部使用 `utils/score.js` 的纯函数计算展示数据：
  - `scoreRows(target, targetKey, ov)` → 行数据
  - `scoreTotals(target, targetKey, ov)` → 汇总
  - `gateRows(target)` → 门槛行
- `targetKey` 由容器通过 `:target-key="cur"` 显式传入（见 §2.1）；pane 内保留按引用反查作为兜底，但不得作为唯一来源
- pane-cmp 的「依据」行展开使用组件内部 local state（不污染容器）

---

## 3. AI 助手：ai-assistant.vue

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `context` | Object | `{ targetKey, targetName, gaps, totals }` |

### 行为

- 自包含：FAB 按钮 + 滑出面板 + 正则预设问答 + Web Speech（可选）
- `beforeDestroy` 中调用 `window.speechSynthesis.cancel()` 清理
- 不修改容器状态，仅展示

---

## 4. 目标弹窗：goal-modal.vue

### Props

| Prop | 类型 | 说明 |
|------|------|------|
| `visible` | Boolean | 是否显示 |
| `mode` | String | `'setup'`（首访添加）/ `'add'`（已有愿景时新增）/ `'manage'`（卡片「编辑」进管理）；前两者为只含分类与级别选择的精简形态（`.gm-body.ft`） |
| `selected` | Object | 当前已选映射 |
| `pendingAdd` | Object/null | 待添加目标 |
| `allGoals` | Object | TARGETS 全量 |
| `focusKey` | String | 打开即展开编辑行的目标 key（管理态用） |

### Events

| Event | Payload | 说明 |
|-------|---------|------|
| `confirm` | `selectedGoals` (Object) | 确认选择 |
| `add` | `goal` (Object) | 添加新愿景 |
| `delete` | `goalKey` (String) | 删除愿景 |
| `resolve-conflict` | `payload` | 解决同类冲突 |
| `close` | — | 关闭弹窗 |

---

## 5. 评分操作弹窗

### 5.1 edit-score-dialog.vue

| Props | 类型 | 说明 |
|-------|------|------|
| `visible` | Boolean | 是否显示 |
| `item` | Object | 当前行对象（含 id, it, ov 等） |
| `target` | Object | 当前目标 |
| `ov` | Object | 全局改动映射 |

Events: `confirm({ id, score, value, del, reason })` / `close`

### 5.2 delete-score-dialog.vue

| Props | 类型 | 说明 |
|-------|------|------|
| `visible` | Boolean | 是否显示 |
| `item` | Object | 当前行对象 |
| `target` | Object | 当前目标 |

Events: `confirm({ id, reason })` / `close`

### 5.3 refetch-dialog.vue

| Props | 类型 | 说明 |
|-------|------|------|
| `visible` | Boolean | 是否显示 |
| `item` | Object | 当前行对象 |
| `target` | Object | 当前目标 |

Events: `confirm({ id })` / `close`

### 5.4 分析报告（已内联到 pane-rpt，无独立弹窗组件）

原型已取消报告弹框：报告在 pane-rpt 内联展示（`.rpt-host`），快照由容器 `reports[cur]` 持有。

| 单元 | 位置 | 职责 |
|------|------|------|
| `reportFp(th, ov)` | `src/utils/report.js` | 状态指纹，用于判断快照是否过期（`.rpt-bar.stale`） |
| `buildReportHtml(t, th, opt)` | `src/utils/report.js` | 生成报告 HTML 串（与原型 `genReport` 逐字对齐） |
| `handleGenerateReport()` | 容器 | 写入 `reports[cur] = { html, at, pull, fp }` |
| `onPrint()` | pane-rpt | 直接 `window.print()`，靠 `@media print` 只输出报告本体 |

### 5.5 sim-action-dialog.vue

| Props | 类型 | 说明 |
|-------|------|------|
| `visible` | Boolean | 是否显示 |
| `item` | Object | 当前行对象 |
| `actionType` | String | `auto2` / `pick` / `fill` / `school` |
| `target` | Object | 当前目标 |

Events: `confirm(payload)` / `close`

---

## 6. 原生对话框替换约定

| 原始方式 | Vue 版本替代 |
|----------|--------------|
| `toast(msg)` | 保留原 `.mini-toast` 自定义轻提示（容器方法控制） |
| `confirm()` / `alert()` | Element UI `this.$confirm` / `this.$alert` |
| 报告打印 | 页面内 `window.print()` + `src/styles/global.scss` 的 `@media print`（不再开新窗口写文档） |

---

## 7. 样式约定（高保真 + 并行协作的有意例外）

- **全部原始 CSS** 集中在 `src/styles/global.scss`，在 `main.js` 中全局引入一次
- 组件模板中直接复用原始 class 名（如 `.target`, `.tab`, `.pane`, `.judge` 等）
- **不要**把 CSS 拆散复制到各组件 `<style scoped>` 块
- 仅当某组件需要原始 CSS 中不存在的新样式时，才在该组件加极少量 `<style scoped>`
- 理由：高保真移植 + 避免并行 agent 之间的样式切分冲突与失真
- 这是对通用「scoped 样式」规范的一个有意例外

---

## 8. Lucide 图标约定

- `index.html` 已引入 Lucide CDN：`<script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js" defer></script>`
- `side-nav.vue` 在 `mounted` / `updated` 中调用 `window.lucide.createIcons()`，并做存在性保护
- 正文内联 SVG 直接写进模板（不依赖 Lucide）

---

## 9. 共享数据与纯函数位置

| 模块 | 路径 | 导出 |
|------|------|------|
| 常量 | `src/constants/qualification.js` | TARGETS, NOWPOST, GOAL_VER, verLine, GOAL_TYPE, GOAL_TYPE_LABEL, GAP, SRC_TYPE, ACTION, PLAIN, ACT_LABEL, TEACHER_ACT, TAB_IC, TAB_DEFS, xgScore, xgTarget, ICON_* |
| 评分工具 | `src/utils/score.js` | ikey, subNum, itemBase, actOf, isTeacherAct, plainOf, scoreItems, gateRows, scoreRows, scoreTotals, tabBadge, judgeCell, basisHTML |
| 报告工具 | `src/utils/report.js` | reportFp, buildReportHtml |
| 格式化工具 | `src/utils/format.js` | fmtTime |
| API 封装 | `src/api/qualification.js` | getTargetList, getScoreDetail, submitOverride, refetchArchive, generateReport, getNowPost, getGoalVerMap, getGoalTypeMap |

---

## 10. 路由约定

- Hash 模式（便于静态预览）
- `'/'` → 重定向到 `'/growth/vision'`
- `'/growth'` 使用 `growth-layout` 作为父路由
- 子路由：`vision`（成长愿景，已实现）、`index`/`portrait`/`archive`/`peer`/`evaluation`/`track`/`mentoring`/`policy`（占位）
- `router.afterEach` 设置 `document.title`

---

## 11. Store 约定

- 最小 Vuex：仅 `user` 模块存演示用户信息
- 页面业务状态不放 store，放 `growth-vision` 容器 data
- Getters: `userName`, `userRole`, `schoolName`
