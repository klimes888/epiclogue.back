/**
 * @param {number} statusCode Response로 내보내질 HTTP 상태코드
 * @param {string} errorMessage Response로 내보내질 에러 메세지
 * @param {Error} errorObject (Optional) 내부적으로 사용하는 에러 오브젝트
 * @returns 새로운 에러 인스턴스
 */
export const apiErrorGenerator = (statusCode, errorMessage, errorObject) => {
  const apiError = new Error()

  // 에러 메세지는 외부 노출(response)용으로 사용
  apiError.name = errorObject.name || 'API Error'
  apiError.status = statusCode || errorObject.status
  apiError.message = errorMessage
  apiError.stack = errorObject.stack

  return apiError
}
