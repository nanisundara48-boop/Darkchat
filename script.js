// ==========================================
// 1. SUPABASE PIPELINE ENCRYPTION STAGE
// ==========================================
const supabaseUrl = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const supabaseKey = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let MY_USER_ROW_ID = null; 
let MY_UNIQUE_ID = null;   
let MY_USERNAME = null;    
let ACTIVE_CHAT_PARTNER_UNIQUE_ID = null; 

// INITIAL RUN-TIME RESOLUTION: LOADING LAYER KILLER
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('nc-loading');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.classList.add('hidden');
            document.getElementById('auth-container').classList.remove('hidden');
        }, 500);
    }, 2000); // 2 Seconds Cinematic Load
});

// ==========================================
// 2. AUTHENTICATION TAB MAPPING
// ==========================================
document.getElementById('tab-login').addEventListener('click', () => {
    toggleAuthForm('login');
});
document.getElementById('tab-register').addEventListener('click', () => {
    toggleAuthForm('register');
});

function toggleAuthForm(mode) {
    if (mode === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-register').classList.remove('active');
    } else {
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
    }
}

// PEEKABOO EFFECT INTERCEPTORS
const passwordFields = [document.getElementById('login-password'), document.getElementById('reg-password')];
passwordFields.forEach(f => {
    f.addEventListener('focus', () => document.getElementById('cat-container').classList.add('hide-eyes'));
    f.addEventListener('blur', () => document.getElementById('cat-container').classList.remove('hide-eyes'));
});

// ==========================================
// 3. INSTRUCTIONAL STEPS ONBOARDING CORE
// ==========================================
let activeTourIndex = 0;
const structuralTourSteps = [
    { id: "tour-search", title: "Global Search Matrix", desc: "Enter any active user's unique #ID code here and hit Enter to instantly instantiate a communication stream." },
    { id: "tour-glimpse", title: "Glimpse Metric Node", desc: "This dashboard keeps track of your user ranking. Use the action node to dynamically increment your score status directly onto the database." },
    { id: "tour-calls", title: "VoIP Call Registry", desc: "This panel registers structural incoming/outgoing call streams. Use the call icon inside active threads to deploy full audio overlay execution." },
    { id: "tour-profile", title: "Cryptographic Privacy Valve", desc: "Long-press this avatar node for 1.5 seconds to deploy the PIN matrix and transition directly into Love UI Stealth Mode." }
];

function initializeInstructionalTour() {
    document.getElementById('onboarding-overlay').classList.remove('hidden');
    executeTourStep();
}

function executeTourStep() {
    if (activeTourIndex >= structuralTourSteps.length) {
        document.getElementById('onboarding-overlay').classList.add('hidden');
        document.getElementById('tour-highlight').classList.add('hidden');
        return;
    }
    const currentStep = structuralTourSteps[activeTourIndex];
    document.getElementById('tour-title').innerText = currentStep.title;
    document.getElementById('tour-desc').innerText = currentStep.desc;

    const targetElement = document.getElementById(currentStep.id);
    if (targetElement) {
        const elementBounds = targetElement.getBoundingClientRect();
        const highbox = document.getElementById('tour-highlight');
        highbox.classList.remove('hidden');
        highbox.style.top = (elementBounds.top - 6) + "px";
        highbox.style.left = (elementBounds.left - 6) + "px";
        highbox.style.width = (elementBounds.width + 12) + "px";
        highbox.style.height = (elementBounds.height + 12) + "px";
    }
}

document.getElementById('btn-tour-next').addEventListener('click', () => {
    activeTourIndex++;
    executeTourStep();
});
document.getElementById('btn-tour-skip').addEventListener('click', () => {
    document.getElementById('onboarding-overlay').classList.add('hidden');
    document.getElementById('tour-highlight').classList.add('hidden');
});

// ==========================================
// 4. PIPELINE DATABASE ACTIONS & APP TRANSITION
// ==========================================
function establishAppSession(userRow) {
    MY_USER_ROW_ID = userRow.id;
    MY_UNIQUE_ID = userRow.unique_id;
    MY_USERNAME = userRow.username;

    document.getElementById('user-avatar').innerText = MY_USERNAME.substring(0,1).toUpperCase();
    document.getElementById('display-glimpse-score').innerText = userRow.glimpse_score || 0;

    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    initializeRealtimeMessagePipeline();
}

