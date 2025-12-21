module.exports = {
  apps: [{
    name: 'alo17',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/alo17',
    instances: 1, // Next.js kendi cluster desteği var, PM2 cluster mode ile çakışabilir
    exec_mode: 'fork', // cluster yerine fork kullan
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git', 'prisma/dev.db']
  }]
};

