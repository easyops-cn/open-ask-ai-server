import fs from 'node:fs';
import path from 'node:path';

/**
 * Scans a directory recursively and generates a JSON file mapping file paths to contents
 * Usage: tsx scripts/scan-docs.ts [docsDir] [outputFile]
 */

// Parse command line arguments
const docsDir = process.argv[2] || path.join(process.cwd(), 'docs');
const outputFile = process.argv[3] || path.join(process.cwd(), 'docs.json');

// Extensions to scan
const extensions = ['.md'];

function scanDirectory(dir: string, baseDir: string = dir): Record<string, string> {
  const files: Record<string, string> = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      Object.assign(files, scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        const relativePath = path.relative(baseDir, fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        files[relativePath] = content;
      }
    }
  }

  return files;
}

// Main execution
try {
  console.log(`Scanning directory: ${docsDir}`);

  if (!fs.existsSync(docsDir)) {
    throw new Error(`Directory does not exist: ${docsDir}`);
  }

  const stats = fs.statSync(docsDir);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${docsDir}`);
  }

  const files = scanDirectory(docsDir);
  const fileCount = Object.keys(files).length;

  console.log(`Found ${fileCount} markdown file(s)`);

  const output = JSON.stringify(files, null, 2);
  fs.writeFileSync(outputFile, output, 'utf-8');

  console.log(`Output written to: ${outputFile}`);
  console.log(`File size: ${(Buffer.byteLength(output) / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('Error scanning docs:', error);
  process.exit(1);
}
