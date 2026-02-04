---
title: "Media Query"
---

通过响应式布局，我们能够更好地适配不同大小的屏幕，而媒体查询则是实现响应式布局的重要工具。现在，我们可以通过相关的求值占位符全局对象和生命周期，来实现响应式布局的编排。

## 求值占位符全局对象

### MEDIA {#media-global-object}

| 属性         | 类型              | 描述                   |
| ------------ | ----------------- | ---------------------- |
| `breakpoint` | `MediaBreakpoint` | 当前屏幕宽度大小的断点 |

```ts
enum MediaBreakpoint {
  xLarge = "xLarge",
  large = "large",
  medium = "medium",
  small = "small",
  xSmall = "xSmall",
}
```

## 生命周期

通过 `onMediaChange` 生命周期，我们可以在屏幕宽度大小的断点改变时，执行相应的事件处理器。具体用法可以参考 [onMediaChange]。

## 断点

| 断点   | 范围     |
| ------ | -------- |
| xLarge | ≥1920px  |
| large  | ≥1600px  |
| medium | ≥1280px  |
| small  | ≥1024px  |
| xSmall | \<1024px |

[onmediachange]: brick-life-cycle.md#on-media-change
