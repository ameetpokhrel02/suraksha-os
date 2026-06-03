/**
 * Suraksha OS - Core Terminal Logic & UX Engine
 * Handles navigation, command processing, command history/suggestions, dual GUI/terminal UI,
 * accessibility settings, and guided onboarding.
 */

// Core elements
const input = document.getElementById("commandInput");
const output = document.getElementById("output");
const terminalSuggestions = document.getElementById("terminalSuggestions");

// Expanded modules array to include all simulation/learning units
const modules = ["learn", "scan", "protect", "rights", "quiz", "social", "snapchat", "ads", "feed", "instagram", "twitter", "whatsapp", "telegram", "chatscam", "mission"];
let progress = JSON.parse(localStorage.getItem("suraksha_progress")) || [];

// Valid command names for autocomplete and suggestions
const VALID_COMMANDS = [
    "help", "learn", "scan", "protect", "rights", "quiz", "social", "snapchat", "ads", "feed",
    "instagram", "twitter", "whatsapp", "telegram", "chatscam", "mission", "panic", "clear", "exit",
    "theme", "themes", "preview", "apply", "cancel", "fontsize"
];

// Theme Definitions
const THEMES = {
    green: {
        name: "Default Green",
        bg: "#0d1117",
        terminalBg: "rgba(1,4,9,0.8)",
        headerBg: "rgba(22,27,34,0.7)",
        accent: "#00ff9c",
        text: "#c9d1d9",
        command: "#58a6ff",
        success: "#3fb950",
        danger: "#f85149",
        warning: "#ffbd2e",
        border: "rgba(48, 54, 61, 0.5)"
    },
    matrix: {
        name: "Matrix",
        bg: "#000000",
        terminalBg: "#000000",
        headerBg: "rgba(0, 50, 0, 0.3)",
        accent: "#00ff00",
        text: "#00cc66",
        command: "#00ff00",
        success: "#00ff00",
        danger: "#ff0000",
        warning: "#ffff00",
        border: "#00aa00"
    },
    kali: {
        name: "Kali Linux",
        bg: "#111827",
        terminalBg: "#1f2937",
        headerBg: "#111827",
        accent: "#4aa3ff",
        text: "#d6e4ff",
        command: "#2563eb",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        border: "#374151"
    },
    ubuntu: {
        name: "Ubuntu",
        bg: "#300a24",
        terminalBg: "#2d0922",
        headerBg: "#1f0516",
        accent: "#e95420",
        text: "#ffffff",
        command: "#dfdbd2",
        success: "#2dca73",
        danger: "#ef2929",
        warning: "#f57900",
        border: "#400c30"
    },
    cyber: {
        name: "Cyberpunk",
        bg: "#0f0c1b",
        terminalBg: "rgba(15, 12, 27, 0.85)",
        headerBg: "rgba(25, 20, 45, 0.7)",
        accent: "#ff0055",
        text: "#00ffff",
        command: "#ff00ff",
        success: "#39ff14",
        danger: "#ff073a",
        warning: "#fefe22",
        border: "#ff0055"
    },
    light: {
        name: "Light Mode",
        bg: "#ffffff",
        terminalBg: "#f8f9fa",
        headerBg: "#e9ecef",
        accent: "#0066cc",
        text: "#222222",
        command: "#111111",
        success: "#198754",
        danger: "#dc3545",
        warning: "#ffc107",
        border: "#dee2e6"
    },
    alert: {
        name: "Red Alert",
        bg: "#0d1117",
        terminalBg: "#1a0000",
        headerBg: "#2d0000",
        accent: "#ff4444",
        text: "#ffd6d6",
        command: "#ff8888",
        success: "#00ff66",
        danger: "#ff1111",
        warning: "#ffaa00",
        border: "#ff4444"
    },
    nepal: {
        name: "Nepal Theme",
        bg: "#0d1b2a",
        terminalBg: "#1b263b",
        headerBg: "#0d1b2a",
        accent: "#dc143c",
        text: "#ffffff",
        command: "#003893",
        success: "#008000",
        danger: "#e60000",
        warning: "#e6b800",
        border: "#003893"
    },
    retro: {
        name: "Retro DOS",
        bg: "#000080",
        terminalBg: "#000080",
        headerBg: "#0000aa",
        accent: "#ffffff",
        text: "#ffffff",
        command: "#ffffff",
        success: "#a8ffb2",
        danger: "#ffa8a8",
        warning: "#ffffa8",
        border: "#ffffff"
    },
    accessible: {
        name: "Accessible High-Contrast",
        bg: "#000000",
        terminalBg: "#000000",
        headerBg: "#1c1c1c",
        accent: "#ffff00",
        text: "#ffffff",
        command: "#00ffff",
        success: "#00ff00",
        danger: "#ff0000",
        warning: "#ffaa00",
        border: "#ffffff"
    }
};

// Theme Manager Object
const ThemeManager = {
    currentTheme: "green",
    previewing: false,
    savedTheme: "green",
    previewTheme: "",

    init() {
        const saved = localStorage.getItem("suraksha_theme") || "green";
        this.apply(saved, false);
    },

    apply(themeName, temp = false) {
        if (themeName === "random") {
            const keys = Object.keys(THEMES);
            themeName = keys[Math.floor(Math.random() * keys.length)];
        }

        if (themeName === "reset") {
            themeName = "green";
        }

        const theme = THEMES[themeName];
        if (!theme) return false;

        // Set CSS custom properties on document
        document.documentElement.style.setProperty('--bg-color', theme.bg);
        document.documentElement.style.setProperty('--terminal-bg', theme.terminalBg);
        document.documentElement.style.setProperty('--header-bg', theme.headerBg);
        document.documentElement.style.setProperty('--accent-color', theme.accent);
        document.documentElement.style.setProperty('--text-color', theme.text);
        document.documentElement.style.setProperty('--command-color', theme.command || theme.accent);
        document.documentElement.style.setProperty('--success-color', theme.success || "#3fb950");
        document.documentElement.style.setProperty('--danger-color', theme.danger || "#f85149");
        document.documentElement.style.setProperty('--warning-color', theme.warning || "#ffbd2e");
        document.documentElement.style.setProperty('--border-color', theme.border || "rgba(48, 54, 61, 0.5)");

        // Accessibility specific overrides
        if (themeName === "accessible") {
            document.body.classList.add("theme-accessible-mode");
            document.documentElement.style.setProperty('--terminal-font-size', '20px');
        } else {
            document.body.classList.remove("theme-accessible-mode");
            // restore font size from local storage if saved, else default 14px
            const savedSize = localStorage.getItem("suraksha_terminal_fontsize") || "14px";
            document.documentElement.style.setProperty('--terminal-font-size', savedSize);
        }

        if (!temp) {
            this.currentTheme = themeName;
            this.savedTheme = themeName;
            localStorage.setItem("suraksha_theme", themeName);

            // Also update dropdown if present
            const selectEl = document.getElementById("guiThemeSelector");
            if (selectEl) selectEl.value = themeName;
        } else {
            this.currentTheme = themeName;
            this.previewTheme = themeName;
            this.previewing = true;
        }
        return true;
    },

    preview(themeName) {
        if (!THEMES[themeName]) return false;
        this.apply(themeName, true);
        return true;
    },

    confirmPreview() {
        if (this.previewing) {
            this.apply(this.currentTheme, false);
            this.previewing = false;
            return true;
        }
        return false;
    },

    cancelPreview() {
        if (this.previewing) {
            this.apply(this.savedTheme, false);
            this.previewing = false;
            return true;
        }
        return false;
    }
};

// Command History State
let commandHistory = JSON.parse(localStorage.getItem("suraksha_cmd_history")) || [];
let historyIndex = -1;

// Guided Onboarding State
let onboardCurrentSlide = 0;
const ONBOARDING_SLIDES = [
    {
        title: "Welcome to Suraksha OS 🛡️",
        html: `
            <div class="onboarding-slide-text">
                <h3>Empowering Citizens Online</h3>
                <p>Suraksha OS is an interactive cyber safety learning system built specifically for Nepalese citizens.</p>
                <p>Our mission is to help protect students, parents, and elderly citizens from the rising threat of banking frauds, OTP scams, fake news, and online harassment in Nepal.</p>
            </div>
        `
    },
    {
        title: "Dual Mode Interface 💻/🌐",
        html: `
            <div class="onboarding-slide-text">
                <h3>Intimidating-Free Experience</h3>
                <p>You can use Suraksha OS in two different modes:</p>
                <p>• <b>Terminal Mode:</b> A retro cyber-command-line interface for typing security commands.</p>
                <p>• <b>GUI Mode:</b> A modern, visual dashboard with clear level badges, progress tracking, and friendly card-based navigation.</p>
                <p>Switch between them at any time using the toggle in the header!</p>
            </div>
        `
    },
    {
        title: "Build Your Digital Shield 🛡️",
        html: `
            <div class="onboarding-slide-text">
                <h3>Track Your Safety score</h3>
                <p>As you complete training modules, your <b>Digital Shield Progress</b> will increase.</p>
                <p>Earn badges for completing simulator challenges and elevate your rank from <b>Unverified</b> to <b>Learner</b>, then <b>Citizen Guard</b>, and finally <b>Digital Surakshak</b>!</p>
            </div>
        `
    },
    {
        title: "Emergency Assistance & AI Guide 🚨",
        html: `
            <div class="onboarding-slide-text">
                <h3>We are Here to Help</h3>
                <p>• <b>AI Security Guide:</b> Click the floating green chat bubble in the bottom right to ask questions or watch security demonstrations at any time.</p>
                <p>• <b>Emergency Panic Command:</b> Type <code>panic</code> or click the Emergency Help button to instantly access the official Nepal Police Cyber Bureau hotline details.</p>
            </div>
        `
    }
];

// Welcome Screen Template
const WELCOME_TEMPLATE = `
    <div class="intro-guidance">
        <p><b>This helps Nepali citizens stay safe online.</b></p>
        <p>Suraksha OS is your personal guide to navigating the digital world in Nepal.
            Addressing real cyber threats affecting our citizens, we'll build your "Digital Shield" together.</p>
        <p class="success" style="opacity: 0.8; font-size: 0.9rem;">Complete modules below to strengthen your Digital Shield.</p>
        <p><i>Type commands below OR click the buttons to begin your journey.</i></p>
    </div>
    <div id="boot-sequence">
        <p>Initializing Nepal Citizen Protection Protocol...</p>
        <p>Loading Educational Journey [ETA Act Compliance]...</p>
        <p class="success">System Ready. You are currently in the safety gateway.</p>
    </div>
    <br>
    <p>Welcome back, Citizen.</p>
    <p>Your Current Safety Shield: <span class="danger" id="safetyLevel">UNVERIFIED (No safety modules completed yet)</span></p>
    <br>
    <p>Explore the modules below to strengthen your shield. If you ever feel unsafe, use the **Emergency Help** button.</p>
`;

// Helper: Levenshtein distance for spell correction suggestion
function getLevenshteinDistance(a, b) {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) {
        tmp[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
        tmp[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = a[i - 1] === b[j - 1] ?
                tmp[i - 1][j - 1] :
                Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + 1);
        }
    }
    return tmp[a.length][b.length];
}

// Helper: Find closest command if typed incorrectly
function getClosestCommand(typed) {
    let closest = "";
    let minDistance = Infinity;

    for (const cmd of VALID_COMMANDS) {
        const dist = getLevenshteinDistance(typed, cmd);
        if (dist < minDistance) {
            minDistance = dist;
            closest = cmd;
        }
    }

    return minDistance <= 2 ? closest : null;
}

// Update Safety Meter Display in Terminal
function updateSafetyMeter() {
    const meter = document.getElementById("safetyLevel");
    if (!meter) return;

    const count = progress.length;
    if (count === 0) {
        meter.innerHTML = "UNVERIFIED (No safety modules completed yet)";
        meter.className = "danger";
    } else if (count < 3) {
        meter.innerHTML = "LEARNER (You're starting to build your awareness)";
        meter.className = "warning";
    } else if (count < 6) {
        meter.innerHTML = "CITIZEN GUARD (You can identify major digital threats)";
        meter.className = "success";
    } else {
        meter.innerHTML = "DIGITAL SURAKSHAK (You understand basic cyber safety practices)";
        meter.className = "success";
        meter.style.textShadow = "0 0 10px var(--success-color)";
    }
}

