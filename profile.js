// ===== Profile Page JavaScript =====

// State management
let isEditMode = false;
let profileData = {
    fullName: 'Debbie Meyers',
    email: 'debbie@meyers.com',
    location: 'San Jose, California',
    bio: 'Learning to invest in tech stocks while balancing my day job. Interested in AI and emerging technologies, and exploring how to grow my savings through smart, long-term investments.',
    riskProfile: 'moderate',
    stocks: [
        { symbol: 'NVDA', name: 'NVIDIA Corporation', reason: 'Leading AI chip manufacturer with strong growth potential', allocation: 30 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', reason: 'Azure cloud growth and OpenAI integration', allocation: 25 },
        { symbol: 'PLTR', name: 'Palantir Technologies', reason: 'AI platform adoption and government contracts', allocation: 20 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', reason: 'Search dominance and AI innovation', allocation: 15 },
        { symbol: 'TSLA', name: 'Tesla Inc.', reason: 'EV market leader with autonomous driving tech', allocation: 10 }
    ]
};

// Load saved data from localStorage
function loadProfileData() {
    const saved = localStorage.getItem('profileData');
    if (saved) {
        profileData = JSON.parse(saved);
        updateProfileDisplay();
    }
}

// Save data to localStorage
function saveProfileData() {
    localStorage.setItem('profileData', JSON.stringify(profileData));
}

// Update profile display
function updateProfileDisplay() {
    document.getElementById('fullName').textContent = profileData.fullName;
    document.getElementById('email').textContent = profileData.email;
    document.getElementById('location').textContent = profileData.location;
    document.getElementById('bio').textContent = profileData.bio;
    document.getElementById('profileName').textContent = profileData.fullName;
    
    // Update inputs
    document.getElementById('fullNameInput').value = profileData.fullName;
    document.getElementById('emailInput').value = profileData.email;
    document.getElementById('locationInput').value = profileData.location;
    document.getElementById('bioInput').value = profileData.bio;
    
    // Update risk profile
    document.querySelectorAll('.risk-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.risk === profileData.riskProfile) {
            option.classList.add('active');
        }
    });
    
    updateRiskDetails(profileData.riskProfile);
    renderStocks();
}

// Update risk profile details
function updateRiskDetails(risk) {
    const details = {
        conservative: {
            tolerance: 'Conservative',
            horizon: '10+ years',
            sectors: 'Utilities, Bonds, Dividend Stocks'
        },
        moderate: {
            tolerance: 'Moderate',
            horizon: '5-10 years',
            sectors: 'Technology, AI, Food Tech'
        },
        aggressive: {
            tolerance: 'Aggressive',
            horizon: '3-5 years',
            sectors: 'Crypto, Startups, High-Growth Tech'
        }
    };
    
    const detail = details[risk];
    document.getElementById('riskTolerance').textContent = detail.tolerance;
    document.getElementById('investmentHorizon').textContent = detail.horizon;
    document.getElementById('preferredSectors').textContent = detail.sectors;
}

