// ==========================================
// 1. SUPABASE DATABASE CONFIGURATION
// ==========================================
const supabaseUrl = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const supabaseKey = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. AUTHENTICATION & CAT ANIMATION LOGIC
// ==========================================
const authContainer = document.getElementById('auth-container');
const ncLoading = document.getElementById('nc-loading');
const mainApp = document.getElementById('main-app');
const passwordInput = document.getElementById('password');
const leftPaw = document.querySelector('.left-paw');
const rightPaw = document.querySelector('.right-paw');

// Cat Paws Animation on Password Focus
passwordInput.addEventListener('focus', () => {
    leftPaw.style.transform = 'translateY(-40px) rotate(-10deg)';
    rightPaw.style.transform = 'translateY(-40px) rotate(10deg)';
});

passwordInput.addEventListener('blur', () => {
    leftPaw.style.transform = 'translateY(0) rotate(0)';
    rightPaw.style.transform = 'translateY(0) rotate(0)';
});

// App Login Sequence
function loginToApp() {
    authContainer.classList.add('hidden');
    ncLoading.classList.remove('hidden');
    setTimeout(() => {
        ncLoading.classList.add('hidden');
        mainApp.classList.remove('hidden');
    }, 2500);
}

// Register & Join Logic
document.getElementById('btn-generate-join').addEventListener('click', async () => {
    const userVal = document.getElementById('username').value;
    const emailVal = document.getElementById('email').value;
    const passVal = document.getElementById('password').value;

    if (userVal && emailVal && passVal) {
        // Unique #ID Generation
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const uniqueId = `#${userVal.substring(0, 3).toUpperCase()}${randomNum}`;

        // Save to Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([{ username: userVal, email: emailVal, unique_id: uniqueId, password: passVal, glimpse_score: 0 }]);

        if (error) {
            alert("Registration failed: " + error.message);
        } else {
            document.getElementById('new-user-id').innerText = uniqueId;
            document.getElementById('generated-id-display').classList.remove('hidden');
            loginToApp();
        }
    } else {
        alert("Please fill all details.");
    }
});

document.getElementById('btn-login').addEventListener('click', loginToApp);

// ==========================================
// 3. NAVIGATION & TABS LOGIC
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.add('hidden'));
        item.classList.add('active');
        document.getElementById(`tab-content-${item.dataset.target}`).classList.remove('hidden');
    });
});

// ==========================================
// 4. PRIVACY LOCK (1.5 SEC HOLD) & THEMES
// ==========================================
const headerUsername = document.getElementById('header-username');
const privacyLockModal = document.getElementById('privacy-lock-modal');
let holdTimer;

function startHold() {
    holdTimer = setTimeout(() => {
        privacyLockModal.classList.remove('hidden');
    }, 1500);
}

function stopHold() {
    clearTimeout(holdTimer);
}

headerUsername.addEventListener('mousedown', startHold);
headerUsername.addEventListener('mouseup', stopHold);
headerUsername.addEventListener('touchstart', startHold);
headerUsername.addEventListener('touchend', stopHold);

document.getElementById('unlock-privacy').addEventListener('click', () => {
    const pin = document.getElementById('privacy-pin').value;
    if (pin === '1234') { // Example PIN
        privacyLockModal.classList.add('hidden');
        document.body.classList.toggle('love-ui-mode');
        alert("Privacy Mode Activated 🖤");
    } else {
        alert("Wrong PIN!");
    }
});

// ==========================================
// 5. CHAT & MESSAGING LOGIC
// ==========================================
const sendMsgBtn = document.getElementById('send-msg-btn');
const msgInput = document.getElementById('message-input');

sendMsgBtn.addEventListener('click', async () => {
    const text = msgInput.value;
    const disappear = document.getElementById('disappear-timer').value;
    
    if (text.trim() !== "") {
        const { error } = await supabase
            .from('messages')
            .insert([{ 
                text: text, 
                sender_id: 'current_user', 
                receiver_id: 'target_user',
                timer: disappear
            }]);

        if (!error) {
            msgInput.value = "";
            console.log("Message Sent!");
        }
    }
});

// Real-time listener for New Messages
supabase
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const notifDot = document.getElementById('notif-dot');
        notifDot.classList.remove('hidden');
        notifDot.innerText = parseInt(notifDot.innerText) + 1;
        // Logic to show popup notification
    })
    .subscribe();

// ==========================================
// 6. MODAL CONTROL HELPERS
// ==========================================
function bindModal(triggerId, modalId) {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    if (trigger && modal) {
        trigger.addEventListener('click', () => modal.classList.remove('hidden'));
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
}

bindModal('search-btn', 'search-modal');
bindModal('notification-btn', 'notifications-modal');
bindModal('settings-menu', 'settings-modal');
bindModal('qr-piping-icon', 'qr-modal');

// Close modal on outside click
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
    }
};

// ==========================================
// 7. GLIMPSE SCORE & STAR LOGIC
// ==========================================
// This updates the UI with the score from database
async function fetchUserStats() {
    const { data, error } = await supabase
        .from('users')
        .select('glimpse_score, referrals')
        .eq('username', 'current_user')
        .single();

    if (data) {
        document.querySelectorAll('.score-value').forEach(el => {
            if (el.innerText.includes('🔥')) el.innerText = `${data.glimpse_score} 🔥`;
        });
        if (data.referrals >= 5) {
            document.getElementById('golden-star').classList.remove('hidden');
        }
    }
}