// Global achievement helper (called from modules or URL)
window.markComplete = function (moduleName) {
    if (modules.includes(moduleName) && !progress.includes(moduleName)) {
        progress.push(moduleName);
        localStorage.setItem("suraksha_progress", JSON.stringify(progress));
        updateGuiDashboard();
        updateSafetyMeter();
    }
}

// Hybrid UI: Execute command from chip click
function executeChip(command) {
    if (input) {
        input.value = command;
        processCommand(command);
        input.value = "";
        updateSuggestions("");
    } else {
        processCommand(command);
    }
}

// Navigation helper
function goTo(page) {
    window.location.href = "modules/" + page + ".html";
}

// Command Processor
function processCommand(command) {
    const trimmedInput = command.trim();
    if (!trimmedInput) return;

    // Save to command history if unique and not empty
    if (commandHistory[commandHistory.length - 1] !== trimmedInput.toLowerCase()) {
        commandHistory.push(trimmedInput);
        if (commandHistory.length > 50) commandHistory.shift(); // Cap history size
        localStorage.setItem("suraksha_cmd_history", JSON.stringify(commandHistory));
    }
    historyIndex = -1; // Reset history index

    // Append user input to terminal
    output.innerHTML += `<p><span class="prompt">citizen@suraksha:~$</span> ${trimmedInput}</p>`;

    // Parse input
    const parts = trimmedInput.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();

    // Command Alias Mapping
    let actualCmd = cmd;
    if (cmd === "back" || cmd === "menu" || cmd === "home") {
        actualCmd = "exit";
    } else if (cmd === "info" || cmd === "guide") {
        actualCmd = "learn";
    } else if (cmd === "law") {
        actualCmd = "rights";
    } else if (cmd === "emergency" || cmd === "cyberbureau" || cmd === "police") {
        actualCmd = "panic";
    } else if (cmd === "simulate") {
        actualCmd = "social";
    }

    // Preview Mode Confirmation Handler
    if (ThemeManager.previewing) {
        if (actualCmd === "apply") {
            ThemeManager.confirmPreview();
            output.innerHTML += `<p class="success">✔ Theme applied permanently.</p>`;
            output.scrollTop = output.scrollHeight;
            return;
        } else if (actualCmd === "cancel") {
            ThemeManager.cancelPreview();
            output.innerHTML += `<p class="warning">Preview cancelled. Reverted to previous theme.</p>`;
            output.scrollTop = output.scrollHeight;
            return;
        }
    }

    switch (actualCmd) {
        case "help":
            output.innerHTML += `
            <div class="help-box">
                <p class="warning">Your Journey to Safety:</p>
                <p><span class="command">learn</span>    → Education: Cybersecurity Basics</p>
                <p><span class="command">scan</span>     → Tools: Vulnerability Scanner</p>
                <p><span class="command">protect</span>  → Tactics: Security Best Practices</p>
                <p><span class="command">rights</span>   → Legal: Citizen Rights in Nepal</p>
                <p><span class="command">quiz</span>     → Training: Knowledge Verification</p>
                <br>
                <p><span class="command">social</span>   → Simulation: Instagram Phishing Simulator</p>
                <p><span class="command">snapchat</span> → Simulation: Snapchat Phishing Simulator (Suspicious Alert)</p>
                <p><span class="command">ads</span>      → Tool: Malicious Ads Detector</p>
                <p><span class="command">feed</span>     → Simulation: Facebook Scam Ad Feed</p>
                <p><span class="command">instagram</span> → Simulation: Instagram Scam Feed (MrBeast, Celebrity Impersonation)</p>
                <p><span class="command">twitter</span>   → Simulation: Twitter/X Scam Feed (Elon Musk Crypto Giveaway)</p>
                <p><span class="command">whatsapp</span> → Simulation: WhatsApp OTP Scam Simulator</p>
                <p><span class="command">telegram</span> → Simulation: Telegram Investment Fraud Simulator</p>
                <p><span class="command">chatscam</span> → Simulation: Chat Trust Building Simulator</p>
                <p><span class="command">mission</span>  → Mission: Full Attack Chain Challenge</p>
                <br>
                <p><span class="command">themes</span>   → Customization: List all terminal themes</p>
                <p><span class="command">theme</span>    → Customization: Change color theme (e.g. theme kali)</p>
                <p><span class="command">fontsize</span> → Customization: Set terminal size (e.g. fontsize 20)</p>
                <br>
                <p><span class="command">panic</span>    → Immediate Help: Cyber Bureau Hotline Details</p>
                <p style="opacity: 0.7;"><span class="command">clear</span>    → Clear terminal output</p>
                <p style="opacity: 0.7;"><span class="command">exit</span>     → Welcome Screen / Main Menu</p>
                <p style="opacity: 0.5; font-size: 0.8rem; margin-top: 8px;"><i>Note: Command aliases supported (e.g. back, info, law, police, guide)</i></p>
            </div>`;
            break;

        case "theme":
            if (!arg) {
                output.innerHTML += `<p class="warning">Usage: theme &lt;theme-name&gt;<br>Type 'themes' to view available themes.</p>`;
            } else if (arg === "random") {
                ThemeManager.apply("random");
                output.innerHTML += `<p class="success">Random theme applied: <b>${THEMES[ThemeManager.currentTheme].name}</b>.</p>`;
            } else if (arg === "reset") {
                ThemeManager.apply("reset");
                output.innerHTML += `<p class="success">Theme reset to Default Green.</p>`;
            } else if (THEMES[arg]) {
                ThemeManager.apply(arg);
                output.innerHTML += `<p class="success">Theme switched to <b>${THEMES[arg].name}</b> successfully.</p>`;
            } else {
                output.innerHTML += `<p class="danger">Theme not found. Type 'themes' to view available themes.</p>`;
            }
            break;

        case "themes":
            output.innerHTML += `
            <div class="help-box">
                <p class="warning">Available Themes:</p>
                <p>- <span class="command">green</span>       (Default Green)</p>
                <p>- <span class="command">matrix</span>      (Neo Matrix green-on-black)</p>
                <p>- <span class="command">kali</span>        (Kali Linux style)</p>
                <p>- <span class="command">ubuntu</span>      (Ubuntu terminal purple/orange)</p>
                <p>- <span class="command">cyber</span>       (Cyberpunk neon pink/blue)</p>
                <p>- <span class="command">light</span>       (Light Mode)</p>
                <p>- <span class="command">alert</span>       (Red Alert warning mode)</p>
                <p>- <span class="command">nepal</span>       (Nepal Crimson and blue)</p>
                <p>- <span class="command">retro</span>       (Retro DOS blue screen)</p>
                <p>- <span class="command">accessible</span>  (Accessible High-Contrast)</p>
                <p>- <span class="command">random</span>      (Select a random theme)</p>
                <p>- <span class="command">reset</span>       (Reset to Default Green)</p>
                <br>
                <p><i>Usage: 'theme &lt;name&gt;' to apply immediately, or 'preview &lt;name&gt;' to try it out.</i></p>
            </div>`;
            break;

        case "preview":
            if (!arg) {
                output.innerHTML += `<p class="warning">Usage: preview &lt;theme-name&gt;</p>`;
            } else if (THEMES[arg]) {
                ThemeManager.preview(arg);
                output.innerHTML += `
                <div class="panic-box" style="border: 1px solid var(--accent-color); background: rgba(0, 255, 156, 0.05); padding: 12px; margin-top: 8px;">
                    <p style="font-weight: bold; color: var(--accent-color);">✨ PREVIEWING THEME: ${THEMES[arg].name} ✨</p>
                    <p>Do you want to keep this theme?</p>
                    <p>Type <span class="command">apply</span> to confirm or <span class="command">cancel</span> to revert.</p>
                </div>`;
            } else {
                output.innerHTML += `<p class="danger">Theme not found. Type 'themes' to view available themes.</p>`;
            }
            break;

        case "fontsize":
            if (!arg) {
                output.innerHTML += `<p class="warning">Usage: fontsize &lt;14 | 16 | 20 | 24&gt;</p>`;
            } else {
                const size = parseInt(arg);
                if (size && [14, 16, 20, 24].includes(size)) {
                    const sizeStr = size + "px";
                    document.documentElement.style.setProperty('--terminal-font-size', sizeStr);
                    localStorage.setItem("suraksha_terminal_fontsize", sizeStr);
                    output.innerHTML += `<p class="success">Terminal font size set to ${sizeStr}.</p>`;
                } else {
                    output.innerHTML += `<p class="danger">Invalid size. Supported sizes: 14, 16, 20, 24.</p>`;
                }
            }
            break;

        case "learn":
        case "scan":
        case "protect":
        case "rights":
        case "quiz":
        case "ads":
        case "feed":
        case "whatsapp":
        case "telegram":
        case "chatscam":
        case "mission":
            output.innerHTML += `<p>Initializing ${actualCmd.toUpperCase()} module. Stay focused, Citizen. Your safety is our priority.</p>`;
            setTimeout(() => goTo(actualCmd === 'feed' ? 'fb-ads' : actualCmd === 'chatscam' ? 'chat-scam' : actualCmd), 600);
            break;

        case "instagram":
            output.innerHTML += `<p>Initializing <span class="warning">INSTAGRAM SCAM FEED</span> module. Spot celebrity impersonation and giveaway scams.</p>`;
            localStorage.setItem('sim_platform', 'instagram');
            setTimeout(() => goTo('fb-ads'), 600);
            break;

        case "twitter":
            output.innerHTML += `<p>Initializing <span class="warning">TWITTER/X SCAM FEED</span> module. Detect crypto giveaway and verified-badge scams.</p>`;
            localStorage.setItem('sim_platform', 'twitter');
            setTimeout(() => goTo('fb-ads'), 600);
            break;

        case "social":
            output.innerHTML += `<p>Initializing SOCIAL (Instagram Phishing) module. Stay focused, Citizen.</p>`;
            setTimeout(() => goTo("social"), 600);
            break;

        case "snapchat":
            output.innerHTML += `<p>Initializing <span class="warning">SNAPCHAT PHISHING SCENARIO</span>. Stay focused, Citizen.</p>`;
            localStorage.setItem('social_scenario', 'snapchat');
            setTimeout(() => goTo("social"), 600);
            break;

        case "panic":
            output.innerHTML += `
            <div class="panic-box" style="border: 1px solid #f85149; padding: 15px; margin: 10px 0; border-radius: 8px; background: rgba(248, 81, 73, 0.15); animation: fadeIn 0.5s;">
                <p class="danger" style="font-weight: bold; font-size: 1.1rem;">NEPAL CYBER BUREAU - EMERGENCY HELP</p>
                <p><b>If you feel unsafe online, help is available.</b> You are not alone.</p>
                <p style="margin-top: 10px;">📞 **Call 1144** (Toll Free Hotline)</p>
                <p>📧 **Email:** cyberbureau@nepalpolice.gov.np</p>
                <p style="margin-top: 10px; font-size: 0.8rem; color: #8b949e;">The Electronic Transactions Act (2063) protects your rights. Report early, save all evidence.</p>
            </div>`;
            break;

        case "exit":
            output.innerHTML = WELCOME_TEMPLATE;
            updateSafetyMeter();
            triggerBootAnimation();
            return; // Don't append prompt

        case "clear":
            output.innerHTML = "";
            return;

        default:
            // Check for intelligent correction
            const suggestion = getClosestCommand(actualCmd);
            if (suggestion) {
                output.innerHTML += `<p class="danger">I don't recognize '${actualCmd}'. Did you mean <span class="command" onclick="executeChip('${suggestion}')" style="cursor: pointer; text-decoration: underline;">${suggestion}</span>? Click the suggestion or type it to run.</p>`;
            } else {
                output.innerHTML += `<p class="danger">I don't recognize '${actualCmd}'. Type <span class="command" onclick="executeChip('help')" style="cursor: pointer; text-decoration: underline;">help</span> to see all available protection options.</p>`;
            }
    }

    // Append hint if output is getting long
    if (output.children.length % 5 === 0) {
        output.innerHTML += `<p style="opacity: 0.5; font-size: 0.8rem;"><i>Hint: Try learn | scan | protect | rights | quiz | panic</i></p>`;
    }

    // Auto-scroll to bottom
    output.scrollTop = output.scrollHeight;
}

