// app.js - script migrado desde EVOKAPP.txt
// Mantiene la estructura y funciones del MVP EVOKA.
// Reglas: No cambiar texto, ids ni comportamiento principal.

/* --- Objeto Global de la App --- */
window.app = {};

/* --- Variables Globales y Datos --- */
let dailyTokens, executors, capsulesData, dialogueData, userData;
let tempCapsuleData = {};

/* --- Punto de Entrada Principal --- */
document.addEventListener('DOMContentLoaded', () => {
    app.loadDataFromLocalStorage();
    app.loadStaticUI();
    app.navigateTo('home');

    // Cerrar menu de perfil al hacer click fuera
    window.addEventListener('click', function(e) {
        const profileButton = document.getElementById('profile-button');
        const profileMenu = document.getElementById('profile-menu');
        if (profileButton && !profileButton.contains(e.target) && profileMenu && !profileMenu.contains(e.target)) {
            profileMenu.classList.add('hidden');
        }
    });
});

/* --- Lógica de Almacenamiento Local --- */
app.saveDataToLocalStorage = function() {
    try {
        localStorage.setItem('evokaUserData', JSON.stringify(userData));
        localStorage.setItem('evokaCapsules', JSON.stringify(capsulesData));
        localStorage.setItem('evokaExecutors', JSON.stringify(executors));
        localStorage.setItem('evokaTokens', dailyTokens);
        localStorage.setItem('evokaDialogue', JSON.stringify(dialogueData));
    } catch (err) {
        console.warn('saveDataToLocalStorage error', err);
    }
}

app.loadDataFromLocalStorage = function() {
    try {
        const savedUser = localStorage.getItem('evokaUserData');
        const savedCapsules = localStorage.getItem('evokaCapsules');
        const savedExecutors = localStorage.getItem('evokaExecutors');
        const savedTokens = localStorage.getItem('evokaTokens');
        const savedDialogue = localStorage.getItem('evokaDialogue');

        userData = savedUser ? JSON.parse(savedUser) : { fullName: "Felipe Arriarán", username: "@felipe", email: "felipe.a@email.com", phone: "+56912345678", birthDate: "1985-10-20", plan: 'free', aiSettings: { type: 'emotive', customPrompt: '' }, progress: 5 };
        capsulesData = savedCapsules ? JSON.parse(savedCapsules) : [];
        executors = savedExecutors ? JSON.parse(savedExecutors) : ['Gisselle', 'Agustín'];
        dailyTokens = savedTokens !== null ? parseInt(savedTokens, 10) : 1;
        dialogueData = savedDialogue ? JSON.parse(savedDialogue) : { lastAnswered: null, answers: {} };
    } catch (err) {
        console.warn('loadDataFromLocalStorage: parsing error', err);
        userData = { fullName: "Felipe Arriarán", username: "@felipe", plan: 'free', progress: 5 };
        capsulesData = [];
        executors = ['Gisselle', 'Agustín'];
        dailyTokens = 1;
        dialogueData = { lastAnswered: null, answers: {} };
    }
}

/* --- Funciones de Navegación y Vistas --- */
app.toggleProfileMenu = function() {
    const menu = document.getElementById('profile-menu');
    if (menu) menu.classList.toggle('hidden');
}

app.navigateTo = function(page) {
    const mainContent = document.getElementById('main-content');
    const actionBar = document.getElementById('action-bar');
    const navLinks = document.querySelectorAll('#side-nav a');

    navLinks.forEach(link => {
        link.classList.toggle('bg-gray-700', link.getAttribute('data-page') === page);
    });

    if (page === 'home') {
        if (mainContent) mainContent.innerHTML = app.getHomeViewHTML();
        if (actionBar) actionBar.innerHTML = app.getHomeActionBarHTML();
        app.updateTokenDisplay();
    } else if (page === 'dialogue') {
        if (mainContent) mainContent.innerHTML = app.getDialogueViewHTML();
        if (actionBar) actionBar.innerHTML = '';
    } else if (page === 'executors') {
        if (mainContent) mainContent.innerHTML = app.getExecutorsViewHTML();
        if (actionBar) actionBar.innerHTML = '';
    } else if (page === 'plans') {
        if (mainContent) mainContent.innerHTML = app.getPlansViewHTML();
        if (actionBar) actionBar.innerHTML = '';
    } else if (page === 'memories') {
        if (mainContent) mainContent.innerHTML = app.getMemoriesViewHTML();
        if (actionBar) actionBar.innerHTML = '';
    } else if (page === 'profile') {
        if (mainContent) mainContent.innerHTML = `<div class="p-6"><h2 class="text-2xl font-bold text-white">Perfil</h2><p class="text-gray-400 mt-2">Información de ${userData.fullName}</p></div>`;
        if (actionBar) actionBar.innerHTML = '';
    } else {
        if (mainContent) mainContent.innerHTML = `<div class="flex-grow flex items-center justify-center text-center p-4"><h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Página de ${page} en construcción.</h1></div>`;
        if (actionBar) actionBar.innerHTML = '';
    }
}

