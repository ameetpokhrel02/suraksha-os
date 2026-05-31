/**
 * Suraksha OS - Cyber Dashboard Module
 * Futuristic Security Dashboard with Real-time Widgets
 */

class CyberDashboard {
  constructor() {
    this.securityScore = 0;
    this.threatLevel = 'LOW';
    this.missions = [];
    this.shieldLevel = 'UNVERIFIED';
    this.stats = {
      modulesCompleted: 0,
      threatsBlocked: 0,
      scansPerformed: 0,
      safetyRank: 'NOVICE'
    };
    
    this.init();
  }

  init() {
    this.loadProgress();
    this.createDashboard();
    this.startRealTimeUpdates();
    this.bindEvents();
  }

  loadProgress() {
    const progress = JSON.parse(localStorage.getItem('suraksha_progress')) || [];
    const completedModules = progress.length;
    
    // Calculate security score based on completed modules
    this.securityScore = Math.min(100, (completedModules / 8) * 100);
    
    // Determine threat level
    if (this.securityScore >= 80) this.threatLevel = 'LOW';
    else if (this.securityScore >= 50) this.threatLevel = 'MEDIUM';
    else this.threatLevel = 'HIGH';
    
    // Determine shield level
    if (completedModules === 0) this.shieldLevel = 'UNVERIFIED';
    else if (completedModules < 3) this.shieldLevel = 'LEARNER';
    else if (completedModules < 6) this.shieldLevel = 'GUARD';
    else this.shieldLevel = 'SURAKSHAK';
    
    // Update stats
    this.stats.modulesCompleted = completedModules;
    this.stats.threatsBlocked = Math.floor(this.securityScore * 1.2);
    this.stats.scansPerformed = completedModules * 3;
    
    // Load missions
    this.missions = [
      { name: 'Password Security', progress: progress.includes('protect') ? 100 : 0, completed: progress.includes('protect') },
      { name: 'Phishing Awareness', progress: progress.includes('learn') ? 100 : 0, completed: progress.includes('learn') },
      { name: 'Scam Detection', progress: progress.includes('scan') ? 100 : 0, completed: progress.includes('scan') },
      { name: 'Privacy Protection', progress: progress.includes('rights') ? 100 : 0, completed: progress.includes('rights') },
      { name: 'Social Media Safety', progress: progress.includes('social') ? 100 : 0, completed: progress.includes('social') }
    ];
  }

  createDashboard() {
    const dashboardContainer = document.getElementById('cyber-dashboard');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = `
      <div class="cyber-widget security-score-widget">
        <div class="widget-header">
          <div class="widget-title">
            <svg class="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"/>
            </svg>
            Security Score
          </div>
          <div class="widget-status ${this.getScoreStatus()}">${this.getScoreStatusText()}</div>
        </div>
        <div class="security-score">
          <div class="score-circle" style="--score-percentage: ${this.securityScore}">
            <svg viewBox="0 0 120 120">
              <circle class="score-circle-bg" cx="60" cy="60" r="54"/>
              <circle class="score-circle-progress" cx="60" cy="60" r="54"/>
            </svg>
            <div class="score-value">${Math.round(this.securityScore)}</div>
          </div>
          <div class="score-label">Digital Safety Score</div>
        </div>
      </div>

      <div class="cyber-widget threat-level-widget">
        <div class="widget-header">
          <div class="widget-title">
            <svg class="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Threat Level
          </div>
          <div class="widget-status ${this.getThreatStatus()}">${this.threatLevel}</div>
        </div>
        <div class="threat-meter">
          <div class="threat-bars">
            ${this.createThreatBars()}
          </div>
          <div class="threat-level-text">${this.threatLevel}</div>
        </div>
      </div>

      <div class="cyber-widget mission-progress-widget">
        <div class="widget-header">
          <div class="widget-title">
            <svg class="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3l8-8"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"/>
            </svg>
            Mission Progress
          </div>
          <div class="widget-status online">${this.missions.filter(m => m.completed).length}/${this.missions.length}</div>
        </div>
        <div class="mission-list">
          ${this.missions.map(mission => this.createMissionItem(mission)).join('')}
        </div>
      </div>

      <div class="cyber-widget safety-shield-widget">
        <div class="widget-header">
          <div class="widget-title">
            <svg class="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"/>
              <path d="M9 12L11 14L15 10"/>
            </svg>
            Safety Shield
          </div>
          <div class="widget-status ${this.getShieldStatus()}">${this.shieldLevel}</div>
        </div>
        <div class="shield-display">
          <svg class="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"/>
            ${this.shieldLevel !== 'UNVERIFIED' ? '<path d="M9 12L11 14L15 10"/>' : ''}
          </svg>
          <div class="shield-level ${this.shieldLevel.toLowerCase()}">${this.shieldLevel}</div>
          <div class="shield-description">${this.getShieldDescription()}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${this.stats.modulesCompleted}</div>
            <div class="stat-label">Modules</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.stats.threatsBlocked}</div>
            <div class="stat-label">Threats Blocked</div>
          </div>
        </div>
      </div>

      ${this.shouldShowAlert() ? this.createAlertWidget() : ''}
    `;

    // Animate widgets on load
    this.animateWidgets();
  }