// ACTION NODE: NEW USER PIPELINE (JOIN)
document.getElementById('btn-generate-join').addEventListener('click', async () => {
    const u = document.getElementById('reg-username').value.trim();
    const e = document.getElementById('reg-email').value.trim();
    const p = document.getElementById('reg-password').value.trim();

    if (!u || !e || !p) { alert("Fill all metrics!"); return; }

    const generatedHash = "#" + u.substring(0,3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    const { data, error } = await supabase
        .from('users')
        .insert([{ username: u, email: e, password: p, unique_id: generatedHash, glimpse_score: 0, referrals: 0 }])
        .select()
        .single();

    if (error) {
        alert("Pipeline Disrupted: " + error.message);
    } else {
        alert("Registration Injected! Cryptographic Node ID: " + generatedHash);
        establishAppSession(data);
        setTimeout(() => initializeInstructionalTour(), 1000); // Trigger Tutorial
    }
});

// ACTION NODE: EXISTING USER SECURE LOGIN
document.getElementById('btn-login').addEventListener('click', async () => {
    const credential = document.getElementById('login-id').value.trim();
    const p = document.getElementById('login-password').value.trim();

    if (!credential || !p) { alert("Metrics incomplete!"); return; }

    const isEmail = credential.includes('@');
    let queryField = isEmail ? 'email' : 'unique_id';

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq(queryField, credential)
        .eq('password', p)
        .maybeSingle();

    if (error) {
        alert("Query Exception: " + error.message);
    } else if (!data) {
        alert("Access Denied: Invalid Unique ID/Email/Password pairing.");
    } else {
        establishAppSession(data);
    }
});

// ==========================================
// 5. GLOBAL SEARCH ENGINE MATRIX
// ==========================================
document.getElementById('search-users').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const targetHash = e.target.value.trim();
        if (targetHash === MY_UNIQUE_ID) { alert("Self Connection Denied."); return; }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('unique_id', targetHash)
            .maybeSingle();

        if (data) {
            instantiateChatThreadUI(data.unique_id, data.username);
            e.target.value = "";
        } else {
            alert("No target matching that Unique ID found in database index.");
        }
    }
});

function instantiateChatThreadUI(targetId, targetName) {
    const list = document.getElementById('chats-list');
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    let existingRow = document.getElementById(`thread-${targetId}`);
    if (!existingRow) {
        const rowHTML = `
            <div id="thread-${targetId}" class="chat-user-item" onclick="openActiveChatPanel('${targetId}', '${targetName}')">
                <div class="user-info-combo">
                    <h4>${targetName} <span style="color:#6e8efb; font-size:11px;">${targetId}</span></h4>
                    <p id="preview-${targetId}">Tap to launch message connection...</p>
                </div>
                <span class="bubble-notif-dot hidden" id="dot-${targetId}">●</span>
            </div>`;
        list.insertAdjacentHTML('beforeend', rowHTML);
    }
    openActiveChatPanel(targetId, targetName);
}

// ==========================================
// 6. CHAT WINDOW SYSTEM PANELS
// ==========================================
function openActiveChatPanel(targetId, targetName) {
    ACTIVE_CHAT_PARTNER_UNIQUE_ID = targetId;
    document.getElementById('active-chat-name').innerText = targetName + " " + targetId;
    document.getElementById(`dot-${targetId}`)?.classList.add('hidden');
    document.getElementById('chat-window').classList.remove('hidden');
    document.getElementById('messages-container').innerHTML = "";
    fetchChatHistory();
}

document.getElementById('btn-back-chats').addEventListener('click', () => {
    document.getElementById('chat-window').classList.add('hidden');
    ACTIVE_CHAT_PARTNER_UNIQUE_ID = null;
});

