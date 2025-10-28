module.exports = {
  apps: [
    {
      name: "noah-api",
      cwd: __dirname,
      script: "dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        DATABASE_URL: process.env.DATABASE_URL,
        FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost",
      },
    },
  ],
};
