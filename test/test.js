// Passing arrow functions (“lambdas”) to Mocha is discouraged.
// https://mochajs.org/#arrow-functions
/* eslint prefer-arrow-callback: "off" */

const assert = require('assert')
const errorFactory = require('../')

const errors = {
  CLIENT_INVALID_PARAM: {
    message: 'Invalid parameter (%s).',
    httpStatus: 400
  }
}

describe('restAPIErrorFactory', function() {
  it('should create an error instance', function() {
    const RESTError = errorFactory(errors)
    const e = new RESTError('CLIENT_INVALID_PARAM', 'articleId')
    assert.strictEqual(e.code, 'CLIENT_INVALID_PARAM')
    assert.strictEqual(e.message, 'Invalid parameter (articleId).')
    assert.strictEqual(e.httpStatus, 400)
    assert.deepStrictEqual(JSON.parse(JSON.stringify(e)), {
      code: 'CLIENT_INVALID_PARAM',
      message: 'Invalid parameter (articleId).'
    })
  })

  it('error should contain passed props', function() {
    const RESTError = errorFactory(errors)
    const e = new RESTError('CLIENT_INVALID_PARAM', 'articleId', { articleId: 'abc' })
    assert.strictEqual(e.code, 'CLIENT_INVALID_PARAM')
    assert.strictEqual(e.message, 'Invalid parameter (articleId).')
    assert.strictEqual(e.httpStatus, 400)
    assert.strictEqual(e.articleId, 'abc')
    assert.deepStrictEqual(JSON.parse(JSON.stringify(e)), {
      code: 'CLIENT_INVALID_PARAM',
      message: 'Invalid parameter (articleId).',
      articleId: 'abc'
    })
  })

  it('should create an error from json', function() {
    const RESTError = errorFactory(errors)
    const e = new RESTError({
      code: 'CLIENT_INVALID_PARAM',
      message: 'Invalid parameter (articleId).',
      articleId: 'abc'
    })
    assert.strictEqual(e.code, 'CLIENT_INVALID_PARAM')
    assert.strictEqual(e.message, 'Invalid parameter (articleId).')
    assert.strictEqual(e.httpStatus, 400)
    assert.strictEqual(e.articleId, 'abc')
    assert.deepStrictEqual(JSON.parse(JSON.stringify(e)), {
      code: 'CLIENT_INVALID_PARAM',
      message: 'Invalid parameter (articleId).',
      articleId: 'abc'
    })
  })
})