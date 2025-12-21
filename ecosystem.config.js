module.exports = {
  apps: [{
    name: 'alo17',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 2, // CPU core sayısına göre ayarlayın (1-4 arası önerilir)
    exec_mode: 'cluster',
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

