---
title: "Provider Bricks"
---

Provider 构件是一种特殊类型的构件，它不提供任何界面展示的能力，仅提供数据获取和处理的能力。配合 [Context] 或 [State] 可以实现页面依赖数据的定义，配合 [Events 事件]可以实现动态的数据处理。

在 Brick Next 中，将数据与 UI 分离非常重要，一方面可以提升业务构件的可复用性，同时也可以提升应用的可配置能力、可编排能力。

## 创建 Provider 构件 {#create-provider-bricks}

```ts
import { createProviderClass } from "@next-core/utils/general";
import { CmdbObjectApi } from "@sdk/cmdb-sdk";

async function getPublicModels(params) {
  const allModels = await CmdbObjectApi.list(params);
  return allModels.filter((model) => !model.private);
}

customElements.define(
  "cmdb.provider-get-public-models",
  createProviderClass(getPublicModels)
);
```

`createProviderClass` 支持传入任意 _Function_，该构件的 `resolve` 方法将被指向为该函数。

## 使用方法 {#usage}

Provider 构件一般用于 [Context]、[State] 和 [Events 事件]。

## 引用其他 Provider 构件 {#use-other-provider-bricks}

Provider 构件本质上是将任意一个函数包裹而成的自定义元素，如果我们期望这个函数能像一个普通的 libs 包中的函数一样对外共享，可以使用 `unwrapProvider`：

```tsx
import { unwrapProvider } from "@next-core/utils/general";
// 引入类型以便获得类型提示
import type { getIllustration } from "@next-bricks/illustrations/data-providers/get-illustration";

// 使用 `unwrapProvider` 来获得一个 Provider 构件被包裹的原始函数
const GetIllustration = unwrapProvider<typeof getIllustration>(
  "illustrations.get-illustration"
);

// 该函数既可以用在普通构件中，
function MyOtherComponent() {
  const url = GetIllustration({ name: "no-content" });
  return <img src={url} />;
}

// 也可以用在其他 Provider 构件中
function myOtherProvider() {
  const url = GetIllustration({ name: "no-content" });
  return url;
}
```

和 `wrapBrick` 类似，通过 `unwrapProvider` 我们获得了在不通的构件包中共享 Provider 函数的能力，和之前的 Libs 包相比，这个方式可以避免跨仓库代码维护的问题，同时解决了 libs 包在多个构件包中制品代码重复的问题。

在 v3 中我们将框架解耦、做薄，因此我们利用了上述能力将一些之前耦合在框架中的模块迁移到了构件中，例如图标库（`icons-NB`）和插画库 `illustrations-NB`。

:::note
Provider 函数既可以是同步的，也可以是异步的。
:::

## Provider 异步回调 {#provider-async-callback}

```yaml
brick: "your-brick"
events:
  something.happen:
    useProvider: "your-provider"
    args:
      - "<% EVENT.detail.id %>"
    callback:
      success:
        target: "another-brick"
        properties:
          instanceData: "<% EVENT.detail %>"
      error:
        action: "console.error"
      finally:
        target: "your-button"
        properties:
          disabled: false
```

在以上配置中，如果构件 `your-brick` 发生了事件 `something.happen`：

1. 系统将使用 Provider 构件 `your-provider`，调用它的 `resolve` （未指定 `method`），传递参数 `<% EVENT.detail.id %>`；
2. 当该异步函数完成后：

- 如果成功，找到构件 `another-brick`，设置它的属性 `instanceData` 为上述函数返回的结果；
- 如果失败，使用 `console.error` 打印上述函数返回的失败原因。
- 无论成功失败，最后都将 `your-button` 构件的 `disabled` 属性设置为 `false`

