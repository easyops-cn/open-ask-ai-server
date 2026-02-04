---
title: "Nesting Bricks"
---

构件即 Custom Elements，通常情况下，构件应像普通的 HTML 元素那样去嵌套和组合使用：

```html
<ul>
  <li>abc</li>
  <li>xyz</li>
</ul>
```

## `wrapBrick`

在基础构件的实现上，我们也应像 HTML 元素那样进行设计，将构件分层，避免直接开发一个大型的、封闭的、专有的构件。

例如一个列表容器构件，我们应避免直接设计为单个构件加属性的方式：

```jsx
<general-list list={[123, 789]} />
```

相反的，我们可以先设计两个基础构件 `base-list` 和 `base-list-item`：

```jsx
<base-list>
  <base-list-item>123</base-list-item>
  <base-list-item>789</base-list-item>
</base-list>
```

当然，如果上层应用的编排直接使用这些底层构件，易用性上会打折扣。但别着急，我们可以在它们的基础上再封装一层构件，可以直接通过属性来设置列表数据：

```jsx
<general-list list={[123, 789]} />
```

而 `general-list` 内部的实现则是通过读取 `list` 属性并使用 `base-list` + `base-list-item` 构件来完成渲染。

```tsx
import { ReactNextElement, wrapBrick } from "@next-core/react-element";

// 使用 `wrapBrick` 传入构件名称，得到一个 React 组件。
const WrappedList = wrapBrick("base-list");
const WrappedListItem = wrapBrick("base-list-item");

@defineElement("general-list")
class GeneralList extends ReactNextElement {
  @property({ attribute: false }) accessor list: string[];

  render() {
    return (
      <WrappedList>
        {this.list.map((text) => (
          <WrappedListItem>{text}</WrappedListItem>
        ))}
      </WrappedList>
    );
  }
}
```

在以上例子中，`base-list`、`base-list-item` 充当着与 HTML 基础元素 `ul`、`li` 类似的作用，而 `general-list` 则与 React 组件的作用类似。我们可以将前者称之为*元素类构件*，后者称之为*组件类构件*。

通过这一层拆分和组合，可以使得我们的基础的元素类构件有更多的复用场景，同时也可以针对上层的编排和使用按需提供易用性更高的组件类构件。例如：

- 再提供一个 `grid-list` 的组件类构件，允许用户配置一个网格布局的列表，底层使用 `base-grid` + `base-list-item`；
- 或者提供一个 `card-list` 的组件类构件，允许用户配置一个卡片列表，底层使用 `base-list` + `base-list-item` + `base-card`。

对于 `wrapBrick` 的使用，再举一个例子，假设我们有一个基础的按钮构件和图标构件，如果我们希望在此基础上封装一个*带图标的按钮*构件：

```tsx
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import type { GeneralIcon, GeneralIconProps } from "@next-bricks/icons/general-icon";
import type { GeneralButton, GeneralButtonProps } from "../button/index.js";

// 使用 `wrapBrick` 传入构件名称，得到一个 React 组件。
// 通过指定相关类型，可以得到有效的 IDE 的属性类型提示。
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>(
  "eo-icon"
);

// 传入的构件既可以是其他构件包的，也可以是当前构件包的。
const WrappedButton = wrapBrick<GeneralButton, GeneralButtonProps>(
  "eo-button"
);

@defineElement("eo-button-with-icon")
class ButtonWithIcon extends ReactNextElement {
  @property() accessor type: string;
  @property() accessor icon: string;

  render() {
    return (
      <WrappedButton type={this.type}>
        <WrappedIcon icon={this.icon} />
        <slot />
      <WrappedButton>
    )
  };
}
```

这种分层和组合的思想应贯穿我们所有构件的设计和实现的过程。

## `asyncWrapBrick`

在上述示例中，如果页面中使用到了 `eo-button-with-icon`，那么系统将始终先加载它的依赖 `eo-icon` 和 `eo-button` 构件，再加载 `eo-button-with-icon`。

但有时候我们的构件可能需要依赖一些资源体积比较大的构件，并且这些构件可能是按条件渲染的，希望只在必要的时候加载这些依赖构件；或者这些构件可以异步渲染，希望页面主要内容不被这些依赖阻塞。

针对这些场景，使用 `asyncWrapBrick` 并结合 React Suspense 即可实现异步组件。

```jsx
import { asyncWrapBrick } from "@next-core/react-runtime";

const MyAsyncDep = React.lazy(async () => ({
  default: await asyncWrapBrick("my-large-or-optional-dep"),
}));

function AsyncWrapComponent({ visible }) {
  return (
    <>
      <h2>Async Wrapper</h2>
      {visible && (
        <React.Suspense fallback="Loading...">
          <MyAsyncDep />
        </React.Suspense>
      )}
    </>
  );
}
```

如上述示例，当 `visible` 为 `false` 时，构件 `my-large-or-optional-dep` 不会被加载。而当 `visible` 为 `true` 时，在加载依赖构件的过程中，页面其他部分也不会被阻塞。

:::info Important
依赖 `basic-NB >= 1.11.1` 和 `brick_next >= 3.13.7`。
:::

## `useBrick`

在另一些场景中，有时候我们需要在构件内部渲染用户动态编排的构件，并结合当前构件的状态数据为这些子构件动态配置属性。

例如一个表格构件，可以允许用户在编排时定义每一列要使用的子构件，并可以动态的引用对应的数据来配置该子构件的属性。

```jsx {1,10-16}
import { ReactUseBrick } from "@next-core/react-runtime";

function MyTableComponent({ columns }) {
  return (
    <table>
      {rows.map((row) => (
        <tr>
          {columns.map((col) => (
            <td>
              <ReactUseBrick
                useBrick={col.useBrick}
                data={{
                  cell: row[col.dataIndex],
                  row,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </table>
  );
}
```

最终用户可以这样编排：

```yaml
brick: "my-table"
properties:
  columns:
    - dataIndex: "name"
      useBrick:
        brick: "general-text"
        properties:
          color: "red"
          # 在表达式中使用 `DATA` 来引用 `ReactUseBrick` 为其传递的 `data` 数据
          textContent: "<% DATA.cell %>"
    - dataIndex: "address"
      useBrick:
        brick: "general-address"
        properties:
          city: "<% DATA.row.city %>"
          address: "<% DATA.cell %>"
```
