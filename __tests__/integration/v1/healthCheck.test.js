'use strict'

import request from 'supertest'
import app from '../../../app'

describe('Server health check', () => {
  test('200', async () => {
    await request(app).get('/').expect(200)
  })
})
