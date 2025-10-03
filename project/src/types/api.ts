export interface DetectorStatus {
  running: boolean;
  pid?: number;
  target?: string;
}

export interface AttackResult {
  target_dir: string;
  key_file: string;
  files_encrypted: number;
  total_size: number;
}

export interface FileInfo {
  path: string;
  size: number;
  encrypted: boolean;
}

export interface FilesResponse {
  ok: boolean;
  files: FileInfo[];
  target_dir: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  msg?: string;
  result?: T;
  e?: any;
}