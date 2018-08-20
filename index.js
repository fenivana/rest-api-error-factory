const { format } = require('util')

module.exports = function(errors) {
  return class extends Error {
    constructor(code, ...args) {
      if (code.constructor === Object) {
        // new E(json)
        const e = code
        super(e.message)

        Object.defineProperty(this, 'httpStatus', {
          value: errors[e.code].httpStatus,
          enumerable: false
        })

        for (const p in e) {
          if (p !== 'message') this[p] = e[p]
        }
      } else {
        // new E(code, ...formatParams, props)
        let props = args[args.length - 1]
        if (props && props.constructor === Object) {
          args.pop()
        } else {
          props = null
        }

        super(format(errors[code].message, ...args))

        Object.defineProperty(this, 'httpStatus', {
          value: errors[code].httpStatus,
          enumerable: false
        })

        this.code = code

        if (props) {
          for (const k in props) {
            this[k] = props[k]
          }
        }
      }
    }

    toJSON() {
      return {
        message: this.message,
        ...this
      }
    }
  }
}
