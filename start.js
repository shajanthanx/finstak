#!/usr/bin/env node
const { execSync } = require('child_process');

try {
    console.log('⚡ Building Next.js project...');
    execSync('node ./node_modules/next/dist/bin/next build', { stdio: 'inherit' });

    console.log('🚀 Starting Next.js server on port 4000...');
    execSync('node ./node_modules/next/dist/bin/next start -p 4000', { stdio: 'inherit' });
} catch (err) {
    console.error('❌ Error during build/start:', err.message);
    process.exit(1);
}
