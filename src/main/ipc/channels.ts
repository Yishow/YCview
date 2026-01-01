export const IPC_CHANNELS = {
  // file read operations
  FILE_READ_DIRECTORY: 'file:read-directory',
  FILE_GET_INFO: 'file:get-info',
  FILE_GET_DRIVES: 'file:get-drives',

  // file write operations
  FILE_COPY: 'file:copy',
  FILE_MOVE: 'file:move',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',
  FILE_CREATE_DIRECTORY: 'file:create-directory',

  // settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // system
  SYSTEM_GET_INFO: 'system:get-info',
  SYSTEM_GET_PLATFORM: 'system:get-platform',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
