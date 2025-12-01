module.exports = {
  apps: [
    {
      name: "food-map",
      cwd: "/root/quang/fe",                 // thư mục dự án (điều chỉnh đúng của bạn)
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3014",                   
      exec_mode: "fork",                       // Next.js thường dùng fork; cluster cần sticky
      instances: 1,                            // tăng sau nếu có sticky load balancer
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3014,
      },
    },
  ],
};
