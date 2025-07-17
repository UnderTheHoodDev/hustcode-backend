export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  },
});
