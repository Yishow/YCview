import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { shell } from 'electron';

import {
  FileInfo,
  DriveInfo,
  DriveType,
  ReadDirectoryOptions,
  FileError,
  FileErrorCode,
  SortField,
  SortOrder,
  CopyOptions,
  MoveOptions,
  DeleteOptions,
  ConflictStrategy,
} from '../../shared/types';

const execAsync = promisify(exec);

function getExtension(filename: string, isDirectory: boolean): string {
  if (isDirectory) return '';
  const ext = path.extname(filename);
  return ext.startsWith('.') ? ext.slice(1).toLowerCase() : '';
}

function isHiddenUnix(filename: string): boolean {
  return filename.startsWith('.');
}

async function isHiddenWindows(filePath: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`attrib "${filePath}"`);
    return stdout.includes('H');
  } catch {
    return false;
  }
}

async function checkIsHidden(filePath: string, filename: string): Promise<boolean> {
  if (process.platform === 'win32') {
    return isHiddenWindows(filePath);
  }
  return isHiddenUnix(filename);
}

function mapNodeErrorToFileError(error: NodeJS.ErrnoException, filePath: string): FileError {
  switch (error.code) {
    case 'ENOENT':
      return new FileError(FileErrorCode.NOT_FOUND, `Path not found: ${filePath}`, filePath);
    case 'EACCES':
    case 'EPERM':
      return new FileError(
        FileErrorCode.PERMISSION_DENIED,
        `Permission denied: ${filePath}`,
        filePath,
      );
    case 'ENOTDIR':
      return new FileError(FileErrorCode.NOT_A_DIRECTORY, `Not a directory: ${filePath}`, filePath);
    case 'EEXIST':
      return new FileError(FileErrorCode.ALREADY_EXISTS, `Already exists: ${filePath}`, filePath);
    default:
      return new FileError(
        FileErrorCode.UNKNOWN_ERROR,
        `Unknown error: ${error.message}`,
        filePath,
      );
  }
}

function createSorter(
  sortBy: SortField,
  sortOrder: SortOrder,
): (a: FileInfo, b: FileInfo) => number {
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  return (a: FileInfo, b: FileInfo): number => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }

    switch (sortBy) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      case 'size':
        return multiplier * (a.size - b.size);
      case 'date':
        return multiplier * (a.modifiedTime.getTime() - b.modifiedTime.getTime());
      case 'extension':
        return (
          multiplier * a.extension.localeCompare(b.extension, undefined, { sensitivity: 'base' })
        );
      default:
        return 0;
    }
  };
}

export async function getFileInfo(filePath: string): Promise<FileInfo> {
  try {
    const stats = await fs.stat(filePath);
    const filename = path.basename(filePath);
    const isDirectory = stats.isDirectory();
    const isHidden = await checkIsHidden(filePath, filename);

    return {
      name: filename,
      path: filePath,
      size: isDirectory ? 0 : stats.size,
      isDirectory,
      isHidden,
      modifiedTime: stats.mtime,
      createdTime: stats.birthtime,
      extension: getExtension(filename, isDirectory),
    };
  } catch (error) {
    throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, filePath);
  }
}

