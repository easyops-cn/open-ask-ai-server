---
title: "Pipes"
---

在 [placeholders 占位符](placeholders.md) `"${ ... }"` 和 `"@{ ... }"`中可以配置管道列表，管道提供了连续处理数据的能力，相当于由框架统一提供的全局数据加工函数。

> 对于不具备通用性，而是针对特定的业务的加工函数，应使用 [Custom Processors 自定义加工函数](custom-processors.md)。

管道的基本语法为以 `|` 开始，然后是 `pipe identifier`，最后是可选的额外参数列表，以 `:` 分隔，参数值如果是不包含特殊控制字符（`|:}`）和空白符的字符串、并且不会和 JSON value 格式冲突时，可以直接填写字面量字符，否则应使用 JSON value 格式编写。

在运行时，管道列表将被遍历执行，通过 `identifier` 找到对应的管道函数 `pipe`，将当前 `result` 作为第一个参数，`parameters` 作为额外参数列表，调用 `pipe` 并将返回值赋值给 `result`。

例如以下 transform 配置片段：

```yaml
transform:
  url: '?query=@{ some.field[0].path = ["complex","value"] | map : instanceId | slice : 0 : 10 }'
```

字段 `url` 使用的管道为：

```yaml
pipes:
  - identifier: "map"
    parameters:
      - "instanceId"
  - identifier: "slice"
    parameters:
      - 0
      - 10
```

## 图解

![图解 pipes](/img/docs/pipes.png)

## 管道列表

Pipes 管道源码现在托管在公开的 GitHub [仓库](https://github.com/easyops-cn/brick-next-pipes)中，以允许包括客户在内的第三方开发者共同维护这些公共数据处理函数。

当前平台支持的管道函数列表请访问 [https://easyops-cn.github.io/brick-next-pipes/brick-next-pipes.html](https://easyops-cn.github.io/brick-next-pipes/brick-next-pipes.html)。

## 变更历史 {#history}
