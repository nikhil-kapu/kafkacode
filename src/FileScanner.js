const fs = require('fs');
const path = require('path');
const { minimatch } = require('minimatch');

class FileScanner {
    constructor(rootDir, options = {}) {
        this.rootDir = path.resolve(rootDir);
        this.supportedExtensions = new Set([
            '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rb', '.php',
            '.env', '.json', '.yaml', '.yml', '.toml', '.ini', '.properties',
            '.xml', '.tf', '.tfvars', '.dockerfile', '.md', '.sh'
        ]);
        this.supportedFilenames = new Set([
            '.env', '.env.example', '.env.local', '.env.development', '.env.production',
            'Dockerfile', 'dockerfile', 'Containerfile', 'Makefile'
        ]);
        this.ignoreDirs = new Set([
            '.git', 'node_modules', 'venv', '__pycache__', '.venv', 'env',
            'build', 'dist', 'target', 'out', '.next', '.nuxt', 'vendor',
            'coverage', '.coverage', '.pytest_cache', '.mypy_cache',
            '.vitepress', '.cache', '.turbo'
        ]);
        this.extraIgnorePatterns = options.exclude || [];
        this.gitignorePatterns = this._loadIgnoreFile('.gitignore');
        this.kafkaCodeIgnorePatterns = this._loadIgnoreFile('.kafkacodeignore');
    }

    _loadIgnoreFile(fileName) {
        const gitignorePath = path.join(this.rootDir, fileName);
        const patterns = [];

        if (fs.existsSync(gitignorePath)) {
            try {
                const content = fs.readFileSync(gitignorePath, 'utf-8');
                const lines = content.split('\n');

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        patterns.push(trimmed);
                    }
                }
            } catch (error) {
                // Ignore errors loading gitignore
            }
        }

        return patterns;
    }

    _shouldIgnorePath(filePath) {
        const relativePath = path.relative(this.rootDir, filePath);
        const pathParts = relativePath.split(path.sep);

        // Check built-in ignore directories
        for (const part of pathParts) {
            if (this.ignoreDirs.has(part)) {
                return true;
            }
        }

        // Check ignore patterns
        const ignorePatterns = [
            ...this.gitignorePatterns,
            ...this.kafkaCodeIgnorePatterns,
            ...this.extraIgnorePatterns
        ];
        for (const pattern of ignorePatterns) {
            if (minimatch(relativePath, pattern, { dot: true }) ||
                minimatch(path.basename(filePath), pattern, { dot: true }) ||
                minimatch(relativePath, `${pattern}/**`, { dot: true })) {
                return true;
            }
        }

        return false;
    }

    _scanDirectory(dir) {
        const files = [];

        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (this._shouldIgnorePath(fullPath)) {
                    continue;
                }

                if (entry.isDirectory()) {
                    files.push(...this._scanDirectory(fullPath));
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (this.supportedExtensions.has(ext) || this.supportedFilenames.has(entry.name)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            // Ignore directory access errors
        }

        return files;
    }

    scanFiles() {
        const files = this._scanDirectory(this.rootDir);
        return files.sort();
    }
}

module.exports = FileScanner;
