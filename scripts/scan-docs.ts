import fs from 'node:fs';
import path from 'node:path';

/**
 * Scans project directories and generates projects.generated.json with file contents
 * Usage: tsx scripts/scan-docs.ts
 */

// Extensions to scan
const extensions = ['.md', '.mdx'];

interface ProjectConfig {
  name: string;
  instructions?: string;
}

interface ProjectWithFiles extends ProjectConfig {
  files: Record<string, string>;
}

interface ProjectsConfig {
  [projectId: string]: ProjectConfig;
}

function scanDirectory(dir: string, baseDir: string = dir): Record<string, string> {
  const files: Record<string, string> = {};

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      Object.assign(files, scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        // Replace mdx extension with md for 'find' tool
        const relativePath = path.relative(baseDir, fullPath).replace(/\.mdx$/, ".md");
        const content = fs.readFileSync(fullPath, 'utf-8');
        files[relativePath] = content;
      }
    }
  }

  return files;
}

// Main execution
try {
  const projectsDir = path.join(process.cwd(), 'projects');
  const projectsJsonPath = path.join(projectsDir, 'projects.json');
  const generatedDir = path.join(projectsDir, 'generated');

  console.log(`Reading projects configuration from: ${projectsJsonPath}`);

  if (!fs.existsSync(projectsJsonPath)) {
    throw new Error(`projects.json not found at: ${projectsJsonPath}`);
  }

  // Create generated directory if it doesn't exist
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
    console.log(`Created directory: ${generatedDir}`);
  }

  // Read projects.json
  const projectsConfig: ProjectsConfig = JSON.parse(
    fs.readFileSync(projectsJsonPath, 'utf-8')
  );

  let totalFiles = 0;
  const generatedFiles: string[] = [];

  // Scan each project
  for (const [projectId, config] of Object.entries(projectsConfig)) {
    console.log(`\nScanning project: ${projectId} (${config.name})`);

    const projectDir = path.join(projectsDir, projectId);
    const outputFile = path.join(generatedDir, `${projectId}.json`);

    let files: Record<string, string> = {};

    if (!fs.existsSync(projectDir)) {
      console.warn(`  Warning: Project directory not found: ${projectDir}`);
    } else {
      files = scanDirectory(projectDir);
      const fileCount = Object.keys(files).length;
      totalFiles += fileCount;
      console.log(`  Found ${fileCount} markdown file(s)`);
    }

    const projectWithFiles: ProjectWithFiles = {
      ...config,
      files,
    };

    // Write individual project file
    const output = JSON.stringify(projectWithFiles, null, 2);
    fs.writeFileSync(outputFile, output, 'utf-8');
    generatedFiles.push(outputFile);

    console.log(`  ✓ Written to: ${outputFile}`);
    console.log(`  ✓ File size: ${(Buffer.byteLength(output) / 1024).toFixed(2)} KB`);
  }

  console.log(`\n✓ Successfully scanned ${Object.keys(projectsConfig).length} project(s)`);
  console.log(`✓ Total files: ${totalFiles}`);
  console.log(`✓ Generated files:`);
  generatedFiles.forEach(file => console.log(`  - ${file}`));
} catch (error) {
  console.error('Error scanning docs:', error);
  process.exit(1);
}
