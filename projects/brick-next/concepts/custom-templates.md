---
title: "Templates"
---

## 背景 {#background}

在较早的 Legacy Templates 构件模板中（以下称 _Legacy Templates_），我们定义了一种使用 JavaScript Functions 定义的构件模板，这一层抽象在一定程度上封装了复杂的构件配置。

Legacy Templates 使用函数定义，因此拥有了高度灵活的动态展开能力。但函数定义使得框架无法将它们像普通构件一样地利用起来，因此受到了诸多限制，例如框架无法进行一些基于静态分析的优化、无法对模板绑定事件处理、无法让用户编排一个自定义模板等等。

因此有必要设计一种自定义模板（以下称 _Custom Templates_），它使用静态结构声明（JSON or YAML），并且拥有普通构件的所有能力，以便在 Brick Next 中编排者可以像普通构件一样去使用它们。

## 原理 {#fundamental}

Custom Templates 的定义和 Storyboard 中的构件配置基本保持一致，可以在它内部配置多个构件，并且可以为这些构件配置插槽。在系统渲染该模板时，将按模板定义展开，并维护一份模板外部与模板内部的属性和事件等的的映射关系。

模板的展开过程如下图所示：

![Custom Templates Expanding Explained](/img/docs/custom-templates.png)

上图中 <span style={{display: "inline-block", border: "2px solid darkorchid", fontSize: "0.9em", padding: "0 0.2em"}}>紫色边框</span> 表示的是 Custom Template，模板在运行时按模板的定义被展开，<span style={{display: "inline-block", border: "2px solid mediumseagreen", fontSize: "0.9em", padding: "0 0.2em"}}>绿色边框</span> 的构件是模板内部定义好的构件，展开前的模板的 <code>tools</code> 插槽下的 <span style={{display: "inline-block", border: "2px solid orange", fontSize: "0.9em", padding: "0 0.2em"}}>橙色边框</span> 的构件按模板定义被移植到了 `basic-bricks.micro-view` 的 `toolbar` 插槽中。并且模板构件的属性和事件等也会按模板定义映射到相关内部构件中。

## 示例 {#examples}

例如一个简单的模板定义：

```yaml
# A custom template definition.
name: "some-package.my-custom-template"
bricks:
  - brick: "basic-bricks.micro-view"
    properties:
      pageTitle: "My Awesome Page"
    slots:
      content:
        type: "bricks"
        bricks:
          - brick: "my.awesome-brick"
          - brick: "my.another-brick"
            events:
              something.happen:
                action: "console.log"
```

在定义好 Custom Templates 后，它们可以像普通构件一样使用：

```yaml
# A storyboard partial.
brick: "some-package.my-custom-template"
# All lifeCycles and other configs.
lifeCycle: ...
```

Custom Templates 可以代理内部构件的属性、事件、插槽和方法，以此实现将 Storyboard 上为该模板配置的属性和事件等映射到模板内部的指定构件上。

例如以下包含 proxy 设置的模板定义：

```yaml
# A custom template definition with proxy.
name: "some-package.my-custom-template"
proxy:
  properties:
    pageName:
      ref: "micro-vew"
      # You can omit `refProperty` if it’s the same as the referring name.
      # The same applies to `refEvent/refMethod/refSlot`.
      refProperty: "pageTitle"
  events:
    awesome.happen:
      ref: "awesome-brick"
      refEvent: "something.happen"
  # Now we recommend to define `slot` element (since brick_next 3.19.13), instead of `proxy.slots`
  slots:
    tools:
      ref: "micro-view"
      refSlot: "toolbar"
      # Optional `refPosition` (number):
      # Insert the slotted bricks to the specified position of inner brick slot.
      # If `refPosition >= 0`, counts from the start.
      # If `refPosition < 0`, counts from the end.
      # The `refPosition` is relative to the slotted bricks specified in template definition.
  methods:
    tellAwesomeStories:
      ref: "awesome-brick"
      refMethod: "tellStories"
bricks:
  - brick: "basic-bricks.micro-view"
    ref: "micro-view" # Notice here! The ref id should be unique inside a custom template.
    slots:
      content:
        type: "bricks"
        bricks:
          - brick: "my.awesome-brick"
            ref: "awesome-brick" # And another ref.
            events:
              inner.happen:
                # Use `targetRef` to point to another brick inside a custom template.
                targetRef: "micro-view"
                method: "updateView"
          # Define a slot
          - brick: slot
            properties:
              name: extra
            # If no bricks is passed in for the slot, will use children of the slot instead
            # (only children of the default empty-named slots).
            children:
              - brick: p
                properties:
                  textContent: I'm a default placeholder
```

在 Storyboard 中使用：

```yaml
# A storyboard partial.
brick: "some-package.my-custom-template"
properties:
  pageName: "My Awesome Page"
events:
  awesome.happen:
    action: "console.log"
slots:
  tools:
    type: "bricks"
    bricks: [...]
```

在该 Storyboard 中：

- 模板的 `pageName` 属性将被映射到模板内部的 `micro-view` 的 `pageTitle` 属性上；
- 模板内部的 `awesome-brick` 触发的 `something.happen` 将触发模板的 `awesome.happen` 事件；
- 模板的 `tools` 插槽将被装载到模板内部的 `micro-view` 的 `toolbar` 插槽中；
- 调用模板的 `tellAwesomeStories` 将实际调用模板内部的 `awesome-brick` 的 `tellStories` 方法。

## 模板状态数据

详见 [Template State 模板状态数据]。

## 变更历史 {#history}

| 组件       | 版本    | 变更                                                                                             |
| ---------- | ------- | ------------------------------------------------------------------------------------------------ |
| brick_next | 3.19.13 | 支持在模板内部定义 slot 元素                                                                     |
| -          | 3.0.0   | 移除废弃用法： `proxy.properties.{refTransform}` `extraOneWayRefs` `mergeProperty` `<% TPL.* %>` |

[context 上下文]: context.md
[template state 模板状态数据]: template-state.md
