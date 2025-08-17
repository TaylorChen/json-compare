<!-- 语言: [English](README.md) | 简体中文 -->

## json-compare

一个基于 Vue 3 的本地前端 JSON 对比与编辑工具。界面与交互参考 `https://jsoneditoronline.org/`，提供左右两栏 JSON 编辑、格式化、压缩、排序、搜索、差异对比、文件导入导出、URL 分享等能力。

### 功能特性
- **左右两栏 JSON 编辑器**：每栏支持三种模式（树、代码、文本）。
- **格式化/压缩**：对当前栏进行美化或最小化。
- **键排序**：递归按键名排序，便于稳定对比。
- **展开/折叠**：一键展开或折叠树节点。
- **复制/交换**：左→右、右→左、两栏内容交换。
- **文件导入导出**：从本地读取 `.json/.txt`，或将当前栏内容下载为文件。
- **差异对比**：基于 jsondiffpatch 的 HTML 视图，快速查看两栏差异。
- **URL 分享**：将当前状态（左右内容、模式、主题、缩进等）压缩到地址栏 Hash，便于分享与恢复。
- **主题/缩进/同步滚动**：明暗主题切换、缩进宽度设置、两栏同步滚动。
- **搜索与菜单**：启用 JSONEditor 内置菜单（包含搜索）。
- **JMESPath 查询**：对当前栏执行 JMESPath 表达式查询与变换。
- **转义/去转义/修复 JSON**：
  - 转义：将当前文本整体转为 JSON 字符串（常用于作为字段嵌入）。
  - 去转义：从 JSON 字符串还原文本，并智能尝试解析为 JSON。
  - 修复：使用 jsonrepair 修复常见不规范 JSON（单引号、缺/多逗号、尾逗号等）。

### 预览与截图
- 本项目为本地前端工具，建议本地运行后自行截图。

### 快速开始
- 安装依赖：
```bash
npm install
```
- 本地开发（热更新）：
```bash
npm run serve
```
- 生产构建：
```bash
npm run build
```
- 代码检查：
```bash
npm run lint
```

### 作为库使用
- 安装（宿主项目需已安装 Vue 3）：
```bash
npm install json-compare-vue
```

- 全局注册（插件方式）：
```js
import { createApp } from 'vue'
import JsonCompareVue from 'json-compare-vue'
import 'json-compare-vue/dist/json-compare-vue.css'
import App from './App.vue'

const app = createApp(App)
app.use(JsonCompareVue) // 默认注册组件名 "JsonDiff"
app.mount('#app')
```

- 局部注册（单组件引入）：
```vue
<template>
  <JsonDiff />
  <!-- 也可以放入自定义布局中 -->
"</template>

<script setup>
import { JsonDiff } from 'json-compare-vue'
import 'json-compare-vue/dist/json-compare-vue.css'
</script>
```

- 说明：
  - 本包将 `vue` 设为 peerDependency，请确保宿主项目安装了 Vue 3。
  - 请引入 `json-compare-vue/dist/json-compare-vue.css` 以正确渲染编辑器与 diff 样式。
  - 包含 `jsoneditor`/`ace`/`jsondiffpatch` 等依赖；若对体积敏感，可在宿主侧做代码分割。

### 使用指南
1. 打开页面后，左右两栏各自为独立的 JSON 编辑器，可通过“模式(左)/(右)”切换树/代码/文本。
2. 通过“打开(左)/(右)”读取本地文件，或直接粘贴内容；“下载(左)/(右)”导出当前栏内容。
3. 可对两栏分别执行“格式化/压缩/排序/修复/转义/去转义”。
4. 点击“对比”生成差异结果，显示在编辑器下方。
5. 开启“同步滚动”后，两栏滚动位置保持一致；“全部展开/折叠”用于树模式快速查看。
6. “分享链接”会把当前状态压缩写入 URL Hash，可复制给他人，打开即还原。
7. 在 JSONEditor 的菜单中可以使用搜索等内置功能。
8. 使用 JMESPath：在输入框填写表达式，点击“应用到左/右”对对应栏执行查询，结果覆盖当前栏。

