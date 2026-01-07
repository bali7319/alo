module.exports = {
  apps: [
    {
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
      max_memory_restart: '3G', // 2G'den 3G'ye çıkarıldı - bellek limiti aşımını önlemek için
      min_uptime: '10s', // En az 10 saniye çalışmalı, yoksa crash sayılır
      max_restarts: 10, // Maksimum 10 restart, sonra durdur
      restart_delay: 4000, // Restart arası 4 saniye bekle
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'prisma/dev.db']
    },
    {
      name: 'alo17-cron',
      script: 'cron-server.js',
      cwd: '/var/www/alo17',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false
    }
  ]
};

