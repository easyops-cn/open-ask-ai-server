---
title: "Template States"
---

有时候我们希望在模板内进行消费类似 [Context 上下文]的数据，但又希望这些数据能控制在模板实例的作用域下：数据封装在模板内部、外部不可访问，同时一个模板的多个实例之间的数据互不影响。*Template State 模板状态数据*正是为了解决这个问题。

## 示例 {#examples}

定义：

```yaml {3-7,12,17}
customTemplates:
  - name: "tpl-my-awesome-button"
    state:
      # 状态数据，在模板外部可以通过给模板传递属性来初始化状态数据。
      - name: "buttonDisabled"
        # 可以设置默认值，在外部没有传递对应属性时使用。
        value: true
        # 如果指定 `expose: true`，则允许该状态数据暴露为该模板的对外属性。
        expose: true
    bricks:
      - brick: "my-button"
        properties:
          # 在模板内部，通过表达式变量 `STATE` 来读取状态数据。
          disabled: "<% STATE.buttonDisabled %>"
      - brick: "my-trigger"
        events:
          click:
            # 在模板内部，通过内置事件处理来更新状态数据。
            action: "state.update"
            args:
              - "buttonDisabled"
              - false
```

该状态数据作用域为模板实例，因此，同一个模板的多个实例之间的数据是隔离的。另外该状态数据只能用于模板内部，无法用于模板外部，包括模板对外暴露的插槽中加入的外部构件。

在模板外部传递状态数据：

```yaml {5,13}
bricks:
  - brick: "tpl-my-awesome-button"
    properties:
      # 设置初始属性（该状态数据指定了 `expose: true`）
      buttonDisabled: false
      id: "button-a"
  - brick: "my-toggle"
    events:
      click:
        # 动态地给模板设置属性来变更它的状态数据（需要配合 `"track state"` 使用）
        target: "#button-a"
        properties:
          buttonDisabled: true
```

除上述示例列出的能力外，已支持的其它能力（类比 `CTX`）：

- 条件判断 `if`
- 属性追踪 `"track state"`
- 异步数据 `resolve`
- 懒加载 `lazy` `state.load`
- 异步加载 `async`
- 主动更新 `state.refresh`
- 追踪依赖 `track`
- 追踪带条件判断的 Resolve

## 变更历史 {#history}

| 组件       | 版本  | 变更                                                                                 |
| ---------- | ----- | ------------------------------------------------------------------------------------ |
| brick_next | 3.9.1 | 支持追踪带条件判断的 Resolve                                                         |
| -          | 3.4.1 | 支持 `async`                                                                         |
| -          | 3.0.0 | 需要主动指定 `expose: true` 的状态数据才可以作为模板的属性传递进来；其他同 [Context] |

[context 上下文]: context.md
[context]: context.md
