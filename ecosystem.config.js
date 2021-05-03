module.exports = {
  apps: [
    {
      name: 'server',
      script: './build/bin/www.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      exec_mode: 'cluster',
      instances: 'max',
    },
  ],
}