如果给事件处理器配置了 `callback`，那么系统在事件触发后，除了执行指定 `method` 外，还将根据该函数执行结果进行回调调用：`method` 将被视作异步函数调用，当该函数成功时（_resolved_），将触发 `callback.success` 回调，反之（_rejected_）将触发 `callback.error`，而无论成功或失败，最后都将触发 `callback.finally`。这些回调的配置本身又是一个事件配置，因此它可以执行内置动作、或设置其他构件的属性、甚至继续调用其他构件的方法。这些回调传递的 `EVENT.detail` 在成功时为函数执行的 _resolved result_，失败时为函数执行的 _rejected reason_。

*基于异步回调驱动*的模式相比*基于事件驱动*的好处在于在同样实现了异步操作的前提下，回调使得操作与响应可以一一对应。事件无法将操作与响应一一对应，对于事件接收方，在收到事件时，很难判断它是自己触发的还是其它对象触发的。

因此事件通常用于旁路处理的场景，例如打印日志、广播通知等。而回调则用于需要将操作和响应对应起来的场景，例如实例的增、删、改、查。

## Provider 轮询 {#provider-polling}

使用 `useProvider` 作事件处理时，可以激活轮询模式，系统将间隔指定时间轮询对应的接口。

```yaml
useProvider: "my-provider"
args:
  - "some args"
  # 通常应为轮询接口指定一个系统额外的参数，以避免在每次轮询时显示加载条
  - interceptorParams:
      ignoreLoadingBar: true
poll:
  enabled: true
  # 通常应指定一个校验函数 `expectPollEnd`，该函数接收一个参数：轮询执行结果，
  # 并返回轮询是否应该结束。
  expectPollEnd: '<% (result) => result.status === "done" %>'
callback:
  progress:
    # 每次轮询得到结果时会触发 `callback.progress`
  success:
    # 轮询完成时会触发 `callback.success`，
    # 即 `expectPollEnd(result)` 返回 true 时
  error:
    # 轮询失败时会触发 `callback.error`
  finally:
    # 轮询完成或失败时触发 `callback.finally`
```

除了使用 `progress` 来获得接口的实时结果外，也可以让轮询接口对外表现得像普通接口一样。例如假设有一个查询工具执行结果的接口需要轮询以得到最终执行结果，可以这样配置：

```yaml
useProvider: "my-provider.get-tool-result"
args:
  - "some args"
  - interceptorParams:
      ignoreLoadingBar: true
poll:
  enabled: true
  expectPollEnd: |
    <%
      (result) =>
        result.status === "success" || result.status === "failed"
    %>
  delegateLoadingBar: true
callback:
  success:
    target: "tool-result"
    properties:
      - output: "<% EVENT.detail.output %>"
  error:
    action: handleHttpError
```

| Poll 选项                 | 默认值  | 说明                                                                                                                                                                        |
| ------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enabled                   | `false` | 是否启用轮询                                                                                                                                                                |
| interval                  | `3000`  | 轮询间隔时间（毫秒）                                                                                                                                                        |
| expectPollEnd             | -       | 轮询是否应结束的校验函数，该函数接收一个参数：当前轮询的执行结果，轮询结束时将触发 `callback.success` 事件                                                                  |
| expectPollStopImmediately | -       | 轮询是否应立即结束的校验函数，还在等待或进行中的轮询将失效，不会触发 `progress \| success \| error \| finally` 等事件                                                       |
| delegateLoadingBar        | `false` | 是否代理系统加载条的显示与隐藏，当启用时，在轮询初始时，会显示加载条，轮询完成或失败时，将隐藏加载条。应配合 `expectPollEnd` 与 `interceptorParams.ignoreLoadingBar` 使用。 |
| continueOnError           | `false` | 当某次轮询失败时，是否仍继续发起轮询。                                                                                                                                      |

## 变更历史 {#history}

| 组件       | 版本  | 变更                                                                               |
| ---------- | ----- | ---------------------------------------------------------------------------------- |
| brick_next | 3.0.0 | 不再支持基于事件的使用方式，例如 `execute` `updateArgs` 等方法和 `response.*` 事件 |

[events 事件]: events.md
[context]: context.md
[state]: template-state.md
