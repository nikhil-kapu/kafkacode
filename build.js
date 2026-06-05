const fs = require('fs');
const path = require('path');

const SRC_DIR = 'src';
const DIST_DIR = 'dist';

// Copy all source files from src/ to dist/. The published `bin` entry points at
// dist/, so this build step simply mirrors the source tree (no transformation).
function copyDirectory(srcDir, distDir) {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const distPath = path.join(distDir, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, distPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            fs.copyFileSync(srcPath, distPath);
        }
    }
}

console.log('🔨 Building KafkaCode...');

// Clean dist/
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
}
fs.mkdirSync(DIST_DIR);

// Copy source files
copyDirectory(SRC_DIR, DIST_DIR);

// Make the CLI entrypoint executable
const cliPath = path.join(DIST_DIR, 'cli.js');
if (fs.existsSync(cliPath)) {
    fs.chmodSync(cliPath, '755');
}

console.log(`✅ Build complete. Output in ${DIST_DIR}/`);
