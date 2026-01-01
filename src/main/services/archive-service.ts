import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import archiver, { type Archiver } from 'archiver';
import extractZip from 'extract-zip';
import * as tar from 'tar';

export type ArchiveFormat = 'zip' | 'tar' | 'tar.gz';

export interface CompressOptions {
  format: ArchiveFormat;
  level?: number;
  password?: string;
}

export interface ExtractOptions {
  password?: string;
  overwrite?: boolean;
}

export interface ArchiveEntry {
  name: string;
  path: string;
  size: number;
  compressedSize: number;
  isDirectory: boolean;
  modifiedTime: Date;
}

export interface ArchiveProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  totalBytes: number;
  processedBytes: number;
}

export interface CompressResult {
  success: boolean;
  path: string;
  error?: string;
}

export interface ExtractResult {
  success: boolean;
  extractedFiles: string[];
  error?: string;
}

export interface ListResult {
  success: boolean;
  entries: ArchiveEntry[];
  error?: string;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFilesRecursive(
  dirPath: string,
): Promise<{ path: string; isDirectory: boolean }[]> {
  const results: { path: string; isDirectory: boolean }[] = [];

  async function traverse(currentPath: string): Promise<void> {
    const stats = await fs.stat(currentPath);

    if (stats.isDirectory()) {
      results.push({ path: currentPath, isDirectory: true });
      const entries = await fs.readdir(currentPath);
      for (const entry of entries) {
        await traverse(path.join(currentPath, entry));
      }
    } else {
      results.push({ path: currentPath, isDirectory: false });
    }
  }

  await traverse(dirPath);
  return results;
}

async function countFilesAndBytes(
  sources: string[],
): Promise<{ totalFiles: number; totalBytes: number }> {
  let totalFiles = 0;
  let totalBytes = 0;

  for (const source of sources) {
    const stats = await fs.stat(source);
    if (stats.isDirectory()) {
      const files = await getFilesRecursive(source);
      for (const file of files) {
        if (!file.isDirectory) {
          totalFiles++;
          const fileStats = await fs.stat(file.path);
          totalBytes += fileStats.size;
        }
      }
    } else {
      totalFiles++;
      totalBytes += stats.size;
    }
  }

  return { totalFiles, totalBytes };
}

export function detectFormat(filePath: string): ArchiveFormat | 'unknown' {
  const ext = filePath.toLowerCase();
  if (ext.endsWith('.tar.gz') || ext.endsWith('.tgz')) {
    return 'tar.gz';
  } else if (ext.endsWith('.tar')) {
    return 'tar';
  } else if (ext.endsWith('.zip')) {
    return 'zip';
  }
  return 'unknown';
}

export async function compress(
  sources: string[],
  destination: string,
  options: CompressOptions,
  onProgress?: (progress: ArchiveProgress) => void,
): Promise<CompressResult> {
  const { format, level = 6 } = options;

  console.log(
    `[archive:compress] Starting compression: ${sources.length} sources -> ${destination}`,
  );

  try {
    for (const source of sources) {
      if (!(await pathExists(source))) {
        return { success: false, path: destination, error: `Source not found: ${source}` };
      }
    }

    const destDir = path.dirname(destination);
    await fs.mkdir(destDir, { recursive: true });

    const { totalFiles, totalBytes } = await countFilesAndBytes(sources);
    let processedFiles = 0;
    let processedBytes = 0;

    const reportProgress = (currentFile: string, fileBytes: number = 0): void => {
      processedBytes += fileBytes;
      if (onProgress) {
        onProgress({
          totalFiles,
          processedFiles,
          currentFile,
          totalBytes,
          processedBytes,
        });
      }
    };

    if (format === 'zip') {
      await compressZip(sources, destination, level, (file, bytes) => {
        processedFiles++;
        reportProgress(file, bytes);
      });
    } else if (format === 'tar' || format === 'tar.gz') {
      await compressTar(sources, destination, format === 'tar.gz', (file, bytes) => {
        processedFiles++;
        reportProgress(file, bytes);
      });
    } else {
      return { success: false, path: destination, error: `Unsupported format: ${format}` };
    }

    console.log(`[archive:compress] Completed: ${destination}`);
    return { success: true, path: destination };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[archive:compress] Error: ${errorMessage}`);
    return { success: false, path: destination, error: errorMessage };
  }
}

async function compressZip(
  sources: string[],
  destination: string,
  level: number,
  onFile: (file: string, bytes: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fsSync.createWriteStream(destination);
    const archive: Archiver = archiver('zip', {
      zlib: { level: Math.min(Math.max(level, 1), 9) },
    });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    archive.on('entry', (entry) => {
      onFile(entry.name, entry.stats?.size ?? 0);
    });

    archive.pipe(output);

    (async () => {
      for (const source of sources) {
        const stats = await fs.stat(source);
        const name = path.basename(source);

        if (stats.isDirectory()) {
          archive.directory(source, name);
        } else {
          archive.file(source, { name });
        }
      }
      await archive.finalize();
    })().catch(reject);
  });
}

async function compressTar(
  sources: string[],
  destination: string,
  gzip: boolean,
  onFile: (file: string, bytes: number) => void,
): Promise<void> {
  const files: string[] = [];
  const baseDirs: Map<string, string> = new Map();

  for (const source of sources) {
    const stats = await fs.stat(source);
    if (stats.isDirectory()) {
      const entries = await getFilesRecursive(source);
      for (const entry of entries) {
        files.push(entry.path);
      }
      baseDirs.set(source, path.dirname(source));
    } else {
      files.push(source);
      baseDirs.set(source, path.dirname(source));
    }
  }

  for (const file of files) {
    const stats = await fs.stat(file);
    if (!stats.isDirectory()) {
      onFile(path.basename(file), stats.size);
    }
  }

  const cwd = sources.length === 1 ? path.dirname(sources[0]) : process.cwd();
  const relativeFiles = sources.map((s) => path.relative(cwd, s));

  await tar.create(
    {
      file: destination,
      gzip,
      cwd,
    },
    relativeFiles,
  );
}

export async function extract(
  archive: string,
  destination: string,
  options?: ExtractOptions,
  onProgress?: (progress: ArchiveProgress) => void,
): Promise<ExtractResult> {
  const { overwrite = true } = options ?? {};

  console.log(`[archive:extract] Starting extraction: ${archive} -> ${destination}`);

  try {
    if (!(await pathExists(archive))) {
      return { success: false, extractedFiles: [], error: `Archive not found: ${archive}` };
    }

    await fs.mkdir(destination, { recursive: true });

    const format = detectFormat(archive);
    if (format === 'unknown') {
      return { success: false, extractedFiles: [], error: `Unknown archive format: ${archive}` };
    }

    const extractedFiles: string[] = [];

    if (format === 'zip') {
      await extractZipArchive(archive, destination, overwrite, extractedFiles, onProgress);
    } else {
      await extractTarArchive(
        archive,
        destination,
        format === 'tar.gz',
        extractedFiles,
        onProgress,
      );
    }

    console.log(`[archive:extract] Completed: ${extractedFiles.length} files extracted`);
    return { success: true, extractedFiles };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[archive:extract] Error: ${errorMessage}`);
    return { success: false, extractedFiles: [], error: errorMessage };
  }
}

