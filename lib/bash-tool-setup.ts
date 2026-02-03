import { OverlayFs } from 'just-bash/fs/overlay-fs';
import { createBashTool } from 'bash-tool';
import type { BashToolConfig } from './types';

/**
 * Creates bash tools with OverlayFs for read-only access to documentation
 *
 * @param config - Configuration for bash tool setup
 * @returns Object containing bash, readFile, and writeFile tools
 */
export async function createBashTools(config: BashToolConfig) {
  const { docsDirectory, readOnly } = config;

  // Create OverlayFs instance
  // Reads come from the real filesystem (docsDirectory)
  // Writes stay in memory and are discarded after execution
  const overlayFs = new OverlayFs({
    root: docsDirectory
  });

  // Create bash tools with the OverlayFs
  const { tools } = await createBashTool({
    fs: overlayFs,
    cwd: overlayFs.getMountPoint(),
  });

  return { tools };
}

/**
 * Validate that the docs directory exists and contains markdown files
 */
export function validateDocsDirectory(docsDir: string): { valid: boolean; error?: string } {
  try {
    const fs = require('fs');
    const path = require('path');

    // Check if directory exists
    if (!fs.existsSync(docsDir)) {
      return {
        valid: false,
        error: `Documentation directory does not exist: ${docsDir}`
      };
    }

    // Check if it's a directory
    const stats = fs.statSync(docsDir);
    if (!stats.isDirectory()) {
      return {
        valid: false,
        error: `Path is not a directory: ${docsDir}`
      };
    }

    // Check if it contains any .md files
    const hasMarkdownFiles = fs.readdirSync(docsDir, { recursive: true })
      .some((file: string) => file.endsWith('.md'));

    if (!hasMarkdownFiles) {
      return {
        valid: false,
        error: `No markdown files found in: ${docsDir}`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}
