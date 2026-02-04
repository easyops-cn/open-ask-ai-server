---
title: "Context"
---

有时候我们需要在多个构件之间交换数据。在 React 中，我们通常使用 [Context](https://reactjs.org/docs/context.md) 来解决这样的问题。在 Storyboard 中我们也可以使用类似的机制来解决编排时处理构件间的数据交换问题。

## 示例 {#examples}

Context 分为定义及使用，在路由处可以定义 Context，该 Context 可以在定义它的路由的所有内部构件（及 `useBrick`）使用。

定义方式一（自由变量）：

```yaml
routes:
  - path: "${APP.homepage}/your-page"
    context:
      - name: myContext
        # 初始 `value` 可以使用表达式。
        value:
          quality: good

      # 初始 `value` 是可选的。
      - name: myAnotherContext
```

定义方式二（异步 Resolve 的自由变量）：

```yaml
routes:
  - path: "${APP.homepage}/your-page"
    context:
      - name: myAsyncContext
        resolve:
          useProvider: my-provider
          # 默认将使用 Provider 返回的数据作为该 Context 的值（brick_next >= 1.25.2 支持）。
          # 如果需要转换数据，注意需使用 transform 后的 value 值。
          transform:
            # `CTX.myAsyncContext` 的值将是 `DATA.hostname`。
            value: "<% DATA.hostname %>"
```

使用方式：

```yaml
bricks:
  - brick: my.source-brick
    events:
      something.change:
        # - 'context.assign': use `Object.assign(context, newValue)` to update current context.
        #   function contextAssign(contextName, newValue) => void
        #
        # - 'context.replace': use `context = newValue` to replace current context.
        #   function contextReplace(contextName, newValue) => void
        action: "context.assign"
        args:
          - myContext
          - quality: better

  - brick: my.trigger-brick
    events:
      something.submit:
        useProvider: my.submit-provider
        args:
          - q: "<% CTX.myContext %>"
```

在表达式中可以使用 `CTX.contextName` 获得名字为 `contextName` 的上下文的值；对于事件则提供了 `context.assign` 和 `context.replace` 两个内置动作，更多信息请参考 [Events 事件 > 内建处理器：context.*]。

## 条件判断 If {#if}

Context 可以配置 `if` 来按条件决定是否启用它。更多关于条件判断的说明请参考 [If 条件渲染](conditional-rendering.md)。

例如：

```yaml {3,6}
context:
  - name: "myData"
    if: '<% !FLAGS["my-flag"] %>'
    value: "My default value"
  - name: "myData"
    if: '<% FLAGS["my-flag"] %>'
    resolve:
      useProvider: "my.any-provider"
```

上述配置将在开关 `my-flag` 关闭时，将 `CTX.myData` 设置为固定值 `"My default value"`，而 `my-flags` 打开时，则将 `CTX.myData` 设置为 `my.any-provider` 的请求结果。被忽略的 Context 不会生效，也不会发起请求。

另外 Resolve 配置中的 `if` 同样有效，例如：

```yaml {4}
context:
  - name: "myData"
    resolve:
      if: '<% FLAGS["my-flag"] %>'
      useProvider: "my.any-provider"
```

## 变更事件 {#on-change}

有时候我们希望声明一个 Context 变量，但不对它立即赋值，而是通过特定事件触发赋值，并且希望能监听其变更事件。

可以在声明 Context 时定义 `onChange`，例如：

```yaml {8-11}
path: "/my-app"
context:
  - name: "myData"
    value:
      status: "loading"
    # `onChange` 和其它事件处理接口一样，
    # 可以设置为单个或多个（数组）事件处理器。
    onChange:
      target: "#myBrick"
      properties:
        someProp: "<% EVENT.detail.status %>"
```

然后在特定条件发生时再对其赋值，例如：

```yaml
brick: "any-brick"
events:
  success:
    action: "context.assign"
    args:
      - status: "loaded"
  error:
    action: "context.assign"
    args:
      - status: "failed"
```

当 Context 发生变化时，`onChange` 注册的事件处理器将被调用，传递的事件对象的 `detail` 为该 Context 的值。关于 Context 变更操作请参考 [Events 事件 > 内建处理器：context.*]。

## 注意事项 {#notes}

在事件回调里始终能拿到当事件发生时、最新的 Context 的值，而在属性中，默认只能在构件初始时拿到 Context 的初始值，此时该 Context 相当于一个应用的常量，例如：

```yaml
brick: my.another-brick
properties:
  oneProp: "<% CTX.myContext %>"
```

默认情况下，当 Context 值变化时，`my.another-brick` 的对应属性不会自动更新。

## 构件属性追踪 Context 变更 {#brick-properties-track-context-change}

如果希望构件的属性能跟随 Context 的变化而变化，可以为表达式添加标记位 `=`，使用 `<%= %>` 来激活绑定模式，当表达式中引用的 Context 变化时，该属性将自动重新计算并赋值。

例如：

```yaml
brick: my.any-brick
properties:
  anyProp: "<%= CTX.myContext + CTX.myAnotherContext %>"
```

当 `myContext` 或 `myAnotherContext` 任一值改变时，`my.any-brick` 将重新计算并赋值给属性 `anyProp`。绑定模式也可以用于自定义模板和 `useBrick` 的构件属性，但注意，它仅适用于构件的第一层属性赋值。

:::note
我们还支持使用类似 `<% "track context", CTX.myData %>` 的形式来激活绑定模式。
:::

## 懒加载 {#lazy}

默认情况下，如果 Context 定义为 Resolve，它会在页面加载前发起请求并阻塞渲染，但有些数据并不着急需要，可能只需在特定条件下再发起请求即可（例如打开抽屉时）。这时可以标记 `resolve.lazy: true` 将它设置为懒加载，该数据将不会默认发送请求，需要开发者在特定条件下主动触发 `context.load` 来发起请求。

```yaml {5}
context:
  - name: "myLazyData"
    resolve:
      useProvider: "my-provider"
      lazy: true
    # 可以为懒加载的数据配置一个初始值，默认为 `undefined`
    value: "Initial"
```

```yaml {6-8}
brick: "my-brick"
properties:
  dataSource: "<%= CTX.myLazyData %>"
events:
  button.click:
    action: "context.load"
    args:
      - "myLazyData"
```

:::note
`context.load` 将确保一个 Context 只会被加载一次，避免发起重复的数据请求。虽然 `context.refresh` 也可以用于主动加载一个标记了懒加载的 Context，但通常情况下这里我们应该使用 `context.load` 来避免发起重复的请求。
:::

`context.load` 和 `context.refresh` 同时还支持配置回调事件：

```yaml {6-18}
events:
  button.click:
    action: "context.load"
    args:
      - "myLazyData"
    callback:
      success:
        action: console.log
        args:
          # Success 事件详情的 `value` 为更新后的 Context 值
          - "<% EVENT.detail.value %>"
      error:
        action: console.error
        args:
          # Error 事件详情为错误对象
          - "<% EVENT.detail %>"
      finally:
        action: console.info
```

## 异步加载 {#async}

设置 `resolve.async: true` 可以将一个 Context 标记为异步加载，该数据请求不会阻塞渲染。与 `lazy` 类似，页面会先以该 Context 的默认值进行渲染，在页面完成 Mount 后，当数据加载完成后会触发其数据变更事件，设置了追踪标记的相关构件属性将自动更新。

```yaml {5}
context:
  - name: "myAsyncData"
    resolve:
      useProvider: "my-provider"
      async: true
    # 可以为异步加载的数据配置一个初始值，默认为 `undefined`
    value: "Initial"
```

```yaml {4}
brick: "my-brick"
properties:
  # 在构件属性定义中使用异步加载的数据时，通常应该设置追踪绑定标记
  dataSource: "<%= CTX.myAsyncData %>"
```

注意 `async` 与 `lazy` 的不同：

- `lazy` 使得一个 Context 的请求不会自动发起，需要主动调用 `context.load`，其最早只能发生在 page load 之后，因此适合将页面的次要数据设置为 `lazy`，这样可以使得其他更重要的数据优先被加载；
- `async` 的 Context 也不会阻塞页面渲染，但仍会尽早地自动发起请求，因此对于页面的主要数据，适合设置为 `async`，这样使得页面既不被特定请求阻塞，又可以更早地将主要数据呈现给用户。

:::note
如果 `async` 的数据加载在页面 Mount 之前就已完成，其数据变更仍会延迟到 Mount 之后再触发。
:::

## 主动强制更新 {#force-refresh}

内置事件 `context.refresh` 可以强制更新一个设置了异步请求的 Context。

```yaml {4-6}
brick: "my-brick"
events:
  button.click:
    action: "context.refresh"
    args:
      - "myAnyData"
```

`context.refresh` 也支持配置回调事件，相关示例请见本文上一节。

## 依赖追踪 {#track-deps}

前面我们提到了 `<%= %>` 用于构件属性自动追踪 Context 的更新，另一方面，我们还提供了让 Context 可以追踪其自身依赖的 Context 的能力。

例如：

```yaml {3}
context:
  - name: "myTrackableData"
    track: true
    resolve:
      useProvider: my-provider
      args:
        - <% CTX.myDepA %>
        - <% CTX.myDepB %>
```

标记 `track: true` 后，当 `myDepA` 或 `myDepB` 变更时（使用 `context.replace`/`context.refresh` 等），`myTrackableData` 会自动重新发起请求并计算得到新的值。

对于普通变量的数据也可以追踪：

```yaml {3}
context:
  - name: myTrackableData
    track: true
    value: "<% CTX.myDepA + CTX.myDepB %>"
```

:::note
对于指定了 `track: true` 的异步 Context，追踪到依赖变化后，将重新计算相关参数，但如果计算得到的请求参数没有发生任何变化，此时将命中缓存，不会发起新的请求。如果业务上需要强制更新数据，应使用 `context.refresh`，该方法将忽略请求缓存。
:::

## 追踪带条件判断的 Resolve {#track-conditional-resolve}

有些时候我们希望根据条件判断分别使用远端数据或静态数据、并且该条件是动态变化的，对于这种场景可以同时设置 `track`、`resolve.if` 和 `value`，即可激活追踪条件判断。

当 `resolve.if` 解析为真时，将调用 Provider 获取远端数据；反之当其解析为假时，将使用静态值 `value`。另外注意此时 `resolve` 和 `value` 中使用到的任意其他 Context 数据变化时都将触发其重新计算。

```yaml {5,7,8}
context:
  - name: "useRemote"
  - name: "myConditionalData"
    resolve:
      if: "<% CTX.useRemote %>"
      useProvider: "my-provider"
    value: "My fallback value"
    track: true
```

:::note
追踪带条件判断的 Resolve 依赖 `brick_next: ^3.9.1 || ^2.91.1`。
:::

## 变更历史 {#history}

| 组件       | 版本  | 变更                                                                           |
| ---------- | ----- | ------------------------------------------------------------------------------ |
| brick_next | 3.9.1 | 支持追踪带条件判断的 Resolve                                                   |
| -          | 3.4.1 | 支持 `async`                                                                   |
| -          | 3.0.0 | 不可以定义重复的 Context（使用 `if` 进行判断除外），不可以引用未定义的 Context |

[events 事件 > 内建处理器：context.*]: events.md#builtin-actions-context
