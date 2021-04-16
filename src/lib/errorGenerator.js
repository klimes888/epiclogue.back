export const errorGenerator = (statusCode, errorObject, errorMessage) => {
  const apiError = new Error()
  // 에러 메세지는 외부 노출(response)용으로 사용
  apiError.name = errorObject.name || 'API Error'
  apiError.status = statusCode || errorObject.status
  apiError.message = errorMessage
  apiError.stack = errorObject.stack
  return apiError
}