/* --- HTML Generators para Vistas --- */
app.getHomeViewHTML = function() {
    return `
    <div class="flex-grow flex items-center justify-center text-center">
        <div>
            <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Hola Felipe
            </h1>
            <p class="text-gray-400 mt-2">¿Qué recuerdo quieres evocar hoy?</p>
        </div>
    </div>
    `;
}

app.getHomeActionBarHTML = function() {
     return `
        <div class="bg-[#1e1f20] rounded-2xl p-3 shadow-lg">
            <div class="flex items-center justify-between px-3 pb-2">
                 <button id="privacy-toggle" onclick="window.app.togglePrivacy(this)" data-privacy="private" class="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <span>Privada</span>
                 </button>
            </div>
            <div class="relative">
                <textarea id="capsule-input" class="w-full h-14 bg-transparent text-gray-200 rounded-lg p-3 pr-24 border-none focus:ring-0 resize-none" placeholder="Escribe tu cápsula aquí..."></textarea>
                <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <button onclick="window.app.toggleRecording()" id="record-button" class="p-2 hover:bg-gray-700 rounded-full" title="Grabar audio"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg></button>
                    <button id="save-button" onclick="window.app.saveCapsule()" class="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-full" title="Publicar Cápsula"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg></button>
                </div>
            </div>
        </div>
     `;
}

app.getExecutorsViewHTML = function() {
    let executorsListHTML = executors.map(e => `
        <li class="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
            <span class="text-gray-200">${e}</span>
            <button class="text-red-400 hover:text-red-300" onclick="window.app.removeExecutor(this, '${e}')">&times;</button>
        </li>`).join('');

    return `
    <section class="fade-in">
        <h2 class="text-3xl font-bold mb-6 text-white flex items-center gap-3"><svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>Tus Albaceas Digitales</h2>
        <div class="bg-[#1e1f20] rounded-xl p-6 space-y-6">
            <div class="bg-gray-800/50 border border-cyan-500/30 text-cyan-200 p-4 rounded-lg">
                <h3 class="font-bold">¿Qué es un Albacea Digital?</h3>
                <p class="text-sm mt-1 text-gray-300">Es una persona de tu confianza a quien le darás acceso a tus cápsulas privadas. Serán los guardianes de tu legado.</p>
            </div>
            <div>
                <h3 class="font-semibold text-lg text-gray-300 mb-3">Lista de Albaceas</h3>
                <ul id="executor-list" class="space-y-3">${executorsListHTML}</ul>
                <button onclick="window.app.addExecutor()" class="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-4 rounded-lg transition">+ Añadir Nuevo Albacea</button>
            </div>
        </div>
    </section>
    `;
}