async function extractZipArchive(
  archive: string,
  destination: string,
  _overwrite: boolean,
  extractedFiles: string[],
  onProgress?: (progress: ArchiveProgress) => void,
): Promise<void> {
  let processedFiles = 0;
  let processedBytes = 0;

  await extractZip(archive, {
    dir: destination,
    onEntry: (entry) => {
      processedFiles++;
      processedBytes += entry.compressedSize;
      extractedFiles.push(path.join(destination, entry.fileName));

      if (onProgress) {
        onProgress({
          totalFiles: 0,
          processedFiles,
          currentFile: entry.fileName,
          totalBytes: 0,
          processedBytes,
        });
      }
    },
  });
}

async function extractTarArchive(
  archive: string,
  destination: string,
  _gzip: boolean,
  extractedFiles: string[],
  onProgress?: (progress: ArchiveProgress) => void,
): Promise<void> {
  let processedFiles = 0;
  let processedBytes = 0;

  await tar.extract({
    file: archive,
    cwd: destination,
    onReadEntry: (entry) => {
      processedFiles++;
      processedBytes += entry.size ?? 0;
      extractedFiles.push(path.join(destination, entry.path));

      if (onProgress) {
        onProgress({
          totalFiles: 0,
          processedFiles,
          currentFile: entry.path,
          totalBytes: 0,
          processedBytes,
        });
      }
    },
  });
}

export async function list(archive: string): Promise<ListResult> {
  console.log(`[archive:list] Listing: ${archive}`);

  try {
    if (!(await pathExists(archive))) {
      return { success: false, entries: [], error: `Archive not found: ${archive}` };
    }

    const format = detectFormat(archive);
    if (format === 'unknown') {
      return { success: false, entries: [], error: `Unknown archive format: ${archive}` };
    }

    const entries: ArchiveEntry[] = [];

    if (format === 'zip') {
      await listZipArchive(archive, entries);
    } else {
      await listTarArchive(archive, entries);
    }

    console.log(`[archive:list] Found ${entries.length} entries`);
    return { success: true, entries };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[archive:list] Error: ${errorMessage}`);
    return { success: false, entries: [], error: errorMessage };
  }
}

async function listZipArchive(archive: string, entries: ArchiveEntry[]): Promise<void> {
  const yauzl = await import('yauzl');

  return new Promise((resolve, reject) => {
    yauzl.open(archive, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) {
        reject(err ?? new Error('Failed to open zip file'));
        return;
      }

      zipfile.readEntry();

      zipfile.on('entry', (entry) => {
        const isDirectory = entry.fileName.endsWith('/');
        entries.push({
          name: path.basename(entry.fileName.replace(/\/$/, '')),
          path: entry.fileName,
          size: entry.uncompressedSize,
          compressedSize: entry.compressedSize,
          isDirectory,
          modifiedTime: entry.getLastModDate(),
        });
        zipfile.readEntry();
      });

      zipfile.on('end', () => resolve());
      zipfile.on('error', (zipErr) => reject(zipErr));
    });
  });
}

async function listTarArchive(archive: string, entries: ArchiveEntry[]): Promise<void> {
  await tar.list({
    file: archive,
    onReadEntry: (entry) => {
      entries.push({
        name: path.basename(entry.path),
        path: entry.path,
        size: entry.size ?? 0,
        compressedSize: entry.size ?? 0,
        isDirectory: entry.type === 'Directory',
        modifiedTime: entry.mtime ?? new Date(),
      });
    },
  });
}

export const ArchiveService = {
  compress,
  extract,
  list,
  detectFormat,
};

export default ArchiveService;
