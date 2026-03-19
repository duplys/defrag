import { FsNode, DirNode, FileNode } from '../types';
import { SERVERS } from './World';

export class FileSystem {
  /** Resolve a path array to a node, or null if not found. */
  resolve(server: string, pathParts: string[]): FsNode | null {
    const srv = SERVERS[server];
    if (!srv) return null;

    let node: FsNode = srv.filesystem;
    for (const part of pathParts) {
      if (node.type !== 'directory') return null;
      const child: import('../types').FsNode | undefined = node.children[part];
      if (!child) return null;
      node = child;
    }
    return node;
  }

  /** List directory contents. Returns null if not a directory. */
  listDir(server: string, pathParts: string[], showHidden: boolean = false): string[] | null {
    const node = this.resolve(server, pathParts);
    if (!node || node.type !== 'directory') return null;
    const entries = Object.keys(node.children);
    if (showHidden) return entries;
    return entries.filter(name => !name.startsWith('.'));
  }

  /** Get file content. Returns null if not a file. */
  readFile(server: string, pathParts: string[]): FileNode | null {
    const node = this.resolve(server, pathParts);
    if (!node || node.type !== 'file') return null;
    return node;
  }

  /** Check whether a path exists as a directory. */
  isDir(server: string, pathParts: string[]): boolean {
    const node = this.resolve(server, pathParts);
    return node !== null && node.type === 'directory';
  }

  /** Resolve a relative or absolute path string against a current path. */
  resolvePath(currentPath: string[], input: string): string[] | null {
    if (input === '/') return [];
    const parts = input.startsWith('/') ? [] : [...currentPath];
    const segments = input.replace(/^\//, '').split('/').filter(s => s.length > 0);
    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') {
        if (parts.length > 0) parts.pop();
      } else {
        parts.push(seg);
      }
    }
    return parts;
  }

  /** Format a path array as a string. */
  formatPath(pathParts: string[]): string {
    return '/' + pathParts.join('/');
  }

  /** Get just the directory node at a path (for lock checks). */
  getDir(server: string, pathParts: string[]): DirNode | null {
    const node = this.resolve(server, pathParts);
    if (!node || node.type !== 'directory') return null;
    return node;
  }
}