// PIPELINE DATA LAYER: FETCH CHATS
async function fetchChatHistory() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${MY_UNIQUE_ID},receiver_id.eq.${ACTIVE_CHAT_PARTNER_UNIQUE_ID}),and(sender_id.eq.${ACTIVE_CHAT_PARTNER_UNIQUE_ID},receiver_id.eq.${MY_UNIQUE_ID})`)
        .order('id', { ascending: true });

    if (data) {
        const container = document.getElementById('messages-container');
        data.forEach(msg => {
            appendMessageBubble(msg.text, msg.sender_id === MY_UNIQUE_ID ? 'me' : 'them');
        });
        container.scrollTop = container.scrollHeight;
    }
}

// PIPELINE DATA LAYER: SEND CHATS
document.getElementById('btn-send-message').addEventListener('click', executeMessageTransmission);
document.getElementById('message-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') executeMessageTransmission(); });

async function executeMessageTransmission() {
    const input = document.getElementById('message-input');
    const val = input.value.trim();
    if (!val || !ACTIVE_CHAT_PARTNER_UNIQUE_ID) return;

    appendMessageBubble(val, 'me');
    document.getElementById(`preview-${ACTIVE_CHAT_PARTNER_UNIQUE_ID}`).innerText = "You: " + val;
    input.value = "";

    const { error } = await supabase
        .from('messages')
        .insert([{ text: val, sender_id: MY_UNIQUE_ID, receiver_id: ACTIVE_CHAT_PARTNER_UNIQUE_ID, status: 'sent' }]);
    
    if(error) console.error("Transmission Failure Error Log:", error.message);
}

function appendMessageBubble(text, direction) {
    const container = document.getElementById('messages-container');
    const b = document.createElement('div');
    b.className = `msg-bubble ${direction}`;
    b.innerText = text;
    container.appendChild(b);
    container.scrollTop = container.scrollHeight;
}

// ==========================================
// 7. REAL-TIME SOCKET SUBSCRIPTION INJECTOR
// ==========================================
function initializeRealtimeMessagePipeline() {
    supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            const incoming = payload.new;
            if (incoming.receiver_id === MY_UNIQUE_ID) {
                if (ACTIVE_CHAT_PARTNER_UNIQUE_ID === incoming.sender_id) {
                    appendMessageBubble(incoming.text, 'them');
                } else {
                    // Update external preview indicator state
                    const previewNode = document.getElementById(`preview-${incoming.sender_id}`);
                    if (previewNode) previewNode.innerText = incoming.text;
                    document.getElementById(`dot-${incoming.sender_id}`)?.classList.remove('hidden');
                }
            }
        })
        .subscribe();
}

// ==========================================
// 8. VOIP CALL INTERFACE DRIVER
// ==========================================
document.getElementById('btn-trigger-call').addEventListener('click', () => {
    if (!ACTIVE_CHAT_PARTNER_UNIQUE_ID) return;
    document.getElementById('call-screen-name').innerText = ACTIVE_CHAT_PARTNER_UNIQUE_ID;
    document.getElementById('calling-overlay').classList.remove('hidden');
});

document.getElementById('btn-end-call').addEventListener('click', () => {
    document.getElementById('calling-overlay').classList.add('hidden');
});
document.getElementById('btn-accept-call').addEventListener('click', () => {
    document.getElementById('call-status-text').innerText = "Link Connected (00:01)";
});

// ==========================================
// 9. GLIMPSE INCREMENT ENGINE LOGIC
// ==========================================
document.getElementById('btn-add-score').addEventListener('click', async () => {
    const node = document.getElementById('display-glimpse-score');
    let currentScore = parseInt(node.innerText);
    let updatedScore = currentScore + 1;
    node.innerText = updatedScore;

    if (updatedScore >= 5) {
        document.getElementById('golden-star').classList.remove('hidden');
    }

    if (MY_USER_ROW_ID) {
        await supabase
            .from('users')
            .update({ glimpse_score: updatedScore })
            .eq('id', MY_USER_ROW_ID);
    }
});

// ==========================================
// 10. TAB CONTAINER SWITCH SYSTEM VIA SCREEN ID
// ==========================================
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        document.querySelectorAll('.tab-screen').forEach(scr => scr.classList.add('hidden'));
        document.getElementById(`screen-${target}`).classList.remove('hidden');
        
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ==========================================
// 11. TIMED PRIVACY SYSTEM (1.5s LONG PRESS VALVE)
// ==========================================
const zone = document.getElementById('header-lock-zone');
let pressLockTimer = null;

zone.addEventListener('mousedown', initiateHoldSequence);
zone.addEventListener('touchstart', initiateHoldSequence);
zone.addEventListener('mouseup', abortHoldSequence);
zone.addEventListener('mouseleave', abortHoldSequence);
zone.addEventListener('touchend', abortHoldSequence);

function initiateHoldSequence(e) {
    e.preventDefault();
    pressLockTimer = setTimeout(() => {
        document.getElementById('privacy-lock-modal').classList.remove('hidden');
    }, 1500); 
}
function abortHoldSequence() { clearTimeout(pressLockTimer); }

document.getElementById('unlock-privacy').addEventListener('click', () => {
    const pin = document.getElementById('privacy-pin').value;
    if (pin === '1234') {
        document.getElementById('privacy-lock-modal').classList.add('hidden');
        document.body.classList.toggle('love-ui-mode');
        document.getElementById('privacy-pin').value = "";
        alert("Stealth Encryption Mode Alternated.");
    } else {
        alert("Invalid PIN Interface Check.");
    }
});
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('privacy-lock-modal').classList.add('hidden');
});
