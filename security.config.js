// Security Configuration for Development
// This file contains settings to reduce information exposure in development

module.exports = {
  // Disable webpack HMR to prevent route exposure
  webpack: {
    hmr: false,
    watchOptions: {
      ignored: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
    },
  },
  
  // Disable source maps in development
  sourceMaps: false,
  
  // Disable development tools that expose routes
  devTools: {
    enabled: false,
  },
  
  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
  },
  
  // Disable route exposure
  routes: {
    exposeInternalRoutes: false,
    exposeFilePaths: false,
  },
};

// Instructions for use:
// 1. Restart your development server after making changes
// 2. Use 'npm run dev:secure' for more secure development
// 3. Check browser developer tools to verify routes are not exposed 