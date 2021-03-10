import request from 'supertest'
import { describe, test } from '@jest/globals'
import app from '../../../app'

describe('Health check', () => {
  test('Server | 200', async () => {
    await request(app).get('/').expect(200)
  })
})
