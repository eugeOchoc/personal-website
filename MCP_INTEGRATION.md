# Athena Dashboard - MCP Server Integration Guide

## Overview

This guide explains how to connect the Athena investment dashboard to the **Tech Investment Intelligence MCP Server** to provide real-time data for Debbie Mayer's personalized investment recommendations.

## MCP Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Athena Dashboard                          │
│                  (Frontend - Browser)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend API Server (FastAPI)                    │
│  - Authentication                                            │
│  - Request routing                                           │
│  - Data aggregation                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP Protocol
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         Tech Investment Intelligence MCP Server              │
│                  (localhost:8000)                            │
├─────────────────────────────────────────────────────────────┤
│  Tool 1: get_ai_company_news                                │
│  Tool 2: get_stock_financial_data                           │
│  Tool 3: get_tech_employment_trends                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Polygon.io  │ │  yfinance   │ │  FRED API   │
│  News API   │ │ (Yahoo)     │ │ Employment  │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Dashboard Data Mapping

### 1. Market Sentiment KPI → MCP Tools
**Data Sources**:
- `get_ai_company_news` - Sentiment analysis from AI company news
- `get_stock_financial_data` - Stock price movements and volatility

**Implementation**:
```javascript
async function updateMarketSentiment() {
  // Get news sentiment
  const newsData = await fetch('/api/mcp/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'get_ai_company_news',
      arguments: {
        company: 'OpenAI',
        days_back: 7
      }
    })
  });
  
  // Get stock data
  const stockData = await fetch('/api/mcp/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'get_stock_financial_data',
      arguments: {
        symbols: ['NVDA', 'GOOGL', 'META', 'MSFT'],
        period: '1mo'
      }
    })
  });
  
  // Calculate sentiment score (0-100)
  const sentiment = calculateSentiment(newsData, stockData);
  document.getElementById('sentimentValue').textContent = sentiment;
}
```

### 2. Developer Activity KPI → MCP Tool
**Data Source**:
- `get_tech_employment_trends` - Software engineering job postings

**Why This Matters**:
As explained in the tooltip: "Developer Activity tracks GitHub commits, repository stars, and open-source contributions for tech companies. High developer engagement often predicts future product innovation and ecosystem strength—a leading indicator that mainstream investors typically miss."

**Implementation**:
```javascript
async function updateDeveloperActivity() {
  const response = await fetch('/api/mcp/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'get_tech_employment_trends',
      arguments: {
        months_back: 6
      }
    })
  });
  
  const data = await response.json();
  const latestIndex = data.employment_data[0].job_postings_index;
  
  document.getElementById('devActivityValue').textContent = 
    (latestIndex / 10).toFixed(1); // Convert to K format
}
```

### 3. Portfolio Performance KPI → MCP Tool
**Data Source**:
- `get_stock_financial_data` - Debbie's portfolio stocks vs S&P 500

**Implementation**:
```javascript
async function updatePortfolioPerformance() {
  // Get Debbie's portfolio stocks
  const portfolioStocks = ['NVDA', 'MSFT', 'PLTR'];
  
  const response = await fetch('/api/mcp/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'get_stock_financial_data',
      arguments: {
        symbols: [...portfolioStocks, 'SPY'], // Include S&P 500 ETF
        period: '1mo',
        include_metrics: true
      }
    })
  });
  
  const data = await response.json();
  const portfolioReturn = calculatePortfolioReturn(data.stocks);
  const spyReturn = data.stocks.find(s => s.symbol === 'SPY').change_percent;
  
  document.getElementById('portfolioValue').textContent = 
    `+${portfolioReturn.toFixed(1)}`;
  document.getElementById('portfolioChange').innerHTML = 
    `<svg>...</svg><span>+${(portfolioReturn - spyReturn).toFixed(1)}% vs SPY</span>`;
}
```

### 4. News Section → MCP Tool
**Data Source**:
- `get_ai_company_news` - Multiple AI companies

