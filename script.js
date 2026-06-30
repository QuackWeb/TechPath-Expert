/* =========================================
   TECHPATH EXPERT SYSTEM - GLOBAL SCRIPT
   Tujuan: Fungsi utiliti merentas halaman
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Serlahkan pautan navigasi aktif berdasarkan URL semasa
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        // Buang kelas aktif dari semua pautan
        link.classList.remove('active');
        
        // Tambah kelas aktif pada halaman yang sepadan
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else if (currentPage === '' || currentPage === '/') {
            // Default kepada index.html jika di root URL
            if (link.getAttribute('href') === 'index.html') {
                link.classList.add('active');
            }
        }
    });

    // 2. Fungsi Reset (Kosongkan Local Storage) apabila pengguna memulakan ujian baharu
    // Mencari butang mula di halaman utama (index.html)
    const startBtn = document.querySelector('a[href="user-info.html"].btn-primary');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            // Memadamkan data sesi ujian yang lepas bagi mengelakkan konflik
            localStorage.removeItem('techpath_userProfile');
            localStorage.removeItem('techpath_minat');
            localStorage.removeItem('techpath_kemahiran');
            localStorage.removeItem('techpath_personaliti');
            localStorage.removeItem('techpath_topCareers');
            console.log("Memori ujian lepas telah dikosongkan. Memulakan sesi baharu...");
        });
    }

    // Mencari butang ulang penilaian di halaman keputusan (result.html)
    const restartBtn = document.querySelector('a[href="index.html"].text-white');
    if (restartBtn && restartBtn.innerText.includes('Ulang Penilaian')) {
        restartBtn.addEventListener('click', () => {
            // Padam kesemua data Sistem Pakar di Local Storage
            localStorage.clear();
        });
    }
    
    // 3. Hamburger Mobile Menu
    initMobileMenu();

    // 4. Log Pengesahan Sistem
    console.log("Modul Antaramuka dan Sistem Pakar TechPath Bersedia.");

    // 5. AI Chat Widget
    initChatWidget();
});

function initMobileMenu() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Determine active page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pages = [
        { href: 'index.html',          label: 'Home' },
        { href: 'knowledge-base.html', label: 'Career List' },
        { href: 'about.html',          label: 'About System' },
        { href: 'cgpa.html',           label: 'CGPA Calculator' },
    ];

    // Inject hamburger button into navbar
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.id = 'hamburger';
    hamburger.setAttribute('aria-label', 'Open menu');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    navbar.appendChild(hamburger);

    // Inject mobile menu overlay into body
    const menuLinks = pages.map(p =>
        `<a href="${p.href}" class="${p.href === currentPage ? 'active' : ''}">${p.label}</a>`
    ).join('');

    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobileMenu';
    mobileMenu.innerHTML = `
        <button class="mobile-menu-close" id="mobileMenuClose" aria-label="Close menu">✕</button>
        ${menuLinks}
    `;
    document.body.appendChild(mobileMenu);

    // Toggle open/close
    function openMenu() {
        hamburger.classList.add('active');
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    document.getElementById('mobileMenuClose').addEventListener('click', closeMenu);

    // Close on link tap
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', closeMenu);
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });
}

function initChatWidget() {
    document.body.insertAdjacentHTML('beforeend', `
        <div class="chat-widget" id="chatWidget">
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">🤖</div>
                        <div>
                            <div class="chat-name">TechPath AI</div>
                            <div class="chat-status" id="chatStatusText">Online</div>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button class="chat-lang-btn" id="chatLangBtn" title="Switch Language">BM</button>
                        <button class="chat-close-btn" id="chatClose" title="Close">✕</button>
                    </div>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="Tanya tentang kerjaya IT..." autocomplete="off">
                    <button class="chat-send-btn" id="chatSend" title="Send">➤</button>
                </div>
            </div>
            <button class="chat-toggle" id="chatToggle" title="Chat with TechPath AI">
                💬
                <span class="chat-notif" id="chatNotif"></span>
            </button>
        </div>
    `);

    const chatToggle  = document.getElementById('chatToggle');
    const chatWindow  = document.getElementById('chatWindow');
    const chatClose   = document.getElementById('chatClose');
    const chatMsgs    = document.getElementById('chatMessages');
    const chatInput   = document.getElementById('chatInput');
    const chatSend    = document.getElementById('chatSend');
    const chatNotif   = document.getElementById('chatNotif');
    const chatLangBtn = document.getElementById('chatLangBtn');

    let isOpen  = false;
    let greeted = false;
    let lang    = 'bm'; // 'bm' = Bahasa Malaysia, 'en' = English

    // ── UI strings per language ──
    const ui = {
        bm: {
            placeholder : 'Tanya tentang kerjaya IT...',
            closeTitle  : 'Tutup',
            sendTitle   : 'Hantar',
            langLabel   : 'BM',
            langSwitch  : 'Bahasa ditukar kepada Bahasa Melayu. 🇲🇾',
            greeting    : "Hai! 👋 Saya TechPath AI. Boleh tanya saya tentang:\n• Kerjaya IT (Web Dev, Data Scientist, dll)\n• Gaji industri tech Malaysia\n• Kemahiran & sijil diperlukan\n• Cara guna Sistem Pakar TechPath\n\nCuba tanya sesuatu!",
        },
        en: {
            placeholder : 'Ask about IT careers...',
            closeTitle  : 'Close',
            sendTitle   : 'Send',
            langLabel   : 'EN',
            langSwitch  : 'Language switched to English. 🇬🇧',
            greeting    : "Hi! 👋 I'm TechPath AI. You can ask me about:\n• IT careers (Web Dev, Data Scientist, etc.)\n• Tech industry salaries in Malaysia\n• Skills & certifications needed\n• How to use the TechPath Expert System\n\nGo ahead, ask anything!",
        }
    };

    function applyLang() {
        chatInput.placeholder = ui[lang].placeholder;
        chatClose.title       = ui[lang].closeTitle;
        chatSend.title        = ui[lang].sendTitle;
        chatLangBtn.textContent = ui[lang].langLabel;
    }

    // ── Responses in Bahasa Malaysia ──
    function replyBM(msg) {
        const m = msg.toLowerCase();

        if (/^(hai|hi|hello|helo|salam|hey|assalam)/.test(m))
            return "Hai! 😊 Apa yang anda ingin tahu hari ini?\n\nSaya boleh bantu tentang kerjaya IT, gaji, kemahiran, sijil, atau cara guna TechPath. Tanya je!";

        if (/web dev|frontend|backend|fullstack|html|css|javascript|react|vue|node/.test(m))
            return "Web Developer terbahagi kepada Frontend, Backend & Fullstack.\n\n💰 Gaji: RM 4,000 – RM 8,000/bulan\n🛠 Kemahiran: HTML, CSS, JavaScript, React/Vue (frontend) atau Node.js/PHP/Laravel (backend)\n📜 Sijil: Meta Frontend Certificate, freeCodeCamp\n\nTip: Mulakan dengan HTML & CSS, kemudian JavaScript!";

        if (/data scien|data analy|data analyst|tableau|power bi/.test(m))
            return "Data Scientist / Analyst antara kerjaya paling dicari!\n\n💰 Gaji: RM 4,500 – RM 15,000/bulan\n🛠 Kemahiran: Python, SQL, Machine Learning, Tableau, Power BI\n📜 Sijil: Google Data Analytics, IBM Data Science\n\nBelajar Python dan SQL dulu sebagai asas! 📊";

        if (/cyber|security analyst|pentest|ethical hack|kali|kompti/.test(m))
            return "Cybersecurity semakin kritikal terutama untuk sektor kewangan Malaysia.\n\n💰 Gaji: RM 5,000 – RM 12,000/bulan\n🛠 Kemahiran: Linux, Networking, Ethical Hacking, Kali Linux\n📜 Sijil: CompTIA Security+, CEH, OSCP\n\nMulakan dengan belajar asas Linux & Networking! 🔐";

        if (/\bai\b|artificial intel|machine learn|deep learn|tensorflow|pytorch|ml engineer/.test(m))
            return "AI/ML Engineer adalah kerjaya masa depan dengan permintaan sangat tinggi!\n\n💰 Gaji: RM 7,000 – RM 20,000/bulan\n🛠 Kemahiran: Python, TensorFlow, PyTorch, Statistics\n📜 Sijil: DeepLearning.AI, Google ML Certificate\n\nAsas kukuh dalam Matematik dan Python adalah wajib. 🤖";

        if (/cloud|devops|aws|azure|docker|kubernetes|gcp/.test(m))
            return "Cloud & DevOps Engineer diperlukan oleh hampir semua syarikat besar!\n\n💰 Gaji: RM 6,000 – RM 15,000/bulan\n🛠 Kemahiran: AWS/Azure, Linux, Docker, Kubernetes, CI/CD\n📜 Sijil: AWS Solutions Architect, Azure Administrator\n\nBelajar Linux dan Docker sebagai langkah pertama. ☁️";

        if (/mobile|android|ios|flutter|react native|kotlin|swift/.test(m))
            return "Mobile Developer sangat popular dengan ledakan aplikasi fintech di Malaysia!\n\n💰 Gaji: RM 4,500 – RM 10,000/bulan\n🛠 Kemahiran: Flutter atau React Native (cross-platform), Kotlin (Android), Swift (iOS)\n\nFlutter bagus untuk pemula kerana satu kod untuk Android & iOS! 📱";

        if (/game dev|unity|unreal|game design/.test(m))
            return "Game Developer di Malaysia masih berkembang dengan syarikat seperti Larian Studios.\n\n💰 Gaji: RM 3,500 – RM 8,000/bulan\n🛠 Kemahiran: Unity (C#) atau Unreal Engine (C++)\n\nPortfolio game adalah kunci utama untuk dapat kerja dalam industri ini! 🎮";

        if (/ui|ux|designer|figma|adobe xd|prototyp/.test(m))
            return "UI/UX Designer semakin penting kerana syarikat fokus kepada pengalaman pengguna.\n\n💰 Gaji: RM 3,500 – RM 8,000/bulan\n🛠 Kemahiran: Figma, Adobe XD, User Research, Prototyping\n\nBina portfolio design yang kuat sebelum apply kerja! 🎨";

        if (/it support|helpdesk|sistem admin|sysadmin/.test(m))
            return "IT Support / System Admin adalah pintu masuk ramai dalam industri IT.\n\n💰 Gaji: RM 2,500 – RM 4,500/bulan\n🛠 Kemahiran: Windows Server, Active Directory, Networking\n📜 Sijil: CompTIA A+, Microsoft MCP\n\nBagus untuk orang yang baru masuk industri IT! 🖥";

        if (/gaji|salary|pendapatan|income|berapa/.test(m))
            return "Julat gaji IT di Malaysia (2025):\n\n• IT Support: RM 2,500–4,500\n• Web Developer: RM 4,000–8,000\n• Data Analyst: RM 4,500–9,000\n• Software Engineer: RM 5,000–12,000\n• Cybersecurity: RM 5,000–15,000\n• Cloud/DevOps: RM 6,000–15,000\n• AI/ML Engineer: RM 7,000–20,000\n\nSijil dan pengalaman boleh naikkan gaji 20–40%! 💰";

        if (/sijil|certificate|certif/.test(m))
            return "Sijil IT paling popular di Malaysia:\n\n🏆 AWS/Azure/GCP — Cloud\n🏆 CompTIA Security+/CEH — Cybersecurity\n🏆 Google Data Analytics — Data\n🏆 Meta Frontend Certificate — Web Dev\n🏆 PMP/Scrum — Project Management\n\nSijil boleh bantu naik gaji dan mudah dapat kerja!";

        if (/python|javascript|java|sql|php|c\+\+|bahasa program|coding|belajar kod/.test(m))
            return "Bahasa pengaturcaraan popular di Malaysia:\n\n🐍 Python — Data, AI, Backend\n🌐 JavaScript — Web (Frontend & Backend)\n☕ Java/Kotlin — Android, Enterprise\n🐘 PHP/Laravel — Web Backend\n🗄 SQL — Semua bidang data\n\nPython dan JavaScript paling mudah untuk pemula!";

        if (/belajar|platform|course|kursus|mana nak|di mana/.test(m))
            return "Platform belajar IT terbaik:\n\n🆓 freeCodeCamp.org — Web Dev (percuma)\n📚 Coursera / edX — Kursus universiti\n🎬 YouTube — Traversy Media, CS Dojo\n💻 Codecademy — Interaktif & mesra pemula\n🛒 Udemy — Kursus berpatutan (RM 15–50)\n\nTip: Bina projek sendiri sambil belajar untuk portfolio!";

        if (/masa depan|trend|bidang mana|pilih|popular|dicari/.test(m))
            return "Bidang IT paling besar masa depan:\n\n1️⃣ AI & Machine Learning 🤖\n2️⃣ Cybersecurity 🔐\n3️⃣ Cloud Computing ☁️\n4️⃣ Data Science 📊\n5️⃣ Blockchain & Web3 ⛓\n\nPilih berdasarkan minat anda, bukan sekadar gaji. Passion + Kemahiran = Kejayaan! ✨";

        if (/cara guna|macam mana|how to use|mula|start assessment|penilaian/.test(m))
            return "Cara guna TechPath Expert System:\n\n1. Klik 'Start Assessment Now'\n2. Isi maklumat peribadi\n3. Jawab soalan minat & kemahiran\n4. Pilih gaya kerja anda\n5. Sistem cadangkan kerjaya terbaik!\n\nProses ambil masa 5–10 minit sahaja. 🚀";

        if (/knowledge base|career list|senarai kerjaya/.test(m))
            return "Knowledge Base TechPath mengandungi 18+ kerjaya IT dengan maklumat lengkap:\n• Huraian kerjaya\n• Kemahiran diperlukan\n• Julat gaji Malaysia\n• Sijil disyorkan\n• Pelan pembelajaran\n\nBoleh akses melalui menu 'Career List' di navbar atas! 📚";

        if (/tentang|sistem pakar|expert system|techpath|apa itu/.test(m))
            return "TechPath adalah Sistem Pakar IT berbasiskan peraturan (Rule-Based Expert System).\n\n🧠 135 peraturan inferens\n⚙️ Enjin Forward Chaining\n🗺 18+ kerjaya IT dalam Knowledge Base\n🇲🇾 Konteks industri tech Malaysia\n\nDibina untuk bantu anda temui kerjaya IT yang paling sesuai dengan profil anda!";

        if (/terima kasih|thanks|thank you|tq |syabas|bagus|best/.test(m))
            return "Sama-sama! 😊 Semoga maklumat tadi berguna untuk anda.\n\nKalau ada soalan lain tentang kerjaya IT, jangan segan tanya! Semoga berjaya dalam perjalanan kerjaya anda! 🌟";

        return "Hmm, saya tak pasti tentang itu. Cuba tanya tentang:\n• Kerjaya IT tertentu (Web Dev, Data Science, dll)\n• Gaji atau kemahiran\n• Sijil yang diperlukan\n• Platform untuk belajar\n• Cara guna TechPath\n\nSaya akan cuba bantu sebaik mungkin! 🤔";
    }

    // ── Responses in English ──
    function replyEN(msg) {
        const m = msg.toLowerCase();

        if (/^(hai|hi|hello|helo|hey|good morning|good afternoon)/.test(m))
            return "Hello! 😊 What would you like to know today?\n\nI can help with IT careers, salaries, skills, certifications, or how to use TechPath. Just ask!";

        if (/web dev|frontend|backend|fullstack|html|css|javascript|react|vue|node/.test(m))
            return "Web Developers specialize in Frontend, Backend, or Fullstack.\n\n💰 Salary: RM 4,000 – RM 8,000/month\n🛠 Skills: HTML, CSS, JavaScript, React/Vue (frontend) or Node.js/PHP/Laravel (backend)\n📜 Certs: Meta Frontend Certificate, freeCodeCamp\n\nTip: Start with HTML & CSS, then move on to JavaScript!";

        if (/data scien|data analy|data analyst|tableau|power bi/.test(m))
            return "Data Scientist / Analyst is one of the most in-demand roles!\n\n💰 Salary: RM 4,500 – RM 15,000/month\n🛠 Skills: Python, SQL, Machine Learning, Tableau, Power BI\n📜 Certs: Google Data Analytics, IBM Data Science\n\nLearn Python and SQL first as your foundation! 📊";

        if (/cyber|security analyst|pentest|ethical hack|kali|comptia/.test(m))
            return "Cybersecurity is increasingly critical, especially in Malaysia's finance sector.\n\n💰 Salary: RM 5,000 – RM 12,000/month\n🛠 Skills: Linux, Networking, Ethical Hacking, Kali Linux\n📜 Certs: CompTIA Security+, CEH, OSCP\n\nStart by learning Linux & Networking basics! 🔐";

        if (/\bai\b|artificial intel|machine learn|deep learn|tensorflow|pytorch|ml engineer/.test(m))
            return "AI/ML Engineer is the career of the future with very high demand!\n\n💰 Salary: RM 7,000 – RM 20,000/month\n🛠 Skills: Python, TensorFlow, PyTorch, Statistics\n📜 Certs: DeepLearning.AI, Google ML Certificate\n\nA solid foundation in Math and Python is essential. 🤖";

        if (/cloud|devops|aws|azure|docker|kubernetes|gcp/.test(m))
            return "Cloud & DevOps Engineers are needed by almost every major company!\n\n💰 Salary: RM 6,000 – RM 15,000/month\n🛠 Skills: AWS/Azure, Linux, Docker, Kubernetes, CI/CD\n📜 Certs: AWS Solutions Architect, Azure Administrator\n\nLearn Linux and Docker as your first step. ☁️";

        if (/mobile|android|ios|flutter|react native|kotlin|swift/.test(m))
            return "Mobile Developers are highly popular with the fintech app boom in Malaysia!\n\n💰 Salary: RM 4,500 – RM 10,000/month\n🛠 Skills: Flutter or React Native (cross-platform), Kotlin (Android), Swift (iOS)\n\nFlutter is great for beginners — one codebase for Android & iOS! 📱";

        if (/game dev|unity|unreal|game design/.test(m))
            return "Game Development in Malaysia is growing, with studios like Larian Studios having a presence here.\n\n💰 Salary: RM 3,500 – RM 8,000/month\n🛠 Skills: Unity (C#) or Unreal Engine (C++)\n\nA strong game portfolio is the key to landing a job in this industry! 🎮";

        if (/ui|ux|designer|figma|adobe xd|prototyp/.test(m))
            return "UI/UX Designers are increasingly important as companies focus on user experience.\n\n💰 Salary: RM 3,500 – RM 8,000/month\n🛠 Skills: Figma, Adobe XD, User Research, Prototyping\n\nBuild a strong design portfolio before applying for jobs! 🎨";

        if (/it support|helpdesk|system admin|sysadmin/.test(m))
            return "IT Support / System Admin is a common entry point into the IT industry.\n\n💰 Salary: RM 2,500 – RM 4,500/month\n🛠 Skills: Windows Server, Active Directory, Networking\n📜 Certs: CompTIA A+, Microsoft MCP\n\nGreat for people just starting in IT! 🖥";

        if (/gaji|salary|income|pay|earning|how much/.test(m))
            return "IT salary ranges in Malaysia (2025):\n\n• IT Support: RM 2,500–4,500\n• Web Developer: RM 4,000–8,000\n• Data Analyst: RM 4,500–9,000\n• Software Engineer: RM 5,000–12,000\n• Cybersecurity: RM 5,000–15,000\n• Cloud/DevOps: RM 6,000–15,000\n• AI/ML Engineer: RM 7,000–20,000\n\nCertifications and experience can increase salary by 20–40%! 💰";

        if (/sijil|certificate|certif/.test(m))
            return "Most popular IT certifications in Malaysia:\n\n🏆 AWS/Azure/GCP — Cloud\n🏆 CompTIA Security+/CEH — Cybersecurity\n🏆 Google Data Analytics — Data\n🏆 Meta Frontend Certificate — Web Dev\n🏆 PMP/Scrum — Project Management\n\nCertifications help with salary increases and job applications!";

        if (/python|javascript|java|sql|php|c\+\+|programming language|coding|learn to code/.test(m))
            return "Popular programming languages in Malaysia:\n\n🐍 Python — Data, AI, Backend\n🌐 JavaScript — Web (Frontend & Backend)\n☕ Java/Kotlin — Android, Enterprise\n🐘 PHP/Laravel — Web Backend\n🗄 SQL — All data-related fields\n\nPython and JavaScript are the easiest for beginners!";

        if (/learn|study|platform|course|where to|resource/.test(m))
            return "Best platforms to learn IT:\n\n🆓 freeCodeCamp.org — Web Dev (free)\n📚 Coursera / edX — University courses\n🎬 YouTube — Traversy Media, CS Dojo\n💻 Codecademy — Interactive & beginner-friendly\n🛒 Udemy — Affordable courses\n\nTip: Build your own projects while learning to grow your portfolio!";

        if (/future|trend|which field|choose|popular|in demand/.test(m))
            return "Biggest IT fields of the future:\n\n1️⃣ AI & Machine Learning 🤖\n2️⃣ Cybersecurity 🔐\n3️⃣ Cloud Computing ☁️\n4️⃣ Data Science 📊\n5️⃣ Blockchain & Web3 ⛓\n\nChoose based on your interests, not just salary. Passion + Skills = Success! ✨";

        if (/how to use|how do i|get started|start|assessment/.test(m))
            return "How to use TechPath Expert System:\n\n1. Click 'Start Assessment Now'\n2. Fill in your personal info\n3. Answer questions about your interests & skills\n4. Choose your work style\n5. The system recommends the best career for you!\n\nThe whole process takes only 5–10 minutes. 🚀";

        if (/knowledge base|career list/.test(m))
            return "TechPath's Knowledge Base contains 18+ IT careers with full details:\n• Career descriptions\n• Required skills\n• Malaysia salary ranges\n• Recommended certifications\n• Learning roadmap\n\nAccess it via the 'Career List' menu in the navbar above! 📚";

        if (/about|expert system|techpath|what is/.test(m))
            return "TechPath is a Rule-Based IT Expert System.\n\n🧠 135 inference rules\n⚙️ Forward Chaining Engine\n🗺 18+ IT careers in the Knowledge Base\n🇲🇾 Built for the Malaysian tech industry context\n\nDesigned to help you discover the IT career that best matches your profile!";

        if (/thank|thanks|terima kasih|tq |great|awesome/.test(m))
            return "You're welcome! 😊 Hope the information was helpful.\n\nIf you have more questions about IT careers, feel free to ask anytime. Best of luck on your career journey! 🌟";

        return "Hmm, I'm not sure about that. Try asking about:\n• A specific IT career (Web Dev, Data Science, etc.)\n• Salaries or skills\n• Required certifications\n• Platforms to learn\n• How to use TechPath\n\nI'll do my best to help! 🤔";
    }

    // ── Toggle language ──
    chatLangBtn.addEventListener('click', () => {
        lang = lang === 'bm' ? 'en' : 'bm';
        applyLang();
        addBotMsg(ui[lang].langSwitch);
    });

    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.classList.toggle('open', isOpen);
        if (isOpen) {
            chatNotif.style.display = 'none';
            if (!greeted) {
                greeted = true;
                setTimeout(() => addBotMsg(ui[lang].greeting), 350);
            }
            setTimeout(() => chatInput.focus(), 350);
        }
    }

    chatToggle.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);

    setTimeout(() => { if (!isOpen) chatNotif.style.display = 'block'; }, 3500);

    function addBotMsg(text) {
        const el = document.createElement('div');
        el.className = 'chat-bubble bot';
        el.textContent = text;
        chatMsgs.appendChild(el);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function addUserMsg(text) {
        const el = document.createElement('div');
        el.className = 'chat-bubble user';
        el.textContent = text;
        chatMsgs.appendChild(el);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'chat-typing';
        el.id = 'chatTyping';
        el.innerHTML = '<span></span><span></span><span></span>';
        chatMsgs.appendChild(el);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('chatTyping');
        if (el) el.remove();
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        addUserMsg(text);
        chatInput.value = '';
        showTyping();
        setTimeout(() => {
            removeTyping();
            addBotMsg(lang === 'bm' ? replyBM(text) : replyEN(text));
        }, 800 + Math.random() * 500);
    }

    applyLang();
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
}