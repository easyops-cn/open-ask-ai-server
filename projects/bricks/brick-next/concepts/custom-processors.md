---
title: "Custom Processors"
---

## 背景

在编排微应用时，经常需要进行数据加工，有时候需要编写数十行、甚至数百行的代码，如果直接在表达式 `<% ... %>` 中编写，无法保障代码的可维护性、质量可靠性等基本要求，同时其复用成本也较高。Custom Processors 正是为了解决这个问题。

## 说明

一个 Custom Processors 实际是一个全局注册的、具有特定业务属性的纯函数，它应只负责加工处理数据，因此它有以下要求：

- 注册的名称需要加上包名作为 namespace，以避免可能的冲突；
- 不能使用异步方法；
- 不应产生副作用；
- 编写单元测试。

## 与 Pipes 管道的区别

[Pipes 管道](pipes.md) 是由框架直接提供的全局注册的纯函数，看起来和 Custom Processors 很像，它们的区别主要是 Pipes 由框架直接提供，具有通用性的加工函数才会纳入框架，而 Custom Processors 由构件包提供，通常具有特定的业务属性、而不具备通用性。

## 示例

<!-- 在 next-\* 相关仓库中使用脚手架工具 `yarn yo` 并选择 `a new custom processor` 可以快速创建一个 Custom Processor。

初始化好的 Custom Processor 大约长这样： -->

```ts
// @file: next-*/bricks/your-package/src/custom-processors/modelsToGraph.ts
import { customProcessors } from "@next-core/runtime";

export function modelsToGraph(models: ModelData[]): Graph {
  // Some hard work.
}

// A camelCase of the package name namespace is auto generated to avoid name collisions.
customProcessors.define("yourPackage.modelsToGraph", modelsToGraph);
```

编写单元测试：

```ts
// @file: modelsToGraph.spec.ts
import { modelsToGraph } from "./modelsToGraph";

describe("modelsToGraph", () => {
  it("should work", () => {
    expect(modelsToGraph(models)).toEqual(...);
  });
});
```

编排时，可以在任意表达式中使用：

```yaml
- brick: "your.any-brick"
  properties:
    someProp: "<% PROCESSORS.yourPackage.modelsToGraph(CTX.models) %>"
```

框架现在在 Storyboard 的表达式中支持了 [Pipeline Operators](https://github.com/tc39/proposal-pipeline-operator/) (Minimal version)，对于连续的加工处理可以使用类似以下的方式编写：

<!-- GitBook seems not working with `|-` in yaml. -->

```yaml
- brick: "your.any-brick"
  properties:
    someProp: |-
      <%
        CTX.modelsYamlString
          |> PIPES.yaml
          |> PROCESSORS.yourPackage.modelsToGraph
          // 如需在 pipeline operators 中传递额外参数，可以自行包装一个箭头函数。
          |> (_ => PIPES.jsonStringify(_, null, 2))
      %>
```

Custom Processors 是构件包的资源，和普通构件类似，框架会根据 Micro App 的使用情况，自动按需加载相关的构件包。

## 变更历史 {#history}
