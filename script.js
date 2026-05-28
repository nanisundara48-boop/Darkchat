/* =========================================
   1. AUTHENTICATION & LOADING LOGIC
========================================= */

// New User / Existing User ఫారమ్ టోగుల్
function toggleAuth() {
    const newUserForm = document.getElementById('new-user-form');
    const existingUserForm = document.getElementById('existing-user-form');
    const toggleText = document.querySelector('.toggle-text');

    if (newUserForm.style.display !== 'none') {
        newUserForm.style.display = 'none';
        existingUserForm.style.display = 'block';
        toggleText.innerText = "First time? Create #ID";
    } else {
        newUserForm.style.display = 'block';
        existingUserForm.style.display = 'none';
        toggleText.innerText = "Already have an account? Login";
    }
}

// ఆథరైజేషన్ తర్వాత లోడింగ్ మరియు యాప్ ఓపెన్ అయ్యే లాజిక్
function enterSanctuary(username) {
    const authSection = document.getElementById('auth-section');
    const loadingScreen = document.getElementById('nc-loading-screen');
    const mainApp = document.getElementById('main-app-interface');
    const mainUsernameDisplay = document.getElementById('main-username');

    // 1. లాగిన్ స్క్రీన్ దాచడం
    authSection.classList.remove('active');
    authSection.classList.add('hidden');
    
    // 2. NC లోడింగ్ స్క్రీన్ చూపించడం
    loadingScreen.classList.remove('hidden');
    loadingScreen.classList.add('active');

    // యూజర్‌నేమ్ సెట్ చేయడం
    if(username) {
        mainUsernameDisplay.innerText = username;
    }

    // 3. 2 సెకన్ల తర్వాత మెయిన్ యాప్‌లోకి వెళ్లడం (లోడింగ్ స్టక్ అవ్వకుండా)
    setTimeout(() => {
        loadingScreen.classList.remove('active');
        loadingScreen.classList.add('hidden');
        
        mainApp.classList.remove('hidden');
        mainApp.classList.add('active');
    }, 2000);
}

// కొత్త యూజర్ రిజిస్ట్రేషన్ (Generate ID)
function generateID() {
    const usernameInput = document.getElementById('reg-username').value;
    if (usernameInput.trim() === "") {
        alert("Please enter a username!");
        return;
    }
    // యూజర్‌నేమ్‌కి రాండమ్ గా 4 నంబర్స్ యాడ్ చేసి #ID క్రియేట్ చేయడం
    const uniqueID = usernameInput + "#" + Math.floor(1000 + Math.random() * 9000);
    alert("Your Unique #ID is: " + uniqueID + "\nKeep it safe for login!");
    
    enterSanctuary(uniqueID);
}

// ఉన్న యూజర్ లాగిన్
function loginUser() {
    const loginIdInput = document.getElementById('login-id').value;
    if (loginIdInput.trim() === "") {
        alert("Please enter your Email or #ID!");
        return;
    }
    enterSanctuary(loginIdInput);
}

/* =========================================
   2. FOOTER TAB NAVIGATION LOGIC
========================================= */
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. అన్ని బటన్స్ నుండి 'active' తీసేయడం
        navButtons.forEach(b => b.classList.remove('active'));
        // 2. క్లిక్ చేసిన బటన్‌కి 'active' ఇవ్వడం
        btn.classList.add('active');

        // 3. టార్గెట్ చేసిన ట్యాబ్ ఐడి తీసుకోవడం
        const targetTabId = btn.getAttribute('data-target');

        // 4. అన్ని ట్యాబ్ కంటెంట్స్ దాచడం
        tabContents.forEach(tab => {
            tab.classList.add('hidden');
            tab.classList.remove('active');
        });

        // 5. కావాల్సిన ట్యాబ్ మాత్రమే చూపించడం
        const activeTab = document.getElementById(targetTabId);
        activeTab.classList.remove('hidden');
        activeTab.classList.add('active');
    });
});

/* =========================================
   3. 1.5 SECONDS HOLD FEATURE (PRIVACY CHAT)
========================================= */
const usernameTrigger = document.getElementById('main-username');
const privateAuthModal = document.getElementById('private-auth-modal');
const protectionLayer = document.getElementById('screenshot-protection-layer');
let holdTimer;

function startHoldTimer() {
    // 1500 మిల్లీసెకన్లు (1.5s) తర్వాత ప్రైవేట్ చాట్ అన్‌లాక్ పాపప్ వస్తుంది
    holdTimer = setTimeout(() => {
        // మొబైల్ వైబ్రేషన్ (సపోర్ట్ ఉంటే 50ms వైబ్రేట్ అవుతుంది)
        if (navigator.vibrate) navigator.vibrate(50);
        
        privateAuthModal.classList.remove('hidden');
        privateAuthModal.classList.add('active');
        
        // స్క్రీన్‌షాట్ ప్రొటెక్షన్ ఎఫెక్ట్ (బ్లర్ ఆన్ చేయడం)
        protectionLayer.style.backdropFilter = "blur(8px)";
        protectionLayer.style.backgroundColor = "rgba(0,0,0,0.4)";
    }, 1500); 
}

function cancelHoldTimer() {
    // యూజర్ 1.5s కంటే ముందే వేలు తీసేస్తే టైమర్ క్యాన్సిల్ అవుతుంది
    clearTimeout(holdTimer);
}

// డెస్క్‌టాప్ (మౌస్) ఈవెంట్స్
usernameTrigger.addEventListener('mousedown', startHoldTimer);
usernameTrigger.addEventListener('mouseup', cancelHoldTimer);
usernameTrigger.addEventListener('mouseleave', cancelHoldTimer);

// మొబైల్ (టచ్) ఈవెంట్స్
usernameTrigger.addEventListener('touchstart', startHoldTimer);
usernameTrigger.addEventListener('touchend', cancelHoldTimer);
usernameTrigger.addEventListener('touchcancel', cancelHoldTimer);

/* =========================================
   4. EXTRA FEATURES UI INTERACTIONS
========================================= */

// Private Chat పాపప్ క్లోజ్ చేయడం (తాత్కాలికంగా బయట క్లిక్ చేస్తే క్లోజ్ అయ్యేలా)
privateAuthModal.addEventListener('click', (e) => {
    if (e.target === privateAuthModal) {
        privateAuthModal.classList.remove('active');
        privateAuthModal.classList.add('hidden');
        
        // స్క్రీన్‌షాట్ ప్రొటెక్షన్ బ్లర్ తీసేయడం
        protectionLayer.style.backdropFilter = "none";
        protectionLayer.style.backgroundColor = "transparent";
    }
});

// డెలివరీ డాట్స్ యానిమేషన్ (Testing కోసం)
// రియల్ టైమ్ డేటాబేస్ (Firebase) వాడేటప్పుడు ఈ డాట్స్ డైనమిక్ గా మారుతాయి
const deliveryDots = document.querySelectorAll('.delivery-status');
deliveryDots.forEach(dot => {
    // ఇది కేవలం ఉదాహరణకి, మీ వెబ్‌సైట్‌లో ఇది బ్యాకెండ్ నుండి కంట్రోల్ అవుతుంది
    dot.title = "Message Status"; 
});