// Render stocks grid
function renderStocks() {
    const grid = document.getElementById('stocksGrid');
    grid.innerHTML = profileData.stocks.map(stock => `
        <div class="stock-item" data-symbol="${stock.symbol}">
            <div class="stock-header">
                <div class="stock-symbol">${stock.symbol}</div>
                <button class="stock-remove" data-symbol="${stock.symbol}">×</button>
            </div>
            <div class="stock-name">${stock.name}</div>
            <div class="stock-reason">${stock.reason}</div>
            <div class="stock-allocation">
                <span class="allocation-label">Portfolio %:</span>
                <span class="allocation-value">${stock.allocation}%</span>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.stock-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeStock(btn.dataset.symbol);
        });
    });
}

// Remove stock
function removeStock(symbol) {
    if (confirm(`Remove ${symbol} from your preferred stocks?`)) {
        profileData.stocks = profileData.stocks.filter(s => s.symbol !== symbol);
        saveProfileData();
        renderStocks();
    }
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.getElementById('editProfileBtn');
    
    if (isEditMode) {
        editBtn.textContent = 'Save Profile';
        editBtn.classList.add('editing');
        showInputs();
    } else {
        // Save changes
        profileData.fullName = document.getElementById('fullNameInput').value;
        profileData.email = document.getElementById('emailInput').value;
        profileData.location = document.getElementById('locationInput').value;
        profileData.bio = document.getElementById('bioInput').value;
        
        saveProfileData();
        updateProfileDisplay();
        
        editBtn.textContent = 'Edit Profile';
        editBtn.classList.remove('editing');
        hideInputs();
    }
}

// Show input fields
function showInputs() {
    document.querySelectorAll('.info-value').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.info-input').forEach(el => el.style.display = 'block');
}

// Hide input fields
function hideInputs() {
    document.querySelectorAll('.info-value').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.info-input').forEach(el => el.style.display = 'none');
}

// Avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarImage').src = e.target.result;
            localStorage.setItem('profileAvatar', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Load saved avatar
function loadAvatar() {
    const savedAvatar = localStorage.getItem('profileAvatar');
    if (savedAvatar) {
        document.getElementById('avatarImage').src = savedAvatar;
    }
}

// Modal management
function openModal() {
    document.getElementById('addStockModal').classList.add('active');
}

function closeModal() {
    document.getElementById('addStockModal').classList.remove('active');
    clearModalInputs();
}

function clearModalInputs() {
    document.getElementById('newStockSymbol').value = '';
    document.getElementById('newStockName').value = '';
    document.getElementById('newStockReason').value = '';
    document.getElementById('newStockAllocation').value = '';
}

// Add new stock
function addStock() {
    const symbol = document.getElementById('newStockSymbol').value.trim().toUpperCase();
    const name = document.getElementById('newStockName').value.trim();
    const reason = document.getElementById('newStockReason').value.trim();
    const allocation = parseInt(document.getElementById('newStockAllocation').value);
    
    // Validation
    if (!symbol || !name || !reason || !allocation) {
        alert('Please fill in all fields');
        return;
    }
    
    if (allocation < 0 || allocation > 100) {
        alert('Allocation must be between 0 and 100');
        return;
    }
    
    // Check if stock already exists
    if (profileData.stocks.some(s => s.symbol === symbol)) {
        alert('This stock is already in your preferred list');
        return;
    }
    
    // Add stock
    profileData.stocks.push({ symbol, name, reason, allocation });
    saveProfileData();
    renderStocks();
    closeModal();
}

// Risk profile selection
function handleRiskSelection(risk) {
    profileData.riskProfile = risk;
    saveProfileData();
    updateRiskDetails(risk);
    
    document.querySelectorAll('.risk-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.risk === risk) {
            option.classList.add('active');
        }
    });
}

// Preference toggles
function setupPreferences() {
    const preferences = ['emailNotifications', 'marketAlerts', 'weeklyReports'];
    
    preferences.forEach(pref => {
        const toggle = document.getElementById(pref);
        const saved = localStorage.getItem(pref);
        
        if (saved !== null) {
            toggle.checked = saved === 'true';
        }
        
        toggle.addEventListener('change', () => {
            localStorage.setItem(pref, toggle.checked);
        });
    });
}

// Mobile menu (from main script)
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
}

// Navigation scroll effect
function setupNavScroll() {
    const nav = document.querySelector('.nav');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadProfileData();
    loadAvatar();
    setupPreferences();
    setupMobileMenu();
    setupNavScroll();
    
    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', toggleEditMode);
    
    // Avatar upload
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('avatarInput').click();
    });
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
    
    // Risk profile selection
    document.querySelectorAll('.risk-option').forEach(option => {
        option.addEventListener('click', () => {
            handleRiskSelection(option.dataset.risk);
        });
    });
    
    // Add stock modal
    document.getElementById('addStockBtn').addEventListener('click', openModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelAddStock').addEventListener('click', closeModal);
    document.getElementById('confirmAddStock').addEventListener('click', addStock);
    
    // Close modal on outside click
    document.getElementById('addStockModal').addEventListener('click', (e) => {
        if (e.target.id === 'addStockModal') {
            closeModal();
        }
    });
    
    // Enter key to add stock
    document.getElementById('addStockModal').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            addStock();
        }
    });
});

// Console message
console.log('%c📊 Athena Profile Page Loaded', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cManage your investment profile and preferences', 'color: #1d4ed8; font-size: 12px;');
