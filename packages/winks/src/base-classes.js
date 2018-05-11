const root = typeof window !== 'undefined' ? window : global
const nullFunc = function () {};
const HTMLElementCtor = root.HTMLElement || nullFunc

class WebComponent extends HTMLElementCtor {
  constructor () {
    if (HTMLElementCtor === nullFunc) {
      throw new Error('Browser environment not suitable')
    }

    super()
  }

  connectedCallback () {
    if (this.template) this.innerHTML = this.template
  }
}

export {WebComponent}