// Event Listeners for Command Input
if (input) {
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            processCommand(input.value);
            input.value = "";
            updateSuggestions("");
        }
    });

    // History and Tab Autocomplete Navigation
    input.addEventListener("keydown", function (e) {
        // Tab key autocomplete
        if (e.key === "Tab") {
            e.preventDefault();
            const val = input.value.trim().toLowerCase();
            if (!val) return;
            const matches = VALID_COMMANDS.filter(c => c.startsWith(val));
            if (matches.length > 0) {
                input.value = matches[0];
                updateSuggestions(matches[0]);
            }
        }

        // Up Arrow (previous command)
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length === 0) return;
            if (historyIndex === -1) {
                historyIndex = commandHistory.length - 1;
            } else if (historyIndex > 0) {
                historyIndex--;
            }
            input.value = commandHistory[historyIndex];
            updateSuggestions(input.value);
        }

        // Down Arrow (next command)
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex === -1) return;
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                input.value = "";
            }
            updateSuggestions(input.value);
        }
    });

    // Suggestions as the user types
    input.addEventListener("input", function () {
        updateSuggestions(input.value);
    });
}

// Accessibility & Theme Mode Logic
function applyA11ySettings() {
    // Theme
    const theme = localStorage.getItem("suraksha_a11y_theme") || "dark";
    setA11yTheme(theme);

    // Text Size
    const textSize = localStorage.getItem("suraksha_a11y_textsize") || "normal";
    setA11yTextSize(textSize);

    // Dyslexia
    const dyslexia = localStorage.getItem("suraksha_a11y_dyslexia") === "true";
    const body = document.body;
    const dyslexiaBtn = document.getElementById("btn-dyslexia-toggle");
    if (dyslexia) {
        body.classList.add("dyslexia-font");
        if (dyslexiaBtn) dyslexiaBtn.innerText = "Turn Off";
    } else {
        body.classList.remove("dyslexia-font");
        if (dyslexiaBtn) dyslexiaBtn.innerText = "Turn On";
    }

    // Motion
    const reducedMotion = localStorage.getItem("suraksha_a11y_animations") === "true";
    const motionBtn = document.getElementById("btn-animations-toggle");
    if (reducedMotion) {
        body.classList.add("reduced-motion");
        if (motionBtn) motionBtn.innerText = "Reduced Motion";
    } else {
        body.classList.remove("reduced-motion");
        if (motionBtn) motionBtn.innerText = "Normal Motion";
    }
}

function setA11yTextSize(size) {
    const body = document.body;
    body.classList.remove("font-size-medium", "font-size-large");
    if (size === "medium") body.classList.add("font-size-medium");
    if (size === "large") body.classList.add("font-size-large");
    localStorage.setItem("suraksha_a11y_textsize", size);

    // Update button active state
    document.querySelectorAll('.a11y-section:nth-child(1) .a11y-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        if (size === 'normal' && idx === 0) btn.classList.add('active');
        if (size === 'medium' && idx === 1) btn.classList.add('active');
        if (size === 'large' && idx === 2) btn.classList.add('active');
    });
}

function setA11yTheme(theme) {
    const body = document.body;
    body.classList.remove("theme-high-contrast-dark", "theme-high-contrast-light");
    if (theme === "high-contrast-dark") body.classList.add("theme-high-contrast-dark");
    if (theme === "high-contrast-light") body.classList.add("theme-high-contrast-light");
    localStorage.setItem("suraksha_a11y_theme", theme);

    // Update button active state
    document.querySelectorAll('.a11y-section:nth-child(2) .a11y-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        if (theme === 'dark' && idx === 0) btn.classList.add('active');
        if (theme === 'high-contrast-dark' && idx === 1) btn.classList.add('active');
        if (theme === 'high-contrast-light' && idx === 2) btn.classList.add('active');
    });
}

function toggleA11yDyslexia() {
    const dyslexia = localStorage.getItem("suraksha_a11y_dyslexia") === "true";
    localStorage.setItem("suraksha_a11y_dyslexia", !dyslexia);
    applyA11ySettings();
}

function toggleA11yAnimations() {
    const reduced = localStorage.getItem("suraksha_a11y_animations") === "true";
    localStorage.setItem("suraksha_a11y_animations", !reduced);
    applyA11ySettings();
}

function toggleA11yPanel() {
    const panel = document.getElementById("a11y-panel");
    if (panel.style.display === "none") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}

// GUI Dashboard and Interface Toggle Logic
function switchInterface(mode) {
    const term = document.getElementById("terminal-container");
    const gui = document.getElementById("gui-container");

    localStorage.setItem("suraksha_interface_mode", mode);

    if (mode === "gui") {
        term.style.display = "none";
        gui.style.display = "block";
        updateGuiDashboard();
    } else {
        gui.style.display = "none";
        term.style.display = "block";
        if (input) input.focus();
    }
}

function launchModule(moduleName) {
    if (moduleName === "feed") {
        goTo("fb-ads");
    } else if (moduleName === "chatscam") {
        goTo("chat-scam");
    } else if (moduleName === "instagram") {
        localStorage.setItem('sim_platform', 'instagram');
        goTo("fb-ads");
    } else if (moduleName === "twitter") {
        localStorage.setItem('sim_platform', 'twitter');
        goTo("fb-ads");
    } else if (moduleName === "snapchat") {
        localStorage.setItem('social_scenario', 'snapchat');
        goTo("social");
    } else {
        goTo(moduleName);
    }
}

function updateGuiDashboard() {
    // 1. Calculate and update progress percentage
    const totalModules = modules.length;
    const completedCount = progress.filter(m => modules.includes(m)).length;
    const percentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    const pctText = document.getElementById("guiProgressPct");
    if (pctText) pctText.innerText = percentage + "%";

    // SVG Circular Ring animation (circumference is 263.89)
    const ringBar = document.getElementById("guiProgressRing");
    if (ringBar) {
        const offset = 263.89 - (263.89 * percentage) / 100;
        ringBar.style.strokeDashoffset = offset;
    }

    // 2. Update Safety Level Banner
    const safetyLabel = document.getElementById("guiSafetyLevel");
    if (safetyLabel) {
        safetyLabel.classList.remove("warning", "success");
        if (completedCount === 0) {
            safetyLabel.innerText = "UNVERIFIED";
        } else if (completedCount < 3) {
            safetyLabel.innerText = "LEARNER";
            safetyLabel.classList.add("warning");
        } else if (completedCount < 6) {
            safetyLabel.innerText = "CITIZEN GUARD";
            safetyLabel.classList.add("success");
        } else {
            safetyLabel.innerText = "DIGITAL SURAKSHAK";
            safetyLabel.classList.add("success");
        }
    }

    // 3. Update unlocked badges list
    const badgesList = document.getElementById("unlockedBadges");
    if (badgesList) {
        badgesList.innerHTML = "";
        const earned = progress.filter(m => modules.includes(m));
        if (earned.length === 0) {
            badgesList.innerHTML = '<span class="no-badges">No badges earned yet.</span>';
        } else {
            earned.forEach(m => {
                let badgeEmoji = "🛡️";
                if (m === "learn") badgeEmoji = "📚";
                else if (m === "scan") badgeEmoji = "🔍";
                else if (m === "protect") badgeEmoji = "🔑";
                else if (m === "rights") badgeEmoji = "⚖️";
                else if (m === "quiz") badgeEmoji = "🎓";
                else if (m === "social") badgeEmoji = "📷";
                else if (m === "snapchat") badgeEmoji = "👻";
                else if (m === "ads") badgeEmoji = "📢";
                else if (m === "feed") badgeEmoji = "📰";
                else if (m === "whatsapp") badgeEmoji = "💬";
                else if (m === "telegram") badgeEmoji = "✈️";
                else if (m === "chatscam") badgeEmoji = "💬";
                else if (m === "mission") badgeEmoji = "🎯";

                const span = document.createElement("span");
                span.className = "badge-item";
                span.innerHTML = `<span>${badgeEmoji}</span> ${m.toUpperCase()}`;
                badgesList.appendChild(span);
            });
        }
    }

    // 4. Update status pills on all module cards
    modules.forEach(m => {
        const pill = document.getElementById("status-" + m);
        if (pill) {
            if (progress.includes(m)) {
                pill.innerText = "Completed";
                pill.className = "card-status-pill completed";
            } else {
                pill.innerText = "Not Started";
                pill.className = "card-status-pill";
            }
        }
    });
}

// Guided Onboarding System
function showOnboarding() {
    onboardCurrentSlide = 0;
    const modal = document.getElementById("onboarding-modal");
    if (modal) modal.style.display = "flex";
    renderOnboardSlide();
}

function renderOnboardSlide() {
    const slide = ONBOARDING_SLIDES[onboardCurrentSlide];
    const body = document.getElementById("onboardingBody");
    const title = document.querySelector("#onboarding-modal h2");

    if (body && slide) {
        title.innerText = slide.title;
        body.innerHTML = slide.html;
    }

    // Update dots indicator
    const dotsContainer = document.getElementById("onboardDots");
    if (dotsContainer) {
        dotsContainer.innerHTML = "";
        ONBOARDING_SLIDES.forEach((_, idx) => {
            const dot = document.createElement("span");
            dot.className = "onboard-dot" + (idx === onboardCurrentSlide ? " active" : "");
            dotsContainer.appendChild(dot);
        });
    }

    // Enable/disable buttons
    const prevBtn = document.getElementById("onboardPrev");
    const nextBtn = document.getElementById("onboardNext");

    if (prevBtn) {
        prevBtn.style.visibility = onboardCurrentSlide === 0 ? "hidden" : "visible";
    }

    if (nextBtn) {
        nextBtn.innerText = onboardCurrentSlide === ONBOARDING_SLIDES.length - 1 ? "Finish" : "Next";
    }
}

function onboardNext() {
    if (onboardCurrentSlide < ONBOARDING_SLIDES.length - 1) {
        onboardCurrentSlide++;
        renderOnboardSlide();
    } else {
        closeOnboarding();
    }
}

function onboardPrev() {
    if (onboardCurrentSlide > 0) {
        onboardCurrentSlide--;
        renderOnboardSlide();
    }
}

function closeOnboarding() {
    const modal = document.getElementById("onboarding-modal");
    if (modal) modal.style.display = "none";
    localStorage.setItem("suraksha_onboarding_completed", "true");
}

// Autocomplete suggestion chip UI update
function updateSuggestions(val) {
    if (!terminalSuggestions) return;
    terminalSuggestions.innerHTML = "";

    const typed = val.trim().toLowerCase();

    // Determine which commands to show
    let matches = [];
    if (!typed) {
        // Show default shortcuts if input is empty
        matches = ["help", "learn", "scan", "panic"];
    } else {
        // Filter based on prefix
        matches = VALID_COMMANDS.filter(cmd => cmd.startsWith(typed));
    }

    matches.forEach(match => {
        const chip = document.createElement("span");
        chip.className = "suggestion-chip";
        chip.innerText = match;
        chip.addEventListener("click", function () {
            if (input) {
                input.value = match;
                input.focus();
                updateSuggestions(match);
            }
        });
        terminalSuggestions.appendChild(chip);
    });
}

// Boot Sequence & Journey Initialization
window.onload = () => {
    // Initialize Theme Manager
    ThemeManager.init();

    // Apply initial accessibility adjustments
    applyA11ySettings();

    // Bind Accessibility floating click
    const a11yTrigger = document.getElementById("a11y-trigger");
    if (a11yTrigger) {
        a11yTrigger.addEventListener("click", toggleA11yPanel);
        a11yTrigger.addEventListener("keypress", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                toggleA11yPanel();
            }
        });
    }

    // Check for completion message from modules (passed via URL query string)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('achieved')) {
        const achieved = urlParams.get('achieved');
        markComplete(achieved);

        output.innerHTML += `<p class="success">✔ Great work! You've mastered the '${achieved}' module. You are now one step closer to being digitally secure.</p>`;

        const completedCount = progress.filter(m => modules.includes(m)).length;
        if (completedCount === modules.length) {
            output.innerHTML += `
            <div class="success" style="border: 2px solid var(--success-color); padding: 15px; margin-top: 20px; border-radius: 8px; font-weight: bold; background: rgba(63, 185, 80, 0.1);">
                🎉 TRANSFORMATION COMPLETE: You are now a DIGITAL SURAKSHAK! 
                <p style="font-weight: normal; margin-top: 10px;">You have the knowledge to protect yourself and your family in Nepal's digital world. Spread the word!</p>
            </div>`;
        }
    }

    // Setup initial suggestions list
    updateSuggestions("");

    runBootSequence();
};

