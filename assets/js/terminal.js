/**
 * Suraksha OS - Core Terminal Logic
 * Handles navigation, command processing, and hybrid UI interactions.
 */

const input = document.getElementById("commandInput");
const output = document.getElementById("output");

const modules = ["learn", "scan", "protect", "rights", "quiz"];
let progress = JSON.parse(localStorage.getItem("suraksha_progress")) || [];

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
    } else if (count < 5) {
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
    }
}

// Hybrid UI: Execute command from chip click
function executeChip(command) {
    if (input) {
        input.value = command;
        processCommand(command);
        input.value = "";
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
    const cmd = command.toLowerCase().trim();

    // Append user input to terminal
    output.innerHTML += `<p><span class="prompt">citizen@suraksha:~$</span> ${cmd}</p>`;

    switch (cmd) {
        case "help":
            output.innerHTML += `
            <div class="help-box">
                <p class="warning">Your Journey to Safety:</p>
                <p><span class="command">learn</span>   → Step 1: Educate yourself on local threats</p>
                <p><span class="command">scan</span>    → Step 2: Practice detecting scams</p>
                <p><span class="command">protect</span> → Step 3: Secure your digital keys</p>
                <p><span class="command">rights</span>  → Step 4: Know your legal shield (ETA Act)</p>
                <p><span class="command">quiz</span>    → Step 5: Get your safety certification</p>
                <br>
                <p><span class="command">panic</span>   → Immediate help: Cyber Bureau 1144</p>
                <p style="opacity: 0.7;"><span class="command">clear</span>   → Clear terminal display</p>
                <p style="opacity: 0.7;"><span class="command">exit</span>    → Return to welcome screen</p>
            </div>`;
            break;

        case "learn":
        case "scan":
        case "protect":
        case "rights":
        case "quiz":
            output.innerHTML += `<p>Initializing ${cmd.toUpperCase()} module. Stay focused, Citizen. Your safety is our priority.</p>`;
            setTimeout(() => goTo(cmd), 600);
            break;

        case "panic":
            output.innerHTML += `
            <div class="panic-box" style="border: 1px solid #f85149; padding: 15px; margin: 10px 0; border-radius: 8px; background: rgba(248, 81, 73, 0.15); animation: fadeIn 0.5s;">
                <p class="danger" style="font-weight: bold; font-size: 1.1rem;">NEPAL CYBER BUREAU - EMERGENCY HELP</p>
                <p><b>If you feel unsafe online, help is available.</b> You are not alone.</p>
                <p style="margin-top: 10px;">📞 **Call 1144** (Toll Free)</p>
                <p>📧 **Email:** cyberbureau@nepalpolice.gov.np</p>
                <p style="margin-top: 10px; font-size: 0.8rem; color: #8b949e;">The Electronic Transactions Act (2063) protects your rights. Report early, save all evidence.</p>
            </div>`;
            break;

        case "exit":
            output.innerHTML = WELCOME_TEMPLATE;
            updateSafetyMeter();
            triggerBootAnimation();
            return; // Don't append the prompt after exit

        case "clear":
            output.innerHTML = "";
            return; // Don't append original message

        case "":
            break;

        default:
            output.innerHTML += `<p class="danger">I don't recognize '${cmd}'. If you're lost, type 'help' or click a button below. I'm here to guide you to safety.</p>`;
    }

    // Append hint if output is getting long
    if (output.children.length % 5 === 0) {
        output.innerHTML += `<p style="opacity: 0.5; font-size: 0.8rem;"><i>Hint: Try learn | scan | protect | rights | quiz | panic</i></p>`;
    }

    // Auto-scroll to bottom
    output.scrollTop = output.scrollHeight;
}

// Event Listeners
if (input) {
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            processCommand(input.value);
            input.value = "";
        }
    });
}

// Boot Sequence & Journey Initialization
window.onload = () => {
    updateSafetyMeter();

    // Check for completion message from modules (passed via URL)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('achieved')) {
        const achieved = urlParams.get('achieved');
        markComplete(achieved);
        updateSafetyMeter();
        output.innerHTML += `<p class="success">✔ Great work! You've mastered the '${achieved}' module. You are now one step closer to being digitally secure.</p>`;

        if (progress.length === 5) {
            output.innerHTML += `
            <div class="success" style="border: 2px solid var(--success-color); padding: 15px; margin-top: 20px; border-radius: 8px; font-weight: bold; background: rgba(63, 185, 80, 0.1);">
                🎉 TRANSFORMATION COMPLETE: You are now a DIGITAL SURAKSHAK! 
                <p style="font-weight: normal; margin-top: 10px;">You have the knowledge to protect yourself and your family in Nepal's digital world. Spread the word!</p>
            </div>`;
        }
    }

    triggerBootAnimation();
};

function triggerBootAnimation() {
    const bootLines = document.querySelectorAll("#boot-sequence p");
    bootLines.forEach((line, index) => {
        line.style.opacity = "0";
        setTimeout(() => {
            line.style.opacity = "1";
            line.style.animation = "fadeIn 0.5s ease forwards";
        }, index * 400);
    });
}