**Implementation**:
```javascript
async function loadNews() {
  const companies = ['OpenAI', 'Anthropic', 'xAI', 'Cohere', 'Mistral'];
  const newsPromises = companies.map(company =>
    fetch('/api/mcp/call-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'get_ai_company_news',
        arguments: {
          company: company,
          days_back: 7
        }
      })
    }).then(r => r.json())
  );
  
  const allNews = await Promise.all(newsPromises);
  const articles = allNews.flatMap(data => data.articles)
    .sort((a, b) => new Date(b.published_utc) - new Date(a.published_utc))
    .slice(0, 6);
  
  renderNewsCards(articles);
}
```

### 5. Stock Picks → MCP Tool
**Data Source**:
- `get_stock_financial_data` - Detailed metrics for recommendations

**Implementation**:
```javascript
async function loadStockPicks() {
  const response = await fetch('/api/mcp/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'get_stock_financial_data',
      arguments: {
        symbols: ['NVDA', 'MSFT', 'PLTR', 'GOOGL', 'META', 'AMD'],
        period: '3mo',
        include_metrics: true
      }
    })
  });
  
  const data = await response.json();
  
  // AI-powered ranking based on Debbie's conservative profile
  const rankedStocks = rankStocksForDebbie(data.stocks);
  const topPicks = rankedStocks.slice(0, 3);
  
  renderStockCards(topPicks);
}

function rankStocksForDebbie(stocks) {
  // Conservative profile (Risk Level 1) prioritizes:
  // - Lower P/E ratios
  // - Higher market cap (stability)
  // - Consistent growth
  return stocks.map(stock => ({
    ...stock,
    score: calculateConservativeScore(stock)
  })).sort((a, b) => b.score - a.score);
}
```

## Backend Integration (FastAPI)

Create a backend API that proxies requests to the MCP server:

```python
# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8000")

@app.post("/api/mcp/call-tool")
async def call_mcp_tool(request: dict):
    """Proxy MCP tool calls to the MCP server"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{MCP_SERVER_URL}/mcp/call-tool",
                json=request,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard")
async def get_dashboard_data():
    """Aggregate all dashboard data"""
    # Call multiple MCP tools in parallel
    async with httpx.AsyncClient() as client:
        # Get market sentiment data
        news_task = client.post(
            f"{MCP_SERVER_URL}/mcp/call-tool",
            json={
                "name": "get_ai_company_news",
                "arguments": {"company": "OpenAI", "days_back": 7}
            }
        )
        
        # Get stock data
        stocks_task = client.post(
            f"{MCP_SERVER_URL}/mcp/call-tool",
            json={
                "name": "get_stock_financial_data",
                "arguments": {
                    "symbols": ["NVDA", "MSFT", "PLTR", "GOOGL", "META"],
                    "period": "1mo",
                    "include_metrics": True
                }
            }
        )
        
        # Get employment trends
        employment_task = client.post(
            f"{MCP_SERVER_URL}/mcp/call-tool",
            json={
                "name": "get_tech_employment_trends",
                "arguments": {"months_back": 6}
            }
        )
        
        # Wait for all responses
        news_response, stocks_response, employment_response = await asyncio.gather(
            news_task, stocks_task, employment_task
        )
        
        return {
            "marketSentiment": calculate_sentiment(news_response.json()),
            "developerActivity": process_employment(employment_response.json()),
            "portfolioPerformance": calculate_portfolio(stocks_response.json()),
            "lastUpdated": datetime.utcnow().isoformat()
        }
```

## Setup Instructions

### 1. Start the MCP Server

```bash
cd week3/server
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the server
python app.py
```

The MCP server will be available at `http://localhost:8000`

### 2. Start the Backend API

```bash
cd backend
pip install fastapi uvicorn httpx

# Start the backend
uvicorn main:app --reload --port 3000
```

The backend API will be available at `http://localhost:3000`

### 3. Update Dashboard Configuration

Update `dashboard-script.js` to point to your backend:

```javascript
// dashboard-script.js
const API_BASE_URL = 'http://localhost:3000';

async function updateDashboardData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`);
    const data = await response.json();
    
    // Update Market Sentiment
    document.getElementById('sentimentValue').textContent = 
      data.marketSentiment.value;
    
    // Update Developer Activity
    document.getElementById('devActivityValue').textContent = 
      data.developerActivity.value;
    
    // Update Portfolio Performance
    document.getElementById('portfolioValue').textContent = 
      `+${data.portfolioPerformance.value}`;
    
    // Update last updated time
    updateLastUpdatedTime();
    
  } catch (error) {
    console.error('Failed to update dashboard:', error);
    showNotification('Failed to refresh data', 'error');
  }
}
```

### 4. Test the Integration

```bash
# Test MCP server directly
curl -X POST http://localhost:8000/mcp/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "get_stock_financial_data",
    "arguments": {
      "symbols": ["NVDA", "MSFT"],
      "period": "1mo"
    }
  }'

