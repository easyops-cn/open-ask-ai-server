---
title: "Placeholders"
---

> 现在推荐使用 [Expressions 表达式]。

Placeholders 占位符允许开发者在编排中使用特殊标记来访问和处理数据。占位符主要有两种方式：注入 `${...}` 和 transform `@{...}`。

例如在构件属性中使用注入占位符：

```yaml
brick: instance-list
properties:
  q: "${QUERY.q}"
  url: "/some-url?p=${QUERY.page|number}"
```

或者在 Resolve 中使用 transform：

```yaml
context:
  - name: myAsyncContext
    resolve:
      useProvider: my-provider
      transform:
        value: "@{hostname}"
```

## 注入 {#inject}

| 示例                      | 说明                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `${xyz}`                  | 路由 path 匹配的参数                                                                                                                            |
| `${QUERY.abc}`            | URL query 参数                                                                                                                                  |
| `${QUERY.*}`              | `URLSearchParams` 对象。结合 `${QUERY.*\|string}` 可以获得序列化的参数如：`a=1&b=2`                                                             |
| `${xyz=good}`             | 如果没有找到参数 `xyz`，那么设置一个默认值 `"good"`，默认值仅使用 `string`                                                                      |
| `${xyz\|number}`          | 对参数做类型转换（或称为管道），未设置时将不做转换，参见 [Pipes 管道]                                                                           |
| `${QUERY.asc=0\|boolean}` | 同时设置默认值和类型转换                                                                                                                        |
| `/some-url?q=${QUERY.q}`  | 可以在普通字符串中混合占位符，此时返回的整体数据始终为字符串，而单个完整的占位符会返回原始对象，例如 `${QUERY.*}` 将返回 `URLSearchParams` 对象 |

除了上述示例外，还支持注入一些 [Expressions 表达式]中支持的内置对象，主要包括：`QUERY`、`QUERY_ARRAY`、`HASH`、`ANCHOR`、`APP`、`EVENT`、`SYS`、`FLAGS`。

## Transform

Transform 和注入占位符基本类似，不同的是，它接收的数据为特定场景下提供的数据。

例如在 Resolve 中，接收的数据是 Provider 构件返回的数据；而在 `useBrick` 的属性配置中，接收的数据是其所属构件为 `useBrick` 传递的 `data` 属性。

## 详细说明 {#details}

例如以下 transform 配置片段（yaml）：

```yaml
transform:
  url: '?query=@{ some.field[0].path = ["complex","value"] | map : instanceId | slice : 0 : 10 }'
```

字段 `url` 中被 `@{ ... }` 包裹的部分就是占位符，它们将在运行时根据上下文信息计算得到。

以上 `url` 可以被分解为以下结构：

```yaml
- RawString: "?query="
- Placeholder:
    field: "some.field[0].path"
    default:
      value: ["complex", "value"]
    pipes:
      - identifier: map
        parameters:
          - "instanceId"
      - identifier: slice
        parameters:
          - 0
          - 10
```

在运行时，`Placeholder` 将根据上下文按以下流程计算得到结果：

1. 使用 `_.get(context, field)` 得到 `result`；
2. 如果 `result` 为 `undefined`，那么将 `default.value` 赋值给 `result`；
3. 遍历 `pipes`，通过 `identifier` 找到对应的管道函数 `pipe`，将 `result` 作为第一个参数，`parameters` 作为额外参数列表，调用 `pipe` 并将返回值赋值给 `result`；
4. 返回 `result`。

> 请参考 [Pipes 管道]。

而最终 `url` 得到的值为所有 `RawString` 与 `Placeholder` 计算得到的值通过 [Array#join] 拼接后的结果。

> 注意：`Array#join` 如果遇到 `undefined`, `null` 或空数组 `[]` 的元素，将被转换为空字符串。

> 注意：当某个字段仅由单个 `Placeholder` 组成时，将返回它原始计算得到的值，而不是 `Array#join` 的结果。

在 `default` 默认值及 `pipe parameters` 管道参数语法中，可以使用 JSON value 的格式传递各种形式的值。同时为了能简化普通字符串的编写，如果要设置的值不会和 JSON value 格式冲突、且不包含特殊控制字符（`|:}`）和空白符的字符串时，可以直接填写字面量的字符串，例如 `${QUERY.objectId=HOST}`。系统在以下情况中将认为该值为 JSON value 并进行相应解析（即使解析失败）：

- 系统认为可能是数组、对象、数字类型的，即以 `[` `{` `"` 或数字开头的、或以 `-` 开头并跟着至少一个数字的；
- 完全等于 `null` `false` `true` 的。

其它情况将按 _literal-string_ 字面量字符串解析。

注意，_literal-string_ 仅能使用英文字母、数字、`_`、`-` 和 _non-ascii_ 字符（即可以使用包括中文在内的其它字符）。`field` 除了上述字符外，还可以使用 `.`、`*`、`[`、`]`。

## 图解

以下图解参考 [https://www.json.org/json-en.html](https://www.json.org/json-en.md)。

![图解 placeholders](/img/docs/placeholders.png)

ws: 和 JSON 定义里的 whitespace 一致，即空字符串或连续的空白字符。

## 变更历史 {#history}

| 组件       | 版本  | 变更                         |
| ---------- | ----- | ---------------------------- |
| brick_next | 3.0.0 | 不再支持在占位符中使用 `CTX` |

[pipes 管道]: pipes.md
[array#join]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
[expressions 表达式]: expressions.md
