import slim from 'observable-slim'

import {set, path} from './util'

const root = typeof window !== 'undefined' ? window : global
const nullFunc = function () {};
const HTMLElementCtor = root.HTMLElement || nullFunc

const SingleSlim = (() => {
  let instance

  function createInstance() {
    const object = slim.create({}, true)
    return object
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    }
  }
})()

class WebComponent extends HTMLElementCtor {
  _listeners = []
  _mapper = []
  context = SingleSlim.getInstance()
  _ctxMapper = {}
  computed = {}

  constructor () {
    if (HTMLElementCtor === nullFunc) {
      throw new Error('Browser environment not suitable')
    }

    super()
    this.initState()
  }

  connectedCallback () {
    let element = null
    if (this.template.content) {
      element = this.template
    } else {
      element = document.createElement('div')
      element.innerHTML = this.template
    }

    if (!this.nonShadow) {
      if (!this.shadowRoot) {
        // Attach shadow DOM
        this.attachShadow({
          mode: 'open'
        })

        // Append template content to custom element
        // this.shadowRoot.appendChild(cssFrag)

        this.shadowRoot.appendChild(document.importNode(element, true))
      }
    } else {
      this.appendChild(element, true)
    }
    // Do not compile children if instance is a shadow-dom
    if (!this.noBind && !element.querySelectorAll('slot').length) {
      this.compile()
    }
  }

  initState () {
    const instance = this

    // Initialize state with data property
    const initial = (
      instance.data instanceof Function ?
      instance.data :
      () => (instance.data || {})
    )()

    this.data = slim.create(
      initial,
      true,
      changes =>
        changes.map(change => {
          Object.keys(instance._mapper)
            .filter(paths => paths.startsWith(change.currentPath))
            .map(paths =>
              instance._mapper[paths].map(
                ({
                  name,
                  node
                }) => {
                  // BUG: not sure but think this makes list-render variable covered up with instance.data
                  const newNode = path(paths, instance.data)
                  if (newNode !== null) {
                    if (name === 'children') {
                      node.innerText = newNode
                    } else {
                      node.setAttribute(name, newNode)
                      // HACK: not sure if value attribute is the only one that sets default rather than live value?
                      if (name === 'value') node.value = newNode
                    }
                  }
                }
              )
            )
        })
    )
  }

  compile (root = this, overrides = {}, peek = false) {
    root = root.shadowRoot || root
    const instance = this

    Array.from(root.querySelectorAll('[x-for]'))
      .map(node => {
        const [name, iterable] = node.attributes['x-for'].value.split(':')
        node.removeAttribute('x-for')
        const template = node.cloneNode(true)
        // HACK: uses node itself as anchor so not removing it, but definitely not a nice solution
        node.style.display = 'none'
        node.className = ''

        const fragment = document.createDocumentFragment()
        let elements = []

        const renderList = changes => {
          // Clear current children
          elements.map(element => element.remove())
          // Compile elements
          const datas = path(iterable, instance.data) || path(iterable, overrides) || []
          console.log(iterable, instance.data, overrides)
          elements = (Array.isArray(datas) ? datas : [])
            .map((single, index) => {
              const element = template.cloneNode(true)
              element.setAttribute('key', index)
              this.compile(element, Object.assign({}, overrides, {[name]: single}), true)
              this.applyListeners(element, Object.assign({}, overrides, {[name]: single}))
              this.activateBinds(element, Object.assign({}, overrides, {[name]: single}))
              this.activateContext(element)
              return element
            })

          elements.map(fragment.appendChild.bind(fragment))
          node.parentNode.insertBefore(fragment, node.nextSibling)
        }

        instance.observe(instance.data, renderList.bind(instance))
        renderList()
      })

    Array.from(root.querySelectorAll('[x-if]'))
      .map(node => {
        const name = node.attributes['x-if'].value
        node.removeAttribute('x-if')

        const conditionalRender = () => {
          const computed = path(name, instance.computed) instanceof Function ? path(name, instance.computed) : null

          if (!path(name, instance.data) && !path(name, instance.context) && !path(name, instance) && !(computed && computed.call(instance, node, overrides))) {
            if (node.style.display !== 'none') {
              node.setAttribute('display', node.style.display)
              node.style.display = 'none'
            }
          } else {
            if (node.style.display === 'none') {
              node.style.display = node.getAttribute('display') || 'block'
            }
          }
        }

        instance.observe(instance.data, conditionalRender.bind(instance))
        instance.observe(instance.context, conditionalRender.bind(instance))
        conditionalRender()
      })

    Array.from(root.querySelectorAll('[x-else]'))
      .map(node => {
        node.removeAttribute('x-else')

        const conditionalRender = () => {
          if (node.previousElementSibling.style && node.previousElementSibling.style.display === 'none') {
            node.style.display = node.getAttribute('display') || 'block'
          } else {
            node.setAttribute('display', node.style.display)
            node.style.display = 'none'
          }
        }

        instance.observe(instance.data, conditionalRender.bind(instance))
        instance.observe(instance.context, conditionalRender.bind(instance))
        conditionalRender()
      })

    // if (peek) console.log(Array.from(root.querySelectorAll('*')))

    // Apply listeners and data binding to nodes without directives
    Array.from(root.querySelectorAll('*'))
      .filter(node => !Object.keys(node.attributes).find(attr => attr.startsWith('x-')))
      .map(node => {
        this.applyListeners(node, overrides)
        this.activateBinds(node, overrides)
        this.activateContext(node)
      })
  }