# Test backend API
curl http://localhost:3000/api/dashboard

# Open dashboard in browser
open dashboard.html
```

## Data Refresh Strategy

### Real-Time Updates
- **Stock prices**: Update every 60 seconds during market hours
- **News**: Update every 5 minutes (respects Polygon.io rate limits)
- **Employment trends**: Update once per day (data updates monthly)

### Caching Strategy
```javascript
// Implement smart caching to reduce API calls
const CACHE_DURATION = {
  stocks: 60 * 1000,      // 1 minute
  news: 5 * 60 * 1000,    // 5 minutes
  employment: 24 * 60 * 60 * 1000  // 24 hours
};

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
}
```

## Personalization for Debbie Mayer

### Risk Profile Integration
Debbie's **Conservative (Level 1)** profile affects:

1. **Stock Recommendations**:
   - Prioritize large-cap stocks (MSFT, GOOGL)
   - Lower P/E ratios preferred
   - Avoid high-volatility stocks

2. **News Filtering**:
   - Focus on established companies (OpenAI, Anthropic)
   - Filter out speculative news
   - Highlight regulatory and stability news

3. **Alert Thresholds**:
   - Conservative: Alert on >5% daily moves
   - Moderate would be >10%

```python
def filter_for_debbie(stocks):
    """Filter stocks based on Debbie's conservative profile"""
    return [
        stock for stock in stocks
        if stock['market_cap'] > 100_000_000_000  # >$100B
        and stock['pe_ratio'] < 40  # Not overvalued
        and stock['52_week_volatility'] < 0.5  # Lower volatility
    ]
```

## Error Handling

### MCP Server Errors
```javascript
async function callMCPTool(toolName, args) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcp/call-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: toolName, arguments: args })
    });
    
    if (!response.ok) {
      throw new Error(`MCP tool ${toolName} failed: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error(`Error calling ${toolName}:`, error);
    
    // Fallback to cached data if available
    const cached = dataCache.get(toolName);
    if (cached) {
      showNotification('Using cached data', 'warning');
      return cached;
    }
    
    // Show user-friendly error
    showNotification(`Unable to fetch ${toolName} data`, 'error');
    return null;
  }
}
```

## Security Considerations

1. **API Key Protection**: Never expose MCP server API keys in frontend
2. **Backend Proxy**: Always route through backend to hide credentials
3. **Rate Limiting**: Implement rate limiting on backend to prevent abuse
4. **Authentication**: Add user authentication before allowing dashboard access

```python
# backend/main.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != os.getenv("DASHBOARD_AUTH_TOKEN"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return credentials.credentials

@app.post("/api/mcp/call-tool")
async def call_mcp_tool(request: dict, token: str = Depends(verify_token)):
    # ... existing code
```

## Deployment

### Production Deployment
1. Deploy MCP server to cloud (AWS, GCP, Azure)
2. Deploy backend API to same cloud provider
3. Deploy frontend to Netlify/Vercel
4. Set up environment variables in production
5. Enable HTTPS for all services

### Environment Variables
```bash
# Production .env
MCP_SERVER_URL=https://mcp.yourdomain.com
DASHBOARD_AUTH_TOKEN=your-secure-token
POLYGON_API_KEY=your-production-key
FRED_API_KEY=your-production-key
```

## Next Steps

1. ✅ MCP server is running with 3 tools
2. ✅ Dashboard UI is complete with personalization
3. 🔄 Create backend API proxy (FastAPI)
4. 🔄 Update dashboard JavaScript to call backend
5. 🔄 Implement caching and error handling
6. 🔄 Add user authentication
7. 🔄 Deploy to production

---

**For Debbie Mayer**: This integration brings real-time, institutional-quality data to your personalized dashboard, helping you make informed investment decisions with confidence.
