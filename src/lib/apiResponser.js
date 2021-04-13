export const apiResponser = ({ res, statusCode = 200, data, message }) => {
  let output = {
    result: 'ok',
    status: statusCode,
    data
  }

  if (statusCode > 399) {
    output.result = 'error'
  }

  if (message) {
    output = { ...output, message }
  }

  return res.status(statusCode).json(output)
}