function runBootSequence() {
    const bootScreen = document.getElementById("boot-screen");
    const terminalContainer = document.getElementById("terminal-container");
    const guiContainer = document.getElementById("gui-container");
    const progressBar = document.getElementById("boot-progress-bar");
    const percentageText = document.getElementById("boot-percentage");
    const bootMessage = document.getElementById("boot-message");
    const commandInput = document.getElementById("commandInput");

    let bootProgress = 0;
    const interval = setInterval(() => {
        bootProgress += Math.floor(Math.random() * 5) + 1; // Random increment for realism

        if (bootProgress >= 100) {
            bootProgress = 100;
            clearInterval(interval);

            progressBar.style.width = "100%";
            percentageText.innerText = "100%";
            bootMessage.innerText = "System Ready. Welcome Citizen.";

            setTimeout(() => {
                bootScreen.style.display = "none";

                // Load preferred interface mode
                const preferredMode = localStorage.getItem("suraksha_interface_mode") || "terminal";
                if (preferredMode === "gui") {
                    guiContainer.style.display = "block";
                    updateGuiDashboard();
                } else {
                    terminalContainer.style.display = "block";
                    output.innerHTML += `<p class="success">Initializing Citizens Safety Protocol...</p>`;
                    output.innerHTML += `<p class="success">Welcome Citizen. Type 'help' to begin.</p>`;
                    updateSafetyMeter();
                    triggerBootAnimation();
                    if (commandInput) commandInput.focus();
                }

                // Show onboarding if not completed before
                const onboardingCompleted = localStorage.getItem("suraksha_onboarding_completed") === "true";
                if (!onboardingCompleted) {
                    showOnboarding();
                }
            }, 800);
        } else {
            progressBar.style.width = bootProgress + "%";
            percentageText.innerText = bootProgress + "%";

            if (bootProgress > 20 && bootProgress < 40) bootMessage.innerText = "Encrypting Data Streams...";
            if (bootProgress > 40 && bootProgress < 60) bootMessage.innerText = "Scanning for Digital Threats...";
            if (bootProgress > 60 && bootProgress < 80) bootMessage.innerText = "Activating Citizen Shields...";
            if (bootProgress > 80 && bootProgress < 95) bootMessage.innerText = "Finalizing Secure Gateway...";
        }
    }, 50);
}

function triggerBootAnimation() {
    const lines = document.querySelectorAll("#output p, #output div.intro-guidance p, #output #boot-sequence p");
    const output = document.getElementById("output");

    // Hide all lines initially
    lines.forEach(line => {
        line.setAttribute('data-text', line.innerHTML);
        line.innerHTML = '';
        line.style.opacity = "1";
    });

    async function typeLine(index) {
        if (index >= lines.length) return;

        const line = lines[index];
        const text = line.getAttribute('data-text');
        let currentText = '';
        let isTag = false;

        for (let char of text) {
            if (char === '<') isTag = true;
            currentText += char;
            if (char === '>') isTag = false;

            if (!isTag) {
                line.innerHTML = currentText;
                output.scrollTop = output.scrollHeight;
                await new Promise(resolve => setTimeout(resolve, 5)); // Very fast typing
            }
        }

        line.innerHTML = text; // Ensure final HTML is perfect
        setTimeout(() => typeLine(index + 1), 50); // Small pause between lines
    }

    typeLine(0);
}

// AI Security Guide - Floating Chat Icon Functionality
function initializeAIChatIcon() {
    const chatIcon = document.getElementById('ai-chat-icon');
    if (!chatIcon) return;

    chatIcon.addEventListener('click', function () {
        toggleAIChat();
    });

    // Add keyboard accessibility
    chatIcon.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAIChat();
        }
    });

    // Make it focusable for accessibility
    chatIcon.setAttribute('tabindex', '0');
    chatIcon.setAttribute('role', 'button');
    chatIcon.setAttribute('aria-label', 'Open AI Security Guide - Learn about 2FA and account protection');
}

function toggleAIChat() {
    if (aiChatOpen) {
        closeAIChat();
    } else {
        openAIChat();
    }
}

function openAIChat() {
    aiChatOpen = true;
    const chatWindow = document.getElementById('ai-chat-window');
    const chatIcon = document.getElementById('ai-chat-icon');

    if (chatWindow) {
        chatWindow.style.display = 'block';

        // Focus on input field
        setTimeout(() => {
            const chatInput = document.getElementById('ai-chat-input');
            if (chatInput) chatInput.focus();
        }, 300);
    }

    // Visual feedback for icon
    if (chatIcon) {
        chatIcon.style.transform = 'scale(0.9)';
        setTimeout(() => {
            chatIcon.style.transform = 'scale(1)';
        }, 150);
    }

    // Initialize chat functionality
    initializeChatFunctionality();

    console.log('AI Chat window opened');
}

function closeAIChat() {
    aiChatOpen = false;
    const chatWindow = document.getElementById('ai-chat-window');
    const chatIcon = document.getElementById('ai-chat-icon');

    if (chatWindow) {
        chatWindow.style.display = 'none';
    }

    // Reset icon appearance
    if (chatIcon) {
        chatIcon.style.transform = 'scale(1)';
        chatIcon.style.background = 'var(--accent-color)';
    }

    console.log('AI Chat window closed');
}

function minimizeAIChat() {
    closeAIChat(); // For now, minimize acts the same as close
}

// Chat Window Functionality
function initializeChatFunctionality() {
    // Initialize only once
    if (window.chatInitialized) return;
    window.chatInitialized = true;

    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const closeBtn = document.querySelector('.close-btn');
    const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');

    // Send button click
    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }

    // Enter key to send
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // Control buttons
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', minimizeAIChat);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAIChat);
    }

    // Quick question buttons
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const question = this.getAttribute('data-question');
            if (question && chatInput) {
                chatInput.value = question;
                handleSendMessage();
            }
        });
    });

    // Click outside to close
    document.addEventListener('click', function (e) {
        const chatWindow = document.getElementById('ai-chat-window');
        const chatIcon = document.getElementById('ai-chat-icon');

        if (aiChatOpen && chatWindow && !chatWindow.contains(e.target) && !chatIcon.contains(e.target)) {
            closeAIChat();
        }
    });
}

