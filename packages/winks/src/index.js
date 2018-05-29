import {WebComponent} from './base-classes'

class Winks {}

// Global methods
Object.assign(Winks, {
  component (name, opt) {
    Object.assign(WebComponent.prototype, opt)
    customElements.define(name, WebComponent)
  }
})

export default Winks