app.getPlansViewHTML = function() {
    return `
    <section class="fade-in text-center">
        <h2 class="text-3xl font-bold mb-2 text-white">Elige tu Plan EVOKA</h2>
        <p class="text-gray-400 mb-8">Desbloquea todo el potencial de tu legado.</p>
        <div class="space-y-6">
            <div class="bg-[#1e1f20] rounded-xl p-6 border-2 border-cyan-500">
                <h3 class="text-2xl font-bold text-white">GRATIS</h3>
                <p class="text-xl font-semibold my-2 text-gray-300">$0 USD</p>
                <ul class="text-gray-400 space-y-2 my-4 text-left">
                    <li><span class="text-cyan-400">✓</span> 1 cápsula por día</li>
                    <li><span class="text-cyan-400">✓</span> 1 albacea digital</li>
                    <li><span class="text-cyan-400">✓</span> Acceso a memorias</li>
                </ul>
                <button class="w-full bg-gray-600 text-gray-400 font-bold py-2 px-4 rounded-lg cursor-default">Plan Actual</button>
            </div>
            <div class="bg-[#1e1f20] rounded-xl p-6 border border-gray-700">
                <h3 class="text-2xl font-bold text-cyan-400">PREMIUM</h3>
                <p class="text-xl font-semibold my-2 text-white">$7 USD / mes</p>
                <ul class="text-gray-400 space-y-2 my-4 text-left">
                    <li><span class="text-cyan-400">✓</span> 20 cápsulas mensuales</li>
                    <li><span class="text-cyan-400">✓</span> 5 albaceas digitales</li>
                    <li><span class="text-cyan-400">✓</span> Creación versión "mi yo PRIME"</li>
                    <li><span class="text-cyan-400">✓</span> Cápsulas para eventos especiales</li>
                </ul>
                <button class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition">Seleccionar Plan</button>
            </div>
            <div class="bg-[#1e1f20] rounded-xl p-6 border border-gray-700">
                <h3 class="text-2xl font-bold text-white">PREMIUM PRO</h3>
                <p class="text-xl font-semibold my-2 text-white">$15 USD / mes</p>
                <ul class="text-gray-400 space-y-2 my-4 text-left">
                    <li><span class="text-cyan-400">✓</span> Cápsulas ilimitadas</li>
                    <li><span class="text-cyan-400">✓</span> Albaceas digitales ilimitados</li>
                    <li><span class="text-cyan-400">✓</span> Acceso y modificación de memorias</li>
                    <li><span class="text-cyan-400">✓</span> Creación versión "mi yo PRIME PRO"</li>
                    <li><span class="text-cyan-400">✓</span> Cápsulas ilimitadas para eventos especiales</li>
                    <li><span class="text-cyan-400">✓</span> Creación cronología oficial de tu vida</li>
                    <li><span class="text-cyan-400">✓</span> Aporte a la memoria humana (Personajes públicos)</li>
                    <li><span class="text-cyan-400">✓</span> Creación "Mi mente paralela" (Tu continuidad)</li>
                </ul>
                <button class="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">Seleccionar Plan</button>
            </div>
        </div>
    </section>
    `;
}

app.getDialogueViewHTML = function() {
    const today = new Date().toISOString().split('T')[0];
    const hasAnsweredToday = dialogueData.lastAnswered === today;
    const progress = userData.progress || 5;
    let progressLevel = "Conocimiento Básico";
    if (progress > 30) progressLevel = "Entendimiento Emocional";
    if (progress > 70) progressLevel = "Sincronización Profunda";

    let contentHTML;

    if (hasAnsweredToday) {
        contentHTML = `
        <div class="bg-[#1e1f20] rounded-xl p-6 text-center">
            <p class="text-gray-300">¡Gracias por tus respuestas! Has completado el entrenamiento de hoy.</p>
            <p class="text-gray-400 text-sm mt-2">Vuelve mañana para nuevas preguntas y seguir construyendo tu mente paralela.</p>
        </div>
        `;
    } else {
        const dailyQuestions = app.getDailyQuestions();
        const questionsHTML = dailyQuestions.map((q, index) => `
            <div class="bg-[#2c2d2f] rounded-xl shadow p-4">
                <label for="q${index}" class="font-semibold text-gray-300">${q}</label>
                <textarea id="q${index}" class="mt-2 w-full h-20 bg-gray-800 text-gray-200 rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="Tu respuesta..."></textarea>
            </div>
        `).join('');

        contentHTML = `
        <div class="space-y-4">
            ${questionsHTML}
        </div>
        <button onclick="window.app.saveDialogueAnswers()" class="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition">Enviar Respuestas</button>
        `;
    }

    return `
    <section class="fade-in">
        <h2 class="text-3xl font-bold mb-2 text-white">Entrenamiento IA</h2>
        <p class="text-gray-400 mb-6">Ayuda a tu mente paralela a conocerte mejor.</p>
        
        <div class="bg-[#1e1f20] rounded-xl p-6 space-y-4 mb-6">
            <div class="flex justify-between items-center text-sm">
                <span class="font-bold text-gray-300">Grado de Sincronización</span>
                <span class="font-bold text-cyan-400">${progress}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2.5">
                <div class="bg-cyan-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
            </div>
            <p class="text-center text-xs text-gray-400">${progressLevel}</p>
        </div>

        ${contentHTML}
    </section>
    `;
}

/* --- UI Static Loader --- */
app.loadStaticUI = function() {
    const sideNav = document.getElementById('side-nav');
    if (sideNav) {
        sideNav.innerHTML = `
            <a href="#" onclick="window.app.navigateTo('home')" data-page="home" class="flex items-center p-3 rounded-lg hover:bg-gray-700 text-white">
                <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span class="nav-text">Inicio</span>
            </a>
            <a href="#" onclick="window.app.navigateTo('dialogue')" data-page="dialogue" class="flex items-center p-3 rounded-lg hover:bg-gray-700 text-white">
                <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span class="nav-text">Entrenamiento IA</span>
            </a>
            <a href="#" onclick="window.app.navigateTo('memories')" data-page="memories" class="flex items-center p-3 rounded-lg hover:bg-gray-700 text-white">
                <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span class="nav-text">Memorias</span>
            </a>
            <a href="#" onclick="window.app.navigateTo('executors')" data-page="executors" class="flex items-center p-3 rounded-lg hover:bg-gray-700 text-white">
                <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span class="nav-text">Albaceas</span>
            </a>
        `;
    }

    app.updateTokenDisplay();
}

