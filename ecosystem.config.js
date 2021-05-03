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
      exec_interpreter: "babel-node", // This configuration is to use the babel-node to execute the nodejs file
      exec_mode: "fork",
      instances: 'max',
    },
  ],
}
