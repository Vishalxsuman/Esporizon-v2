#!/usr/bin/env node

/**
 * Production Readiness Verification Script
 * 
 * This script checks for common issues that would break the color prediction game in production.
 * Run this before deploying to catch configuration errors early.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

let errors = [];
let warnings = [];
let passed = [];

console.log('🔍 Running Production Readiness Checks...\n');

// ===========================================
// CHECK 1: Environment Configuration
// ===========================================

function checkEnvironmentConfig() {
    console.log('📋 Checking environment configuration...');

    const envFiles = ['.env', '.env.production', '.env.example'];
    let foundValidConfig = false;

    for (const envFile of envFiles) {
        const filePath = path.join(process.cwd(), envFile);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');

            // Check for VITE_API_URL
            if (content.includes('VITE_API_URL')) {
                const match = content.match(/VITE_API_URL=(.*)/);
                if (match) {
                    const url = match[1].trim();

                    if (url.includes('localhost')) {
                        warnings.push(`⚠️  ${envFile} contains localhost URL: ${url}`);
                    } else if (url === 'http://65.2.33.69:5000/api') {
                        passed.push(`✅ ${envFile} has correct production URL`);
                        foundValidConfig = true;
                    } else if (url) {
                        warnings.push(`⚠️  ${envFile} has unexpected URL: ${url}`);
                    } else {
                        errors.push(`❌ ${envFile} has empty VITE_API_URL`);
                    }
                }
            }
        }
    }

    if (!foundValidConfig) {
        errors.push('❌ No valid production API URL configuration found');
        console.log('\n💡 Fix: Create .env.production with:\n   VITE_API_URL=http://65.2.33.69:5000/api\n');
    }
}

// ===========================================
// CHECK 2: No Hardcoded Localhost
// ===========================================

function checkNoHardcodedLocalhost() {
    console.log('\n📋 Checking for hardcoded localhost references...');

    const srcPath = path.join(process.cwd(), 'src');
    const localhostPattern = /['"]http:\/\/localhost:\d+/g;
    let foundLocalhost = false;

    function scanDirectory(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const matches = content.match(localhostPattern);

                if (matches) {
                    const relativePath = path.relative(process.cwd(), filePath);
                    errors.push(`❌ Hardcoded localhost found in ${relativePath}`);
                    foundLocalhost = true;
                }
            }
        }
    }

    if (fs.existsSync(srcPath)) {
        scanDirectory(srcPath);
    }

    if (!foundLocalhost) {
        passed.push('✅ No hardcoded localhost URLs found');
    }
}

// ===========================================
// CHECK 3: API Client Exists
// ===========================================

function checkAPIClient() {
    console.log('\n📋 Checking API client...');

    const apiClientPath = path.join(process.cwd(), 'src', 'lib', 'predictionApi.ts');

    if (fs.existsSync(apiClientPath)) {
        const content = fs.readFileSync(apiClientPath, 'utf8');

        if (content.includes('getCurrentPeriod') && content.includes('getLatestResult')) {
            passed.push('✅ API client exists with required methods');
        } else {
            errors.push('❌ API client missing required methods');
        }

        if (content.includes('GAME_TYPE_MAP')) {
            passed.push('✅ Game mode mapping implemented');
        } else {
            warnings.push('⚠️  Game mode mapping may be missing');
        }
    } else {
        errors.push('❌ API client not found at src/lib/predictionApi.ts');
    }
}

// ===========================================
// CHECK 4: Game Engine Hook
// ===========================================

function checkGameEngineHook() {
    console.log('\n📋 Checking game engine hook...');

    const hookPath = path.join(process.cwd(), 'src', 'hooks', 'useGameEngine.ts');

    if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');

        // Check for BAD patterns (client-side timer)
        if (content.includes('setInterval')) {
            errors.push('❌ useGameEngine still uses setInterval (client-side timer)');
        } else {
            passed.push('✅ No setInterval found (good - backend-authoritative)');
        }

        if (content.includes('Date.now()') && !content.includes('// debugging')) {
            warnings.push('⚠️  Date.now() found in useGameEngine (may be used for timing)');
        }

        if (content.includes('setTimeout')) {
            passed.push('✅ Uses setTimeout for polling (correct pattern)');
        } else {
            warnings.push('⚠️  setTimeout not found - check polling implementation');
        }

        if (content.includes('getCurrentPeriod')) {
            passed.push('✅ Calls backend API (getCurrentPeriod)');
        } else {
            errors.push('❌ Does not call getCurrentPeriod from backend API');
        }
    } else {
        errors.push('❌ useGameEngine hook not found');
    }
}

// ===========================================
// CHECK 5: Build Output (if exists)
// ===========================================

function checkBuildOutput() {
    console.log('\n📋 Checking build output...');

    const distPath = path.join(process.cwd(), 'dist');

    if (fs.existsSync(distPath)) {
        // Check if built files contain localhost
        function scanBuildDirectory(dir) {
            const files = fs.readdirSync(dir);
            let foundLocalhost = false;

            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    if (scanBuildDirectory(filePath)) foundLocalhost = true;
                } else if (file.endsWith('.js')) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    if (content.includes('localhost:5000')) {
                        errors.push(`❌ Build artifact contains localhost: ${path.relative(process.cwd(), filePath)}`);
                        foundLocalhost = true;
                    }
                }
            }

            return foundLocalhost;
        }

        if (!scanBuildDirectory(distPath)) {
            passed.push('✅ Build output does not contain localhost');
        }
    } else {
        warnings.push('⚠️  No build output found (run npm run build to test)');
    }
}

// ===========================================
// RUN ALL CHECKS
// ===========================================

checkEnvironmentConfig();
checkNoHardcodedLocalhost();
checkAPIClient();
checkGameEngineHook();
checkBuildOutput();

// ===========================================
// REPORT
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION REPORT');
console.log('='.repeat(60));

if (passed.length > 0) {
    console.log('\n✅ PASSED:');
    passed.forEach(p => console.log('  ' + p));
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => console.log('  ' + w));
}

if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => console.log('  ' + e));
    console.log('\n🚨 CRITICAL: Fix these errors before deploying to production!\n');
    process.exit(1);
} else {
    console.log('\n🎉 All critical checks passed! Ready for production deployment.\n');

    if (warnings.length > 0) {
        console.log('💡 Consider addressing the warnings above for best practices.\n');
    }

    process.exit(0);
}
