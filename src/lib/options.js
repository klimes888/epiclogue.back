export const cookieOption = {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'test',
    domain: process.env.NODE_ENV === 'test' ? 'localhost' : '.epiclogue.com',
    sameSite: process.env.NODE_ENV === 'test' ? 'Lax' : 'None',
}