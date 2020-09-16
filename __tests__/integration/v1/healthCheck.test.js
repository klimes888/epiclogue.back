'use strict'

import request from 'supertest'
import app from '../../../app'
import { describe, expect, test } from '@jest/globals'

describe('Server health check', () => {
  test('200', async () => {
    await request(app).get('/').expect(200)
  })
})
