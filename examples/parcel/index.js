import Winks from 'winks'

Winks.component('xyz-abc', {
  template: `<div>
    <h2>ABC</h2>
    <div :children="message"></div>
    <input @input="changeMessage">
  </div>`,
  data: () => ({
    message: 'YO MAN'
  }),
  changeMessage (e) {
    this.data.message = e.target.value
  }
})
