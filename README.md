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

## How to use

#### 1. Add a new component

```js
Winks.component('some-component', {
  template: '<h2>Component content</h2>'
})
```

### 2. Access children of the html file in its class

```js
Winks.component('xyz-abc', {
  connectedCallback () {
    super.connectedCallback()
    console.log($(this.shadowRoot).children('#send-email'))
  }
}
```

### 3. Add event listeners to template content

```js
Winks.component('xyz-abc', class extends MyElement {
  template: '<button @click="sendEmail">Send</button>'
  sendEmail (e) {
    e.preventDefault()
    api.sendMail()
    console.log('sending email')
  }
})
```

### 4. Use reactive state

```html
<template>
  <input :value="message" @input="changeMessage">
  <div :children="message"></div>
</template>

<script>
  Winks.component('abc-xyz', {
    // NOTE: Use a function that returns the initial value
    data () {
      return {
        cc: 100,
        message: 'qq'
      }
    }
    changeMessage (e) {
      this.data.message = e.target.value
    }
  })
</script>
```

### 5. Use global context

```html
<template>
  <input ~value="magic" @input="changeMessage">
  <div ~children="magic"></div>
</template>

<script>
  Winks.component('abc-xyz', {
    changeMessage (e) {
      this.context.magic = e.target.value
    }
  })
</script>
```

### 6. Use `x-for` directive

```html
<template>
  <div x-for="abc:messages" :children="abc"></div>
</template>

<script>
  Winks.component('abc-xyz', {
    data () {
      return {
        messages: ['hello', 'bye', 'magic']
      }
    }
  })
</script>
```

### 7. Use `x-if` and `x-else` directive

```html
<template>
  <button @click="toggleEdit">Edit</button>
  <input x-if="isEditting" :value="content" @input="changeContent">
  <div x-else :children="content"></div>
</template>

<script>
  Winks.component('abc-xyz', {
    data () {
      return {
        isEditting: false,
        content: ''
      }
    }
  
    toggleEdit () {
      this.data.isEditting = !this.data.isEditting
    }
  
    changeContent (e) {
      this.data.content = e.target.value
    }
  })
</script>
```

## Development

```sh
yarn

yarn clip watch

yarn clip build
```