/* --- Funciones relacionadas con cápsulas y UI --- */
app.saveCapsule = function() {
    if (dailyTokens <= 0 && userData.plan === 'free') return;
    const input = document.getElementById('capsule-input');
    const privacyToggle = document.getElementById('privacy-toggle');
    const privacy = privacyToggle ? privacyToggle.dataset.privacy : 'private';

    if (!input || capsuleTrimEmpty(input.value)) {
        alert("No hay nada que guardar.");
        return;
    }

    tempCapsuleData.text = input.value;
    tempCapsuleData.privacy = privacy;

    if (privacy === 'private') {
        // Try open executor modal (stub if not fully implemented)
        if (typeof app.openExecutorSelectionModal === 'function') {
            app.openExecutorSelectionModal();
        } else {
            console.warn('openExecutorSelectionModal no implementado - stub');
            app.finalizeCapsuleSave('Privado');
        }
    } else {
        app.finalizeCapsuleSave('Público');
    }
}

function capsuleTrimEmpty(str) {
    return !str || str.trim() === '';
}

app.updateTokenDisplay = function() {
    const tokenCountEl = document.getElementById('token-count');
    const userStatusEl = document.getElementById('user-status');
    const saveButton = document.getElementById('save-button');
    const capsuleInput = document.getElementById('capsule-input');

    if (tokenCountEl && userStatusEl) {
        switch (userData.plan) {
            case 'premium':
                tokenCountEl.innerHTML = '24';
                userStatusEl.textContent = 'PREMIUM';
                break;
            case 'pro':
                tokenCountEl.innerHTML = '&infin;';
                userStatusEl.textContent = 'PRO';
                break;
            default:
                tokenCountEl.textContent = dailyTokens;
                userStatusEl.textContent = 'FREE';
                break;
        }
    }

    if (saveButton && userData.plan === 'free') {
        if (dailyTokens <= 0) {
            saveButton.disabled = true;
            saveButton.classList.add('bg-gray-500', 'cursor-not-allowed');
            saveButton.classList.remove('bg-cyan-600', 'hover:bg-cyan-500');
            if(capsuleInput) {
                capsuleInput.placeholder = 'Vuelve mañana para más cápsulas.';
                capsuleInput.disabled = true;
            }
        } else {
             saveButton.disabled = false;
             saveButton.classList.remove('bg-gray-500', 'cursor-not-allowed');
             saveButton.classList.add('bg-cyan-600', 'hover:bg-cyan-500');
             if(capsuleInput) capsuleInput.disabled = false;
        }
    }
}

/* --- Helpers: edad, privacidad, preguntas diarias --- */
app.calculateAge = function(birthDateString) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

app.togglePrivacy = function(button) {
    const isPrivate = button.dataset.privacy === 'private';
    if (isPrivate) {
        button.dataset.privacy = 'public';
        button.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l1.414-1.414a1 1 0 011.414 0l1.414 1.414M10 11V3m4 8V3m-6 8h2m6-8h2"></path></svg>
            <span>Pública</span>
        `;
    } else {
        button.dataset.privacy = 'private';
        button.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <span>Privada</span>
        `;
    }
}

app.getDailyQuestions = function() {
    const allQuestions = [
        "¿Qué es lo que más te apasiona en este momento de tu vida?",
        "Si pudieras darle un consejo a tu yo de hace 10 años, ¿cuál sería?",
        "Describe un lugar donde te sientas completamente en paz.",
        "¿Cuál es el mayor riesgo que has tomado?",
        "¿Qué canción te transporta instantáneamente a un recuerdo feliz?",
        "¿Hay algún sueño que dejaste ir y que a veces extrañas?",
        "¿Qué cualidad valoras más en un amigo?",
        "Si tuvieras un día completamente libre, sin obligaciones, ¿qué harías?",
        "¿Cuál es un pequeño placer que te alegra el día?"
    ];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const startIndex = (dayOfYear * 3) % allQuestions.length;
    
    let questions = [];
    for(let i = 0; i < 3; i++) {
        questions.push(allQuestions[(startIndex + i) % allQuestions.length]);
    }
    return questions;
}

