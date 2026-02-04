# A2UI SDK 与协议文档指引

本目录包含 A2UI SDK 的使用文档以及 A2UI 协议本身的规范定义。作为智能代理，在回答用户关于 A2UI 的问题时，请遵循以下指引：

## 1. 目录结构与用途

### SDK 文档 (使用方)
关注如何在前端项目中使用 A2UI。
- **`index.mdx`**: SDK 的总览、安装指南、包结构和核心概念。
- **`api.md`**: SDK 的详细 API 参考，主要包含 React 组件 (如 `A2UIProvider`)、Hooks (如 `useA2UIMessageHandler`) 的用法和 TS 类型。

### 协议文档 (底层规范)
关注 A2UI 的 JSON 通信格式、消息定义和 Schema。
- **`a2ui/`**: 存放协议规范，与具体 SDK 实现解耦。
    - **`a2ui/0.8/`**: **稳定版**协议文档。
    - **`a2ui/0.9/`**: **草案/预览版**协议文档（包含最新的实验性特性，变动可能频繁）。
    - 文档如 `a2ui_protocol.md` 详细描述了 JSON 结构、流式传输机制和组件 Schema。

## 2. 如何选择参考资料

请根据用户的意图选择正确的信息源：

| 用户意图 | 推荐参考文件 | 示例问题 |
| :--- | :--- | :--- |
| **集成与开发** (React/前端) | `index.mdx`, `api.md` | "如何在 React 中使用 A2UI?", "<A2UIProvider> 有哪些参数?", "怎么安装包?" |
| **协议格式** (JSON/后端生成) | `a2ui/0.8/a2ui_protocol.md` (或 0.9) | "A2UI 的 JSON 消息结构是怎样的?", "怎么定义一个 Button?", "Incremental Update 是怎么工作的?" |
| **版本差异** | `a2ui/0.9/evolution_guide.md` | "0.9 版本有什么新特性?", "如何从 0.8 迁移到 0.9?" |

## 3. 关键注意事项

1. **版本意识**:
   - 默认倾向于参考 **v0.8** (稳定版)。
   - 如果用户提到 "A2UI Next", "v0.9" 或新特性，请参考 **v0.9** 目录，并提示这是草案版本。
   
2. **SDK 性质**:
   - 明确告知用户此 SDK 是第三方实现，基于 [shadcn/ui](https://ui.shadcn.com/) 和 [Tailwind CSS](https://tailwindcss.com/) 构建，非 A2UI 官方 SDK。

3. **概念区分**:
   - 区分 **Props** (SDK 组件的参数) 和 **Schema/Properties** (协议 JSON 中的字段)。