  createThreatBars() {
    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = levels.indexOf(this.threatLevel);
    
    return levels.map((level, index) => {
      const height = index <= currentIndex ? (index + 1) * 25 : 10;
      const color = index <= currentIndex ? this.getThreatBarColor(index) : 'rgba(255,255,255,0.1)';
      
      return `
        <div class="threat-bar">
          <div class="threat-bar-fill" style="--fill-height: ${height}%; background: ${color}"></div>
        </div>
      `;
    }).join('');
  }

  createMissionItem(mission) {
    return `
      <div class="mission-item ${mission.completed ? 'completed' : ''}">
        <svg class="mission-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${mission.completed ? 
            '<path d="M9 11l3 3l8-8"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"/>' :
            '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
          }
        </svg>
        <div class="mission-info">
          <div class="mission-name">${mission.name}</div>
          <div class="mission-progress-bar">
            <div class="mission-progress-fill" style="width: ${mission.progress}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  createAlertWidget() {
    return `
      <div class="cyber-widget alert-widget">
        <div class="widget-header">
          <div class="widget-title">
            <svg class="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Security Alert
          </div>
          <div class="widget-status danger">ACTIVE</div>
        </div>
        <div class="alert-content">
          <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div class="alert-text">
            <div class="alert-title">Low Security Score Detected</div>
            <div class="alert-message">Complete more security modules to improve your digital safety.</div>
          </div>
        </div>
      </div>
    `;
  }

  animateWidgets() {
    const widgets = document.querySelectorAll('.cyber-widget');
    widgets.forEach((widget, index) => {
      widget.style.opacity = '0';
      widget.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        widget.style.transition = 'all 0.5s ease-out';
        widget.style.opacity = '1';
        widget.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  startRealTimeUpdates() {
    // Update dashboard every 30 seconds
    setInterval(() => {
      this.loadProgress();
      this.updateWidgets();
    }, 30000);

    // Simulate real-time threat monitoring
    setInterval(() => {
      this.updateThreatAnimation();
    }, 5000);
  }

  updateWidgets() {
    // Update security score
    const scoreElement = document.querySelector('.score-value');
    if (scoreElement) {
      scoreElement.textContent = Math.round(this.securityScore);
    }

    // Update threat level
    const threatElement = document.querySelector('.threat-level-text');
    if (threatElement) {
      threatElement.textContent = this.threatLevel;
    }

    // Update shield level
    const shieldElement = document.querySelector('.shield-level');
    if (shieldElement) {
      shieldElement.textContent = this.shieldLevel;
      shieldElement.className = `shield-level ${this.shieldLevel.toLowerCase()}`;
    }
  }

  updateThreatAnimation() {
    const threatBars = document.querySelectorAll('.threat-bar-fill');
    threatBars.forEach(bar => {
      bar.style.animation = 'none';
      setTimeout(() => {
        bar.style.animation = 'threatFill 1.5s ease-out forwards';
      }, 10);
    });
  }

  bindEvents() {
    // Widget click handlers
    document.addEventListener('click', (e) => {
      const widget = e.target.closest('.cyber-widget');
      if (!widget) return;

      if (widget.classList.contains('security-score-widget')) {
        this.showSecurityDetails();
      } else if (widget.classList.contains('mission-progress-widget')) {
        this.showMissionDetails();
      } else if (widget.classList.contains('safety-shield-widget')) {
        this.showShieldDetails();
      }
    });

    // Mission item clicks
    document.addEventListener('click', (e) => {
      const missionItem = e.target.closest('.mission-item');
      if (missionItem && !missionItem.classList.contains('completed')) {
        const missionName = missionItem.querySelector('.mission-name').textContent;
        this.launchMission(missionName);
      }
    });
  }

  showSecurityDetails() {
    const details = `
Security Score Breakdown:
• Password Security: ${this.missions[0].completed ? '✅' : '❌'} 
• Phishing Awareness: ${this.missions[1].completed ? '✅' : '❌'}
• Scam Detection: ${this.missions[2].completed ? '✅' : '❌'}
• Privacy Protection: ${this.missions[3].completed ? '✅' : '❌'}
• Social Media Safety: ${this.missions[4].completed ? '✅' : '❌'}

Complete more modules to improve your score!`;

    this.showModal('Security Score Details', details);
  }

  showMissionDetails() {
    const completedCount = this.missions.filter(m => m.completed).length;
    const details = `
Mission Progress: ${completedCount}/${this.missions.length}

Available Missions:
${this.missions.map(m => `• ${m.name}: ${m.completed ? 'COMPLETED' : 'PENDING'}`).join('\n')}

Complete missions to strengthen your digital shield!`;

    this.showModal('Mission Progress', details);
  }

  showShieldDetails() {
    const details = `
Current Shield Level: ${this.shieldLevel}

Shield Levels:
• UNVERIFIED: No modules completed
• LEARNER: 1-2 modules completed  
• GUARD: 3-5 modules completed
• SURAKSHAK: 6+ modules completed

${this.getShieldDescription()}`;

    this.showModal('Safety Shield Status', details);
  }

  launchMission(missionName) {
    const missionMap = {
      'Password Security': 'protect',
      'Phishing Awareness': 'learn',
      'Scam Detection': 'scan',
      'Privacy Protection': 'rights',
      'Social Media Safety': 'social'
    };

    const module = missionMap[missionName];
    if (module) {
      window.location.href = `modules/${module}.html`;
    }
  }

  showModal(title, content) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <pre>${content}</pre>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Utility methods
  getScoreStatus() {
    if (this.securityScore >= 80) return 'online';
    if (this.securityScore >= 50) return 'warning';
    return 'danger';
  }

  getScoreStatusText() {
    if (this.securityScore >= 80) return 'SECURE';
    if (this.securityScore >= 50) return 'MODERATE';
    return 'VULNERABLE';
  }

  getThreatStatus() {
    return this.threatLevel === 'LOW' ? 'online' : 
           this.threatLevel === 'MEDIUM' ? 'warning' : 'danger';
  }

  getThreatBarColor(index) {
    const colors = [
      'var(--success-color)',
      'var(--warning-color)', 
      'var(--danger-color)',
      '#ff073a'
    ];
    return colors[index];
  }

  getShieldStatus() {
    return this.shieldLevel === 'SURAKSHAK' ? 'online' :
           this.shieldLevel === 'GUARD' ? 'warning' : 'danger';
  }

  getShieldDescription() {
    const descriptions = {
      'UNVERIFIED': 'Complete security modules to activate your digital shield.',
      'LEARNER': 'You\'re building awareness. Keep learning!',
      'GUARD': 'Good progress! You can identify major threats.',
      'SURAKSHAK': 'Excellent! You\'re a digital security expert.'
    };
    return descriptions[this.shieldLevel];
  }

  shouldShowAlert() {
    return this.securityScore < 50;
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dashboardContainer = document.getElementById('cyber-dashboard');
  if (dashboardContainer) {
    window.cyberDashboard = new CyberDashboard();
  }
});