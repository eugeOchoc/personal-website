// ===== Dashboard JavaScript =====

// ===== MCP Server Configuration =====
const MCP_CONFIG = {
    // Backend API URL (proxy to MCP server)
    API_BASE_URL: 'http://localhost:3000',
    
    // MCP Server URL (direct - for development only)
    MCP_SERVER_URL: 'http://localhost:8000',
    
    // Cache durations (milliseconds)
    CACHE_DURATION: {
        stocks: 60 * 1000,           // 1 minute
        news: 5 * 60 * 1000,         // 5 minutes
        employment: 24 * 60 * 60 * 1000  // 24 hours
    },
    
    // Debbie's portfolio stocks
    PORTFOLIO_STOCKS: ['NVDA', 'MSFT', 'PLTR'],
    
    // AI companies to track
    AI_COMPANIES: ['OpenAI', 'Anthropic', 'xAI', 'Cohere', 'Mistral']
};

// ===== Data Cache Implementation =====
class DataCache {
    constructor() {
        this.cache = new Map();
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.duration) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    set(key, data, duration) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            duration
        });
    }
    
    clear() {
        this.cache.clear();
    }
}

const dataCache = new DataCache();

// ===== MCP Tool Caller =====
async function callMCPTool(toolName, args) {
    const cacheKey = `${toolName}-${JSON.stringify(args)}`;
    
    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached) {
        console.log(`Using cached data for ${toolName}`);
        return cached;
    }
    
    try {
        // Call backend API (which proxies to MCP server)
        const response = await fetch(`${MCP_CONFIG.API_BASE_URL}/api/mcp/call-tool`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Add authentication if needed
                // 'Authorization': 'Bearer YOUR_TOKEN'
            },
            body: JSON.stringify({ 
                name: toolName, 
                arguments: args 
            })
        });
        
        if (!response.ok) {
            throw new Error(`MCP tool ${toolName} failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the result
        const cacheDuration = MCP_CONFIG.CACHE_DURATION[toolName] || 60000;
        dataCache.set(cacheKey, data, cacheDuration);
        
        return data;
        
    } catch (error) {
        console.error(`Error calling ${toolName}:`, error);
        showNotification(`Unable to fetch ${toolName} data. Using simulated data.`, 'warning');
        
        // Return simulated data for development
        return getSimulatedData(toolName, args);
    }
}

// ===== Simulated Data (for development without MCP server) =====
function getSimulatedData(toolName, args) {
    const simulatedData = {
        'get_stock_financial_data': {
            stocks: args.symbols.map(symbol => ({
                symbol: symbol,
                current_price: Math.random() * 500 + 100,
                change_percent: (Math.random() * 10 - 5).toFixed(2),
                volume: Math.floor(Math.random() * 50000000),
                market_cap: Math.floor(Math.random() * 2000000000000),
                pe_ratio: (Math.random() * 50 + 20).toFixed(1),
                '52_week_high': Math.random() * 600 + 200,
                '52_week_low': Math.random() * 200 + 50
            })),
            last_updated: new Date().toISOString()
        },
        'get_ai_company_news': {
            company: args.company,
            articles: [
                {
                    title: `${args.company} Announces Major AI Breakthrough`,
                    url: 'https://example.com/news/1',
                    published_utc: new Date().toISOString(),
                    summary: 'Company reveals significant progress in AI development...',
                    sentiment: 'positive'
                }
            ],
            total_articles: 5,
            date_range: `${new Date(Date.now() - args.days_back * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`
        },
        'get_tech_employment_trends': {
            employment_data: Array.from({ length: args.months_back }, (_, i) => ({
                date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                job_postings_index: 100 + Math.random() * 20,
                change_from_baseline: (Math.random() * 10).toFixed(1)
            })),
            trend: 'increasing',
            summary: 'Software engineering job postings up 5.2% from pre-pandemic baseline'
        }
    };
    
    return simulatedData[toolName] || null;
}

// ===== Mobile Menu Toggle =====
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// ===== Update Last Updated Time =====
function updateLastUpdatedTime() {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    lastUpdatedElement.textContent = timeString;
}

// Update time on page load
updateLastUpdatedTime();

// ===== Refresh Button =====
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        // Simulate data refresh
        refreshBtn.disabled = true;
        refreshBtn.style.opacity = '0.6';
        
        // Animate refresh icon
        const svg = refreshBtn.querySelector('svg');
        svg.style.transform = 'rotate(360deg)';
        
        // Simulate API call delay
        setTimeout(() => {
            updateDashboardData();
            updateLastUpdatedTime();
            refreshBtn.disabled = false;
            refreshBtn.style.opacity = '1';
            svg.style.transform = 'rotate(0deg)';
            
            // Show success feedback
            showNotification('Dashboard updated successfully', 'success');
        }, 1500);
    });
}

// ===== Update Dashboard Data (MCP-Powered) =====
async function updateDashboardData() {
    try {
        // Show loading state
        console.log('Updating dashboard with MCP data...');
        
        // Call MCP tools in parallel for better performance
        const [stockData, newsData, employmentData] = await Promise.all([
            callMCPTool('get_stock_financial_data', {
                symbols: [...MCP_CONFIG.PORTFOLIO_STOCKS, 'GOOGL', 'META', 'AMD', 'SPY'],
                period: '1mo',
                include_metrics: true
            }),
            callMCPTool('get_ai_company_news', {
                company: 'OpenAI',
                days_back: 7
            }),
            callMCPTool('get_tech_employment_trends', {
                months_back: 6
            })
        ]);
        
        // Update Market Sentiment (based on news sentiment and stock performance)
        updateMarketSentiment(newsData, stockData);
        
        // Update Developer Activity (based on employment trends)
        updateDeveloperActivity(employmentData);
        
        // Update Portfolio Performance (based on Debbie's stocks)
        updatePortfolioPerformance(stockData);
        
        // Update last updated time
        updateLastUpdatedTime();
        
        console.log('Dashboard updated successfully with MCP data');
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showNotification('Using simulated data for demo', 'info');
        
        // Fallback to simulated updates
        updateDashboardSimulated();
    }
}

// ===== Update Market Sentiment =====
function updateMarketSentiment(newsData, stockData) {
    const sentimentValue = document.getElementById('sentimentValue');
    const sentimentChange = document.getElementById('sentimentChange');
    const sentimentStatus = document.getElementById('sentimentStatus');
    
    // Calculate sentiment score (0-100) based on:
    // 1. News sentiment (40% weight)
    // 2. Stock performance (60% weight)
    
    let newsSentiment = 50; // neutral default
    if (newsData && newsData.articles) {
        const positiveCount = newsData.articles.filter(a => a.sentiment === 'positive').length;
        const totalCount = newsData.articles.length;
        newsSentiment = (positiveCount / totalCount) * 100;
    }
    
    let stockSentiment = 50; // neutral default
    if (stockData && stockData.stocks) {
        const avgChange = stockData.stocks.reduce((sum, s) => sum + parseFloat(s.change_percent), 0) / stockData.stocks.length;
        stockSentiment = 50 + (avgChange * 5); // Scale to 0-100
    }
    
    const newSentiment = Math.round(newsSentiment * 0.4 + stockSentiment * 0.6);
    const sentimentDelta = (newSentiment - parseInt(sentimentValue.textContent)).toFixed(1);
    
    animateValue(sentimentValue, parseInt(sentimentValue.textContent), newSentiment, 1000);
    
    // Update change indicator
    if (sentimentDelta > 0) {
        sentimentChange.className = 'kpi-change positive';
        sentimentChange.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>+${sentimentDelta}%</span>
        `;
    } else {
        sentimentChange.className = 'kpi-change negative';
        sentimentChange.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span>${sentimentDelta}%</span>
        `;
    }
    
    // Update status
    if (newSentiment > 70) {
        sentimentStatus.textContent = 'Bullish';
        sentimentStatus.className = 'kpi-status bullish';
    } else if (newSentiment > 50) {
        sentimentStatus.textContent = 'Neutral';
        sentimentStatus.className = 'kpi-status neutral';
    } else {
        sentimentStatus.textContent = 'Bearish';
        sentimentStatus.className = 'kpi-status bearish';
    }
}

// ===== Update Developer Activity =====
function updateDeveloperActivity(employmentData) {
    const devActivityValue = document.getElementById('devActivityValue');
    const devActivityChange = document.getElementById('devActivityChange');
    
    if (employmentData && employmentData.employment_data) {
        const latestData = employmentData.employment_data[0];
        const previousData = employmentData.employment_data[1] || latestData;
        
        const newDevActivity = (latestData.job_postings_index / 10).toFixed(1);
        const changePercent = ((latestData.job_postings_index - previousData.job_postings_index) / previousData.job_postings_index * 100).toFixed(1);
        
        animateValue(devActivityValue, parseFloat(devActivityValue.textContent), parseFloat(newDevActivity), 1000);
        
        devActivityChange.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>+${changePercent}%</span>
        `;
    }
}

// ===== Update Portfolio Performance =====
function updatePortfolioPerformance(stockData) {
    const portfolioValue = document.getElementById('portfolioValue');
    const portfolioChange = document.getElementById('portfolioChange');
    
    if (stockData && stockData.stocks) {
        // Calculate Debbie's portfolio return
        const portfolioStocks = stockData.stocks.filter(s => 
            MCP_CONFIG.PORTFOLIO_STOCKS.includes(s.symbol)
        );
        
        const portfolioReturn = portfolioStocks.reduce((sum, s) => 
            sum + parseFloat(s.change_percent), 0
        ) / portfolioStocks.length;
        
        // Get S&P 500 return
        const spyStock = stockData.stocks.find(s => s.symbol === 'SPY');
        const spyReturn = spyStock ? parseFloat(spyStock.change_percent) : 0;
        
        const alpha = portfolioReturn - spyReturn;
        
        animateValue(
            portfolioValue, 
            parseFloat(portfolioValue.textContent.replace('+', '')), 
            parseFloat(portfolioReturn.toFixed(1)), 
            1000, 
            '+', 
            '%'
        );
        
        portfolioChange.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>+${alpha.toFixed(1)}% vs SPY</span>
        `;
    }
}

// ===== Fallback: Simulated Update =====
function updateDashboardSimulated() {
    const sentimentValue = document.getElementById('sentimentValue');
    const devActivityValue = document.getElementById('devActivityValue');
    const portfolioValue = document.getElementById('portfolioValue');
    
    const newSentiment = Math.floor(Math.random() * 30) + 60;
    const newDevActivity = (Math.random() * 5 + 6).toFixed(1);
    const newPortfolio = (Math.random() * 10 + 10).toFixed(1);
    
    animateValue(sentimentValue, parseInt(sentimentValue.textContent), newSentiment, 1000);
    animateValue(devActivityValue, parseFloat(devActivityValue.textContent), parseFloat(newDevActivity), 1000);
    animateValue(portfolioValue, parseFloat(portfolioValue.textContent.replace('+', '')), parseFloat(newPortfolio), 1000, '+', '%');
}

// ===== Animate Value Changes =====
function animateValue(element, start, end, duration, prefix = '', suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        const displayValue = suffix === '%' ? current.toFixed(1) : 
                           element.textContent.includes('.') ? current.toFixed(1) : 
                           Math.floor(current);
        element.textContent = prefix + displayValue;
    }, 16);
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .nav-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        padding: 1rem 2rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        gap: 1rem;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);

// ===== Simple Chart Rendering (Canvas-based) =====
function drawSparkline(canvasId, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.offsetWidth;
    const height = 80;
    
    canvas.width = width;
    canvas.height = height;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const step = width / (data.length - 1);
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    data.forEach((value, index) => {
        const x = index * step;
        const y = height - ((value - min) / range) * (height - 20) - 10;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Generate sample data and draw charts
function initializeCharts() {
    // Market Sentiment Chart
    const sentimentData = Array.from({ length: 30 }, () => Math.random() * 30 + 60);
    drawSparkline('sentimentChart', sentimentData, '#2563eb');
    
    // Developer Activity Chart
    const devActivityData = Array.from({ length: 30 }, () => Math.random() * 5 + 6);
    drawSparkline('devActivityChart', devActivityData, '#10b981');
    
    // Portfolio Chart
    const portfolioData = Array.from({ length: 30 }, (_, i) => 10 + i * 0.3 + Math.random() * 2);
    drawSparkline('portfolioChart', portfolioData, '#f59e0b');
}

// Initialize charts on load
window.addEventListener('load', initializeCharts);
window.addEventListener('resize', initializeCharts);

// ===== Stock Details Button Handlers =====
document.querySelectorAll('.btn-details').forEach(button => {
    button.addEventListener('click', (e) => {
        const stockCard = e.target.closest('.stock-card');
        const stockSymbol = stockCard.querySelector('.stock-symbol').textContent;
        showNotification(`Loading detailed analysis for ${stockSymbol}...`, 'info');
        
        // In a real app, this would navigate to a detailed stock page
        setTimeout(() => {
            showNotification(`Analysis for ${stockSymbol} would open here`, 'success');
        }, 1000);
    });
});

// ===== Auto-refresh every 5 minutes =====
setInterval(() => {
    updateDashboardData();
    updateLastUpdatedTime();
    console.log('Dashboard auto-refreshed');
}, 300000); // 5 minutes

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Active Nav Link Highlighting =====
const sections = document.querySelectorAll('section[id]');
const navLinksArray = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksArray.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== Console Welcome Message =====
console.log('%c📊 TechInvest Dashboard', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cReal-time tech stock insights powered by AI', 'color: #10b981; font-size: 14px;');
console.log('%cDashboard loaded successfully', 'color: #6b7280; font-size: 12px;');

// ===== Performance Monitoring =====
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
});