export async function readDirectory(
  dirPath: string,
  options: ReadDirectoryOptions = {},
): Promise<FileInfo[]> {
  const { showHidden = false, sortBy = 'name', sortOrder = 'asc' } = options;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const fileInfoPromises: Promise<FileInfo | null>[] = entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);

      try {
        const stats = await fs.stat(fullPath);
        const isDirectory = entry.isDirectory();
        const isHidden = await checkIsHidden(fullPath, entry.name);

        if (!showHidden && isHidden) {
          return null;
        }

        return {
          name: entry.name,
          path: fullPath,
          size: isDirectory ? 0 : stats.size,
          isDirectory,
          isHidden,
          modifiedTime: stats.mtime,
          createdTime: stats.birthtime,
          extension: getExtension(entry.name, isDirectory),
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fileInfoPromises);
    const validResults = results.filter((item): item is FileInfo => item !== null);

    return validResults.sort(createSorter(sortBy, sortOrder));
  } catch (error) {
    throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, dirPath);
  }
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function getWindowsDrives(): Promise<DriveInfo[]> {
  try {
    const { stdout } = await execAsync(
      'wmic logicaldisk get caption,volumename,drivetype,size,freespace /format:csv',
    );

    const lines = stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    if (lines.length < 2) return [];

    const drives: DriveInfo[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length < 5) continue;

      const name = parts[1]?.trim();
      const driveTypeCode = parseInt(parts[2]?.trim() || '0', 10);
      const freeSpace = parseInt(parts[3]?.trim() || '0', 10);
      const totalSpace = parseInt(parts[4]?.trim() || '0', 10);
      const volumeName = parts[5]?.trim() || '';

      if (!name) continue;

      let driveType: DriveType = 'unknown';
      switch (driveTypeCode) {
        case 2:
          driveType = 'removable';
          break;
        case 3:
          driveType = 'fixed';
          break;
        case 4:
          driveType = 'network';
          break;
        case 5:
          driveType = 'cdrom';
          break;
      }

      drives.push({
        name,
        label: volumeName || `Local Disk (${name})`,
        type: driveType,
        totalSpace: isNaN(totalSpace) ? 0 : totalSpace,
        freeSpace: isNaN(freeSpace) ? 0 : freeSpace,
      });
    }

    return drives;
  } catch {
    const defaultDrives: DriveInfo[] = [];
    for (const letter of ['C', 'D', 'E', 'F']) {
      const drivePath = `${letter}:`;
      if (await exists(drivePath)) {
        defaultDrives.push({
          name: drivePath,
          label: `Local Disk (${drivePath})`,
          type: 'fixed',
          totalSpace: 0,
          freeSpace: 0,
        });
      }
    }
    return defaultDrives;
  }
}

async function getUnixDrives(): Promise<DriveInfo[]> {
  const drives: DriveInfo[] = [];

  try {
    const rootStats = await fs.statfs('/');
    drives.push({
      name: '/',
      label: process.platform === 'darwin' ? 'Macintosh HD' : 'Root',
      type: 'fixed',
      totalSpace: rootStats.bsize * rootStats.blocks,
      freeSpace: rootStats.bsize * rootStats.bfree,
    });
  } catch {
    drives.push({
      name: '/',
      label: process.platform === 'darwin' ? 'Macintosh HD' : 'Root',
      type: 'fixed',
      totalSpace: 0,
      freeSpace: 0,
    });
  }

  const homeDir = process.env['HOME'];
  if (homeDir && homeDir !== '/' && (await exists(homeDir))) {
    drives.push({
      name: homeDir,
      label: 'Home',
      type: 'fixed',
      totalSpace: 0,
      freeSpace: 0,
    });
  }

  if (process.platform === 'darwin' && (await exists('/Volumes'))) {
    const volumesEntries = await fs.readdir('/Volumes', { withFileTypes: true }).catch(() => []);
    for (const entry of volumesEntries) {
      if (entry.isDirectory() && entry.name !== 'Macintosh HD') {
        const volumePath = path.join('/Volumes', entry.name);
        try {
          const volStats = await fs.statfs(volumePath);
          drives.push({
            name: volumePath,
            label: entry.name,
            type: 'removable',
            totalSpace: volStats.bsize * volStats.blocks,
            freeSpace: volStats.bsize * volStats.bfree,
          });
        } catch {
          drives.push({
            name: volumePath,
            label: entry.name,
            type: 'removable',
            totalSpace: 0,
            freeSpace: 0,
          });
        }
      }
    }
  }

  return drives;
}

export async function getDrives(): Promise<DriveInfo[]> {
  if (process.platform === 'win32') {
    return getWindowsDrives();
  }
  return getUnixDrives();
}

