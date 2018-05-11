import {WebComponent} from './base-classes'

class Winks {}

// Global methods
Object.assign(Winks, {
  component (name, opt) {
    Object.assign(WebComponent.prototype, opt)
    customElements.define(name, WebComponent)
  }
})

if (process.env.NODE_ENV === 'development') {
  window.addEventListener('WebComponentsReady', () => {
    Winks.component('abc-xyz', {
      template: '<h2>ABC</h2>'
    })
  })
}

export default Winks
