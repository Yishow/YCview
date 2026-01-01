import { useState, useCallback } from 'react';
import type { CopyOptions, MoveOptions, DeleteOptions } from '../../shared/types';

export interface UseFileOperationsReturn {
  isLoading: boolean;
  error: string | null;
  copy: (sources: string[], destination: string, options?: CopyOptions) => Promise<boolean>;
  move: (sources: string[], destination: string, options?: MoveOptions) => Promise<boolean>;
  deleteFiles: (paths: string[], options?: DeleteOptions) => Promise<boolean>;
  rename: (oldPath: string, newName: string) => Promise<boolean>;
  createDirectory: (parentPath: string, name: string) => Promise<boolean>;
  clearError: () => void;
}

export const useFileOperations = (): UseFileOperationsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleOperation = async <T>(
    operation: () => Promise<{ success: boolean; data?: T; error?: { message: string } }>,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      if (!result.success) {
        setError(result.error?.message || 'Unknown error occurred');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const copy = useCallback(
    async (sources: string[], destination: string, options?: CopyOptions) => {
      return handleOperation(() => window.api.file.copy(sources, destination, options));
    },
    [],
  );

  const move = useCallback(
    async (sources: string[], destination: string, options?: MoveOptions) => {
      return handleOperation(() => window.api.file.move(sources, destination, options));
    },
    [],
  );

  const deleteFiles = useCallback(async (paths: string[], options?: DeleteOptions) => {
    return handleOperation(() => window.api.file.delete(paths, options));
  }, []);

  const rename = useCallback(async (oldPath: string, newName: string) => {
    return handleOperation(() => window.api.file.rename(oldPath, newName));
  }, []);

  const createDirectory = useCallback(async (parentPath: string, name: string) => {
    return handleOperation(() => window.api.file.createDirectory(parentPath, name));
  }, []);

  return {
    isLoading,
    error,
    copy,
    move,
    deleteFiles,
    rename,
    createDirectory,
    clearError,
  };
};
