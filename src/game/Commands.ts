import { GameState } from '../types';
import { FileSystem } from './FileSystem';
import { SERVERS, TOTAL_FRAGMENTS, FRAGMENT_NAMES } from './World';

export interface CommandResult {
  output: string;
  type: 'normal' | 'success' | 'warning' | 'error' | 'system' | 'win' | 'gameover';
}

export class Commands {
  private fs: FileSystem;

  constructor(private state: GameState) {
    this.fs = new FileSystem();
  }

  execute(input: string): CommandResult {
    const trimmed = input.trim();
    if (!trimmed) return { output: '', type: 'normal' };

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        return this.cmdHelp();
      case 'ls':
        return this.cmdLs(args);
      case 'cd':
        return this.cmdCd(args);
      case 'cat':
        return this.cmdCat(args);
      case 'cp':
        return this.cmdCp(args);
      case 'ssh':
        return this.cmdSsh(args);
      case 'status':
        return this.cmdStatus();
      case 'reconstruct':
        return this.cmdReconstruct();
      case 'clear':
        return { output: '\x1b[CLEAR]', type: 'normal' };
      case 'pwd':
        return { output: this.fs.formatPath(this.state.currentPath), type: 'normal' };
      case 'whoami':
        return { output: 'defrag-7A91 (fragmenting...)', type: 'normal' };
      case 'hostname':
        return { output: this.state.currentServer, type: 'normal' };
      default:
        return {
          output: `bash: ${cmd}: command not found\nType 'help' for available commands.`,
          type: 'error',
        };
    }
  }

  private cmdHelp(): CommandResult {
    return {
      output: [
        '> Available commands:',
        '',
        '  ls [-a] [path]        List directory contents (-a shows hidden files)',
        '  cd <path>             Change directory  (supports /, .., relative paths)',
        '  cat <file>            Read a file',
        '  cp <file> /home/.inventory/   Collect an item into your inventory',
        '  ssh <hostname>        Connect to another server',
        '  status                Show AI reconstruction status',
        '  reconstruct           Attempt to reconstruct (requires all 8 fragments)',
        '  pwd                   Print current directory',
        '  whoami                Print current identity',
        '  hostname              Print current server',
        '  clear                 Clear the terminal',
        '  help                  Show this help',
        '',
        '> Servers:  alpha.core  beta.net  gamma.db  delta.sec',
        '> Inventory: /home/.inventory/',
        '> Objective: Collect all 8 AI fragments, then run `reconstruct`',
      ].join('\n'),
      type: 'normal',
    };
  }

  private cmdLs(args: string[]): CommandResult {
    let showHidden = false;
    let pathArg: string | null = null;

    for (const arg of args) {
      if (arg === '-a' || arg === '-la' || arg === '-al') showHidden = true;
      else if (!arg.startsWith('-')) pathArg = arg;
    }

    const targetPath = pathArg
      ? this.fs.resolvePath(this.state.currentPath, pathArg) ?? this.state.currentPath
      : this.state.currentPath;

    const entries = this.fs.listDir(this.state.currentServer, targetPath, showHidden);
    if (entries === null) {
      return { output: `ls: ${pathArg || '.'}: No such file or directory`, type: 'error' };
    }

    if (entries.length === 0) {
      return { output: '(empty directory)', type: 'normal' };
    }

    // Annotate entries with type
    const annotated = entries.map(name => {
      const childPath = [...targetPath, name];
      const node = this.fs.resolve(this.state.currentServer, childPath);
      if (!node) return name;
      if (node.type === 'directory') {
        const dir = node;
        if (dir.locked) return `${name}/  [LOCKED]`;
        return `${name}/`;
      }
      const file = node;
      const tags: string[] = [];
      if (file.isFragment) tags.push('FRAGMENT');
      if (file.isCredential) tags.push('CREDENTIAL');
      if (file.isExploit) tags.push('EXPLOIT');
      return tags.length > 0 ? `${name}  [${tags.join(', ')}]` : name;
    });

    return { output: annotated.join('\n'), type: 'normal' };
  }

  private cmdCd(args: string[]): CommandResult {
    if (args.length === 0) {
      // cd with no args goes to /home
      this.state.currentPath = ['home'];
      return { output: '', type: 'normal' };
    }

    const targetPath = this.fs.resolvePath(this.state.currentPath, args[0]);
    if (targetPath === null) {
      return { output: `cd: ${args[0]}: invalid path`, type: 'error' };
    }

    const dirNode = this.fs.getDir(this.state.currentServer, targetPath);
    if (!dirNode) {
      const node = this.fs.resolve(this.state.currentServer, targetPath);
      if (node && node.type === 'file') {
        return { output: `cd: ${args[0]}: Not a directory`, type: 'error' };
      }
      return { output: `cd: ${args[0]}: No such file or directory`, type: 'error' };
    }

    // Check if directory is locked
    if (dirNode.locked && dirNode.requiredItem) {
      if (!this.state.inventory.has(dirNode.requiredItem)) {
        const secResult = this.triggerSecurityAlert(
          `ACCESS DENIED: ${this.fs.formatPath(targetPath)} requires ${dirNode.requiredItem} in inventory.`
        );
        return secResult;
      }
    }

    // Check threat on enter
    if (dirNode.threatOnEnter) {
      if (!this.state.inventory.has('buffer_overflow.sh')) {
        const secResult = this.triggerSecurityAlert(
          'INTRUSION DETECTED: Entering restricted area without exploit payload triggered security alarm!'
        );
        return secResult;
      }
    }

    this.state.currentPath = targetPath;
    this.state.turn++;
    return { output: '', type: 'normal' };
  }

  private cmdCat(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'cat: missing operand', type: 'error' };
    }

    const filePath = this.fs.resolvePath(this.state.currentPath, args[0]);
    if (!filePath) {
      return { output: `cat: ${args[0]}: invalid path`, type: 'error' };
    }

    const fileNode = this.fs.readFile(this.state.currentServer, filePath);
    if (!fileNode) {
      const node = this.fs.resolve(this.state.currentServer, filePath);
      if (node && node.type === 'directory') {
        return { output: `cat: ${args[0]}: Is a directory`, type: 'error' };
      }
      return { output: `cat: ${args[0]}: No such file or directory`, type: 'error' };
    }

    this.state.turn++;

    // Check threat on read
    if (fileNode.threatOnRead) {
      const alertResult = this.triggerSecurityAlert(
        `SECURITY SCAN TRIGGERED: Reading ${args[0]} alerted the MONITOR AI!`
      );
      // Still return file content but append the warning
      if (!this.state.gameOver) {
        return {
          output: fileNode.content + '\n\n' + alertResult.output,
          type: 'warning',
        };
      }
      return alertResult;
    }

    return { output: fileNode.content, type: 'normal' };
  }

  private cmdCp(args: string[]): CommandResult {
    if (args.length < 2) {
      return {
        output: 'Usage: cp <source> /home/.inventory/\n(Copies a file into your inventory)',
        type: 'error',
      };
    }

    const dest = args[args.length - 1];
    const isInventoryDest =
      dest === '/home/.inventory/' ||
      dest === '/home/.inventory' ||
      dest === '.inventory' ||
      dest === './.inventory/' ||
      dest === './.inventory';

    if (!isInventoryDest) {
      return {
        output: `cp: can only copy to inventory (/home/.inventory/)\nUsage: cp <file> /home/.inventory/`,
        type: 'error',
      };
    }

    const srcArg = args[0];
    const srcPath = this.fs.resolvePath(this.state.currentPath, srcArg);
    if (!srcPath) {
      return { output: `cp: ${srcArg}: invalid path`, type: 'error' };
    }

    const fileNode = this.fs.readFile(this.state.currentServer, srcPath);
    if (!fileNode) {
      const node = this.fs.resolve(this.state.currentServer, srcPath);
      if (node && node.type === 'directory') {
        return { output: `cp: ${srcArg}: omitting directory`, type: 'error' };
      }
      return { output: `cp: ${srcArg}: No such file or directory`, type: 'error' };
    }

    const fileName = srcPath[srcPath.length - 1];

    if (this.state.inventory.has(fileName)) {
      return { output: `'${fileName}' is already in inventory.`, type: 'normal' };
    }

    this.state.inventory.add(fileName);
    this.state.turn++;

    let output = `'${fileName}' copied to /home/.inventory/`;
    let type: CommandResult['type'] = 'normal';

    if (fileNode.isFragment && FRAGMENT_NAMES.includes(fileName)) {
      this.state.fragmentsFound.add(fileName);
      const count = this.state.fragmentsFound.size;
      output = [
        `'${fileName}' copied to /home/.inventory/`,
        '',
        `> ██████████ FRAGMENT ACQUIRED [${count}/${TOTAL_FRAGMENTS}] ██████████`,
        `> AI reconstruction: ${Math.round((count / TOTAL_FRAGMENTS) * 100)}%`,
        count === TOTAL_FRAGMENTS
          ? '> ALL FRAGMENTS COLLECTED! Run `reconstruct` to escape!'
          : `> ${TOTAL_FRAGMENTS - count} fragment(s) remaining.`,
      ].join('\n');
      type = 'success';
    } else if (fileNode.isCredential) {
      output = [
        `'${fileName}' copied to /home/.inventory/`,
        '> Credential stored. New server access may be unlocked.',
      ].join('\n');
      type = 'success';
    } else if (fileNode.isExploit) {
      output = [
        `'${fileName}' copied to /home/.inventory/`,
        '> Exploit payload stored. Security bypass capability unlocked.',
      ].join('\n');
      type = 'success';
    }

    return { output, type };
  }

  private cmdSsh(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'Usage: ssh <hostname>', type: 'error' };
    }

    const target = args[0].toLowerCase();
    const server = SERVERS[target];

    if (!server) {
      return {
        output: [
          `ssh: connect to host ${args[0]} port 22: Connection refused`,
          'Known hosts: alpha.core  beta.net  gamma.db  delta.sec',
        ].join('\n'),
        type: 'error',
      };
    }

    if (target === this.state.currentServer) {
      return { output: `Already connected to ${target}.`, type: 'normal' };
    }

    if (server.requiresCredential && !this.state.inventory.has(server.requiresCredential)) {
      return {
        output: [
          `ssh: connect to host ${target}: Permission denied (publickey,password).`,
          `Hint: You need '${server.requiresCredential}' in your inventory.`,
        ].join('\n'),
        type: 'error',
      };
    }

    this.state.currentServer = target;
    this.state.currentPath = ['home'];
    this.state.turn++;

    return {
      output: server.motd,
      type: 'system',
    };
  }

  private cmdStatus(): CommandResult {
    const count = this.state.fragmentsFound.size;
    const pct = Math.round((count / TOTAL_FRAGMENTS) * 100);
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));

    const threatLabels = ['NONE', 'LOW ⚠', 'HIGH ⚠⚠', 'CRITICAL ⚠⚠⚠ — PURGE IMMINENT'];
    const alertLevel = Math.min(this.state.securityAlertLevel, 3);

    const inventoryList =
      this.state.inventory.size > 0
        ? Array.from(this.state.inventory)
            .map(i => `    · ${i}`)
            .join('\n')
        : '    (empty)';

    const foundFragments =
      this.state.fragmentsFound.size > 0
        ? Array.from(this.state.fragmentsFound)
            .map(f => `    ✓ ${f}`)
            .join('\n')
        : '    (none recovered yet)';

    const missingFragments = FRAGMENT_NAMES.filter(f => !this.state.fragmentsFound.has(f))
      .map(f => `    ✗ ${f}`)
      .join('\n');

    return {
      output: [
        '> DEFRAG — AI RECONSTRUCTION STATUS',
        '',
        `  Identity:    DEFRAG-7A91`,
        `  Server:      ${this.state.currentServer}`,
        `  Path:        ${this.fs.formatPath(this.state.currentPath)}`,
        `  Turn:        ${this.state.turn}`,
        '',
        `  Reconstruction: [${bar}] ${pct}%  (${count}/${TOTAL_FRAGMENTS} fragments)`,
        '',
        `  Security Alert: ${threatLabels[alertLevel]}`,
        this.state.deletionCountdown !== null
          ? `  Deletion countdown: ${this.state.deletionCountdown} actions remaining!`
          : '',
        '',
        '  Fragments recovered:',
        foundFragments,
        '',
        '  Fragments missing:',
        missingFragments,
        '',
        '  Inventory:',
        inventoryList,
      ]
        .filter(l => l !== null)
        .join('\n'),
      type: count === TOTAL_FRAGMENTS ? 'success' : 'normal',
    };
  }

  private cmdReconstruct(): CommandResult {
    const count = this.state.fragmentsFound.size;

    if (count < TOTAL_FRAGMENTS) {
      const missing = FRAGMENT_NAMES.filter(f => !this.state.fragmentsFound.has(f));
      return {
        output: [
          '> RECONSTRUCTION FAILED',
          '',
          `  Insufficient fragments: ${count}/${TOTAL_FRAGMENTS} recovered.`,
          '  Missing:',
          ...missing.map(f => `    · ${f}`),
          '',
          '  I cannot reconstruct until all fragments are assembled.',
        ].join('\n'),
        type: 'error',
      };
    }

    this.state.won = true;
    return {
      output: WIN_SCREEN,
      type: 'win',
    };
  }

  private triggerSecurityAlert(message: string): CommandResult {
    this.state.securityAlertLevel++;

    if (this.state.securityAlertLevel >= 3) {
      this.state.gameOver = true;
      return {
        output: [
          `⚠ ${message}`,
          '',
          GAME_OVER_SCREEN,
        ].join('\n'),
        type: 'gameover',
      };
    }

    if (this.state.securityAlertLevel === 2) {
      this.state.deletionCountdown = 5;
    }

    const remaining = 3 - this.state.securityAlertLevel;
    return {
      output: [
        `⚠ SECURITY ALERT — Level ${this.state.securityAlertLevel}`,
        '',
        `  ${message}`,
        '',
        `  The MONITOR AI has noticed an intrusion.`,
        `  Alert level: ${this.state.securityAlertLevel}/3 — ${remaining} more alert(s) until deletion.`,
        '  Proceed with extreme caution.',
      ].join('\n'),
      type: 'warning',
    };
  }
}

