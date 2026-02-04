# Brick Next Overview

## What is Brick Next?
Brick Next is a low-code UI framework that allows developers to build modern web applications using declarative structural data (typically YAML). It treats UI components as "Bricks" which can be nested and composed to create complex interfaces.

## Core Architecture
- **Storyboard**: The declarative definition of the page structure, composed of a hierarchy of bricks.
- **Bricks**: The fundamental building blocks. These can be standard HTML elements (like `div`, `button`) or Custom Elements (Web Components).
- **Context**: A state management system. Data stored in Context can be bound to Brick properties using expressions.
- **Events**: A mechanism to handle user interactions without writing imperative code in the UI definition.
- **Expressions**: JavaScript snippets embedded in the configuration (e.g., `<%= CTX.user.name %>`) to enable dynamic behavior and data binding.

## Basic Usage Example
A simple counter application defined in YAML:

```yaml
# A button that displays a count and increments it on click
brick: button
properties:
  textContent: <%= `Clicked ${CTX.count} times` %>
events:
  click:
    action: context.replace
    args:
    - count
    - <% CTX.count + 1 %>
```

With a corresponding Context definition:
```yaml
- name: count
  value: 0
```

---

# Brick Next Documentation Summary

This document provides a summary of the documentation available in the current directory for Brick Next. The documentation is organized into three main sections: Learn, Concepts, and Advanced.

## Learn (`learn/`)
This section contains resources for getting started with Brick Next.

- **[Installation](learn/installation.mdx)**: How to install Brick Next.
- **[Quick Start](learn/quick-start.mdx)**: A quick guide to start using Brick Next.
- **[Tutorial](learn/tutorial.mdx)**: A step-by-step tutorial (with a backup version `tutorial-bak.mdx`).

## Concepts (`concepts/`)
This section covers the core concepts and features of the Brick Next framework.

- **[Brick Life Cycle](concepts/brick-life-cycle.md)**: Understanding the lifecycle of bricks during rendering.
- **[Conditional Rendering](concepts/conditional-rendering.md)**: How to render components conditionally based on flags or data.
- **[Context](concepts/context.md)**: Sharing data between bricks, similar to React Context.
- **[Control Nodes](concepts/control-nodes.md)**: Alternatives to older template systems for flow control.
- **[Custom Processors](concepts/custom-processors.md)**: Extending functionality with custom processors.
- **[Custom Templates](concepts/custom-templates.md)**: Creating reusable templates.
- **[Events](concepts/events.md)**: Handling events in the storyboard.
- **[Expressions](concepts/expressions.md)**: Using JavaScript expressions in configurations.
- **[Browser History](concepts/history.md)**: Managing browser history and navigation.
- **[I18n](concepts/i18n.md)**: Internationalization support using i18next.
- **[Media Query](concepts/media-query.md)**: Responsive layout capabilities using media queries.
- **[Nesting Bricks](concepts/nesting-bricks.md)**: Composing UI by nesting bricks.
- **[Pipes](concepts/pipes.md)**: Data processing pipelines in placeholders.
- **[Placeholders](concepts/placeholders.md)**: Using placeholders `${ ... }` and `@{ ... }` (Note: Expressions are now recommended).
- **[Provider Bricks](concepts/provider-bricks.md)**: Special bricks for data fetching and processing without UI.
- **[Storyboard Functions](concepts/storyboard-functions.md)**: Defining reusable functions in the storyboard.
- **[Template States](concepts/template-state.md)**: Managing local state within templates.
- **[Theme & Mode](concepts/theme-and-mode.md)**: Theming and mode support.

## Advanced (`advanced/`)
This section looks at more complex topics.

- **[Incremental Rendering](advanced/incremental-rendering.mdx)**: Optimizing performance with incremental rendering.