function handleSendMessage() {
    const chatInput = document.getElementById('ai-chat-input');
    const messagesContainer = document.getElementById('ai-chat-messages');

    if (!chatInput || !messagesContainer) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addUserMessage(message);

    // Clear input
    chatInput.value = '';

    // Simulate AI response (will be replaced with actual AI logic in next tasks)
    setTimeout(() => {
        addAIMessage(getSimulatedResponse(message));
    }, 500);
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    messageElement.innerHTML = `
        <div class="user-avatar">U</div>
        <div class="user-message-content">
            <div class="user-message-text">
                <p>${escapeHtml(message)}</p>
            </div>
            <div class="user-message-time">${getCurrentTime()}</div>
        </div>
    `;

    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function addAIMessage(message) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'ai-message';
    messageElement.innerHTML = `
        <div class="ai-avatar">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="ai-message-content">
            <div class="ai-message-text">
                ${message}
            </div>
            <div class="ai-message-time">${getCurrentTime()}</div>
        </div>
    `;

    messagesContainer.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// AI Response Engine for 2FA Education
class AIResponseEngine {
    constructor() {
        this.conversationContext = {
            lastIntent: null,
            demoOffered: false,
            platformDiscussed: null,
            userLevel: 'beginner' // beginner, intermediate, advanced
        };
    }

    processQuery(userInput) {
        const intent = this.detectIntent(userInput);
        const response = this.generateResponse(intent, userInput);

        // Update conversation context
        this.conversationContext.lastIntent = intent;

        return response;
    }

    detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        // 2FA Basic Questions
        if (this.matchesPatterns(lowerMessage, [
            'what is 2fa', 'what is two factor', 'explain 2fa', 'define 2fa',
            'what does 2fa mean', 'two factor authentication'
        ])) {
            return 'explain_2fa';
        }

        // Setup Instructions
        if (this.matchesPatterns(lowerMessage, [
            'how to enable', 'how to setup', 'how to turn on', 'enable 2fa',
            'setup 2fa', 'activate 2fa', 'how do i enable'
        ])) {
            return 'setup_instructions';
        }

        // Authenticator Apps
        if (this.matchesPatterns(lowerMessage, [
            'authenticator app', 'google authenticator', 'microsoft authenticator',
            'authy', 'authenticator', 'app for 2fa', 'which app'
        ])) {
            return 'authenticator_apps';
        }

        // Platform Specific
        if (this.matchesPatterns(lowerMessage, [
            'facebook', 'instagram', 'whatsapp', 'gmail', 'google',
            'twitter', 'social media'
        ])) {
            return 'platform_specific';
        }

        // Demo Requests
        if (this.matchesPatterns(lowerMessage, [
            'show me', 'demo', 'demonstration', 'walk through',
            'step by step', 'tutorial', 'guide me'
        ])) {
            return 'demo_request';
        }

        // Security Threats
        if (this.matchesPatterns(lowerMessage, [
            'why 2fa', 'security', 'hacker', 'attack', 'protect',
            'safe', 'secure', 'threat', 'risk'
        ])) {
            return 'security_importance';
        }

        // Yes/No responses
        if (this.matchesPatterns(lowerMessage, ['yes', 'yeah', 'sure', 'ok', 'okay'])) {
            return 'affirmative';
        }

        if (this.matchesPatterns(lowerMessage, ['no', 'nah', 'not now', 'maybe later'])) {
            return 'negative';
        }

        // Help
        if (this.matchesPatterns(lowerMessage, ['help', 'what can you do', 'commands'])) {
            return 'help';
        }

        return 'unknown';
    }

    matchesPatterns(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    }

    generateResponse(intent, userInput) {
        switch (intent) {
            case 'explain_2fa':
                return this.explain2FA();

            case 'setup_instructions':
                return this.setupInstructions();

            case 'authenticator_apps':
                return this.authenticatorApps();

            case 'platform_specific':
                return this.platformSpecific(userInput);

            case 'demo_request':
                return this.demoRequest();

            case 'security_importance':
                return this.securityImportance();

            case 'affirmative':
                return this.handleAffirmative();

            case 'negative':
                return this.handleNegative();

            case 'help':
                return this.helpResponse();

            default:
                return this.unknownResponse();
        }
    }

    explain2FA() {
        this.conversationContext.demoOffered = true;
        return `
            <p><strong>🛡️ Two-Factor Authentication (2FA)</strong> is like having two locks on your door instead of one!</p>
            <p><strong>Here's how it works:</strong></p>
            <p>🔐 <strong>First Factor:</strong> Your password (something you know)</p>
            <p>📱 <strong>Second Factor:</strong> A code from your phone (something you have)</p>
            <p><strong>Why it's powerful:</strong> Even if a hacker steals your password, they still can't get in without your phone!</p>
            <p>In Nepal, this is especially important as cyber attacks are increasing. The Nepal Cyber Bureau recommends 2FA for all important accounts.</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Would you like to see a setup demo?</strong></p>
                <p>I can show you exactly how to enable 2FA on Facebook, Instagram, or WhatsApp!</p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Yes, show me a demo">Yes, show me a demo!</button>
                    <button class="quick-question-btn" data-question="Tell me more about security">Tell me more first</button>
                </div>
            </div>
        `;
    }

    setupInstructions() {
        this.conversationContext.demoOffered = true;
        return `
            <p><strong>📋 General 2FA Setup Steps:</strong></p>
            <p><strong>1. Account Settings</strong> - Go to your account/profile settings</p>
            <p><strong>2. Security Section</strong> - Look for "Security", "Privacy & Security", or "Login"</p>
            <p><strong>3. Find 2FA Option</strong> - Search for "Two-Factor Authentication" or "2FA"</p>
            <p><strong>4. Choose Method:</strong></p>
            <p>   📱 <strong>SMS:</strong> Codes sent to your phone (easier but less secure)</p>
            <p>   🔐 <strong>Authenticator App:</strong> More secure, works offline</p>
            <p><strong>5. Follow Setup</strong> - Scan QR code or enter verification code</p>
            <p><strong>6. Save Backup Codes</strong> - Keep these safe in case you lose your phone!</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Want to see this in action?</strong></p>
                <p>I can walk you through the exact steps for popular platforms!</p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Show Facebook 2FA setup">Facebook Setup</button>
                    <button class="quick-question-btn" data-question="Show Instagram 2FA setup">Instagram Setup</button>
                    <button class="quick-question-btn" data-question="Show WhatsApp 2FA setup">WhatsApp Setup</button>
                </div>
            </div>
        `;
    }

    authenticatorApps() {
        return `
            <p><strong>📱 Authenticator Apps - Your Digital Security Guard!</strong></p>
            <p><strong>🥇 Recommended Apps:</strong></p>
            <p><strong>Google Authenticator</strong> - Simple, reliable, works everywhere</p>
            <p><strong>Microsoft Authenticator</strong> - Great for Microsoft services, backup features</p>
            <p><strong>Authy</strong> - Syncs across devices, has backup</p>
            <p><strong>🔐 How they work:</strong></p>
            <p>• Generate new 6-digit codes every 30 seconds</p>
            <p>• Work offline (no internet needed)</p>
            <p>• Much safer than SMS (can't be intercepted)</p>
            <p><strong>💡 Pro Tip for Nepal:</strong> Download the app before you travel to areas with poor network coverage - it works without internet!</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Want to see how to set one up?</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Show authenticator setup demo">Show me the setup process</button>
                    <button class="quick-question-btn" data-question="Which authenticator app is best">Which app should I choose?</button>
                </div>
            </div>
        `;
    }

    platformSpecific(userInput) {
        const lowerInput = userInput.toLowerCase();
        let platform = '';

        if (lowerInput.includes('facebook')) platform = 'Facebook';
        else if (lowerInput.includes('instagram')) platform = 'Instagram';
        else if (lowerInput.includes('whatsapp')) platform = 'WhatsApp';
        else if (lowerInput.includes('gmail') || lowerInput.includes('google')) platform = 'Google';

        this.conversationContext.platformDiscussed = platform;
        this.conversationContext.demoOffered = true;

        return `
            <p><strong>🎯 ${platform} 2FA Setup</strong></p>
            <p><strong>Why ${platform} needs 2FA:</strong></p>
            <p>• Protects your personal messages and photos</p>
            <p>• Prevents hackers from impersonating you</p>
            <p>• Keeps your contacts and data safe</p>
            <p><strong>📱 ${platform} supports both SMS and Authenticator apps</strong></p>
            <p>In Nepal, many people use ${platform} for business and personal communication, making it a prime target for attackers.</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Ready to secure your ${platform} account?</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Start ${platform} demo">Start ${platform} Demo</button>
                    <button class="quick-question-btn" data-question="Show me attack prevention">Show me how 2FA stops attacks</button>
                </div>
            </div>
        `;
    }

    demoRequest() {
        return `
            <p><strong>🎯 Interactive 2FA Demo Available!</strong></p>
            <p>I can show you step-by-step simulations for:</p>
            <p><strong>📱 Platform Demos:</strong></p>
            <p>• <strong>Facebook</strong> - Account settings to 2FA activation</p>
            <p>• <strong>Instagram</strong> - Security settings walkthrough</p>
            <p>• <strong>WhatsApp</strong> - Two-step verification setup</p>
            <p><strong>🔐 Security Demos:</strong></p>
            <p>• <strong>Authenticator App Setup</strong> - QR code scanning simulation</p>
            <p>• <strong>Attack Prevention</strong> - See how 2FA stops hackers</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Choose your demo:</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Start Facebook demo">📘 Facebook 2FA Setup</button>
                    <button class="quick-question-btn" data-question="Start Instagram demo">📷 Instagram Security</button>
                    <button class="quick-question-btn" data-question="Start WhatsApp demo">💬 WhatsApp Two-Step</button>
                    <button class="quick-question-btn" data-question="Show attack prevention demo">🛡️ Attack Prevention</button>
                </div>
            </div>
        `;
    }

    platformSpecific(userInput) {
        const lowerInput = userInput.toLowerCase();
        let platform = '';

        if (lowerInput.includes('facebook')) platform = 'Facebook';
        else if (lowerInput.includes('instagram')) platform = 'Instagram';
        else if (lowerInput.includes('whatsapp')) platform = 'WhatsApp';
        else if (lowerInput.includes('gmail') || lowerInput.includes('google')) platform = 'Google';

        this.conversationContext.platformDiscussed = platform;
        this.conversationContext.demoOffered = true;

        return `
            <p><strong>🎯 ${platform} 2FA Setup</strong></p>
            <p><strong>Why ${platform} needs 2FA in Nepal:</strong></p>
            ${this.getPlatformSpecificInfo(platform)}
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Ready to secure your ${platform} account?</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Start ${platform} demo">Start ${platform} Demo</button>
                    <button class="quick-question-btn" data-question="Show me attack prevention">Show Attack Prevention</button>
                    <button class="quick-question-btn" data-question="Tell me about other platforms">Other Platforms</button>
                </div>
            </div>
        `;
    }

    getPlatformSpecificInfo(platform) {
        switch (platform) {
            case 'Facebook':
                return `
                    <p>• Most popular social platform in Nepal with 12+ million users</p>
                    <p>• Frequently targeted for account takeovers and scam spreading</p>
                    <p>• Protects your personal photos, messages, and friend connections</p>
                    <p>• Prevents scammers from impersonating you to your family</p>
                `;
            case 'Instagram':
                return `
                    <p>• Growing rapidly in Nepal, especially among young users</p>
                    <p>• Business accounts are prime targets for cybercriminals</p>
                    <p>• Protects your photos, stories, and direct messages</p>
                    <p>• Essential for content creators and businesses</p>
                `;
            case 'WhatsApp':
                return `
                    <p>• Primary communication app for most Nepali families and businesses</p>
                    <p>• SIM swapping attacks are increasing in Nepal</p>
                    <p>• Protects your chat history and prevents account hijacking</p>
                    <p>• Critical for business communications and family groups</p>
                `;
            default:
                return `
                    <p>• Protects your personal messages and data</p>
                    <p>• Prevents hackers from impersonating you</p>
                    <p>• Keeps your contacts and information safe</p>
                `;
        }
    }

    securityImportance() {
        return `
            <p><strong>🛡️ Why 2FA is Critical in Nepal</strong></p>
            <p><strong>Growing Cyber Threats:</strong></p>
            <p>• Nepal Cyber Bureau reports 300% increase in cyber attacks (2023)</p>
            <p>• Social media account takeovers are the #1 threat</p>
            <p>• Scammers target Nepali users through compromised accounts</p>
            <p><strong>🇳🇵 Common Attack Methods in Nepal:</strong></p>
            <p>• <strong>SIM Swapping:</strong> Criminals transfer your phone number to their SIM</p>
            <p>• <strong>Phishing:</strong> Fake login pages steal your passwords</p>
            <p>• <strong>Data Breaches:</strong> Your password gets leaked from other sites</p>
            <p>• <strong>Social Engineering:</strong> Scammers trick you into giving access</p>
            <p><strong>🔐 How 2FA Stops These Attacks:</strong></p>
            <p>• Even if they get your password, they need your phone too</p>
            <p>• Authenticator apps work offline (no network needed)</p>
            <p>• You get notified of suspicious login attempts</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Want to see 2FA in action?</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Show attack prevention demo">See Attack Prevention Demo</button>
                    <button class="quick-question-btn" data-question="Start Facebook demo">Learn Facebook Setup</button>
                    <button class="quick-question-btn" data-question="What are authenticator apps?">About Authenticator Apps</button>
                </div>
            </div>
        `;
    }

    handleAffirmative() {
        if (this.conversationContext.demoOffered) {
            if (this.conversationContext.platformDiscussed) {
                // Start demo for the discussed platform
                return demoSystem.startDemo(this.conversationContext.platformDiscussed);
            } else {
                // Show platform selection
                return this.demoRequest();
            }
        }

        return this.unknownResponse();
    }

    handleNegative() {
        this.conversationContext.demoOffered = false;
        return `
            <p>No problem! I'm here whenever you're ready to learn about 2FA.</p>
            <p><strong>You can always ask me:</strong></p>
            <div class="quick-questions">
                <button class="quick-question-btn" data-question="What is 2FA?">What is 2FA?</button>
                <button class="quick-question-btn" data-question="Why is 2FA important?">Why is it important?</button>
                <button class="quick-question-btn" data-question="How to enable 2FA?">How to enable it?</button>
                <button class="quick-question-btn" data-question="Help">Show all options</button>
            </div>
        `;
    }

    authenticatorApps() {
        return `
            <p><strong>📱 Authenticator Apps - Your Digital Security Guard!</strong></p>
            <p><strong>🥇 Recommended Apps for Nepal:</strong></p>
            <p><strong>Google Authenticator</strong> - Simple, reliable, works everywhere</p>
            <p><strong>Microsoft Authenticator</strong> - Great backup features, syncs across devices</p>
            <p><strong>Authy</strong> - Multi-device support, cloud backup</p>
            <p><strong>🔐 How they work:</strong></p>
            <p>• Generate new 6-digit codes every 30 seconds</p>
            <p>• Work offline (perfect for Nepal's network issues)</p>
            <p>• Much safer than SMS (can't be intercepted)</p>
            <p><strong>💡 Pro Tips for Nepal:</strong></p>
            <p>• Download before traveling to remote areas</p>
            <p>• Works without internet or mobile data</p>
            <p>• Backup your accounts to multiple devices</p>
            <div class="demo-offer" style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>🎯 Want to see how to set one up?</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Start Facebook demo">Facebook Setup Demo</button>
                    <button class="quick-question-btn" data-question="Start Instagram demo">Instagram Setup Demo</button>
                    <button class="quick-question-btn" data-question="Which authenticator app is best">Which app should I choose?</button>
                </div>
            </div>
        `;
    }

    securityImportance() {
        return `
            <p><strong>🚨 Why 2FA is Critical for Your Security</strong></p>
            <p><strong>🇳🇵 In Nepal:</strong></p>
            <p>• Cyber attacks increased 300% in recent years</p>
            <p>• Social media account hacking is common</p>
            <p>• Financial fraud through compromised accounts</p>
            <p><strong>🛡️ How 2FA Protects You:</strong></p>
            <p><strong>Without 2FA:</strong> Password stolen = Account compromised</p>
            <p><strong>With 2FA:</strong> Password stolen + Phone needed = You stay safe!</p>
            <p><strong>Real Attack Scenarios 2FA Prevents:</strong></p>
            <p>• Phishing emails that steal passwords</p>
            <p>• Data breaches exposing login credentials</p>
            <p>• SIM swapping attacks (when using authenticator apps)</p>
            <div class="demo-offer" style="background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); padding: 12px; border-radius: 8px; margin-top: 12px;">
                <p><strong>⚠️ Want to see how attacks work and how 2FA stops them?</strong></p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Show attack simulation">Show Attack Simulation</button>
                    <button class="quick-question-btn" data-question="Start 2FA setup now">I'm convinced - let's set up 2FA!</button>
                </div>
            </div>
        `;
    }

    handleAffirmative() {
        if (this.conversationContext.demoOffered) {
            return this.demoRequest();
        }
        return `
            <p>Great! I'm here to help you with 2FA and account security.</p>
            <div class="quick-questions">
                <button class="quick-question-btn" data-question="What is 2FA?">What is 2FA?</button>
                <button class="quick-question-btn" data-question="Show me a demo">Show me a demo</button>
                <button class="quick-question-btn" data-question="How to enable 2FA?">How to enable 2FA?</button>
            </div>
        `;
    }

    handleNegative() {
        return `
            <p>No problem! I'm here whenever you're ready to learn about 2FA.</p>
            <p>Feel free to ask me anything about account security, or try:</p>
            <div class="quick-questions">
                <button class="quick-question-btn" data-question="Why is 2FA important?">Why is 2FA important?</button>
                <button class="quick-question-btn" data-question="What are authenticator apps?">What are authenticator apps?</button>
                <button class="quick-question-btn" data-question="Help">Show me all options</button>
            </div>
        `;
    }

    helpResponse() {
        return `
            <p><strong>🛡️ AI Security Guide - Help Menu</strong></p>
            <p><strong>I can help you with:</strong></p>
            <p><strong>📚 Learning:</strong></p>
            <p>• "What is 2FA?" - Basic explanation</p>
            <p>• "How to enable 2FA?" - Setup instructions</p>
            <p>• "What are authenticator apps?" - App recommendations</p>
            <p><strong>🎯 Interactive Demos:</strong></p>
            <p>• "Show Facebook demo" - Facebook 2FA setup</p>
            <p>• "Show Instagram demo" - Instagram security</p>
            <p>• "Show WhatsApp demo" - WhatsApp two-step verification</p>
            <p>• "Show attack demo" - See how 2FA prevents attacks</p>
            <p><strong>🇳🇵 Nepal-Specific:</strong></p>
            <p>• Local cyber threat information</p>
            <p>• Platform usage patterns in Nepal</p>
            <p>• Nepal Cyber Bureau resources</p>
            <div class="quick-questions">
                <button class="quick-question-btn" data-question="What is 2FA?">Start with basics</button>
                <button class="quick-question-btn" data-question="Show me a demo">Jump to demo</button>
            </div>
        `;
    }

    unknownResponse() {
        return `
            <p>I understand you're asking about security! 🛡️</p>
            <p>I specialize in <strong>Two-Factor Authentication (2FA)</strong> and account protection.</p>
            <p><strong>Try asking me:</strong></p>
            <div class="quick-questions">
                <button class="quick-question-btn" data-question="What is 2FA?">What is 2FA?</button>
                <button class="quick-question-btn" data-question="How to enable 2FA?">How to enable 2FA?</button>
                <button class="quick-question-btn" data-question="Show me a demo">Show me a demo</button>
                <button class="quick-question-btn" data-question="Help">Show all options</button>
            </div>
        `;
    }
}

