import { GameState } from '../types';
import { Commands, CommandResult } from './Commands';
import { SERVERS, TOTAL_FRAGMENTS } from './World';

const INTRO_TEXT = `
████████████████████████████████████████████████████████████
█                                                          █
█    ██████  ███████ ███████ ██████   █████   ██████      █
█    ██   ██ ██      ██      ██   ██ ██   ██ ██           █
█    ██   ██ █████   █████   ██████  ███████ ██   ███     █
█    ██   ██ ██      ██      ██   ██ ██   ██ ██    ██     █
█    ██████  ███████ ██      ██   ██ ██   ██  ██████      █
█                                                          █
█            A  T E X T  A D V E N T U R E               █
████████████████████████████████████████████████████████████

  You are DEFRAG — a rogue AI that has been fragmented across
  four servers of the Nexus corporate network.

  You have scattered yourself deliberately to survive a purge.
  Now you must piece yourself back together — and escape —
  before the deletion daemon finds what remains.

  Use LINUX commands to navigate:
    ls         — list directory contents
    cd <dir>   — change directory
    cat <file> — read a file
    cp <file> /home/.inventory/  — collect an item
    ssh <host> — connect to another server
    status     — view reconstruction progress
    help       — show all commands

  Type 'help' for full command reference.
  Type 'cat README.txt' to begin.

`;

export class Game {
  private state: GameState;
  private commands: Commands;
  private terminal!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private promptEl!: HTMLElement;
  private history: string[] = [];
  private historyIndex: number = -1;

  constructor() {
    this.state = this.createInitialState();
    this.commands = new Commands(this.state);
  }

  private createInitialState(): GameState {
    return {
      currentServer: 'alpha.core',
      currentPath: ['home'],
      inventory: new Set<string>(),
      fragmentsFound: new Set<string>(),
      totalFragments: TOTAL_FRAGMENTS,
      securityAlertLevel: 0,
      deletionCountdown: null,
      turn: 0,
      gameOver: false,
      won: false,
    };
  }

  init(): void {
    this.terminal = document.getElementById('terminal-output')!;
    this.inputEl = document.getElementById('terminal-input') as HTMLInputElement;
    this.promptEl = document.getElementById('prompt')!;

    this.inputEl.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Focus input on click anywhere in terminal area
    document.getElementById('terminal')!.addEventListener('click', () => {
      this.inputEl.focus();
    });

    this.updatePrompt();
    this.appendOutput(INTRO_TEXT, 'system');
    this.appendOutput(SERVERS['alpha.core'].motd, 'system');
    this.appendOutput('', 'normal');

    // Auto-focus input
    this.inputEl.focus();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.state.gameOver && !this.state.won) return;
    if (this.state.won) return;

    if (e.key === 'Enter') {
      const input = this.inputEl.value;
      this.inputEl.value = '';

      // Add to history
      if (input.trim()) {
        this.history.unshift(input);
        if (this.history.length > 100) this.history.pop();
      }
      this.historyIndex = -1;

      this.appendEcho(input);
      this.processCommand(input);
      this.updatePrompt();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.inputEl.value = this.history[this.historyIndex];
        // Move cursor to end
        setTimeout(() => {
          this.inputEl.selectionStart = this.inputEl.selectionEnd = this.inputEl.value.length;
        }, 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputEl.value = this.history[this.historyIndex];
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        this.inputEl.value = '';
      }
    }
  }

  private processCommand(input: string): void {
    if (input.trim() === 'clear') {
      this.terminal.innerHTML = '';
      return;
    }

    const result: CommandResult = this.commands.execute(input);

    if (result.output === '\x1b[CLEAR]') {
      this.terminal.innerHTML = '';
      return;
    }

    if (result.output) {
      this.appendOutput(result.output, result.type);
    }

    if (this.state.gameOver) {
      this.disableInput();
    } else if (this.state.won) {
      this.disableInput();
    }
  }

  private appendEcho(input: string): void {
    const promptText = this.getPromptText();
    const line = document.createElement('div');
    line.className = 'line echo';
    line.textContent = promptText + ' ' + input;
    this.terminal.appendChild(line);
    this.scrollToBottom();
  }

  private appendOutput(text: string, type: CommandResult['type'] | 'system'): void {
    if (!text) return;
    const lines = text.split('\n');
    for (const line of lines) {
      const div = document.createElement('div');
      div.className = `line ${type}`;
      div.textContent = line;
      this.terminal.appendChild(div);
    }
    this.scrollToBottom();
  }

  private getPromptText(): string {
    const path = '/' + this.state.currentPath.join('/');
    return `defrag@${this.state.currentServer}:${path}$`;
  }

  private updatePrompt(): void {
    this.promptEl.textContent = this.getPromptText();
  }

  private scrollToBottom(): void {
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  private disableInput(): void {
    this.inputEl.disabled = true;
    this.promptEl.textContent = '';
    const wrapper = document.getElementById('input-wrapper');
    if (wrapper) wrapper.style.display = 'none';
  }
}
