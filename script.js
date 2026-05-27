// ==========================================
// 1. SUPABASE & APP CONFIG
// ==========================================
const supabaseUrl = 'https://ctrdxfjqbseddtoirweb.supabase.co';
const supabaseKey = 'sb_publishable_NQ_eOYMqlMIWaDcEkQsIlA_zDXXbuMx';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. LOADING SCREEN LOGIC (Fixed)
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('nc-loading').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('hidden');
    }, 2500);
});

// ==========================================
// 3. AUTH & NAVIGATION LOGIC
// ==========================================
// Tab switching (Login/Register)
document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

// Register New User
document.getElementById('btn-generate-join').addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value;
    const unique_id = "@" + username + Math.floor(1000 + Math.random() * 9000);

    const { error } = await supabase.from('users').insert([{ username, email, password, unique_id }]);
    
    if (!error) {
        alert("Account Created! Your ID: " + unique_id);
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    } else {
        alert("Error: " + error.message);
    }
});

// Bottom Navigation Switching
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const target = e.target.getAttribute('data-target');
        document.querySelectorAll('.tab-screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('screen-' + target).classList.remove('hidden');
    });
});

// ==========================================
// 4. WEBRTC & CHAT ENGINE
// ==========================================
// Trigger Video Call
document.getElementById('btn-trigger-video-call').addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('local-video').srcObject = stream;
        document.getElementById('webrtc-call-screen').classList.remove('hidden');
    } catch (err) {
        alert("Camera/Mic access needed!");
    }
});

// End Call
document.getElementById('btn-end-webrtc-call').addEventListener('click', () => {
    const stream = document.getElementById('local-video').srcObject;
    stream.getTracks().forEach(track => track.stop());
    document.getElementById('webrtc-call-screen').classList.add('hidden');
});

// Simple Messaging
document.getElementById('btn-send-message').addEventListener('click', async () => {
    const input = document.getElementById('message-input');
    if (!input.value) return;

    await supabase.from('messages').insert([{ text: input.value }]);
    const msg = document.createElement('div');
    msg.textContent = "Me: " + input.value;
    document.getElementById('messages-container').appendChild(msg);
    input.value = '';
});
