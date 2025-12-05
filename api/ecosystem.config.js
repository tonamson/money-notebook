module.exports = {
  apps: [
    {
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/api-error.log',
      out_file: '/var/log/pm2/api-out.log',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
