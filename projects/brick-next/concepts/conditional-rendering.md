---
title: "Conditional Rendering"
---

有些场景下，我们希望 Storyboard 可以根据特性开关或其它动态数据进行特定配置，例如根据用户权限决定使用哪些构件/路由。

## 普通条件 {#normal-conditions}

例如对于以下构件配置：

```yaml
bricks:
  - if: '<% FLAGS["your-feature"] %>'
    brick: your-brick-a
  - if: '<% !FLAGS["your-feature"] %>'
    brick: "your-brick-b"
```

当特性开关 `your-feature` 打开时，将显示构件 `your-brick-a`，反之则显示 `your-brick-b`。

## Resolvable 条件 {#resolvable-conditions}

当条件需要请求服务端接口或需要更复杂的逻辑计算得到时，可以使用 Resolvable 条件：

```yaml
bricks:
  - if:
      useProvider: "your-permission-provider"
      transform:
        if: <% DATA.hasPermission %>
    brick: "your-brick-a"
  - if:
      useProvider: "your-permission-provider"
      transform:
        if: <% !DATA.hasPermission %>
    brick: "your-brick-b"
```

当系统渲染时，如果 `your-permission-provider` 返回的对象中的 `permOfUpdateTools` 为 `true` 时，页面将显示 `your-brick-a` 构件，反之将显示为 `your-brick-b`。

注意：当使用 Resolvable 条件时，应始终返回一个 `{ if?: boolean }` 的对象。

## 变更历史 {#history}
