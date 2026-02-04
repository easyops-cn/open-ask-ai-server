---
title: "Expressions"
---

开发者可以在 Storyboard 编排中使用 JavaScript 表达式。

```yaml
brick: my-brick
properties:
  groups: <% _.groupBy(DATA.list, 'category') %>
```

Storyboard 中的表达式用 `<% %>` 嵌入，可以在诸如构件属性、事件等大部分场景中使用。

```yaml
properties:
  # ✅
  good: "<% `Question: ${QUERY.q}` %>"

  # 🚫 Not work: has extra prefix string
  bad1: "Question: <% QUERY.q %>"

  # 🚫 Not work: has extra suffix string
  bad2: "<% QUERY.q %>&extra=1"

  # 🚫 Not work: missing spaces
  bad3: "<%QUERY.path%>"
```

表达式中可以使用大部分 JavaScript 表达式语法和 API，以及 Brick Next 内置对象。

## 内置 API {#builtin-api}

表达式中支持的内置对象主要如下：

| 对象              | 类型              | 说明                                                                                                                                                                                                            |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_`               | `object`          | Lodash 函数库，例如 `_.groupBy(list, 'category')`。注意：剔除了注明会修改原始数据的、以及 `Function` 一节的 API。                                                                                               |
| `moment`          | `function`        | Moment 函数库，例如 `moment().format(...)`。注意：剔除了注明会修改原始数据的 API。                                                                                                                              |
| `ANCHOR`          | `string`          | URL hash 参数去掉前缀 `#`。                                                                                                                                                                                     |
| `APP`             | `object`          | 微应用信息（对应 storyboard 的 `app` 字段），例如 `<% APP.homepage %>`。                                                                                                                                        |
| `BASE_URL`        | `string`          | 页面的根目录，可能为 `""` 或 `"/next"`，例如 `` `${BASE_URL}/hello-world` ``。                                                                                                                                  |
| `CTX`             | `object`          | [Context] 对象。                                                                                                                                                                                                |
| `DATA`            | -                 | Context/State resolve 进行 transform 时的原始数据，或 UseBrick 对应的原始数据。                                                                                                                                 |
| `EVENT`           | `object`          | 事件对象，仅适用于事件配置中。                                                                                                                                                                                  |
| `FLAGS`           | `object`          | 特性开关信息的键值对，键名为开关名，值为是否启用的布尔值。                                                                                                                                                      |
| `FN`              | `object`          | 调用指定[函数]，例如 `FN.sayHello()`。                                                                                                                                                                          |
| `HASH`            | `string`          | URL hash 参数，带前缀 `#`（如有）。                                                                                                                                                                             |
| `I18N_TEXT`       | `function`        | 使用 [`I18N_TEXT(...)`](i18n.md#i18n-at-run-time) 根据当前语言设置转换带有国际化设置的字典为对应文本内容。                                                                                                      |
| `I18N`            | `function`        | 使用 [`I18N(...)`](i18n.md#i18n-in-micro-apps) 显示应用预设的国际化内容。                                                                                                                                       |
| `IMG`             | `object`          | 使用 `IMG.get(...)` 获取图像资源的 URL。                                                                                                                                                                        |
| `INDEX`           | `number`          | [控制节点] `:forEach` 内的子节点使用 `INDEX` 来访问对应的子项的索引（从 `0` 开始计数）。                                                                                                                        |
| `INSTALLED_APPS`  | `object`          | 使用 `INSTALLED_APPS.has("your-app")` 来判断指定微应用是否已安装。也可以使用 `INSTALLED_APPS.has("your-app", ">=1.2.3")` 来判断指定微应用已安装并且版本满足指定规则（目前仅支持 `>=` `>` `=` `<` `<=`）         |
| `ITEM`            | -                 | [控制节点] `:forEach` 内的子节点使用 `ITEM` 来访问对应的子项数据。                                                                                                                                              |
| `LOCAL_STORAGE`   | `object`          | localStorage 存储的信息，支持 `getItem` 方法获取 `localStorage` 项，例如 `LOCAL_STORAGE.getItem("your-key")`。需要写入或移除数据，请使用[内建处理器：localStorage.\*]。                                         |
| `MEDIA`           | `object`          | [媒体查询全局对象]。                                                                                                                                                                                            |
| `MISC`            | `object`          | 系统 Misc 设置。                                                                                                                                                                                                |
| `PARAMS`          | `URLSearchParams` | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) 原始对象。                                                                                                                  |
| `PATH_NAME`       | `string`          | URL 路径名，例如当 URL 为 `http://www.uwintech.cn/next/path/name?a=a` 时，`<% PATH_NAME %>` 将转换为 `/path/name` 。                                                                                            |
| `PATH`            | `string`          | URL path 参数。例如对于路径为 `/object/:objectId` 的路由，构件可以使用 `<% PATH.objectId %>` 引用当前 URL 对应的参数。                                                                                          |
| `PERMISSIONS`     | `object`          | 使用 `PERMISSIONS.check("your:action-x")` 检查当前登录用户是否拥有指定权限。可以传递多个 actions，当用户拥有所有指定权限时返回 `true`，否则返回 `false`。                                                       |
| `PIPES`           | `object`          | [管道]字典。例如可以使用 `PIPES.yaml(whatever)` 来引用 `yaml` 管道函数。                                                                                                                                        |
| `PROCESSORS`      | `object`          | [自定义加工函数]。                                                                                                                                                                                              |
| `QUERY_ARRAY`     | `object`          | URL query 参数，在解析某项参数值时将返回数组。例如当 URL 为 `?a=1&a=2` 时，`QUERY_ARRAY.a` 可以得到 `["1", "2"]`                                                                                                |
| `QUERY`           | `object`          | URL query 参数，例如当 URL 为 `?a=1&b=2` 时，`QUERY.a` 可以得到 `"1"`                                                                                                                                           |
| `SAFE_TAG_URL`    | `function`        | 类似于 `TAG_URL` 但会执行严格编码（会转换 `/` 为 `%2F`）。                                                                                                                                                      |
| `SESSION_STORAGE` | `object`          | sessionStorage 存储的信息，支持 `getItem` 方法获取 `sessionStorage` 项，例如 `SESSION_STORAGE.getItem("your-key")`。需要写入或移除数据，请使用[内建处理器：sessionStorage.\*]。                                 |
| `SIZE`            | `number`          | [控制节点] `:forEach` 内的子节点使用 `SIZE` 来访问数据源的数量。                                                                                                                                                |
| `STATE`           | `object`          | [模板状态数据]                                                                                                                                                                                                  |
| `SYS`             | `object`          | 系统信息，例如当前登录用户名： `SYS.username`, 当前登录用户实例 ID： `SYS.userInstanceId`                                                                                                                       |
| `TAG_URL`         | `function`        | 使用 JavaScript 的 [Tagged Template] 来实现对 URL 参数的自动编码（会忽略 `/` 的编码）。例如 `` TAG_URL`${APP.homepage}?q=${q}` `` 可以得到 `/hello?q=a%26b` （假设 `APP.homepage` 为 `/hello`、`q` 为 `a&b`）。 |
| `THEME`           | `object`          | 通过 `THEME.getTheme()` 获得当前主题（通常为 `"light"` 或 `"dark-v2"`）                                                                                                                                         |
| `LANGUAGE`        | `string`          | 用于标识当前应用的界面语言（如 `zh` 或 `en`），在国际化逻辑中统一使用，目前国际化语言支持`zh`，`en`。                                                                                                           |

## 递归标记 {#recursive-flag}

由于表达式（包括占位符和 Transform）计算得到的数据通常包含来自用户输入的数据，因此为了避免意外解析（例如某数据需要保存原始内容的表达式字符串），表达式得到的数据的内部的其它表达式在消费时不会执行解析。同时也为了避免类比于 [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) 的攻击，例如攻击者将某用户输入数据设置为包含恶意表达式的内容。

通过添加递归标记 `~` 例如 `<%~ DATA %>`，可以允许该表达式得到的数据的内部的其它表达式（包括占位符和 Transform）在消费时继续执行解析。请谨慎使用该标记。

## 附录 {#references}

由于在设计上它仅用于数据加工和逻辑处理，因此我们剔除了修改数据、访问 DOM 等相关的语法和 API。

支持的 JavaScript 语法清单：

- ✅ ArrayExpression: `[1, 2, 3]`
- ✅ ObjectExpression: `{ a: 1 }`
- ✅ ArrowFunctionExpression: `() => 1`
- ✅ UnaryExpression &lt;Partial&gt;
  - ✅ `-` `+` `!` `typeof` `void`
- ✅ BinaryExpression &lt;Partial&gt;
  - ✅ `==` `!=` `===` `!==`
  - ✅ `<` `<=` `>` `>=`
  - ✅ `+` `-` `*` `/` `%` `**`
  - ✅ `|>` (pipeline operators! [minimal version](https://github.com/tc39/proposal-pipeline-operator/))
- ✅ LogicalExpression: `||` `&&` `??` (nullish coalescing 💅)
- ✅ MemberExpression: `a.b`
- ✅ OptionalMemberExpression: `a?.b` (optional chaining 💅)
- ✅ ConditionalExpression: `a ? 1 : 2`
- ✅ CallExpression: `a(1)`
- ✅ SequenceExpression: `a, b`
- ✅ TemplateLiteral: `` `/your/${path}` ``
  - ✅ Tagged template: `` TAG_URL`${APP.homepage}/list?q=${q}` ``
- ✅ SpreadElement: `[1, ...a]` `{ a, ...rest }`
- ✅ ObjectPattern: `({ a, b }) => null`
- ✅ ArrayPattern: `([ a, b ]) => null`
- ✅ RestElement: `(...args) => null`
- ✅ AssignmentPattern: `(a = 1) => null`
- ✅ NewExpression &lt;Partial&gt;
  - ✅ `new Array(...)`
  - ✅ `new Date(...)`
  - ✅ `new Map(...)`
  - ✅ `new Set(...)`
  - ✅ `new WeakMap(...)`
  - ✅ `new WeakSet(...)`
  - ✅ `new URLSearchParams(...)`

不支持的 JavaScript 语法清单：

- 🚫 Statement: `if (a) {}`
- 🚫 Declaration: `var a`
- 🚫 FunctionExpression: `function a() {}`
- 🚫 UpdateExpression: `++i`
- 🚫 AssignmentExpression: `a = 1`
- 🚫 Class: `class A {}`
- UnaryExpression &lt;Partial&gt;
  - 🚫 `~` `delete`
- BinaryExpression &lt;Partial&gt;
  - 🚫 `<<` `>>` `>>>`
  - 🚫 `|` `^` `&` `in` `instanceof`
- 🚫 Raw string in tagged template

浏览器原生 API 支持清单：

- Object &lt;Partial&gt;
  - ✅ `entries()` `fromEntries()` `keys()` `values()`
  - 🚫 Other Methods `assign()`, etc.
- ✅ Array
- ✅ Boolean
- ✅ Date
- ✅ Infinity
- ✅ JSON
- ✅ Math
- ✅ NaN
- ✅ Number
- ✅ String
- ✅ atob
- ✅ btoa
- ✅ decodeURI
- ✅ decodeURIComponent
- ✅ encodeURI
- ✅ encodeURIComponent
- ✅ isFinite
- ✅ isNaN
- ✅ parseFloat
- ✅ parseInt
- location (readonly) &lt;Partial&gt;
  - ✅ href
  - ✅ origin
  - ✅ host
  - ✅ hostname

[自定义加工函数]: custom-processors.md
[管道]: pipes.md
[context]: context.md
[内建处理器：localstorage.\*]: events.md#builtin-actions-localStorage
[内建处理器：sessionstorage.\*]: events.md#builtin-actions-sessionStorage
[函数]: storyboard-functions.md
[媒体查询全局对象]: media-query.md#media-global-object
[tagged template]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
[控制节点]: control-nodes.md
[模板状态数据]: template-state.md
