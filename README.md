# rest-api-error-factory
[![CircleCI](https://img.shields.io/circleci/project/github/kasha-io/rest-api-error-factory.svg)](https://circleci.com/gh/kasha-io/rest-api-error-factory)
[![Codecov](https://img.shields.io/codecov/c/github/kasha-io/rest-api-error-factory.svg)](https://codecov.io/gh/kasha-io/rest-api-error-factory)
[![npm](https://img.shields.io/npm/dm/rest-api-error-factory.svg)](https://www.npmjs.com/package/rest-api-error-factory)
[![npm](https://img.shields.io/npm/v/rest-api-error-factory.svg)](https://www.npmjs.com/package/rest-api-error-factory)
[![license](https://img.shields.io/github/license/kasha-io/rest-api-error-factory.svg)](https://github.com/kasha-io/rest-api-error-factory)

A factory function to create REST API error classes.

## Usage

```js
const Koa = require('koa')
const Router = require('koa-router')
const restAPIErrorFactory = require('rest-api-error-factory')

const errors = {
  CLIENT_INVALID_PARAM: {
    message: 'Invalid parameter (%s).',
    httpStatus: 400
  },

  CLIENT_RESOURCE_NOT_FOUND: {
    message: 'Resouce not found.',
    httpStatus: 404
  },

  SERVER_INTERNAL_ERROR: {
    message: 'Server Internal Error (EVENT_ID: %s-%s).',
    httpStatus: 500
  }
}

// create a REST API error class
const RESTError = restAPIErrorFactory(errors)

const app = new Koa()
const router = new Router()

app.use(async(ctx, next) => {
  try {
    await next()
  } catch (e) {
    if (!(e instanceof RESTError)) {
      // here we use raven-logger to log unexpected errors
      // https://github.com/kasha-io/raven-logger
      const { timestamp, eventId } = logger.error(e)
      e = new RESTError('SERVER_INTERNAL_ERROR', timestamp, eventId)
    }

    // here we reply the request with REST API message.
    ctx.status = e.httpStatus
    ctx.body = e.toJSON()
  }
})

router.get('/articles/:id', async ctx => {
  const id = parseInt(ctx.params.id)
  if (isNaN(id)) {
    // throw the error
    throw new RESTError('CLIENT_INVALID_PARAM', 'id', { id: ctx.params.id })
  }

  // ...
})

app.use(router)

app.use(ctx => {
  throw new RESTError('CLIENT_RESOURCE_NOT_FOUND')
})

app.listen(3000)
```

## APIs

### restAPIErrorFactory(errorDefs)
Creates an error class that contains error definitions you passed.

`errorDefs` format:
```js
{
  ERROR_CODE: {
    message: 'MESSAGE'
    httpStatus: STATUS_CODE
  },

  ...
}
```

Example:
```js
const RESTError = restAPIErrorFactory({
  CLIENT_INVALID_PARAM: {
    message: 'Invalid parameter (%s).',
    httpStatus: 400
  }
})
```

### new RESTError(errorCode, [messageParam1, messageParam2, ...], [extraProperties])
Creates an error instance.

#### Params:
`errorCode`: String. The error code you defined in error definition object.  
`messageParams1`, `messageParam2`, ...: String | Number. The params to format the error message. The message will be formatted by `util.format(message, messageParam1, messageParam2, ...)`. See [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) for details.  
`extraProperties`: Object. Extra properties to set.  

Example:
```js
const e = new RESTError('CLIENT_INVALID_PARAM', 'id', { id: 'foo' })

console.log(e.httpStatus)
// -> 400

console.log(e.toJSON())
/*
->
{
  code: 'CLIENT_INVALID_PARAM',
  message: 'Invalid parameter (id).'
  id: 'foo'
}

httpStatus will be excluded
*/
```

### new RESTError(json)
Creates an error instance from JSON object.

#### Params:
`json`: JSON object. You can get it from `restError.toJSON()`.

Example:
```js
const e = new RESTError({
  code: 'CLIENT_INVALID_PARAM',
  message: 'Invalid parameter (id).',
  id: 'foo'
})
```
