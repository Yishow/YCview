export const IPC_CHANNELS = {
  FILE_READ_DIRECTORY: 'file:read-directory',
  FILE_GET_INFO: 'file:get-info',
  FILE_GET_DRIVES: 'file:get-drives',

  FILE_COPY: 'file:copy',
  FILE_MOVE: 'file:move',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',
  FILE_CREATE_DIRECTORY: 'file:create-directory',

  ARCHIVE_COMPRESS: 'archive:compress',
  ARCHIVE_EXTRACT: 'archive:extract',
  ARCHIVE_LIST: 'archive:list',
  ARCHIVE_PROGRESS: 'archive:progress',

  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  SYSTEM_GET_INFO: 'system:get-info',
  SYSTEM_GET_PLATFORM: 'system:get-platform',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
