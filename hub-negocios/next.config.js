/** @type {import('next').NextConfig} */
const nextConfig = {
  
  allowedDevOrigins: ['127.0.0.1', 'localhost'], 

  experimental: {
    serverActions: {
      allowedOrigins: [
        '127.0.0.1:3000', 
        'localhost:3000',
        '*.githubpreview.dev', 
        '*.app.github.dev'     
      ],
    },
  },
};

module.exports = nextConfig;