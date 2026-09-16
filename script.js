// Initialize Lucide icons
lucide.createIcons();

// --- Theme Management ---
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlEl = document.documentElement;

// Check for saved theme or system preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const setTheme = (isDark) => {
    if (isDark) {
        htmlEl.setAttribute('data-theme', 'dark');
        themeIcon.setAttribute('data-lucide', 'sun');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlEl.setAttribute('data-theme', 'light');
        themeIcon.setAttribute('data-lucide', 'moon');
        localStorage.setItem('theme', 'light');
    }
    lucide.createIcons(); // Re-render icons
};

// Initial theme setup
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    setTheme(true);
}

themeToggle.addEventListener('click', () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
});

// --- App State & Elements ---
const receivedEmailEl = document.getElementById('receivedEmail');
const charCountEl = document.getElementById('charCount');
const generateBtn = document.getElementById('generateBtn');
const generateBtnText = document.getElementById('generateBtnText');
const emailErrorEl = document.getElementById('emailError');
const resultCard = document.getElementById('resultCard');
const generatedReplyEl = document.getElementById('generatedReply');

const toneSelect = document.getElementById('toneSelect');
const lengthSelect = document.getElementById('lengthSelect');
const languageSelect = document.getElementById('languageSelect');

// Buttons
const copyBtn = document.getElementById('copyBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toast = document.getElementById('toast');

// --- Character Counter ---
receivedEmailEl.addEventListener('input', () => {
    const currentLength = receivedEmailEl.value.length;
    charCountEl.textContent = currentLength;
    if (currentLength > 0) {
        emailErrorEl.classList.add('hidden');
    }
});

// --- Mock AI Reply Generator ---
const mockReplies = {
    professional: {
        short: "Hi there,\n\nThank you for reaching out. I will review the details and get back to you shortly.\n\nBest regards,\nWamiq",
        medium: "Hi there,\n\nThank you for reaching out. I appreciate your message and will review the details carefully. I’ll get back to you shortly with the requested information.\n\nBest regards,\nWamiq",
        detailed: "Hi there,\n\nThank you for reaching out with this information. I appreciate your thoroughness. I will review the details carefully with my team to ensure we address all your points accurately. \n\nExpect a comprehensive update from me by tomorrow.\n\nBest regards,\nWamiq",
    },
    friendly: {
        short: "Hi!\n\nThanks for the email! I'll take a look and get back to you soon.\n\nBest,\nWamiq",
        medium: "Hi there!\n\nThanks for your email! I really appreciate you reaching out. I’ll take a look at everything and get back to you soon.\n\nBest,\nWamiq",
        detailed: "Hi there!\n\nThanks so much for your email! I really appreciate you taking the time to share these details. I’ll review everything on my end and send over a full response very soon. \n\nHope you're having a great week!\n\nBest,\nWamiq",
    },
    casual: {
        short: "Hey,\n\nGot it, thanks. Will check it out.\n\nCheers,\nWamiq",
        medium: "Hey,\n\nGot your email, thanks! I'll take a look when I get a chance and loop back with you.\n\nCheers,\nWamiq",
        detailed: "Hey!\n\nThanks for sending this over. I've got it on my radar and will dig into the details as soon as I can. \n\nI'll let you know if I need anything else from you to proceed.\n\nCheers,\nWamiq",
    },
    formal: {
        short: "Dear Sender,\n\nReceipt of your correspondence is acknowledged. A detailed response will follow.\n\nSincerely,\nWamiq",
        medium: "Dear Sender,\n\nThank you for your correspondence. I have received your message and will review the contents with due diligence. Expect a formal response in due course.\n\nSincerely,\nWamiq",
        detailed: "Dear Sender,\n\nThank you for your detailed correspondence. I formally acknowledge receipt of your message. The contents will be reviewed with due diligence to ensure compliance with our standard operating procedures. \n\nA formal and complete response will be provided shortly.\n\nSincerely,\nWamiq",
    },
    appreciative: {
        short: "Hi,\n\nThank you so much for this! Greatly appreciated.\n\nBest,\nWamiq",
        medium: "Hi,\n\nThank you so much for sharing this with me. I truly appreciate your help and effort here.\n\nBest,\nWamiq",
        detailed: "Hi,\n\nThank you so much for putting this together and sharing it with me. I truly appreciate the time and effort you took to provide these details. This is incredibly helpful!\n\nBest,\nWamiq",
    },
    concise: {
        short: "Received, thanks.\n- Wamiq",
        medium: "Thanks for the information. I will review and follow up.\n- Wamiq",
        detailed: "Thanks for the detailed information. I will review the attachments and context provided, and follow up with next steps.\n- Wamiq",
    }
};

// The function to generate a reply
const generateReply = async () => {
    const emailContent = receivedEmailEl.value.trim();

    // Validation
    if (!emailContent) {
        emailErrorEl.classList.remove('hidden');
        receivedEmailEl.focus();
        return;
    }

    const tone = toneSelect.value;
    const length = lengthSelect.value;
    const language = languageSelect.value;

    // Loading State
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i><span>Generating reply...</span>';
    lucide.createIcons();

    let reply = "";
    try {
        // Call our secure serverless API route (on Vercel this uses GROQ_API_KEY env var)
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailContent, tone, length, language })
        });

        if (response.ok) {
            const data = await response.json();
            reply = data.reply;
        } else {
            // Fallback for local development: call Groq directly via config.js
            const localKey = window.GROQ_API_KEY || 'YOUR_GROQ_API_KEY';
            const prompt = `You are a professional email assistant. Write a ${length} email reply in ${language} with a ${tone} tone to the following email:\n\n${emailContent}\n\nDo NOT include conversational filler, just output the reply directly.`;
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'openai/gpt-oss-120b', messages: [{ role: 'user', content: prompt }] })
            });
            const groqData = await groqRes.json();
            reply = groqData.choices?.[0]?.message?.content?.trim() || 'Failed to generate reply.';
        }
    } catch (e) {
        console.error(e);
        reply = "An error occurred while generating the reply. Please try again.";
    }

    // Display Result
    generatedReplyEl.value = reply;
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reset Button
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i data-lucide="sparkles"></i><span id="generateBtnText">Generate Reply</span>';
    lucide.createIcons();
};

// Generate Button Event
generateBtn.addEventListener('click', generateReply);

// Regenerate Button
regenerateBtn.addEventListener('click', () => {
    regenerateBtn.disabled = true;
    const originalContent = regenerateBtn.innerHTML;
    regenerateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Regenerating';
    lucide.createIcons();

    // Briefly show loading, then regenerate
    setTimeout(() => {
        generateReply().then(() => {
            regenerateBtn.disabled = false;
            regenerateBtn.innerHTML = originalContent;
            lucide.createIcons();
        });
    }, 100);
});

// Clear Button
clearBtn.addEventListener('click', () => {
    receivedEmailEl.value = '';
    charCountEl.textContent = '0';
    emailErrorEl.classList.add('hidden');
    resultCard.classList.add('hidden');
    generatedReplyEl.value = '';

    // Switch to defaults
    toneSelect.value = 'professional';
    lengthSelect.value = 'medium';
    languageSelect.value = 'english';
});

// Copy Button
copyBtn.addEventListener('click', () => {
    const textToCopy = generatedReplyEl.value;
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast();
        });
    }
});

// Download Button
downloadBtn.addEventListener('click', () => {
    const textToDownload = generatedReplyEl.value;
    if (textToDownload) {
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email-reply.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// Toast Notification Logic
let toastTimeout;
const showToast = () => {
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
};
