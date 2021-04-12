export const cookieOption = {
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'test',
  domain: process.env.NODE_ENV === 'test' ? 'localhost' : '.epiclogue.com',
  sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'None',
}

export const cookieClearOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'test',
  domain: process.env.NODE_ENV === 'test' ? 'localhost' : '.epiclogue.com',
  sameSite: process.env.NODE_ENV === 'production' ? 'Lax' : 'None',
}

// tag extraction pattern
export const tagPattern = /#[^\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"\s]+/g

export const dbOption = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}
