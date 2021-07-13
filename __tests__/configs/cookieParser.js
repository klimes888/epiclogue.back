import cookie from 'cookie'

/**
 * 다수의 HTTP 쿠키를 받아 파싱한 후 access_token 만 리턴하는 함수
 */ 
export const getAccessTokenFromCookie = cookies =>
  cookies
    .map(c => cookie.parse(c))
    .filter(c => c.access_token !== undefined)
    .pop()
    .access_token
