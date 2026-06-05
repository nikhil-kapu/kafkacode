const fs = require('fs');
const path = require('path');
const { minimatch } = require('minimatch');

class FileScanner {
    constructor(rootDir) {
        this.rootDir = path.resolve(rootDir);
        this.supportedExtensions = new Set(['.py', '.js', '.ts', '.java', '.go', '.rb', '.php']);
        this.ignoreDirs = new Set([
            '.git', 'node_modules', 'venv', '__pycache__', '.venv', 'env',
            'build', 'dist', 'target', 'out', '.next', '.nuxt', 'vendor',
            'coverage', '.coverage', '.pytest_cache', '.mypy_cache'
        ]);
        this.gitignorePatterns = this._loadGitignore();
    }

    _loadGitignore() {
        const gitignorePath = path.join(this.rootDir, '.gitignore');
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

        // Check gitignore patterns
        for (const pattern of this.gitignorePatterns) {
            if (minimatch(relativePath, pattern) || minimatch(path.basename(filePath), pattern)) {
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
                    if (this.supportedExtensions.has(ext)) {
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