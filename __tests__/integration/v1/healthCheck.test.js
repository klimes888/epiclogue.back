'use strict'

import request from 'supertest'
import app from '../../../app'
import { describe, expect, test } from '@jest/globals'

describe('Health check', () => {
  test('Server | 200', async () => {
    await request(app).get('/').expect(200)
  })
})