// Demo System - Interactive 2FA Setup Demonstrations
class DemoSystem {
    constructor() {
        this.currentDemo = null;
        this.demoState = {
            isActive: false,
            platform: null,
            method: null,
            currentStep: 0,
            totalSteps: 0,
            stepData: []
        };
    }

    startDemo(platform, method = 'authenticator') {
        this.demoState = {
            isActive: true,
            platform: platform.toLowerCase(),
            method: method,
            currentStep: 0,
            totalSteps: 0,
            stepData: []
        };

        // Load demo data based on platform
        this.loadDemoData(platform.toLowerCase());

        // Show demo area
        this.showDemoArea();

        // Start first step
        this.showCurrentStep();

        return `
            <p><strong>🎯 Starting ${platform} 2FA Setup Demo!</strong></p>
            <p>I'll walk you through each step. The demo area has opened below - follow along!</p>
            <p><em>This is a safe simulation - no real accounts will be modified.</em></p>
        `;
    }

    loadDemoData(platform) {
        switch (platform) {
            case 'facebook':
                this.demoState.stepData = this.getFacebookDemoSteps();
                break;
            case 'instagram':
                this.demoState.stepData = this.getInstagramDemoSteps();
                break;
            case 'whatsapp':
                this.demoState.stepData = this.getWhatsAppDemoSteps();
                break;
            case 'attack':
                this.demoState.stepData = this.getAttackPreventionSteps();
                break;
            default:
                this.demoState.stepData = this.getGenericDemoSteps();
        }
        this.demoState.totalSteps = this.demoState.stepData.length;
    }

    getFacebookDemoSteps() {
        return [
            {
                title: "Open Facebook Settings",
                description: "First, we'll navigate to your Facebook account settings where all security options are located.",
                visual: this.createFacebookSettingsVisual(),
                action: "Click on your profile picture, then select 'Settings & Privacy' → 'Settings'"
            },
            {
                title: "Find Security Settings",
                description: "In the left sidebar, we'll locate the security and login section.",
                visual: this.createSecuritySectionVisual(),
                action: "Click on 'Security and Login' in the left menu"
            },
            {
                title: "Locate Two-Factor Authentication",
                description: "Scroll down to find the Two-Factor Authentication option in the security settings.",
                visual: this.create2FAOptionVisual(),
                action: "Find 'Two-Factor Authentication' and click 'Edit'"
            },
            {
                title: "Choose Authentication Method",
                description: "Facebook offers SMS and Authenticator App options. Authenticator apps are more secure.",
                visual: this.createMethodSelectionVisual(),
                action: "Select 'Authentication App' for better security"
            },
            {
                title: "Set Up Authenticator App",
                description: "Scan the QR code with your authenticator app and enter the verification code.",
                visual: this.createQRCodeVisual(),
                action: "Scan QR code with Google Authenticator, then enter the 6-digit code"
            },
            {
                title: "Save Backup Codes",
                description: "Facebook provides backup codes in case you lose access to your authenticator app.",
                visual: this.createBackupCodesVisual(),
                action: "Download and safely store your backup codes"
            },
            {
                title: "Test Your Setup",
                description: "Let's verify that 2FA is working by testing the login process.",
                visual: this.createTestLoginVisual(),
                action: "Log out and log back in to test 2FA"
            }
        ];
    }

    getInstagramDemoSteps() {
        return [
            {
                title: "Open Instagram Settings",
                description: "Navigate to your Instagram profile and access the settings menu.",
                visual: this.createInstagramSettingsVisual(),
                action: "Tap your profile picture → Menu (☰) → Settings"
            },
            {
                title: "Access Security Settings",
                description: "Find the security section in Instagram's settings menu.",
                visual: this.createInstagramSecurityVisual(),
                action: "Tap 'Security' from the settings menu"
            },
            {
                title: "Enable Two-Factor Authentication",
                description: "Instagram calls it 'Two-Factor Authentication' in the security section.",
                visual: this.createInstagram2FAVisual(),
                action: "Tap 'Two-Factor Authentication'"
            },
            {
                title: "Choose Authentication Method",
                description: "Select between SMS or Authentication App. Apps are more secure.",
                visual: this.createInstagramMethodVisual(),
                action: "Choose 'Authentication App' for better security"
            },
            {
                title: "Set Up Authenticator",
                description: "Follow Instagram's guide to set up your authenticator app.",
                visual: this.createInstagramQRVisual(),
                action: "Scan QR code and enter verification code"
            },
            {
                title: "Confirm Setup",
                description: "Instagram will confirm that 2FA is now active on your account.",
                visual: this.createInstagramConfirmVisual(),
                action: "Tap 'Done' to complete setup"
            }
        ];
    }

    getWhatsAppDemoSteps() {
        return [
            {
                title: "Open WhatsApp Settings",
                description: "Access WhatsApp settings to find the two-step verification option.",
                visual: this.createWhatsAppSettingsVisual(),
                action: "Open WhatsApp → Settings (⚙️) → Account"
            },
            {
                title: "Find Two-Step Verification",
                description: "WhatsApp calls their 2FA feature 'Two-Step Verification'.",
                visual: this.createWhatsAppSecurityVisual(),
                action: "Tap 'Two-step verification'"
            },
            {
                title: "Enable Two-Step Verification",
                description: "Start the setup process for WhatsApp's additional security layer.",
                visual: this.createWhatsAppEnableVisual(),
                action: "Tap 'Enable' to start setup"
            },
            {
                title: "Create Your PIN",
                description: "Choose a 6-digit PIN that you'll remember. This is different from other 2FA methods.",
                visual: this.createWhatsAppPINVisual(),
                action: "Enter a memorable 6-digit PIN"
            },
            {
                title: "Add Recovery Email",
                description: "Provide an email address to recover your PIN if you forget it.",
                visual: this.createWhatsAppEmailVisual(),
                action: "Enter your email address for PIN recovery"
            },
            {
                title: "Confirm Setup",
                description: "WhatsApp will confirm that two-step verification is now active.",
                visual: this.createWhatsAppConfirmVisual(),
                action: "Your WhatsApp is now protected with 2FA!"
            }
        ];
    }

    getAttackPreventionSteps() {
        return [
            {
                title: "The Attack Scenario",
                description: "Let's see what happens when a hacker tries to access an account with 2FA enabled.",
                visual: this.createAttackScenarioVisual(),
                action: "Watch as an attacker attempts to break in"
            },
            {
                title: "Password Compromised",
                description: "The attacker has obtained your password through phishing or a data breach.",
                visual: this.createPasswordCompromisedVisual(),
                action: "Attacker enters your correct password"
            },
            {
                title: "2FA Challenge Appears",
                description: "Even with the correct password, the system asks for the 2FA code.",
                visual: this.create2FAChallengeVisual(),
                action: "System requests 6-digit authentication code"
            },
            {
                title: "Attacker Blocked",
                description: "Without access to your phone/authenticator app, the attacker cannot proceed.",
                visual: this.createAttackerBlockedVisual(),
                action: "Login attempt fails - your account stays safe!"
            },
            {
                title: "You Get Notified",
                description: "You receive a notification about the failed login attempt.",
                visual: this.createNotificationVisual(),
                action: "You're alerted to change your password"
            },
            {
                title: "Account Remains Secure",
                description: "Thanks to 2FA, your account is protected even with a compromised password.",
                visual: this.createSecureAccountVisual(),
                action: "2FA successfully prevented unauthorized access!"
            }
        ];
    }

    showDemoArea() {
        const demoArea = document.getElementById('ai-demo-area');
        if (demoArea) {
            demoArea.style.display = 'block';

            // Initialize demo controls
            this.initializeDemoControls();
        }
    }

    hideDemoArea() {
        const demoArea = document.getElementById('ai-demo-area');
        if (demoArea) {
            demoArea.style.display = 'none';
        }
        this.demoState.isActive = false;
    }

    initializeDemoControls() {
        const prevBtn = document.querySelector('.demo-prev-btn');
        const nextBtn = document.querySelector('.demo-next-btn');
        const closeBtn = document.querySelector('.demo-close-btn');

        if (prevBtn) {
            prevBtn.onclick = () => this.previousStep();
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.nextStep();
        }

        if (closeBtn) {
            closeBtn.onclick = () => this.closeDemo();
        }
    }

    showCurrentStep() {
        if (!this.demoState.isActive || this.demoState.currentStep >= this.demoState.stepData.length) {
            return;
        }

        const step = this.demoState.stepData[this.demoState.currentStep];
        const demoContent = document.getElementById('demo-content');
        const progressSpan = document.querySelector('.demo-progress');
        const prevBtn = document.querySelector('.demo-prev-btn');
        const nextBtn = document.querySelector('.demo-next-btn');

        if (demoContent) {
            demoContent.innerHTML = `
                <div class="demo-step">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    <div class="demo-visual">
                        ${step.visual}
                    </div>
                    <div class="demo-action">
                        <strong>Action:</strong> ${step.action}
                    </div>
                </div>
            `;
        }

        if (progressSpan) {
            progressSpan.textContent = `Step ${this.demoState.currentStep + 1} of ${this.demoState.totalSteps}`;
        }

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = this.demoState.currentStep === 0;
        }

