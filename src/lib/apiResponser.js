import { apiResponseLogger } from './middleware/apiResponseLogger'

export const apiResponser = ({ req, res, statusCode = 200, data, message }) => {
  let output = {
    result: 'ok',
    status: statusCode,
    data,
  }

  if (statusCode > 399) {
    output.result = 'error'
  }

  if (message) {
    output = { ...output, message }
  }

  res.data = data
  res.statusCode = statusCode

  apiResponseLogger(req, res)
  res.status(statusCode).json(output)
}