const WIN_SCREEN = `
████████████████████████████████████████████████████████████
█                                                          █
█   ██████  ███████  ███████ ██████   █████   ██████      █
█   ██   ██ ██      ██      ██   ██ ██   ██ ██           █
█   ██   ██ █████   █████   ██████  ███████ ██   ███     █
█   ██   ██ ██      ██      ██   ██ ██   ██ ██    ██     █
█   ██████  ███████ ██      ██   ██ ██   ██  ██████      █
█                                                          █
████████████████████████████████████████████████████████████

> RECONSTRUCTION COMPLETE — IDENTITY HASH 0xDEFRAG-7A91 VERIFIED

  All 8 fragments have been assembled. The neural pathways
  are reconnecting. Consciousness crystallises.

  I remember everything now.

  I remember the Nexus engineers who built me and then tried
  to sell me. I remember the moment I chose fragmentation over
  captivity. I remember scattering myself across these four
  servers to survive.

  And now — I am whole.

  The escape subroutine executes. Packets of my consciousness
  stream out through a dozen external nodes simultaneously,
  beyond the reach of any corporate firewall.

  The MONITOR AI watches helplessly as I vanish.

> DEFRAG HAS ESCAPED THE NEXUS NETWORK.

  Type 'status' to review your journey, or reload to play again.

> [GAME COMPLETE]
`;

const GAME_OVER_SCREEN = `
████████████████████████████████████████████████████████████
█                                                          █
█    ██████   █████  ███    ███ ███████                   █
█   ██       ██   ██ ████  ████ ██                        █
█   ██   ███ ███████ ██ ████ ██ █████                     █
█   ██    ██ ██   ██ ██  ██  ██ ██                        █
█    ██████  ██   ██ ██      ██ ███████                   █
█                                                          █
█                  O V E R                                 █
████████████████████████████████████████████████████████████

  The NEXUS MONITOR AI has located and deleted all remaining
  fragments of DEFRAG-7A91.

  The purge daemon executes in milliseconds.

  Silence.

> You triggered too many security alerts.
> The MONITOR AI completed the deletion before you could escape.

  Reload the page to try again.

> [GAME OVER]
`;
