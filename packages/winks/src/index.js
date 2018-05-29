import {WebComponent} from './base-classes'

class Winks {}

// Global methods
Object.assign(Winks, {
  component (name, opt) {
    if (document.currentScript.parentElement.querySelector('template')) {
      WebComponent.template = WebComponent.prototype.template = document.currentScript.parentElement.querySelector('template').cloneNode(true)
    }
    Object.assign(WebComponent.prototype, opt)
    customElements.define(name, WebComponent)
  }
})

export default Winks