/* --- Guardar respuestas del diálogo diario --- */
app.saveDialogueAnswers = function() {
    const answers = [
        (document.getElementById('q0') || {}).value || '',
        (document.getElementById('q1') || {}).value || '',
        (document.getElementById('q2') || {}).value || '',
    ];

    if (answers.some(a => a.trim() === '')) {
        alert('Por favor, responde todas las preguntas.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    dialogueData.lastAnswered = today;
    dialogueData.answers[today] = answers;
    userData.progress = Math.min(100, (userData.progress || 5) + 2); // Aumentar progreso
    app.saveDataToLocalStorage();
    
    console.log("Respuestas guardadas:", dialogueData.answers[today]);
    app.navigateTo('dialogue');
}

/* --- Renderizado y gestión de Albaceas/Cápsulas --- */
app.addExecutor = function() {
    const name = prompt('Nombre del nuevo albacea:');
    if (!name) return;
    executors = executors || [];
    executors.push(name);
    app.saveDataToLocalStorage();
    app.navigateTo('executors');
}

app.removeExecutor = function(btn, name) {
    executors = executors.filter(e => e !== name);
    app.saveDataToLocalStorage();
    app.navigateTo('executors');
}

/* --- Finalizar guardado de cápsula (stub mínimo y funcional) --- */
app.finalizeCapsuleSave = function(visibilityLabel) {
    try {
        const input = document.getElementById('capsule-input');
        const confirmEl = document.getElementById('confirmation-message');

        const text = (tempCapsuleData.text || (input ? input.value : '')).trim();
        if (!text) {
            if (confirmEl) {
                confirmEl.textContent = 'Nada para guardar';
                confirmEl.classList.remove('hidden');
                setTimeout(() => confirmEl.classList.add('hidden'), 1500);
            }
            return;
        }

        capsulesData = capsulesData || [];
        const capsule = {
            id: `c_${Date.now()}`,
            text,
            privacy: tempCapsuleData.privacy || 'private',
            visibility: visibilityLabel || 'Privado',
            createdAt: Date.now()
        };
        capsulesData.unshift(capsule);

        // Reducir tokens si aplica
        if (userData && userData.plan === 'free') {
            dailyTokens = Math.max(0, (dailyTokens || 0) - 1);
        }

        app.saveDataToLocalStorage();

        if (input) input.value = '';
        app.updateTokenDisplay();

        if (confirmEl) {
            confirmEl.textContent = 'Guardado';
            confirmEl.classList.remove('hidden');
            setTimeout(() => confirmEl.classList.add('hidden'), 2000);
        }

        // limpiar temp
        tempCapsuleData = {};
    } catch (err) {
        console.warn('finalizeCapsuleSave error', err);
    }
}

/* --- Abrir modal de selección de ejecutor (stub no bloqueante) --- */
app.openExecutorSelectionModal = function() {
    console.warn('openExecutorSelectionModal: stub llamado - TODO: implementar selección de ejecutor');
    // Comportamiento mínimo: intentar seleccionar primer ejecutor automáticamente para no bloquear flow
    if (Array.isArray(executors) && executors.length > 0) {
        // asignar primer ejecutor temporalmente
        tempCapsuleData.executor = executors[0];
    }
    // Continuar flujo de guardado
    app.finalizeCapsuleSave('Privado');
}

/* --- Toggle de grabación (stub) --- */
app.toggleRecording = function() {
    console.warn('toggleRecording: stub llamado - TODO: implementar grabación');
    const btn = document.getElementById('record-button');
    if (!btn) return;
    btn.classList.toggle('bg-red-500');
    btn.classList.toggle('text-white');
}

/* --- Memorias view placeholder (se respeta comportamiento original) --- */
app.getMemoriesViewHTML = function() {
    return `
    <section class="fade-in">
        <h2 class="text-3xl font-bold mb-2 text-white">Memorias</h2>
        <p class="text-gray-400">Aquí verás tus memorias publicadas.</p>
        <div class="mt-4 space-y-3">
            ${(capsulesData && capsulesData.length) ? capsulesData.map(c => `
                <div class="bg-[#1e1f20] rounded-lg p-4">
                    <div class="text-gray-200">${escapeHtml(c.text)}</div>
                    <div class="text-xs text-gray-400 mt-2">Guardada: ${new Date(c.createdAt).toLocaleString()}</div>
                </div>
            `).join('') : `<p class="text-sm text-gray-400">No hay memorias todavía.</p>`}
        </div>
    </section>
    `;
}

/* --- Utility: escape HTML para inserciones simples --- */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}
