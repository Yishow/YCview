import fs from 'node:fs';
import crypto from 'node:crypto';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

export interface HashProgress {
  filePath: string;
  bytesRead: number;
  totalBytes: number;
  percentage: number;
}

export interface HashResult {
  success: boolean;
  algorithm: HashAlgorithm;
  hash?: string;
  error?: string;
}

export interface HashVerifyResult {
  match: boolean;
  actualHash: string;
}

const PROGRESS_INTERVAL = 1024 * 1024; // 1MB

async function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats.size);
      }
    });
  });
}

async function calculateFileHash(
  filePath: string,
  algorithm: HashAlgorithm,
  onProgress?: (progress: HashProgress) => void,
): Promise<string> {
  const totalBytes = await getFileSize(filePath);
  const hash = crypto.createHash(algorithm);
  const stream = fs.createReadStream(filePath);

  let bytesRead = 0;
  let lastReportedBytes = 0;

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer | string) => {
      hash.update(chunk);
      const chunkLength = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
      bytesRead += chunkLength;

      if (onProgress && bytesRead - lastReportedBytes >= PROGRESS_INTERVAL) {
        lastReportedBytes = bytesRead;
        onProgress({
          filePath,
          bytesRead,
          totalBytes,
          percentage: totalBytes > 0 ? Math.round((bytesRead / totalBytes) * 100) : 0,
        });
      }
    });

    stream.on('end', () => {
      if (onProgress && bytesRead !== lastReportedBytes) {
        onProgress({
          filePath,
          bytesRead,
          totalBytes,
          percentage: 100,
        });
      }
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

export async function calculate(
  filePath: string,
  algorithm: HashAlgorithm,
  onProgress?: (progress: HashProgress) => void,
): Promise<HashResult> {
  try {
    const hash = await calculateFileHash(filePath, algorithm, onProgress);
    return {
      success: true,
      algorithm,
      hash,
    };
  } catch (error) {
    return {
      success: false,
      algorithm,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function calculateBatch(
  filePaths: string[],
  algorithm: HashAlgorithm,
  onProgress?: (progress: HashProgress) => void,
): Promise<Map<string, HashResult>> {
  const results = new Map<string, HashResult>();

  for (const filePath of filePaths) {
    const result = await calculate(filePath, algorithm, onProgress);
    results.set(filePath, result);
  }

  return results;
}

export async function verify(
  filePath: string,
  expectedHash: string,
  algorithm: HashAlgorithm,
): Promise<HashVerifyResult> {
  const result = await calculate(filePath, algorithm);

  if (!result.success || !result.hash) {
    return {
      match: false,
      actualHash: '',
    };
  }

  const normalizedExpected = expectedHash.toLowerCase().trim();
  const normalizedActual = result.hash.toLowerCase();

  return {
    match: normalizedExpected === normalizedActual,
    actualHash: result.hash,
  };
}

export const HashService = {
  calculate,
  calculateBatch,
  verify,
};

export default HashService;
