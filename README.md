# sonner-js

> :warning: **WARNING: This library is still a work in progress!** :warning:
>
> Please be aware that while this library is being actively developed and improved, there may be instability and breaking changes. Use at your own risk in production environments.

sonner-js is a dependency-free, vanilla JavaScript version of the [Sonner](https://sonner.emilkowal.ski/) toast component originally built for React. This version maintains almost the same functionality but is built to be used in any JavaScript project without the need for React.

## Usage

To start using the library, include it in your project:

```html
<script src="path/to/sonner.js"></script>
<link rel="stylesheet" href="path/to/sonner.css" />
```

Then, you can start using the `Sonner.show` method to display toasts:

```javascript
Sonner.show("My first toast");
```

```html
<button onclick="Sonner.show('Here\'s a toast')">Give me a toast</button>
```

## Roadmap

Some of the features of the original Sonner component are not available in this version. These include:

1. Custom toast components
2. Promise toast
3. TypeScript definitions

The intention is to implement these features in the future.

The example also needs some love. It's a bit rough around the edges.

If you want to run the example, all you need to do is clone the repository and open the `example/index.html` file in your browser.

## Sonner API

The Sonner API is very simple and consists of a few methods:

- `init`
- `success`
- `error`
- `info`
- `warning`
- `show`
- `remove`

### `init(options)`

Initializes the toasters in the DOM.

**Parameters:**

- `options` (Object)
  - `closeButton` (boolean): Controls the visibility of the close button on the toasts.
  - `richColors` (boolean): Controls the use of rich colors for the toasts.
  - `position` (string): Controls the position of the toasts. Possible values are `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, and `bottom-right`.

### `success(msg)`

Shows a new success toast with a specific message.

**Parameters:**

- `msg` (string): The message to display in the toast.

### `error(msg)`

Shows a new error toast with a specific message.

**Parameters:**

- `msg` (string): The message to display in the toast.

### `info(msg)`

Shows a new info toast with a specific message.

**Parameters:**

- `msg` (string): The message to display in the toast.

### `warning(msg)`

Shows a new warning toast with a specific message.

**Parameters:**

- `msg` (string): The message to display in the toast.

### `show(msg, options)`

Shows a new toast with a specific message, description, and type.

**Parameters:**

- `msg` (string): The message to display in the toast.
- `options` (Object)
  - `type` (string): The type of the toast.
  - `description` (string): The description to display in the toast.

### `remove(id)`

Removes an element with a specific id from the DOM after a delay.

**Parameters:**

- `id` (string): The data-id attribute of the element to remove.

## Thanks

I would like to thank [Emil Kowalski](https://emilkowalski.com/) for creating the original Sonner component and for the inspiration to create this version.

## License

This library is licensed under the MIT license. See the [LICENSE](LICENSE) file for more information.
