---
title: "Brick Life Cycle"
---

构件在自身渲染和页面渲染的各个时刻可以执行相关的动作，它们通过 `lifeCycle` 定义。

其生命周期包含的阶段及其顺序如下：

- 当页面进入：
  1. `onBeforePageLoad`
  2. `onPageLoad`
  3. `onAnchorLoad` or `onAnchorUnload`
  4. `onMount`
- 访问页面过程中，当特定条件触发时：
  1. `onMount`
  2. `onUnmount`
  3. `onScrollIntoView`
  4. `onMediaChange`
  5. `onMessage`
- 当页面离开时：
  1. `onBeforePageLeave`
  2. `onPageLeave`
  3. `onUnmount`

:::note
`useResolves` 在 v3 中已下线，请使用 `context` 或 `state` 代替。
:::

### onBeforePageLoad

定义页面渲染前要执行的动作，它是配置初始化页面的[主题和模式]的窗口期。它的配置与构件单个[事件的配置方式]基本一致。

### onPageLoad

定义构件在页面渲染完成后的动作。它的配置与构件单个[事件的配置方式]基本一致，例如：

```yaml
brick: your.any-brick
lifeCycle:
  onPageLoad:
    action: console.log
```

它同样支持传递一个数组以执行多项动作，另外，它额外支持配置 `target: "_self"` 以将目标指向到该构件自身：

```yaml
brick: your.any-brick
lifeCycle:
  onPageLoad:
    - target: _self
      method: doSomething

    - target: your.other-brick
      method: doSomethingElse
```

### onAnchorLoad

定义构件在页面渲染完成后，当页面 URL 中包含非空的 anchor（URL hash 去掉前缀 `#`）时，需要处理的动作。它的配置与上一节 `onPageLoad` 一致。发送的事件为：

```ts
CustomEvent<{ hash: string; anchor: string }>;
```

因此可以使用 `<% EVENT.detail.anchor %>` 来获得 anchor 值。

### onAnchorUnload

类似 `onAnchorLoad`，但在页面 URL 中不包含 anchor 时触发，该事件不携带 `detail`。

### onBeforePageLeave

定义构件在页面离开前要执行的动作。结合 `history.block` 可以实现在特定条件下提示用户确认是否离开。

通过相关事件或构件属性绑定到 [Context 上下文]并通过 `if` [条件渲染]构造判断条件以实现按条件阻止页面离开。另外也可以通过内置事件处理器 `history.block` 和 `history.unblock` 动态控制是否阻止页面离开及其提示信息。

示例一：阻止前往除指定页面外的其它页面：

```yaml
brick: your.any-brick
lifeCycle:
  # 当页面离开前触发 `onBeforePageLeave`
  onBeforePageLeave:
    # 通过事件配置的 `if` 决定是否执行对应动作。
    # 如果是框架代理的内部链接跳转，`EVENT.detail` 中将包含 `{ location }` 为将要跳转的目标页面的地址信息。
    # 如果是浏览器级别的页面跳转、刷新或关闭等行为，`EVENT.detail` 始终为 `{}`。
    # 因此，通常应判断 location 是否存在。
    if: '<% !EVENT.detail.location?.pathname.startsWith("/specified/page") %>'
    # `history.bock` 方法阻止页面离开，它接收一个字符串参数，用于提示用户。
    action: history.block
    args:
      # 注：提示信息参数仅适用于框架代理的内部链接跳转，由浏览器触发的页面离开无法控制提示信息。
      - "You should stay, are you sure to leave?"
```

示例二：当表单为已填写状态并且没有保存时阻止离开：

```yaml
brick: your.form-brick
events:
  something.change:
    # 可以由指定事件提前设置 `history.block`。
    # 此时需要在另一事件中主动设置 `history.unblock`，否则页面将始终处于阻止状态。
    action: history.block
    args:
      - "Your data has not been saved, are you sure to leave?"
  submit:
    useProvider: ...
    callback:
      success:
        action: history.unblock
```

### onMount

当页面初始渲染、或[控制节点]因自动追踪变更而重新渲染时、或 `useBrick` 每次渲染时，触发。

### onUnmount

当构件已在页面渲染，而后离开页面、或[控制节点]因自动追踪变更而清除前一次渲染时、或 `useBrick` 每次渲染前清除前一次渲染时，触发。

### onMessage

定义构件接收`WebSocket消息推送`中订阅的消息：

```yaml
brick: your.any-brick
lifeCycle:
  onMessage:
    handlers:
      - target: your.any-brick
        transform:
          dataSource: "<% EVENT.detail %>"
```

示例：

```yaml
brick: your.any-brick
lifeCycle:
  onPageLoad:
    - action: message.subscribe
      args:
        - pipelineChannel
        - system: pipeline
          topic: "<% `pipeline.task.running.${QUERY.taskId}` %>"
      callback:
        success:
          action: console.log
        error:
          action: console.log
  onMessage:
    - channel: pipelineChannel
      handlers:
        - target: your-brick
          transform:
            dataSource: "<% EVENT.detail %>"
```

### OnScrollIntoView

构件在页面渲染完成后，给对应的构件绑定监听事件，当目标构件与当前视图交集大小超过阈值（threshold）时执行（适用于懒加载场景）。

示例:

```yaml
brick: your brick
lifeCycle:
  onScrollIntoView:
    # threshold 默认值为0.1，范围在[0,1]
    threshold: 0.2
    handlers:
      - useProvider: your provider
        args:
          - your args
        callback:
          success:
            action: console.log
          error:
            action: console.log
```

### onMediaChange {#on-media-change}

在屏幕宽度大小的断点改变时触发，示例如下：

```yaml
brick: your.any-brick
lifeCycle:
  onMediaChange:
    - target: _self
      properties:
        size: <% MEDIA.breakpoint %>
```

其他信息可以参考[媒体查询](media-query.md)。

## 变更历史 {#history}

| 组件       | 版本  | 变更                                           |
| ---------- | ----- | ---------------------------------------------- |
| brick_next | 3.0.0 | 新增 `onMount` `onUnmount`；移除 `useResolves` |

[主题和模式]: theme-and-mode.md
[事件的配置方式]: events.md
[条件渲染]: conditional-rendering.md
[context 上下文]: context.md
[控制节点]: control-nodes.md
