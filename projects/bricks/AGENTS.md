# Bricks Overview

Bricks (构件) are just Web Components, used in Brick Next, which combines bricks into pages and apps, just like building LEGOs.

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

# Bricks Documentation Summary

## Bricks (`bricks/`)
The `bricks/` directory contains the documentation for the extensive library of pre-built UI components (Bricks) available in the framework. These are categorized by their function:

### Core Categories
- **Basic** (`bricks/basic/`): Atomic UI elements and utilities.
  - **UI Elements**: `eo-button`, `eo-text`, `eo-icon`, `eo-avatar`, `eo-tag`.
  - **Utilities**: `http-request`, `show-notification`, `copy-to-clipboard`.
- **Containers** (`bricks/containers/`): Structural components for layout and grouping.
  - **Layout**: `eo-flex-layout`, `eo-grid-layout`, `eo-content-layout`.
  - **Grouping**: `eo-card`, `eo-modal`, `eo-drawer`, `eo-tabs`.
- **Form** (`bricks/form/`): Input components for data collection.
  - `eo-form`, `eo-input`, `eo-select`, `eo-date-picker`, `eo-checkbox`.
- **Advanced** (`bricks/advanced/`): Complex, feature-rich components.
  - `eo-table`, `eo-tree`, `pdf-viewer`, `eo-cascader`.

### Specialized Categories
- **Data View** (`bricks/data-view/`): Visualizations, charts, and dashboard elements.
- **AI** (`bricks/ai/` & `bricks/ai-portal/`): Components for AI chat interfaces and agent interactions.
- **Diagram** (`bricks/diagram/`): Tools for drawing and displaying diagrams.
- **Visual Builder** (`bricks/visual-builder/`): Components related to the visual editor itself.

Each Brick documentation file (typically `.mdx`) details the specific properties, events, slots, and methods supported by that component.

## Brick Next (`brick-next/`)
The `brick-next/` directory documents the core framework concepts and APIs.
- **Concepts**: Deep dives into Life Cycle, Context, Events, Expressions, and Templates.
- **Learn**: Tutorials and guides for getting started.
- **Advanced**: topics like Incremental Rendering.