---
title: "Theme & Mode"
---

:::note
Brick Next 从 2.7.1 开始支持页面主题和模式。
:::

Brick Next 支持两种主题：`light` 和 `dark`（默认为 `light`），以及两种模式：`default` 和 `dashboard`（默认为 `default`）。

在 `dark` 深色主题下，页面框架及构件将以深色背景样式显示。而在 `dashboard` 大屏模式下，系统的页面顶栏及侧栏将消失，同时配合 `basic-bricks.micro-view` 开启 `dashboardMode: true` 可以实现大屏效果。

目前主要在“大屏”场景下使用，注意该场景需要同时启用深色主题和大屏模式。

![](/img/docs/screen-shot-dashboard-mode.png)

## 微应用编排：切换主题和模式 {#toggle-theme-and-mode}

例如在 Storyboard 编排中，希望某个按钮点击后切换到“深色+大屏”场景，可以如下配置：

```yaml {4-5}
brick: "your-button"
events:
  click:
    - action: "theme.setDarkTheme"
    - action: "mode.setDashboardMode"
```

每当页面初始进入、或发生跳转并重新渲染前，**系统将自动切回浅色主题和默认模式**，但系统开放了一个窗口期 `onBeforePageLoad`，以支持页面可以设置初始化为深色主题及大屏模式。

例如假设我们希望 URL 中携带参数 `mode=dashboard` 时自动使用深色主题和大屏模式，可以如下配置：

```yaml
brick: "basic-bricks.micro-view"
lifeCycle:
  onBeforePageLoad:
    - if: "<% QUERY.mode === 'dashboard' %>"
      action: "theme.setDarkTheme"
    - if: "<% QUERY.mode === 'dashboard' %>"
      action: "mode.setDashboardMode"
properties:
  dashboardMode: "<% QUERY.mode === 'dashboard' %>"
```

注意 `basic-bricks.micro-view` 构件在大屏模式下会多一个退出按钮，点击后将发出 `mode.dashboard.exit` 事件，需要用户自行配置退出大屏需要执行的动作。例如通常应添加如下事件配置：

```yaml
brick: "basic-bricks.micro-view"
events:
  mode.dashboard.exit:
    - target: "_self"
      properties:
        dashboardMode: false
    - action: "theme.setLightTheme"
    - action: "mode.setDefaultMode"
```

不内置退出动作的原因是，用户可以通过其他方式退出大屏，例如通过 `history.pushQuery` 跳转重置 `mode=dashboard` 参数来实现退出大屏模式：

```yaml
brick: "basic-bricks.micro-view"
events:
  mode.dashboard.exit:
    - action: "history.pushQuery"
      args:
        - mode: null
```

:::info Important
不要在编排中为构件配置固定的颜色值，而应使用系统预定义的 CSS custom properties，具体可以参考本文下一节内容。
:::

## 构件开发：适配深色主题和大屏模式 {#develop-with-theme-and-mode}

系统通过定义一系列 [CSS custom properties]（又称 CSS variables）来实现主题样式的实时无缝切换，无论在编排或构件开发时应首先尝试使用这些属性。具体属性列表可以参考这里的[源码](https://git.easyops.local/anyclouds/next-core/blob/master/packages/brick-container/src/styles/variables.css)。

系统当前的主题和模式反馈在 `<html>` 元素的 `data-theme` 及 `data-mode` 属性上，因此仅使用 css 即可完成大部分深色主题和大屏模式的适配。例如：

```css {5-7}
.your-class {
  color: black;
}

html[data-theme="dark"] .your-class {
  color: white;
}
```

当使用系统预定义的 CSS custom properties 时，则无需额外配置 `html[data-theme="dark"]` 样式：

```css
.your-class {
  color: var(--text-color-default);
}
```

有时候构件需要在 JavaScript 中判断当前主题或模式，例如图表类构件需要根据当前主题来生成不同的颜色列表，对此系统提供了 React Hooks `useCurrentTheme` 和 `useCurrentMode` 来获取当前的主题和模式，例如：

```jsx {4}
import { useCurrentTheme } from "@next-core/brick-kit";

function YourComponent() {
  const theme = useCurrentTheme();

  const colors = theme === "dark" ? ["red", "green"] : ["blue", "orange"];

  return <YourChart colors={colors} />;
}
```

## 适配公共 UI 规范样式 {#adapting-ui-specs}

### 使用 CSS Variables {#using-css-variables}

:::note
注意：虽然在 v3 中我们不再使用 AntDesign，但仍保留了已有的 `--antd-` 作为前缀的 CSS variables。
:::

Brick Next 的 CSS variables 统一管理在 next-core 仓库的 [packages/theme/src/variables.css](https://github.com/easyops-cn/next-core/blob/master/packages/theme/src/variables.css) 中。

[css custom properties]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
