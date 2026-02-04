---
title: "Browser History"
---

在 Brick Next 中，`History` 概念不同于[浏览器原生的 History]，而是指的是一个[第三方库 history]，它和原生 History 的能力类似，但提供了更丰富的能力，另外我们又在它的基础上扩展了更多能力。

## 使用 {#usage}

在构件源码中使用：

```ts
import { getHistory } from "@next-core/runtime";

const history = getHistory();
history.push("/your/location");
```

在 Storyboard 中配置事件处理：

```yaml
events:
  something.happen:
    action: "history.push"
    args:
      - "/your/location"
```

## 属性 {#properties}

### location

```ts
export interface Location<S = LocationState> {
  pathname: string;
  search: string;
  state: S;
  hash: string;
  key?: string;
}
```

## 基本方法 {#methods}

### push

跳转到指定地址，往浏览器会话历史栈中推入一条新记录。普通的页面跳转应使用此方法。

| 参数列表 | 类型                                          | 必填 | 描述       |
| -------- | --------------------------------------------- | ---- | ---------- |
| `path`   | <code>string &#124; LocationDescriptor</code> | ✔️   | 新页面地址 |
| `state`  | `{ notify?: boolean }`                        | -    | -          |

### replace

跳转到指定地址，替换浏览器会话历史栈中最新的一条记录。

| 参数列表 | 类型                                          | 必填 | 描述       |
| -------- | --------------------------------------------- | ---- | ---------- |
| `path`   | <code>string &#124; LocationDescriptor</code> | ✔️   | 新页面地址 |
| `state`  | `{ notify?: boolean }`                        | -    | -          |

### goBack

回退到浏览器会话历史栈中的上一条记录。

### goForward

前进到浏览器会话历史栈中的下一条记录。

## 扩展方法 {#extended-methods}

### pushQuery

更新指定 query 参数，会保留当前其它 query 参数，往浏览器会话历史栈中推入一条新记录。

| 参数列表  | 类型                                                         | 必填 | 描述                                                                                          |
| --------- | ------------------------------------------------------------ | ---- | --------------------------------------------------------------------------------------------- |
| `query`   | `object`                                                     | ✔️   | 需要更新的 query 参数键值对，如果值为 `null` `undefined` `""` ，该字段将被删除                |
| `options` | `{ extraQuery?: object; clear?: boolean; notify?: boolean }` | -    | 通过 `extraQuery` 指定额外的 query 对象；`clear` 为 `true` 时将清空当前 URL 已有的 query 参数 |

### replaceQuery

类似 `pushQuery`，但会替换浏览器会话历史栈中最新的一条记录。

| 参数列表  | 类型                                                         | 必填 | 描述           |
| --------- | ------------------------------------------------------------ | ---- | -------------- |
| `query`   | `object`                                                     | ✔️   | 同 `pushQuery` |
| `options` | `{ extraQuery?: object; clear?: boolean; notify?: boolean }` | -    | 同 `pushQuery` |

### pushAnchor

类似 `history.pushQuery`，将跳转到指定的 anchor（ URL hash）地址。此方法默认不会触发页面重新渲染。

| 参数列表 | 类型     | 必填 | 描述                  |
| -------- | -------- | ---- | --------------------- |
| `anchor` | `string` | ✔️   | URL hash 去掉前缀 `#` |

### reload

将重载当前会话，即触发页面重新渲染。与 `location.reload()` 不同，它不会触发浏览器页面的重载。

### block

设置后，将在用户离开页面前（例如跳转到其它页面、刷新、关闭浏览器标签页等）弹出提示信息，以便用户确认是否离开。更多信息请参考 [`lifeCycle.onBeforePageLeave`](brick-life-cycle.md#onbeforepageleave)。

| 参数列表  | 类型     | 必填 | 描述                           |
| --------- | -------- | ---- | ------------------------------ |
| `message` | `string` | ✔️   | 阻止页面离开时，弹出的确认信息 |

### unblock

取消之前设置的阻止页面离开信息的设置。

## 高级 {#advanced}

在 `push` 等支持可选的 `state` 参数的地方传递 `{ notify: false }` 可以不触发页面重新渲染。

## 变更历史 {#history}

[浏览器原生的 history]: https://developer.mozilla.org/en-US/docs/Web/API/History
[第三方库 history]: https://github.com/ReactTraining/history