### 常用命令与参数
- 指定端口/主机：
```bash
npm run serve -- --port 8080 --host 0.0.0.0
```

### 浏览器与运行环境
- 建议使用现代浏览器（Chrome/Edge/Firefox/Safari 最新版本）；不支持 IE11。
- Node.js 推荐版本：18 LTS 或 20 LTS（更高版本可能出现三方包引擎告警）。

### 主要依赖
- `vue`：前端框架。
- `jsoneditor`：JSON 可视化编辑器（树/代码/文本三模式，内置菜单与搜索）。
- `ace-builds`：代码编辑器内核（被 JSONEditor 使用）。
- `jsondiffpatch`：JSON 差异计算与 HTML 格式化输出。
- `lz-string`：URL Hash 压缩与还原。
- `file-saver`：文件下载。
- `lodash`：工具集合（此处主要用于深拷贝）。
- `jmespath`：JSON 查询与变换。
- `jsonrepair`：修复不规范 JSON。

### 项目结构
```
json-compare/
  public/
  src/
    components/
      JsonDiff.vue        # 核心组件（两栏编辑与对比、工具栏）
    assets/
      jsondiffpatch-html.css  # 差异视图样式
    App.vue
    main.js
```

### 与 jsoneditoronline 的对齐情况
- 已实现：
  - 左右两栏、树/代码/文本模式、格式化/压缩、键排序、展开/折叠、复制/交换、导入/导出。
  - 搜索（通过 JSONEditor 菜单）、明暗主题、缩进设置、同步滚动。
  - 差异对比（HTML 视图）、URL 状态分享（Hash 压缩编码）。
  - JMESPath 查询、转义/去转义、JSON 修复。
- 差异/暂未包含：
  - 像素级 UI、图标与布局并非完全一致（现为轻量定制样式）。
  - 高级能力如历史版本、线上云存储/协作、多标签会话等未包含。

### 路线图（Roadmap）
- 视觉与交互对齐至像素级（图标、布局、交互细节、快捷键）。
- 差异结果导航（上一处/下一处）、统计汇总与过滤。
- 拖拽导入、剪贴板图片/文件解析增强。
- i18n 多语言与可访问性增强（a11y）。
- 单元测试与 E2E 测试覆盖，CI 构建与发布流程。

### 贡献指南
1. Fork 本仓库，创建特性分支：`git checkout -b feature/your-feature`。
2. 进行开发并确保：`npm run lint`、`npm run build` 通过。
3. 提交信息建议遵循 Conventional Commits：`feat: xxx`、`fix: xxx`、`docs: xxx` 等。
4. 发起 Pull Request，并清晰描述变更动机、实现方案与影响范围。

### 问题反馈与安全
- 使用过程中如遇问题，请提交 Issue，附上：复现步骤、期望行为、实际行为、环境信息（浏览器、系统、Node 版本）。
- 本项目为纯前端工具，默认不向远端发送数据；请勿在 Issue/PR 中附加敏感信息或隐私数据。

### 许可证（License）
- 本仓库当前尚未明确开源许可证，默认保留所有权利。
- 如需开放开源使用，建议添加 MIT/Apache-2.0/BSD-3-Clause 等主流许可证文件。
- 若无异议，我可以提交 MIT License（常用、宽松）以便社区使用与贡献。

### 致谢（Acknowledgements）
- 灵感与交互参考：`https://jsoneditoronline.org/`。
- 开源依赖：`jsoneditor`、`ace-builds`、`jsondiffpatch`、`lz-string`、`file-saver`、`lodash`、`jmespath`、`jsonrepair` 等。

### 关联文档
- Vue CLI 配置说明：`https://cli.vuejs.org/config/`


