---
title: "Functions"
---

## 背景 {#background}

在编排微应用时，经常需要进行数据加工，有些复杂的加工方法，我们可以通过 [Custom Processors 自定义加工函数]来实现。

这些在代码仓库中管理的加工函数，可以享受代码仓库带来的好处：代码风格和静态检查及自动修复、使用 TypeScript 增强代码健壮性、严格的单元测试流程提升代码质量等等。不过它同时也带来了一些不便：编写门槛较高、发布周期较长、需要管理依赖版本等等。

因此我们还提供了微应用级别的等价加工函数：_Storyboard Functions 微应用函数_，它与 Custom Processor 的能力基本一致，同样用于数据加工处理，但是可以直接在 Next Builder 中进行编写和使用，并跟随微应用一起发布。

## 说明 {#description}

Storyboard Functions 的定位为纯粹地处理数据加工，使用 JavaScript 或 TypeScript 编写，对页面数据无感知（不可以直接引用 `CTX` 等页面运行时数据，但可以使用参数传递过来），可以在 [Expressions 表达式]中通过 `FN.yourFunction(params)` 来调用它。

例如，编写以下函数：

```js
function sayHello(params) {
  return `Hello, ${params.name}`;
}
```

在编排时可以这样使用：

```yaml
anyProp: '<% FN.sayHello({ name: "world" }) %>'
```

函数中还可以使用在 [Expressions 表达式]中的、与运行时状态无关的几个框架内置对象：

- `_` (Lodash)
- `moment`
- `FN`
- `PIPES`
- `TAG_URL`
- `SAFE_TAG_URL`
- `I18N`
- `I18N_TEXT`
- `IMG`

例如，可以在函数中使用同一个微应用的其它函数，例如：

```js
function sayHello(params) {
  return FN.sayExclamation(`Hello, ${params.name}`);
}
```

## 测试用例 {#tests}

Storyboard Functions 通常包含较复杂的逻辑，因此需要编写测试用例来保障其质量。

## 注意 {#notice}

编写 Storyboard Functions 时可以使用绝大多数的 JavaScript/TypeScript 语法，但由于它的定位仅为纯数据加工，以及出于对函数代码的健壮性和可维护性等因素的考虑，限制了部分语法和能力。

不推荐或不支持的语法清单：

- 🚫 Async/Await: `async function() { await … }`
- 🚫 Generator: `function* a() { yield … }`
- 🚫 Class: `class A { … }`
- 🚫 ThisExpression: `this.anyProp`
- 🚫 VarDeclaration of `var`: `var a`
- 🚫 LabeledStatement: `anyLabel: …`
- 🚫 WithStatement: `with (…) { … }`
- 🚫 DebuggerStatement: `debugger`

## 变更历史 {#history}

[custom processors 自定义加工函数]: custom-processors.md
[expressions 表达式]: expressions.md