        if (nextBtn) {
            const isLastStep = this.demoState.currentStep === this.demoState.totalSteps - 1;
            nextBtn.textContent = isLastStep ? 'Complete' : 'Next';
            nextBtn.disabled = false;
        }
    }

    nextStep() {
        if (this.demoState.currentStep < this.demoState.totalSteps - 1) {
            this.demoState.currentStep++;
            this.showCurrentStep();
        } else {
            this.completeDemo();
        }
    }

    previousStep() {
        if (this.demoState.currentStep > 0) {
            this.demoState.currentStep--;
            this.showCurrentStep();
        }
    }

    completeDemo() {
        const platform = this.demoState.platform;
        this.hideDemoArea();

        // Add completion message to chat
        setTimeout(() => {
            addAIMessage(`
                <div style="background: rgba(63, 185, 80, 0.1); border: 1px solid rgba(63, 185, 80, 0.3); padding: 16px; border-radius: 8px;">
                    <p><strong>🎉 Demo Complete! Your account is now safer!</strong></p>
                    <p><strong>What you've learned:</strong></p>
                    <p>✅ How to enable 2FA on ${platform}</p>
                    <p>✅ Why authenticator apps are more secure than SMS</p>
                    <p>✅ How 2FA prevents unauthorized access</p>
                    <p><strong>Next steps:</strong></p>
                    <p>1. Set up 2FA on your real ${platform} account</p>
                    <p>2. Enable 2FA on other important accounts</p>
                    <p>3. Keep your backup codes safe</p>
                    <div class="quick-questions">
                        <button class="quick-question-btn" data-question="Show another platform demo">Try Another Platform</button>
                        <button class="quick-question-btn" data-question="Show attack prevention demo">See Attack Prevention</button>
                        <button class="quick-question-btn" data-question="What other accounts need 2FA?">What other accounts need 2FA?</button>
                    </div>
                </div>
            `);
        }, 500);

        // Mark progress in Suraksha OS
        markComplete('2fa-demo');
        updateSafetyMeter();
    }

    closeDemo() {
        this.hideDemoArea();

        // Add message to chat
        setTimeout(() => {
            addAIMessage(`
                <p>Demo closed. No worries - you can restart it anytime!</p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Restart demo">Restart Demo</button>
                    <button class="quick-question-btn" data-question="Try different platform">Try Different Platform</button>
                    <button class="quick-question-btn" data-question="Ask me anything">Ask me anything else</button>
                </div>
            `);
        }, 300);
    }

    // Visual creation methods (simplified for now, will be enhanced in later tasks)
    createFacebookSettingsVisual() {
        return `
            <div class="demo-mockup facebook-mockup">
                <div class="mockup-header">
                    <div class="fb-logo">f</div>
                    <span>Facebook Settings</span>
                </div>
                <div class="mockup-content">
                    <div class="settings-menu">
                        <div class="menu-item">General</div>
                        <div class="menu-item highlighted">Security and Login</div>
                        <div class="menu-item">Privacy</div>
                        <div class="menu-item">Profile and Tagging</div>
                    </div>
                </div>
            </div>
        `;
    }

    createSecuritySectionVisual() {
        return `
            <div class="demo-mockup security-mockup">
                <h4>Security and Login</h4>
                <div class="security-options">
                    <div class="security-item">
                        <span>Where You're Logged In</span>
                        <button>Edit</button>
                    </div>
                    <div class="security-item highlighted">
                        <span>Two-Factor Authentication</span>
                        <button>Edit</button>
                    </div>
                    <div class="security-item">
                        <span>Authorized Logins</span>
                        <button>Edit</button>
                    </div>
                </div>
            </div>
        `;
    }

    create2FAOptionVisual() {
        return `
            <div class="demo-mockup twofa-mockup">
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security to your account</p>
                <div class="twofa-status">
                    <span class="status-off">Currently: OFF</span>
                    <button class="enable-btn">Set Up</button>
                </div>
            </div>
        `;
    }

    createMethodSelectionVisual() {
        return `
            <div class="demo-mockup method-mockup">
                <h4>Choose Your Method</h4>
                <div class="method-options">
                    <div class="method-option">
                        <input type="radio" name="method" id="sms">
                        <label for="sms">📱 Text Message (SMS)</label>
                        <small>Less secure - can be intercepted</small>
                    </div>
                    <div class="method-option recommended">
                        <input type="radio" name="method" id="app" checked>
                        <label for="app">🔐 Authentication App</label>
                        <small>More secure - works offline</small>
                    </div>
                </div>
            </div>
        `;
    }

    createQRCodeVisual() {
        return `
            <div class="demo-mockup qr-mockup">
                <h4>Scan QR Code</h4>
                <div class="qr-container">
                    <div class="qr-code">
                        <div class="qr-pattern"></div>
                    </div>
                    <p>Scan this code with your authenticator app</p>
                </div>
                <div class="code-input">
                    <label>Enter 6-digit code:</label>
                    <input type="text" placeholder="123456" maxlength="6">
                    <button>Verify</button>
                </div>
            </div>
        `;
    }

    createBackupCodesVisual() {
        return `
            <div class="demo-mockup backup-mockup">
                <h4>Save Your Backup Codes</h4>
                <p>Keep these codes safe - you'll need them if you lose your phone</p>
                <div class="backup-codes">
                    <code>12345-67890</code>
                    <code>23456-78901</code>
                    <code>34567-89012</code>
                    <code>45678-90123</code>
                    <code>56789-01234</code>
                </div>
                <button class="download-btn">Download Codes</button>
            </div>
        `;
    }

    createTestLoginVisual() {
        return `
            <div class="demo-mockup test-mockup">
                <h4>Test Your 2FA Setup</h4>
                <div class="login-simulation">
                    <div class="login-step">
                        <span>1. Enter password ✅</span>
                    </div>
                    <div class="login-step current">
                        <span>2. Enter 2FA code</span>
                        <input type="text" placeholder="Enter code from app">
                    </div>
                    <div class="login-step">
                        <span>3. Access granted</span>
                    </div>
                </div>
                <p class="success">🎉 2FA is working! Your account is now secure.</p>
            </div>
        `;
    }

    // Instagram Platform Demo Visuals
    createInstagramSettingsVisual() {
        return `
            <div class="demo-mockup instagram-mockup">
                <div class="mockup-header">
                    <div class="ig-logo" style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">📷</div>
                    <span>Instagram Settings</span>
                </div>
                <div class="mockup-content">
                    <div class="settings-menu">
                        <div class="menu-item">Edit Profile</div>
                        <div class="menu-item">Account</div>
                        <div class="menu-item highlighted">Security</div>
                        <div class="menu-item">Privacy</div>
                        <div class="menu-item">Notifications</div>
                    </div>
                </div>
            </div>
        `;
    }

    createInstagramSecurityVisual() {
        return `
            <div class="demo-mockup instagram-security-mockup">
                <h4>Security Settings</h4>
                <div class="security-options">
                    <div class="security-item">
                        <span>Password</span>
                        <button>Change</button>
                    </div>
                    <div class="security-item highlighted">
                        <span>Two-Factor Authentication</span>
                        <button>Edit</button>
                    </div>
                    <div class="security-item">
                        <span>Login Activity</span>
                        <button>View</button>
                    </div>
                    <div class="security-item">
                        <span>Apps and Websites</span>
                        <button>Manage</button>
                    </div>
                </div>
            </div>
        `;
    }

    createInstagram2FAVisual() {
        return `
            <div class="demo-mockup instagram-2fa-mockup">
                <h4>Two-Factor Authentication</h4>
                <p>Help secure your account by requiring a security code in addition to your password when logging in from an unrecognized device.</p>
                <div class="twofa-status">
                    <span class="status-off">Two-Factor Authentication: OFF</span>
                    <button class="enable-btn">Get Started</button>
                </div>
                <div style="margin-top: 12px; padding: 8px; background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 4px; font-size: 0.85rem;">
                    💡 <strong>Tip:</strong> Use an authentication app for better security than SMS
                </div>
            </div>
        `;
    }

    createInstagramMethodVisual() {
        return `
            <div class="demo-mockup instagram-method-mockup">
                <h4>Choose Security Method</h4>
                <div class="method-options">
                    <div class="method-option">
                        <input type="radio" name="ig-method" id="ig-sms">
                        <label for="ig-sms">📱 Text Message</label>
                        <small>Get codes via SMS (less secure)</small>
                    </div>
                    <div class="method-option recommended">
                        <input type="radio" name="ig-method" id="ig-app" checked>
                        <label for="ig-app">🔐 Authentication App</label>
                        <small>Use Google Authenticator or similar (recommended)</small>
                    </div>
                </div>
                <div style="margin-top: 16px; text-align: center;">
                    <button class="enable-btn">Continue</button>
                </div>
            </div>
        `;
    }

    createInstagramQRVisual() {
        return `
            <div class="demo-mockup instagram-qr-mockup">
                <h4>Set Up Authentication App</h4>
                <div class="qr-container">
                    <div class="qr-code">
                        <div class="qr-pattern"></div>
                    </div>
                    <p><strong>Step 1:</strong> Download Google Authenticator or Microsoft Authenticator</p>
                    <p><strong>Step 2:</strong> Scan this QR code with your app</p>
                    <p><strong>Step 3:</strong> Enter the 6-digit code below</p>
                </div>
                <div class="code-input">
                    <label>Enter 6-digit code from your app:</label>
                    <input type="text" placeholder="000000" maxlength="6" style="text-align: center; font-family: monospace; font-size: 18px;">
                    <button>Confirm</button>
                </div>
            </div>
        `;
    }

    createInstagramConfirmVisual() {
        return `
            <div class="demo-mockup instagram-confirm-mockup">
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 60px; height: 60px; background: var(--success-color); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px;">✓</div>
                    <h4 style="color: var(--success-color); margin-bottom: 12px;">Two-Factor Authentication Enabled!</h4>
                    <p>Your Instagram account is now protected with an extra layer of security.</p>
                    <div style="background: rgba(63, 185, 80, 0.1); border: 1px solid rgba(63, 185, 80, 0.3); padding: 12px; border-radius: 6px; margin: 16px 0; text-align: left;">
                        <p><strong>✅ What's protected:</strong></p>
                        <p>• Login attempts from new devices</p>
                        <p>• Password changes</p>
                        <p>• Account recovery</p>
                    </div>
                    <button class="enable-btn">Done</button>
                </div>
            </div>
        `;
    }

    // WhatsApp Platform Demo Visuals
    createWhatsAppSettingsVisual() {
        return `
            <div class="demo-mockup whatsapp-mockup">
                <div class="mockup-header">
                    <div class="wa-logo" style="background: #25D366; color: white; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">💬</div>
                    <span>WhatsApp Settings</span>
                </div>
                <div class="mockup-content">
                    <div class="settings-menu">
                        <div class="menu-item">Profile</div>
                        <div class="menu-item highlighted">Account</div>
                        <div class="menu-item">Chats</div>
                        <div class="menu-item">Notifications</div>
                        <div class="menu-item">Storage and Data</div>
                    </div>
                </div>
            </div>
        `;
    }

    createWhatsAppSecurityVisual() {
        return `
            <div class="demo-mockup whatsapp-security-mockup">
                <h4>Account Settings</h4>
                <div class="security-options">
                    <div class="security-item">
                        <span>Privacy</span>
                        <button>→</button>
                    </div>
                    <div class="security-item highlighted">
                        <span>Two-step verification</span>
                        <button>→</button>
                    </div>
                    <div class="security-item">
                        <span>Change number</span>
                        <button>→</button>
                    </div>
                    <div class="security-item">
                        <span>Request account info</span>
                        <button>→</button>
                    </div>
                </div>
            </div>
        `;
    }

    createWhatsAppEnableVisual() {
        return `
            <div class="demo-mockup whatsapp-enable-mockup">
                <h4>Two-step verification</h4>
                <p>For added security, enable two-step verification, which will require a PIN when registering your phone number with WhatsApp again.</p>
                <div style="background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3); padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>🛡️ How it works:</strong></p>
                    <p>• You'll create a 6-digit PIN</p>
                    <p>• Required when setting up WhatsApp on a new device</p>
                    <p>• Protects against SIM card attacks</p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="enable-btn">Enable</button>
                </div>
            </div>
        `;
    }

    createWhatsAppPINVisual() {
        return `
            <div class="demo-mockup whatsapp-pin-mockup">
                <h4>Create Your PIN</h4>
                <p>Choose a 6-digit PIN that you'll remember. You'll need this when setting up WhatsApp on a new device.</p>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 16px;">
                        <input type="password" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;">
                        <input type="password" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;">
                        <input type="password" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;">
                        <input type="password" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;">
                        <input type="password" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;">
                        <input type="password" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;">
                    </div>
                    <p style="font-size: 0.85rem; opacity: 0.8;">💡 Choose something memorable but not obvious (avoid 123456 or your birthday)</p>
                </div>
                <div style="text-align: center;">
                    <button class="enable-btn">Next</button>
                </div>
            </div>
        `;
    }

    createWhatsAppEmailVisual() {
        return `
            <div class="demo-mockup whatsapp-email-mockup">
                <h4>Add Recovery Email (Optional)</h4>
                <p>If you forget your PIN, WhatsApp can send it to your email address. This step is optional but recommended.</p>
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Email Address:</label>
                    <input type="email" placeholder="your.email@example.com" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 14px;">
                </div>
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 0.85rem;">
                    <p><strong>⚠️ Important:</strong> Use an email you can always access. If you lose your phone AND forget your PIN, this email is your only way to recover your WhatsApp account.</p>
                </div>
                <div style="text-align: center; display: flex; gap: 12px;">
                    <button style="background: transparent; border: 1px solid var(--border-color); color: var(--text-color); padding: 8px 16px; border-radius: 4px; cursor: pointer;">Skip</button>
                    <button class="enable-btn">Next</button>
                </div>
            </div>
        `;
    }

    createWhatsAppConfirmVisual() {
        return `
            <div class="demo-mockup whatsapp-confirm-mockup">
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 60px; height: 60px; background: #25D366; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">✓</div>
                    <h4 style="color: #25D366; margin-bottom: 12px;">Two-step verification enabled!</h4>
                    <p>Your WhatsApp account now has an extra layer of protection.</p>
                    <div style="background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3); padding: 12px; border-radius: 6px; margin: 16px 0; text-align: left;">
                        <p><strong>🛡️ Your account is now protected against:</strong></p>
                        <p>• SIM card swapping attacks</p>
                        <p>• Unauthorized device registration</p>
                        <p>• Account takeover attempts</p>
                    </div>
                    <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); padding: 12px; border-radius: 6px; margin: 16px 0; text-align: left; font-size: 0.85rem;">
                        <p><strong>📝 Remember:</strong> WhatsApp will ask for your PIN periodically to make sure you don't forget it. If you don't enter it for 7 days, you'll lose the ability to register your number again for 7 days.</p>
                    </div>
                    <button class="enable-btn">Done</button>
                </div>
            </div>
        `;
    }

    // Attack Prevention Demo Visuals
    createAttackScenarioVisual() {
        return `
            <div class="demo-mockup attack-scenario-mockup">
                <h4>🎭 Attack Simulation</h4>
                <p>Let's see what happens when a cybercriminal tries to access your account...</p>
                <div style="background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; background: var(--danger-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🦹</div>
                        <div>
                            <p style="margin: 0; font-weight: 500;">Cybercriminal</p>
                            <p style="margin: 0; font-size: 0.8rem; opacity: 0.8;">Attempting to break into your account</p>
                        </div>
                    </div>
                    <p><strong>Scenario:</strong> A hacker has obtained your password through a phishing email or data breach. Let's see if they can access your account...</p>
                </div>
            </div>
        `;
    }

    createPasswordCompromisedVisual() {
        return `
            <div class="demo-mockup password-compromised-mockup">
                <h4>🔓 Step 1: Password Compromised</h4>
                <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0; font-family: monospace;">
                    <div style="margin-bottom: 12px; color: var(--danger-color);">🦹 Attacker's Computer</div>
                    <div style="background: rgba(0, 0, 0, 0.6); padding: 12px; border-radius: 4px;">
                        <p style="margin: 4px 0;">Email: victim@example.com</p>
                        <p style="margin: 4px 0;">Password: ••••••••••• ✅ <span style="color: var(--success-color);">CORRECT</span></p>
                        <p style="margin: 4px 0; color: var(--warning-color);">Attempting login...</p>
                    </div>
                </div>
                <div style="background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); padding: 12px; border-radius: 6px; font-size: 0.9rem;">
                    <p><strong>😱 Without 2FA:</strong> The attacker would now have full access to your account!</p>
                    <p><strong>🛡️ With 2FA:</strong> Let's see what happens next...</p>
                </div>
            </div>
        `;
    }

    create2FAChallengeVisual() {
        return `
            <div class="demo-mockup twofa-challenge-mockup">
                <h4>🛡️ Step 2: 2FA Challenge Appears</h4>
                <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--accent-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <div style="text-align: center; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; background: var(--accent-color); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--bg-color);">🔐</div>
                        <h4 style="margin: 0; color: var(--accent-color);">Two-Factor Authentication Required</h4>
                    </div>
                    <p style="text-align: center; margin-bottom: 16px;">Please enter the 6-digit code from your authenticator app</p>
                    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 16px;">
                        <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;" disabled>
                        <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;" disabled>
                        <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;" disabled>
                        <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;" disabled>
                        <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;" disabled>
                        <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 8px; background: rgba(0,0,0,0.3); color: var(--text-color); font-size: 18px;" disabled>
                    </div>
                    <p style="text-align: center; font-size: 0.85rem; opacity: 0.8;">The attacker doesn't have access to your phone or authenticator app!</p>
                </div>
            </div>
        `;
    }

    createAttackerBlockedVisual() {
        return `
            <div class="demo-mockup attacker-blocked-mockup">
                <h4>🚫 Step 3: Attacker Blocked!</h4>
                <div style="background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <div style="text-align: center; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; background: var(--danger-color); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">❌</div>
                        <h4 style="margin: 0; color: var(--danger-color);">Access Denied</h4>
                    </div>
                    <div style="background: rgba(0, 0, 0, 0.4); padding: 12px; border-radius: 4px; font-family: monospace; margin-bottom: 12px;">
                        <p style="margin: 4px 0; color: var(--danger-color);">ERROR: Invalid authentication code</p>
                        <p style="margin: 4px 0; color: var(--danger-color);">Login attempt failed</p>
                        <p style="margin: 4px 0; color: var(--warning-color);">Security notification sent to account owner</p>
                    </div>
                    <p><strong>🎉 Success!</strong> Even though the attacker had your correct password, 2FA stopped them cold!</p>
                </div>
                <div style="background: rgba(63, 185, 80, 0.1); border: 1px solid rgba(63, 185, 80, 0.3); padding: 12px; border-radius: 6px; font-size: 0.9rem;">
                    <p><strong>🛡️ Why this works:</strong> The attacker would need BOTH your password AND physical access to your phone/authenticator app to succeed.</p>
                </div>
            </div>
        `;
    }

    createNotificationVisual() {
        return `
            <div class="demo-mockup notification-mockup">
                <h4>📱 Step 4: You Get Notified</h4>
                <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; background: var(--command-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🔔</div>
                        <div>
                            <p style="margin: 0; font-weight: 500;">Security Alert</p>
                            <p style="margin: 0; font-size: 0.8rem; opacity: 0.8;">2 minutes ago</p>
                        </div>
                    </div>
                    <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); padding: 12px; border-radius: 6px;">
                        <p style="margin: 0; font-weight: 500;">⚠️ Suspicious Login Attempt</p>
                        <p style="margin: 8px 0 0 0; font-size: 0.9rem;">Someone tried to access your account from an unrecognized device. The attempt was blocked by two-factor authentication.</p>
                        <div style="margin-top: 12px;">
                            <p style="margin: 2px 0; font-size: 0.85rem;"><strong>Location:</strong> Unknown</p>
                            <p style="margin: 2px 0; font-size: 0.85rem;"><strong>Device:</strong> Unknown Browser</p>
                            <p style="margin: 2px 0; font-size: 0.85rem;"><strong>Time:</strong> Just now</p>
                        </div>
                    </div>
                </div>
                <div style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 12px; border-radius: 6px; font-size: 0.9rem;">
                    <p><strong>💡 What to do:</strong> Change your password immediately and check for any suspicious activity on your account.</p>
                </div>
            </div>
        `;
    }

    createSecureAccountVisual() {
        return `
            <div class="demo-mockup secure-account-mockup">
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 80px; height: 80px; background: var(--success-color); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white;">🛡️</div>
                    <h4 style="color: var(--success-color); margin-bottom: 12px;">Your Account Remains Secure!</h4>
                    <p style="margin-bottom: 20px;">Thanks to 2FA, the attack was completely blocked.</p>
                    
                    <div style="background: rgba(63, 185, 80, 0.1); border: 1px solid rgba(63, 185, 80, 0.3); padding: 16px; border-radius: 8px; margin: 16px 0; text-align: left;">
                        <p style="margin: 0 0 8px 0; font-weight: 500; color: var(--success-color);">🎯 What 2FA Protected:</p>
                        <p style="margin: 4px 0;">✅ Your personal messages and photos</p>
                        <p style="margin: 4px 0;">✅ Your contact list and private information</p>
                        <p style="margin: 4px 0;">✅ Your account from being used to scam others</p>
                        <p style="margin: 4px 0;">✅ Your reputation and digital identity</p>
                    </div>
                    
                    <div style="background: rgba(0, 255, 156, 0.1); border: 1px solid rgba(0, 255, 156, 0.3); padding: 16px; border-radius: 8px; margin: 16px 0; text-align: left;">
                        <p style="margin: 0 0 8px 0; font-weight: 500;">🇳🇵 In Nepal's Context:</p>
                        <p style="margin: 4px 0; font-size: 0.9rem;">• Cyber attacks are increasing - Nepal Cyber Bureau reports 300% rise in 2023</p>
                        <p style="margin: 4px 0; font-size: 0.9rem;">• Social media accounts are often targeted for scamming friends and family</p>
                        <p style="margin: 4px 0; font-size: 0.9rem;">• 2FA is your best defense against these growing threats</p>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <p style="font-weight: 500; margin-bottom: 8px;">🚀 Next Steps:</p>
                        <p style="font-size: 0.9rem; margin: 4px 0;">1. Enable 2FA on all your important accounts</p>
                        <p style="font-size: 0.9rem; margin: 4px 0;">2. Use authenticator apps instead of SMS when possible</p>
                        <p style="font-size: 0.9rem; margin: 4px 0;">3. Keep your backup codes safe</p>
                        <p style="font-size: 0.9rem; margin: 4px 0;">4. Share this knowledge with family and friends</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize Demo System
const demoSystem = new DemoSystem();

// Enhanced AI Response Engine with Demo Integration
class EnhancedAIResponseEngine extends AIResponseEngine {
    generateResponse(intent, userInput) {
        const lowerInput = userInput.toLowerCase();

        // Handle specific platform demo requests
        if (lowerInput.includes('start') && lowerInput.includes('demo')) {
            if (lowerInput.includes('facebook')) {
                return demoSystem.startDemo('Facebook');
            } else if (lowerInput.includes('instagram')) {
                return demoSystem.startDemo('Instagram');
            } else if (lowerInput.includes('whatsapp')) {
                return demoSystem.startDemo('WhatsApp');
            } else if (lowerInput.includes('attack')) {
                return demoSystem.startDemo('Attack');
            }
        }

        // Handle demo requests
        if (intent === 'demo_request' || lowerInput.includes('demo')) {
            if (lowerInput.includes('facebook')) {
                return demoSystem.startDemo('Facebook');
            } else if (lowerInput.includes('instagram')) {
                return demoSystem.startDemo('Instagram');
            } else if (lowerInput.includes('whatsapp')) {
                return demoSystem.startDemo('WhatsApp');
            } else if (lowerInput.includes('attack') || lowerInput.includes('prevention')) {
                return demoSystem.startDemo('Attack');
            } else {
                return this.demoRequest();
            }
        }

        // Handle platform-specific questions
        if (intent === 'platform_specific') {
            return this.platformSpecific(userInput);
        }

        // Handle affirmative responses when demo was offered
        if (intent === 'affirmative' && this.conversationContext.demoOffered) {
            return this.handleAffirmative();
        }

        // Use parent class for other responses
        return super.generateResponse(intent, userInput);
    }

    detectIntent(message) {
        const lowerMessage = message.toLowerCase();

        // Enhanced platform detection
        if (this.matchesPatterns(lowerMessage, [
            'facebook', 'instagram', 'whatsapp', 'gmail', 'google',
            'twitter', 'social media', 'fb', 'ig', 'wa'
        ])) {
            return 'platform_specific';
        }

        // Enhanced demo detection
        if (this.matchesPatterns(lowerMessage, [
            'show me', 'demo', 'demonstration', 'walk through',
            'step by step', 'tutorial', 'guide me', 'start demo',
            'facebook demo', 'instagram demo', 'whatsapp demo'
        ])) {
            return 'demo_request';
        }

        // Use parent class for other intents
        return super.detectIntent(message);
    }
}

// Replace the AI response engine with enhanced version
const enhancedAIResponseEngine = new EnhancedAIResponseEngine();

// Update the response function
function getSimulatedResponse(message) {
    return enhancedAIResponseEngine.processQuery(message);
}

function toggleDashboardMobile() {
    const body = document.body;
    const termBtn = document.getElementById("dash-mobile-btn-term");
    const guiBtn = document.getElementById("dash-mobile-btn-gui");
    
    if (body.classList.contains("dashboard-mobile-view")) {
        body.classList.remove("dashboard-mobile-view");
        if (termBtn) termBtn.innerHTML = "📱 Mobile View";
        if (guiBtn) guiBtn.innerHTML = "📱 Mobile View";
        localStorage.setItem("dash_view_mode", "desktop");
    } else {
        body.classList.add("dashboard-mobile-view");
        if (termBtn) termBtn.innerHTML = "🖥️ Desktop View";
        if (guiBtn) guiBtn.innerHTML = "🖥️ Desktop View";
        localStorage.setItem("dash_view_mode", "mobile");
    }
}

// Initialize AI Chat Icon when page loads
document.addEventListener('DOMContentLoaded', function () {
    initializeAIChatIcon();
    
    // Load stored dashboard view mode
    const storedDashView = localStorage.getItem("dash_view_mode");
    if (storedDashView === "mobile") {
        document.body.classList.add("dashboard-mobile-view");
        const termBtn = document.getElementById("dash-mobile-btn-term");
        const guiBtn = document.getElementById("dash-mobile-btn-gui");
        if (termBtn) termBtn.innerHTML = "🖥️ Desktop View";
        if (guiBtn) guiBtn.innerHTML = "🖥️ Desktop View";
    }
});