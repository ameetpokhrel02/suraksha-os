/**
 * Suraksha OS - Terminal Engine
 * Real Terminal Experience with Command Parsing and Filesystem Simulation
 */

class SurakshaTerminal {
  constructor() {
    this.currentPath = '/home/citizen';
    this.commandHistory = JSON.parse(localStorage.getItem('suraksha_command_history')) || [];
    this.historyIndex = -1;
    this.suggestions = [];
    this.isBooting = true;
    
    // Initialize terminal elements
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeFileSystem();
    
    // Start boot sequence
    this.startBootSequence();
  }

  initializeElements() {
    this.terminalBody = document.getElementById('terminal-body');
    this.terminalInput = document.getElementById('terminal-input');
    this.terminalPrompt = document.getElementById('terminal-prompt');
    this.suggestionsContainer = document.getElementById('terminal-suggestions');
    this.bootScreen = document.getElementById('boot-screen');
    this.terminalContainer = document.getElementById('terminal-container');
  }

  initializeEventListeners() {
    // Input handling
    this.terminalInput?.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.terminalInput?.addEventListener('input', (e) => this.handleInput(e));
    
    // Focus management
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.terminal-suggestions')) {
        this.hideSuggestions();
      }
    });
    
    // Auto-focus terminal input
    document.addEventListener('keydown', (e) => {
      if (e.target !== this.terminalInput && !e.ctrlKey && !e.altKey && !e.metaKey) {
        this.terminalInput?.focus();
      }
    });
  }

  initializeFileSystem() {
    this.fileSystem = {
      '/': {
        type: 'directory',
        children: {
          'home': {
            type: 'directory',
            children: {
              'citizen': {
                type: 'directory',
                children: {
                  'awareness': {
                    type: 'directory',
                    description: 'Cybersecurity awareness modules',
                    children: {
                      'phishing.md': { type: 'file', description: 'Phishing awareness guide' },
                      'passwords.md': { type: 'file', description: 'Password security guide' },
                      'social-media.md': { type: 'file', description: 'Social media safety' }
                    }
                  },
                  'simulators': {
                    type: 'directory',
                    description: 'Interactive security simulators',
                    children: {
                      'scam-detector': { type: 'executable', description: 'Scam detection simulator' },
                      'phishing-test': { type: 'executable', description: 'Phishing awareness test' },
                      'social-sim': { type: 'executable', description: 'Social media simulator' }
                    }
                  },
                  'tools': {
                    type: 'directory',
                    description: 'Security tools and utilities',
                    children: {
                      'password-checker': { type: 'executable', description: 'Password strength checker' },
                      'privacy-audit': { type: 'executable', description: 'Privacy settings audit' },
                      'threat-scanner': { type: 'executable', description: 'Threat detection scanner' }
                    }
                  },
                  'rights': {
                    type: 'directory',
                    description: 'Digital rights and legal information',
                    children: {
                      'nepal-cyber-law.md': { type: 'file', description: 'Nepal cybersecurity laws' },
                      'citizen-rights.md': { type: 'file', description: 'Digital citizen rights' },
                      'reporting.md': { type: 'file', description: 'How to report cyber crimes' }
                    }
                  },
                  'missions': {
                    type: 'directory',
                    description: 'Gamified learning missions',
                    children: {
                      'mission-phishing': { type: 'executable', description: 'Phishing detection mission' },
                      'mission-password': { type: 'executable', description: 'Password security mission' },
                      'mission-privacy': { type: 'executable', description: 'Privacy protection mission' }
                    }
                  },
                  'emergency': {
                    type: 'directory',
                    description: 'Emergency cyber help resources',
                    children: {
                      'cyber-bureau.md': { type: 'file', description: 'Nepal Cyber Bureau contacts' },
                      'incident-report': { type: 'executable', description: 'Report cyber incident' },
                      'emergency-contacts.md': { type: 'file', description: 'Emergency contact list' }
                    }
                  }
                }
              }
            }
          },
          'system': {
            type: 'directory',
            children: {
              'themes': { type: 'directory', description: 'Terminal themes' },
              'settings': { type: 'directory', description: 'System settings' },
              'logs': { type: 'directory', description: 'System logs' }
            }
          }
        }
      }
    };
  }

  startBootSequence() {
    const bootMessages = [
      'Initializing Suraksha OS...',
      'Loading Nepal Citizen Protection Protocol...',
      'Scanning for cyber threats...',
      'Activating digital shield systems...',
      'Establishing secure connection...',
      'Loading educational modules...',
      'Initializing threat detection...',
      'System ready. Welcome, Citizen.'
    ];

    let messageIndex = 0;
    const bootInterval = setInterval(() => {
      if (messageIndex < bootMessages.length) {
        this.addOutput(bootMessages[messageIndex], 'system');
        messageIndex++;
      } else {
        clearInterval(bootInterval);
        this.completeBootSequence();
      }
    }, 800);
  }

  completeBootSequence() {
    this.isBooting = false;
    this.addOutput('', 'break');
    this.addOutput('🛡️ Suraksha OS v2.0 - Nepal Digital Safety System', 'success');
    this.addOutput('Type "help" to get started or "ls" to explore the system.', 'info');
    this.addOutput('', 'break');
    this.updatePrompt();
    this.terminalInput?.focus();
  }

  handleKeyDown(e) {
    if (this.isBooting) {
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.executeCommand();
        break;
      
      case 'Tab':
        e.preventDefault();
        this.handleTabCompletion();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
      
      case 'Escape':
        this.hideSuggestions();
        break;
    }
  }

  handleInput(e) {
    const input = e.target.value;
    this.showSuggestions(input);
  }

  executeCommand() {
    const command = this.terminalInput.value.trim();
    if (!command) return;

    // Add to history
    if (this.commandHistory[this.commandHistory.length - 1] !== command) {
      this.commandHistory.push(command);
      localStorage.setItem('suraksha_command_history', JSON.stringify(this.commandHistory));
    }
    this.historyIndex = -1;

    // Display command
    this.addOutput(`${this.getPromptText()}${command}`, 'command');

    // Parse and execute
    this.parseCommand(command);

    // Clear input
    this.terminalInput.value = '';
    this.hideSuggestions();
  }

  parseCommand(commandLine) {
    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        this.showHelp();
        break;
      
      case 'ls':
        this.listDirectory(args[0]);
        break;
      
      case 'cd':
        this.changeDirectory(args[0]);
        break;
      
      case 'pwd':
        this.printWorkingDirectory();
        break;
      
      case 'clear':
        this.clearTerminal();
        break;
      
      case 'whoami':
        this.showUser();
        break;
      
      case 'about':
        this.showAbout();
        break;
      
      case 'theme':
        this.handleTheme(args);
        break;
      
      case 'history':
        this.showHistory();
        break;
      
      case 'reset':
        this.resetSystem();
        break;
      
      // Educational modules
      case 'learn':
        this.launchModule('learn');
        break;
      
      case 'scan':
        this.launchModule('scan');
        break;
      
      case 'protect':
        this.launchModule('protect');
        break;
      
      case 'rights':
        this.launchModule('rights');
        break;
      
      case 'quiz':
        this.launchModule('quiz');
        break;
      
      case 'mission':
        this.launchModule('mission');
        break;
      
      case 'panic':
      case 'emergency':
        this.showEmergencyHelp();
        break;
      
      default:
        this.showCommandNotFound(command);
    }
  }

  showHelp() {
    const helpText = `
🛡️ Suraksha OS Command Reference

NAVIGATION:
  ls [path]          List directory contents
  cd <path>          Change directory
  pwd                Show current directory
  clear              Clear terminal screen

SYSTEM:
  whoami             Show current user
  about              About Suraksha OS
  theme <name>       Change terminal theme
  history            Show command history
  reset              Reset system

SECURITY MODULES:
  learn              Cybersecurity awareness
  scan               Scam detection simulator
  protect            Password security tools
  rights             Digital rights guide
  quiz               Security knowledge quiz
  mission            Gamified learning missions

EMERGENCY:
  panic              Emergency cyber help
  emergency          Contact cyber authorities

EXAMPLES:
  ls awareness       List awareness modules
  cd tools           Enter tools directory
  theme matrix       Switch to Matrix theme
  mission phishing   Start phishing mission

Type any command to get started!`;

    this.addOutput(helpText, 'info');
  }

  listDirectory(path = null) {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const dir = this.getDirectoryContents(targetPath);
    
    if (!dir) {
      this.addOutput(`ls: cannot access '${path}': No such file or directory`, 'error');
      return;
    }

    if (dir.type !== 'directory') {
      this.addOutput(`ls: ${path}: Not a directory`, 'error');
      return;
    }

    this.addOutput(`Contents of ${targetPath}:`, 'info');
    
    const items = Object.entries(dir.children || {});
    if (items.length === 0) {
      this.addOutput('(empty directory)', 'muted');
      return;
    }

    items.forEach(([name, item]) => {
      const icon = this.getFileIcon(item.type);
      const color = this.getFileColor(item.type);
      const description = item.description ? ` - ${item.description}` : '';
      this.addOutput(`${icon} ${name}${description}`, color);
    });
  }

  changeDirectory(path) {
    if (!path) {
      this.currentPath = '/home/citizen';
      this.updatePrompt();
      return;
    }

    if (path === '..') {
      const parts = this.currentPath.split('/').filter(p => p);
      if (parts.length > 0) {
        parts.pop();
        this.currentPath = '/' + parts.join('/');
        if (this.currentPath === '/') this.currentPath = '/home/citizen';
      }
      this.updatePrompt();
      return;
    }

    const targetPath = this.resolvePath(path);
    const dir = this.getDirectoryContents(targetPath);
    
    if (!dir) {
      this.addOutput(`cd: ${path}: No such file or directory`, 'error');
      return;
    }

    if (dir.type !== 'directory') {
      this.addOutput(`cd: ${path}: Not a directory`, 'error');
      return;
    }

    this.currentPath = targetPath;
    this.updatePrompt();
  }

  printWorkingDirectory() {
    this.addOutput(this.currentPath, 'info');
  }

  clearTerminal() {
    this.terminalBody.innerHTML = '';
  }

  showUser() {
    this.addOutput('citizen@suraksha', 'success');
  }

  showAbout() {
    const aboutText = `
🛡️ Suraksha OS v2.0
Nepal Digital Safety System

A comprehensive cybersecurity awareness platform designed for Nepali citizens.
Built to protect against digital threats and promote cyber literacy.

Developed with ❤️ for Nepal's digital safety.
Report issues: cyberbureau@nepalpolice.gov.np`;

    this.addOutput(aboutText, 'info');
  }

  showHistory() {
    if (this.commandHistory.length === 0) {
      this.addOutput('No command history available.', 'muted');
      return;
    }

    this.addOutput('Command History:', 'info');
    this.commandHistory.slice(-20).forEach((cmd, index) => {
      this.addOutput(`${index + 1}. ${cmd}`, 'muted');
    });
  }

  resetSystem() {
    this.addOutput('Resetting Suraksha OS...', 'warning');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  launchModule(module) {
    this.addOutput(`Launching ${module} module...`, 'info');
    setTimeout(() => {
      window.location.href = `modules/${module}.html`;
    }, 500);
  }

  showEmergencyHelp() {
    const emergencyText = `
🚨 NEPAL CYBER BUREAU - EMERGENCY HELP

If you feel unsafe online, help is available:

📞 Call: 1144 (Toll Free)
📧 Email: cyberbureau@nepalpolice.gov.np
🌐 Website: nepalpolice.gov.np

IMMEDIATE ACTIONS:
1. Document evidence (screenshots, messages)
2. Do not engage with attackers
3. Report to authorities immediately
4. Change passwords if compromised

You are not alone. Help is available 24/7.`;

    this.addOutput(emergencyText, 'danger');
  }

  showCommandNotFound(command) {
    const suggestions = this.getSimilarCommands(command);
    this.addOutput(`Command '${command}' not found.`, 'error');
    
    if (suggestions.length > 0) {
      this.addOutput(`Did you mean: ${suggestions.join(', ')}?`, 'muted');
    }
    
    this.addOutput("Type 'help' for available commands.", 'muted');
  }

  // Utility methods
  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    }
    
    const current = this.currentPath === '/' ? '' : this.currentPath;
    return `${current}/${path}`.replace(/\/+/g, '/');
  }

  getDirectoryContents(path) {
    const parts = path.split('/').filter(p => p);
    let current = this.fileSystem['/'];
    
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  getFileIcon(type) {
    const icons = {
      'directory': '📁',
      'file': '📄',
      'executable': '⚡'
    };
    return icons[type] || '📄';
  }

  getFileColor(type) {
    const colors = {
      'directory': 'command',
      'file': 'info',
      'executable': 'success'
    };
    return colors[type] || 'info';
  }

  getSimilarCommands(command) {
    const commands = ['help', 'ls', 'cd', 'pwd', 'clear', 'learn', 'scan', 'protect', 'rights', 'quiz', 'mission', 'panic'];
    return commands.filter(cmd => 
      cmd.includes(command) || 
      command.includes(cmd) ||
      this.levenshteinDistance(command, cmd) <= 2
    ).slice(0, 3);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  addOutput(text, type = 'info') {
    const line = document.createElement('div');
    line.className = `terminal-line terminal-${type}`;
    
    if (type === 'command') {
      line.innerHTML = `<span class="terminal-prompt">${this.getPromptText()}</span><span class="terminal-command">${text.replace(this.getPromptText(), '')}</span>`;
    } else if (type === 'break') {
      line.innerHTML = '<br>';
    } else {
      line.textContent = text;
    }
    
    this.terminalBody.appendChild(line);
    this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
  }

  getPromptText() {
    const path = this.currentPath.replace('/home/citizen', '~');
    return `citizen@suraksha:${path}$ `;
  }

  updatePrompt() {
    if (this.terminalPrompt) {
      this.terminalPrompt.textContent = this.getPromptText();
    }
  }

  // Tab completion and suggestions
  handleTabCompletion() {
    const input = this.terminalInput.value;
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];
    
    if (parts.length === 1) {
      // Command completion
      const commands = ['help', 'ls', 'cd', 'pwd', 'clear', 'whoami', 'about', 'theme', 'history', 'reset', 'learn', 'scan', 'protect', 'rights', 'quiz', 'mission', 'panic'];
      const matches = commands.filter(cmd => cmd.startsWith(lastPart));
      
      if (matches.length === 1) {
        this.terminalInput.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        this.addOutput(`Possible completions: ${matches.join(', ')}`, 'muted');
      }
    } else if (parts[0] === 'cd' || parts[0] === 'ls') {
      // Path completion
      this.completePathName(lastPart, parts);
    }
  }

  completePathName(partial, parts) {
    const currentDir = this.getDirectoryContents(this.currentPath);
    if (!currentDir || !currentDir.children) return;
    
    const matches = Object.keys(currentDir.children).filter(name => 
      name.startsWith(partial)
    );
    
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      this.terminalInput.value = parts.join(' ') + ' ';
    } else if (matches.length > 1) {
      this.addOutput(`Possible completions: ${matches.join(', ')}`, 'muted');
    }
  }

  showSuggestions(input) {
    if (!input.trim()) {
      this.hideSuggestions();
      return;
    }

    const commands = [
      { cmd: 'help', desc: 'Show available commands' },
      { cmd: 'ls', desc: 'List directory contents' },
      { cmd: 'cd', desc: 'Change directory' },
      { cmd: 'learn', desc: 'Cybersecurity awareness' },
      { cmd: 'scan', desc: 'Scam detection' },
      { cmd: 'protect', desc: 'Password tools' },
      { cmd: 'rights', desc: 'Digital rights' },
      { cmd: 'quiz', desc: 'Security quiz' },
      { cmd: 'mission', desc: 'Learning missions' },
      { cmd: 'panic', desc: 'Emergency help' }
    ];

    const matches = commands.filter(item => 
      item.cmd.startsWith(input.toLowerCase())
    );

    if (matches.length > 0 && matches.length < 6) {
      this.displaySuggestions(matches);
    } else {
      this.hideSuggestions();
    }
  }

  displaySuggestions(suggestions) {
    if (!this.suggestionsContainer) return;
    
    this.suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <span class="suggestion-command">${suggestion.cmd}</span>
        <span class="suggestion-description">${suggestion.desc}</span>
      `;
      item.addEventListener('click', () => {
        this.terminalInput.value = suggestion.cmd + ' ';
        this.hideSuggestions();
        this.terminalInput.focus();
      });
      this.suggestionsContainer.appendChild(item);
    });
    
    this.suggestionsContainer.classList.add('show');
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.classList.remove('show');
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;
    
    if (direction === -1) {
      // Up arrow
      if (this.historyIndex === -1) {
        this.historyIndex = this.commandHistory.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
    } else {
      // Down arrow
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = -1;
        this.terminalInput.value = '';
        return;
      }
    }
    
    if (this.historyIndex >= 0) {
      this.terminalInput.value = this.commandHistory[this.historyIndex];
    }
  }

  handleTheme(args) {
    if (args.length === 0) {
      this.addOutput('Available themes: green, matrix, kali, cyber, ubuntu, light', 'info');
      this.addOutput('Usage: theme <name>', 'muted');
      return;
    }

    const themeName = args[0].toLowerCase();
    const validThemes = ['green', 'matrix', 'kali', 'cyber', 'ubuntu', 'light'];
    
    if (!validThemes.includes(themeName)) {
      this.addOutput(`Invalid theme: ${themeName}`, 'error');
      this.addOutput(`Available themes: ${validThemes.join(', ')}`, 'muted');
      return;
    }

    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('suraksha_theme', themeName);
    this.addOutput(`Theme changed to: ${themeName}`, 'success');
  }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.surakshaTerminal = new SurakshaTerminal();
});