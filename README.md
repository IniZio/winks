# :stuck_out_tongue_winking_eye: Winks.js

## Getting started

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Hello Winks.js</title>
</head>
<body>
  <!-- 0. Polyfill for web-component -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-lite.js"></script>
  <!-- 1. Polyfill for es5 custom-element work in modern browsers -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/custom-elements-es5-adapter.js"></script>
  <!-- 2. Winks.js -->
  <script src="https://unpkg.com/winks/dist/winks.min.js"></script>
  <!-- 3. Create a web component  -->
  <script>
    Winks.component('hello-winks', {
      template: '<h1>Hello Winks.js!</h1>'
    })
  </script>
  <!-- 4. Use the custom-element -->
  <hello-winks></hello-winks>
</body>
</html>
```

## Development

```sh
yarn

yarn clip watch

yarn clip build
```
