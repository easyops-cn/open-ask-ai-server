---
title: "Events"
---

在 Storyboard 中可以为构件配置事件的处理，例如：

```yaml
brick: "your-brick"
events:
  something.happened:
    action: "console.warn"
  others.happened:
    - action: "console.log"
    - target: "#other-brick"
      method: "openModal"
```

对于以上配置，在构件 `<your-brick>` 发起 `something.happened` 事件时，将触发内建处理函数 `console.warn`；而在发起 `others.happened` 事件时，将依次触发内建函数 `console.log`、找到 `id="other-brick"` 的构件并调用它的 `openModal()` 方法。

构件的事件处理器主要有三种：内建处理器、Provider 处理器、自定义构件处理器。

## 内建处理器 {#builtin-actions}

使用 `action: "..."` 来配置内建处理器，使用 `args: [...]` 设置传递给处理器的参数。

当前内建处理器主要有以下几类：

- [`history.*`](#builtin-actions-history)
  <!-- - [`segue.*`](#builtin-actions-segue) -->
  <!-- - [`alias.*`](#builtin-actions-alias) -->
  <!-- - [`legacy.*`](#builtin-actions-legacy) -->
- [`location.*`](#builtin-actions-location)
- [`window.*`](#builtin-actions-window)
- [`event.*`](#builtin-actions-event)
- [`console.*`](#builtin-actions-console)
- [`message.*`](#builtin-actions-message)
- [`handleHttpError`](#builtin-actions-handleHttpError)
- [`context.*`](#builtin-actions-context)
- [`state.*`](#builtin-actions-state)
- [`localStorage.*`](#builtin-actions-localStorage)
- [`sessionStorage.*`](#builtin-actions-sessionStorage)
- [`tpl.*`](#builtin-actions-tpl)

### 内建处理器：history.\* {#builtin-actions-history}

更多信息请参考 [History 会话历史]。

| Action                                            |
| ------------------------------------------------- |
| [`history.push`](history.md#push)                 |
| [`history.replace`](history.md#replace)           |
| [`history.goBack`](history.md#goback)             |
| [`history.goForward`](history.md#goforward)       |
| [`history.pushQuery`](history.md#pushquery)       |
| [`history.replaceQuery`](history.md#replacequery) |
| [`history.pushAnchor`](history.md#pushanchor)     |
| [`history.reload`](history.md#reload)             |
| [`history.block`](history.md#block)               |
| [`history.unblock`](history.md#unblock)           |

### 内建处理器：location.\* {#builtin-actions-location}

| Action            | Arguments     | description                                                |
| ----------------- | ------------- | ---------------------------------------------------------- |
| `location.reload` | -             | 浏览器刷新页面                                             |
| `location.assign` | `url: string` | 浏览器跳转页面，例如 `` `${BASE_URL}${PATH_NAME}?q=any` `` |

### 内建处理器：window.\* {#builtin-actions-window}

| Action               | Arguments                        | description                                                       |
| -------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `window.open`        | `url: string, target: string`    | 打开页面（注意：需要自行按需使用 `BASE_URL` 补上 `/next` 的前缀） |
| `window.postMessage` | `data: unknown, origin?: string` | 发送消息                                                          |

### 内建处理器：event.\* {#builtin-actions-event}

| Action                 | Arguments | description        |
| ---------------------- | --------- | ------------------ |
| `event.preventDefault` | -         | 阻止事件的默认行为 |

### 内建处理器：console.\* {#builtin-actions-console}

`console.log|warn|info` 默认不会打印信息在 console 中，如何开启请在 devtools 中输入`window.debugConsole.help()`查看。

| Action          | Arguments | description |
| --------------- | --------- | ----------- |
| `console.log`   | `any`     | -           |
| `console.error` | `any`     | -           |
| `console.warn`  | `any`     | -           |
| `console.info`  | `any`     | -           |

### 内建处理器：message.\* {#builtin-actions-message}

| Action            | Arguments | description |
| ----------------- | --------- | ----------- |
| `message.success` | `string`  | 成功提示    |
| `message.error`   | `string`  | 失败提示    |
| `message.warn`    | `string`  | 告警提示    |
| `message.info`    | `string`  | 信息提示    |

### 内建处理器：handleHttpError {#builtin-actions-handleHttpError}

| Action            | Arguments | description      |
| ----------------- | --------- | ---------------- |
| `handleHttpError` | -         | 请求报错弹框提示 |

### 内建处理器：context.\* {#builtin-actions-context}

`context.*` 接收两个参数：context name 和 context value。更多信息请参考 [Context 上下文]。注意：不能对绑定构件属性的 Context 执行 `context.*` 操作。

| Action            | Arguments                     | description                                  |
| ----------------- | ----------------------------- | -------------------------------------------- |
| `context.assign`  | `name: string, newValue: any` | 使用 `Object.assign()` 更新已有的 Context 值 |
| `context.replace` | `name: string, newValue: any` | 使用新的值替换已有的 Context 值              |
| `context.load`    | `name: string`                | 主动加载一个懒加载的 Context                 |
| `context.refresh` | `name: string`                | 强制更新一个异步的 Context                   |

### 内建处理器：state.\* {#builtin-actions-state}

`state.*` 接收两个参数：state name 和 state value。更多信息请参考 [Template State 模板状态数据]。

| Action          | Arguments                     | description                   |
| --------------- | ----------------------------- | ----------------------------- |
| `state.update`  | `name: string, newValue: any` | 使用新的值替换已有的 State 值 |
| `state.load`    | `name: string`                | 主动加载一个懒加载的 State    |
| `state.refresh` | `name: string`                | 强制更新一个异步的 State      |

### 内建处理器：localStorage.\* {#builtin-actions-localStorage}

localStorage 存储的信息，支持写入数据（`setItem`）方法和移除项（`removeItem`）方法。

需要获取数据的时候使用表达式：`<% LOCAL_STORAGE.getItem("your-key") %>`

| Action                    | Arguments                 | description                      |
| ------------------------- | ------------------------- | -------------------------------- |
| `localStorage.setItem`    | `key: string, value: any` | 往 `localStorage` 中写入一项数据 |
| `localStorage.removeItem` | `key: string`             | 往 `localStorage` 中移除项       |

### 内建处理器：sessionStorage.\* {#builtin-actions-sessionStorage}

sessionStorage 存储的信息，支持写入数据（`setItem`）方法和移除项（`removeItem`）方法。

需要获取数据的时候使用表达式：`<% SESSION_STORAGE.getItem("your-key") %>`

| Action                      | Arguments                 | description                        |
| --------------------------- | ------------------------- | ---------------------------------- |
| `sessionStorage.setItem`    | `key: string, value: any` | 往 `sessionStorage` 中写入一项数据 |
| `sessionStorage.removeItem` | `key: string`             | 往 `sessionStorage` 中移除项       |

### 内建处理器：tpl.\* {#builtin-actions-tpl}

`tpl.dispatchEvent` 可以用于在 [Custom Template 自定义模板]内部定义的 `useBrick` 中以 Custom Template 的名义对外发送事件。

它触发时将使用该构件所属的 Custom Template 作为事件源发送自定义事件，第一个参数为新的事件类型名，第二个参数是 [`CustomEventInit`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent)，可以包装新的 `detail` 数据。。

| Action              | Arguments                                  | description                                             |
| ------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `tpl.dispatchEvent` | `eventType: string, init: CustomEventInit` | 使用构件所属的 Custom Template 作为事件源发送自定义事件 |

## Provider 处理器 {#provider-handlers}

使用 `useProvider` 指定要使用的 Provider 构件名，并通过 `callback` 来处理 Provider 调用后的结果。

| Field         | type                                    | required | default | description                                                                              |
| ------------- | --------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| `useProvider` | `string`                                | ✔️       | -       | Provider 构件名                                                                          |
| `args`        | `any[]`                                 | -        | -       | 调用构件方法时传递的参数，不填则将原始事件本身作为唯一参数传入                           |
| `callback`    | `{ success, error, finally, progress }` | -        | -       | 执行 Provider 构件的 `resolve(...args)` 后的异步回调，更多信息请参考 [Provider 异步回调] |
| `poll`        | `ProviderPollOptions`                   | -        | -       | 启用轮询模式，更多信息请参考 [Provider 轮询]                                             |

## 自定义构件处理器 {#custom-handlers}

自定义构件处理器让构件的事件可以传递给其它指定构件，执行指定构件的方法或设置指定构件的属性。

### 自定义构件处理器：执行指定构件方法 {#custom-handlers-method}

| Field      | type                          | required | default   | description                                                               |
| ---------- | ----------------------------- | -------- | --------- | ------------------------------------------------------------------------- |
| `target`   | `string`                      | ✔️       | -         | 接收事件的构件的 _css selector_                                           |
| `multiple` | `bool`                        | -        | `false`   | 是否查询多个构件（`querySelectorAll`），而不是单个构件（`querySelector`） |
| `method`   | `string`                      | ✔️       | -         | 想要调用的构件的方法名                                                    |
| `args`     | `any[]`                       | -        | `[event]` | 调用构件方法时传递的参数，不填则将原始事件本身作为唯一参数传入            |
| `callback` | `{ success, error, finally }` | -        | -         | 执行 `method` 后的异步回调，更多信息请参考 [Provider 异步回调]            |

### 自定义构件处理器：设置指定构件属性 {#custom-handlers-properties}

| Field        | type     | required | default | description                                                               |
| ------------ | -------- | -------- | ------- | ------------------------------------------------------------------------- |
| `target`     | `string` | ✔️       | -       | 接收事件的构件的 _css selector_                                           |
| `multiple`   | `bool`   | -        | `false` | 是否查询多个构件（`querySelectorAll`），而不是单个构件（`querySelector`） |
| `properties` | `object` | -        | -       | 想要设置模板构件的属性字典                                                |

## 条件判断 {#conditions}

在事件处理器中可以配置 `if` 字段，以根据事件信息决定是否执行相关事件处理。它的使用方式和[条件渲染]大体相似，例如：

```yaml
events:
  button.click:
    if: "<% EVENT.detail.length > 0 %>"
    action: history.push
```

## 变更历史 {#history}

| 组件       | 版本   | 变更                                                                                                                                  |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| brick_next | 3.22.3 | `console.log` `console.warn` `console.info` 默认不在 console 中打印信息，如何开启请在 devtools 中输入`window.debugConsole.help()`查看 |
| -          | 3.18.9 | 支持 `window.postMessage`                                                                                                             |

[history 会话历史]: history.md
[provider 异步回调]: provider-bricks.md#provider-async-callback
[provider 轮询]: provider-bricks.md#provider-polling
[条件渲染]: conditional-rendering.md
[context 上下文]: context.md
[template state 模板状态数据]: template-state.md
[custom template 自定义模板]: custom-templates.md
