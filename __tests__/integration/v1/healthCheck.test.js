import request from 'supertest'
import { describe, test } from '@jest/globals'
import app from '../../../src/app'

describe('Health check', () => {
  test('Server | 200', async () => {
    await request(app).get('/').expect(200)
  })
})
