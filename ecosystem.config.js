module.exports = {
  apps: [
    {
      name: "chat-app", // Name for your Next.js app
      script: "npm", // Use npm to start the Next.js app
      args: "start", // Runs npm start
      cwd: ".", // Directory where the Next.js app resides
      instances: "max", // Scale across all CPU cores
      exec_mode: "cluster", // Use cluster mode for better performance
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Port for your Next.js app
      },
    },
    {
      name: "websocket-server", // Name for your WebSocket server
      script: "node", // Use Node.js to run the WebSocket server
      args: "websocket.js", // Path to your WebSocket server file
      cwd: "./src/websocket", // Directory where the WebSocket file resides
      env: {
        NODE_ENV: "production",
        PORT: 8080, // Port for your WebSocket server
      },
    },
  ],
};