  activateBinds(node, overrides = {}) {
    const instance = this

    Array.from(node.attributes)
      // e.g. :value
      .filter(attr => attr.name.startsWith(':'))
      .map(attr => {
        node.removeAttribute(attr.name)
        const computed = path(attr.value, instance.computed) instanceof Function ? path(attr.value, instance.computed) : null
        const name = attr.name.slice(1)
        const value = path(attr.value, overrides) || (computed ? computed.call(instance, node, overrides) : path(attr.value, this.data)) || ''

        // attr.value === 'segment' && console.log('value of child: ', attr.name, value, overrides, node)

        if (name === 'children') {
          node.innerText = value
        } else node.setAttribute(name, value)

        // HACK: not sure if value attribute is the only one that sets default rather than live value?
        if (name === 'value') node.value = value

        if (this._mapper.hasOwnProperty(attr.value)) {
          this._mapper[attr.value].push({name: (computed ? '' : name), node})
        } else this._mapper[attr.value] = [{name: (computed ? '' : name), node}]
      })
  }

  diactivateState() {
    slim.remove(this.data)
  }

  activateContext(node) {
    const instance = this;

    Array.from(node.attributes)
      // e.g. :value
      .filter(attr => attr.name.startsWith('~'))
      .map(attr => {
        const name = attr.name.slice(1)
        node.removeAttribute(attr.name)
        if (instance._ctxMapper.hasOwnProperty(attr.value)) {
          instance._ctxMapper[attr.value].push({
            name,
            node
          })
        } else instance._ctxMapper[attr.value] = [{
          name,
          node
        }]
      })

    slim.observe(SingleSlim.getInstance(), changes => {
      changes.map(change => {
        // console.log(change.currentPath, instance._ctxMapper)
        Object.keys(instance._ctxMapper)
          .filter(paths => paths.startsWith(change.currentPath))
          .map(paths =>
            instance._ctxMapper[paths].map(
              ({
                name,
                node
              }) => {
                const newNode = path(paths, instance.context)
                if (name === 'children') {
                  node.innerText = newNode
                } else {
                  node.setAttribute(name, newNode)
                  // HACK: not sure if value attribute is the only one that sets default rather than live value?
                  if (name === 'value') node.value = newNode
                }
              }
            )
          )
      })
    })
  }

  disconnectedCallback() {
    this.clearListeners()
    this.diactivateState()
    // this.diactivateContext()
  }

  applyListeners(node, overrides = {}) {
    const instance = this

    Array.from(node.attributes)
      // e.g. @click
      .filter(attr => attr.name.startsWith('@'))
      .map(attr => {
        node.removeAttribute(attr.name)
        if (instance[attr.value] instanceof Function) {
          const handler = e => instance[attr.value].apply(instance, [e, node, overrides])
          node.addEventListener(attr.name.slice(1), handler)
          instance._listeners.push({
            el: node,
            event: attr.name.slice(1),
            handler
          })
        }
      })
  }

  clearListeners() {
    this._listeners.map(({
      el,
      event,
      handler
    }) => el.removeEventListener(event, handler))
    this._listeners.length = 0
  }
}

export {WebComponent}
