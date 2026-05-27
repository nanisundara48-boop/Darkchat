// SUPABASE CONFIG (Keep your keys same)
const supabaseUrl = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const supabaseKey = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- 1. AUTH TAB SWITCHING ---
document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
});

document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
});

// --- 2. ONBOARDING TUTORIAL LOGIC ---
let tourStep = 0;
const tourData = [
    { title: "Chatting", desc: "Search friends by #ID and start talking!", target: "tab-chats" },
    { title: "Glimpse", desc: "Share moments and increase your Glimpse Score!", target: "tab-glimpse" },
    { title: "Profile", desc: "Hold your username to enter Love UI mode.", target: "tour-profile" }
];

function startTutorial() {
    document.getElementById('onboarding-overlay').classList.remove('hidden');
    showStep();
}

function showStep() {
    const step = tourData[tourStep];
    document.getElementById('tour-title').innerText = step.title;
    document.getElementById('tour-desc').innerText = step.desc;
}

document.getElementById('btn-tour-next').addEventListener('click', () => {
    tourStep++;
    if (tourStep < tourData.length) {
        showStep();
    } else {
        document.getElementById('onboarding-overlay').classList.add('hidden');
    }
});

document.getElementById('btn-tour-skip').addEventListener('click', () => {
    document.getElementById('onboarding-overlay').classList.add('hidden');
});

// --- 3. LOGIN & REGISTER LOGIC ---
// (Use the previous insert logic here, but call startTutorial() only for New Users)
async function handleNewUserSuccess() {
    loginToApp();
    setTimeout(() => startTutorial(), 3000); // Start tour after loading
}

// --- 4. CALLING SYSTEM (Mockup) ---
function triggerCall(userName) {
    const callHTML = `
        <div id="active-call" class="call-overlay">
            <div class="caller-info">
                <img src="default-dp.png" class="caller-img">
                <h2>${userName}</h2>
                <p>Calling...</p>
            </div>
            <div class="call-actions">
                <button class="btn-call btn-end" onclick="endCall()">✖</button>
                <button class="btn-call btn-accept">✔</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', callHTML);
}

function endCall() {
    document.getElementById('active-call').remove();
}

// --- 5. TAB NAVIGATION ---
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
        document.getElementById(`tab-${target}`).classList.remove('hidden');
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
