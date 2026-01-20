#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🔍 Starting Pre-push Validation...');

try {
    console.log('📦 Validating Frontend Build...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend Build Passed');

    console.log('🚀 Validating Backend Startup...');
    // We just check if it compiles/can be interpreted, not full startup as it needs DB
    execSync('node --check backend/src/server.js', { stdio: 'inherit' });
    console.log('✅ Backend Syntax Check Passed');

    console.log('✨ All validations passed! Ready for push.');
} catch (error) {
    console.error('❌ Validation Failed. Please fix errors before pushing.');
    process.exit(1);
}