const INVALID_FILENAME_CHARS = /[/:*?"<>|\\]/;

function isValidFilename(name: string): boolean {
  if (!name || name.trim() === '') return false;
  if (name === '.' || name === '..') return false;
  return !INVALID_FILENAME_CHARS.test(name);
}

function generateUniqueName(basePath: string, name: string, isDir: boolean): string {
  const ext = isDir ? '' : path.extname(name);
  const baseName = isDir ? name : path.basename(name, ext);
  let counter = 1;
  let newName = name;
  let fullPath = path.join(basePath, newName);

  while (true) {
    try {
      fsSync.accessSync(fullPath);
      newName = ext ? `${baseName} (${counter})${ext}` : `${baseName} (${counter})`;
      fullPath = path.join(basePath, newName);
      counter++;
    } catch {
      break;
    }
  }
  return newName;
}

async function resolveConflict(
  destPath: string,
  destDir: string,
  name: string,
  isDir: boolean,
  strategy: ConflictStrategy,
): Promise<{ action: 'proceed' | 'skip'; resolvedPath: string }> {
  const fileExists = await exists(destPath);
  if (!fileExists) {
    return { action: 'proceed', resolvedPath: destPath };
  }

  switch (strategy) {
    case 'overwrite':
      return { action: 'proceed', resolvedPath: destPath };
    case 'skip':
      return { action: 'skip', resolvedPath: destPath };
    case 'rename': {
      const newName = generateUniqueName(destDir, name, isDir);
      return { action: 'proceed', resolvedPath: path.join(destDir, newName) };
    }
  }
}

async function copyFileWithTimestamp(
  source: string,
  dest: string,
  preserveTimestamps: boolean,
): Promise<void> {
  await fs.copyFile(source, dest);
  if (preserveTimestamps) {
    const stats = await fs.stat(source);
    await fs.utimes(dest, stats.atime, stats.mtime);
  }
}

async function copyDirectoryRecursive(
  source: string,
  dest: string,
  options: CopyOptions,
): Promise<void> {
  const { onConflict = 'skip', preserveTimestamps = true } = options;

  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    console.log(`[copy] Processing: ${srcPath}`);

    if (entry.isDirectory()) {
      const { action, resolvedPath } = await resolveConflict(
        destPath,
        dest,
        entry.name,
        true,
        onConflict,
      );
      if (action === 'skip') continue;
      await copyDirectoryRecursive(srcPath, resolvedPath, options);
    } else {
      const { action, resolvedPath } = await resolveConflict(
        destPath,
        dest,
        entry.name,
        false,
        onConflict,
      );
      if (action === 'skip') continue;
      await copyFileWithTimestamp(srcPath, resolvedPath, preserveTimestamps);
    }
  }

  if (preserveTimestamps) {
    const stats = await fs.stat(source);
    await fs.utimes(dest, stats.atime, stats.mtime);
  }
}

export async function copy(
  sources: string[],
  destination: string,
  options: CopyOptions = {},
): Promise<void> {
  const { onConflict = 'skip', preserveTimestamps = true } = options;

  const destIsDir = await isDirectory(destination);
  if (!destIsDir) {
    throw new FileError(
      FileErrorCode.NOT_A_DIRECTORY,
      `Destination is not a directory: ${destination}`,
      destination,
    );
  }

  for (const source of sources) {
    console.log(`[copy] Starting: ${source} -> ${destination}`);

    try {
      const stats = await fs.stat(source);
      const name = path.basename(source);
      const destPath = path.join(destination, name);

      const { action, resolvedPath } = await resolveConflict(
        destPath,
        destination,
        name,
        stats.isDirectory(),
        onConflict,
      );

      if (action === 'skip') {
        console.log(`[copy] Skipped: ${source}`);
        continue;
      }

      if (stats.isDirectory()) {
        await copyDirectoryRecursive(source, resolvedPath, { onConflict, preserveTimestamps });
      } else {
        await copyFileWithTimestamp(source, resolvedPath, preserveTimestamps);
      }

      console.log(`[copy] Completed: ${source}`);
    } catch (error) {
      throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, source);
    }
  }
}

function areSameDevice(path1: string, path2: string): boolean {
  if (process.platform === 'win32') {
    const drive1 = path.parse(path1).root.toUpperCase();
    const drive2 = path.parse(path2).root.toUpperCase();
    return drive1 === drive2;
  }
  return true;
}

