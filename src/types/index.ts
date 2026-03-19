export type NodeType = 'file' | 'directory';

export interface FileNode {
  type: 'file';
  content: string;
  hidden?: boolean;
  isFragment?: boolean;
  isCredential?: boolean;
  isExploit?: boolean;
  locked?: boolean;
  requiredItem?: string;
  threatOnRead?: boolean;
}

export interface DirNode {
  type: 'directory';
  children: Record<string, FsNode>;
  hidden?: boolean;
  locked?: boolean;
  requiredItem?: string;
  threatOnEnter?: boolean;
}

export type FsNode = FileNode | DirNode;

export interface Server {
  hostname: string;
  description: string;
  motd: string;
  filesystem: DirNode;
  requiresCredential?: string;
}

export interface GameState {
  currentServer: string;
  currentPath: string[];
  inventory: Set<string>;
  fragmentsFound: Set<string>;
  totalFragments: number;
  securityAlertLevel: number;
  deletionCountdown: number | null;
  turn: number;
  gameOver: boolean;
  won: boolean;
}
