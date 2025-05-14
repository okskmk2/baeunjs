# BaeunJS

A lightweight JavaScript library for DOM manipulation, state management, and hash-based SPA routing. BaeunJS provides a simple way to build small to medium-sized Single Page Applications (SPAs).

---

## Features

- **`elem`**: Create DOM elements with attributes, event listeners, and children.
- **`stateManager`**: Manage application state with localStorage and reactive callbacks.
- **`hashRouter`**: Build hash-based routing for SPAs without server-side configurations.

---

## Installation

Install BaeunJS using NPM:

```bash
npm install baeunjs
```

Or include it via a script tag:

```html
<script src="https://unpkg.com/baeunjs"></script>
```

---

## Usage

### 1. DOM Manipulation with `elem`

The `elem` function simplifies the creation of DOM elements.

```javascript
import { elem } from "baeunjs";

// Create a div with attributes and children
const myDiv = elem("div", { class: "container", id: "my-div" }, [
  elem("h1", {}, "Hello, World!"),
  elem("button", { onclick: () => alert("Clicked!") }, "Click Me"),
]);

document.body.appendChild(myDiv);
```

---

### 2. State Management with `stateManager`

The `stateManager` provides an easy way to manage application state and listen for changes.

```javascript
import { stateManager } from "baeunjs";

// Set a value
stateManager.set("user", { name: "Alice", age: 25 });

// Get a value
const user = stateManager.get("user");
console.log(user.name); // Alice

// Update a value
stateManager.update("user", (current) => ({
  ...current,
  age: current.age + 1,
}));

// Listen for changes
stateManager.onChange("user", (newUser) => {
  console.log("User updated:", newUser);
});
```

---

### 3. SPA Routing with `hashRouter`

The `hashRouter` enables hash-based SPA routing with no server-side configuration.

```javascript
import { hashRouter, elem } from "baeunjs";

// Define routes
const routes = {
  "/": () => elem("div", {}, "Home Page"),
  "/about": () => elem("div", {}, "About Page"),
  "*": () => elem("div", {}, "404 Page Not Found"),
};

// Initialize the router
hashRouter(routes);

// Add navigation links
document.body.appendChild(
  elem("nav", {}, [
    elem("a", { href: "#/" }, "Home"),
    elem("a", { href: "#/about" }, "About"),
  ])
);
```

---

## API Reference

### `elem(tagName, options, children)`

Create a DOM element.

| Parameter    | Type                                | Description                          |
|--------------|-------------------------------------|--------------------------------------|
| `tagName`    | `string`                            | The name of the element tag.         |
| `options`    | `Record<string, any>` (optional)    | Attributes and event listeners.      |
| `children`   | `string | number | HTMLElement[]`  | Children elements or text content.  |
| **Returns**  | `HTMLElement`                      | The created DOM element.             |

---

### `stateManager`

A utility for managing application state.

#### Methods

| Method           | Description                                     |
|-------------------|-------------------------------------------------|
| `set(key, value)` | Save a value to localStorage.                   |
| `get(key)`        | Retrieve a value from localStorage.             |
| `update(key, fn)` | Update a value based on the current state.      |
| `remove(key)`     | Remove a specific key from localStorage.        |
| `clear()`         | Clear all stored state values.                  |
| `onChange(key, callback)` | Listen for changes to a specific key.  |

---

### `hashRouter(routes, appId)`

Create a hash-based SPA router.

| Parameter  | Type                                | Description                                       |
|------------|-------------------------------------|---------------------------------------------------|
| `routes`   | `Record<string, () => HTMLElement>`| A map of routes to components.                   |
| `appId`    | `string` (optional, default: `"app"`)`| The ID of the container where components render. |

| **Returns** | `() => void` | A function to manually trigger the router. |

---

## Example Project

Create a simple SPA using BaeunJS:

```javascript
import { elem, hashRouter, stateManager } from "baeunjs";

const routes = {
  "/": () => elem("div", {}, "Welcome to Home Page!"),
  "/counter": () => {
    const count = stateManager.get("count") || 0;

    const incrementButton = elem("button", {
      onclick: () => {
        const updatedCount = stateManager.update("count", (c) => (c || 0) + 1);
        countText.textContent = `Count: ${updatedCount}`;
      },
    }, "Increment");

    const countText = elem("p", {}, `Count: ${count}`);

    return elem("div", {}, [countText, incrementButton]);
  },
  "*": () => elem("div", {}, "404 Not Found"),
};

// Initialize the router
hashRouter(routes);
```

---

## License

MIT License. See [LICENSE](LICENSE) for more information.