export async function move(
  sources: string[],
  destination: string,
  options: MoveOptions = {},
): Promise<void> {
  const { onConflict = 'skip' } = options;

  const destIsDir = await isDirectory(destination);
  if (!destIsDir) {
    throw new FileError(
      FileErrorCode.NOT_A_DIRECTORY,
      `Destination is not a directory: ${destination}`,
      destination,
    );
  }

  for (const source of sources) {
    console.log(`[move] Starting: ${source} -> ${destination}`);

    try {
      const stats = await fs.stat(source);
      const name = path.basename(source);
      const destPath = path.join(destination, name);

      const { action, resolvedPath } = await resolveConflict(
        destPath,
        destination,
        name,
        stats.isDirectory(),
        onConflict,
      );

      if (action === 'skip') {
        console.log(`[move] Skipped: ${source}`);
        continue;
      }

      if (areSameDevice(source, destination)) {
        if (await exists(resolvedPath)) {
          await fs.rm(resolvedPath, { recursive: true });
        }
        await fs.rename(source, resolvedPath);
      } else {
        if (stats.isDirectory()) {
          await copyDirectoryRecursive(source, resolvedPath, {
            onConflict: 'overwrite',
            preserveTimestamps: true,
          });
        } else {
          await copyFileWithTimestamp(source, resolvedPath, true);
        }
        await fs.rm(source, { recursive: true });
      }

      console.log(`[move] Completed: ${source}`);
    } catch (error) {
      throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, source);
    }
  }
}

export async function deleteFiles(paths: string[], options: DeleteOptions = {}): Promise<void> {
  const { useTrash = true } = options;

  for (const filePath of paths) {
    console.log(`[delete] Starting: ${filePath}, useTrash: ${useTrash}`);

    try {
      if (!(await exists(filePath))) {
        throw new FileError(FileErrorCode.NOT_FOUND, `Path not found: ${filePath}`, filePath);
      }

      if (useTrash) {
        await shell.trashItem(filePath);
      } else {
        await fs.rm(filePath, { recursive: true });
      }

      console.log(`[delete] Completed: ${filePath}`);
    } catch (error) {
      if (error instanceof FileError) throw error;
      throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, filePath);
    }
  }
}

export async function rename(oldPath: string, newName: string): Promise<string> {
  console.log(`[rename] ${oldPath} -> ${newName}`);

  if (!isValidFilename(newName)) {
    throw new FileError(FileErrorCode.INVALID_NAME, `Invalid filename: ${newName}`, oldPath);
  }

  try {
    if (!(await exists(oldPath))) {
      throw new FileError(FileErrorCode.NOT_FOUND, `Path not found: ${oldPath}`, oldPath);
    }

    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);

    if (await exists(newPath)) {
      throw new FileError(FileErrorCode.ALREADY_EXISTS, `File already exists: ${newPath}`, newPath);
    }

    await fs.rename(oldPath, newPath);
    console.log(`[rename] Completed: ${newPath}`);
    return newPath;
  } catch (error) {
    if (error instanceof FileError) throw error;
    throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, oldPath);
  }
}

export async function createDirectory(parentPath: string, name: string): Promise<string> {
  console.log(`[createDirectory] ${parentPath}/${name}`);

  if (!isValidFilename(name)) {
    throw new FileError(FileErrorCode.INVALID_NAME, `Invalid directory name: ${name}`, parentPath);
  }

  try {
    if (!(await exists(parentPath))) {
      throw new FileError(
        FileErrorCode.NOT_FOUND,
        `Parent path not found: ${parentPath}`,
        parentPath,
      );
    }

    if (!(await isDirectory(parentPath))) {
      throw new FileError(
        FileErrorCode.NOT_A_DIRECTORY,
        `Parent is not a directory: ${parentPath}`,
        parentPath,
      );
    }

    const newPath = path.join(parentPath, name);

    if (await exists(newPath)) {
      throw new FileError(
        FileErrorCode.ALREADY_EXISTS,
        `Directory already exists: ${newPath}`,
        newPath,
      );
    }

    await fs.mkdir(newPath);
    console.log(`[createDirectory] Completed: ${newPath}`);
    return newPath;
  } catch (error) {
    if (error instanceof FileError) throw error;
    throw mapNodeErrorToFileError(error as NodeJS.ErrnoException, parentPath);
  }
}

export const FileService = {
  readDirectory,
  getFileInfo,
  getDrives,
  exists,
  isDirectory,
  copy,
  move,
  deleteFiles,
  rename,
  createDirectory,
};

export default FileService;
