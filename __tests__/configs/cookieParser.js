import cookie from 'cookie'

// 다수의 HTTP 쿠키를 받아 파싱한 후 리턴하는 함수
export const cookieParser = cookies => cookies.map(c => cookie.parse(c))

export const getAccessTokenFromCookie = cookies => cookies.filter(c => cookie.parse(c).access_token !== undefined )[0]