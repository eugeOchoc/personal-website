# 🚀 Deploy Your Website to Netlify

Your website is ready to deploy! Here are the easiest methods:

## Method 1: Netlify Drop (Easiest - No Account Required Initially)

1. **Open Netlify Drop**: Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)

2. **Drag & Drop**: 
   - Open Finder and navigate to this folder:
     ```
     /Users/eugeniefontugne/Desktop/Stanford /2025-2026/CS 146S - The Modern Software developer/CascadeProjects/personal-website
     ```
   - Select these files:
     - `index.html`
     - `styles.css`
     - `script.js`
   - Drag and drop them onto the Netlify Drop page

3. **Get Your URL**: Netlify will instantly deploy your site and give you a URL like:
   ```
   https://random-name-123456.netlify.app
   ```

4. **Optional - Customize Domain**: 
   - Create a free Netlify account
   - Claim your site
   - Change the domain name to something like `eugenie-fontugne.netlify.app`

---

## Method 2: GitHub + Netlify (Recommended for Updates)

### Step 1: Push to GitHub

```bash
cd "/Users/eugeniefontugne/Desktop/Stanford /2025-2026/CS 146S - The Modern Software developer/CascadeProjects/personal-website"

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Franco-Swiss personal website"

# Create a new repository on GitHub (https://github.com/new)
# Then connect and push:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up or log in (free account)
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub"
5. Select your repository
6. Deploy settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: Leave empty or use `.`
7. Click "Deploy site"

Your site will be live in seconds!

---

## Method 3: Quick Command Line (If you install Netlify CLI)

```bash
# Install Netlify CLI (requires Node.js)
npm install -g netlify-cli

# Navigate to your project
cd "/Users/eugeniefontugne/Desktop/Stanford /2025-2026/CS 146S - The Modern Software developer/CascadeProjects/personal-website"

# Deploy
netlify deploy --prod

# Follow the prompts to authorize and deploy
```

---

## 🎯 Recommended: Method 1 (Netlify Drop)

**This is the fastest way to get your site live right now!**

Just drag and drop your files to [https://app.netlify.com/drop](https://app.netlify.com/drop) and you'll have a live URL in seconds.

---

## 📝 After Deployment

Once deployed, you can:
- Share your URL with anyone
- Set up a custom domain
- Enable HTTPS (automatic on Netlify)
- Set up continuous deployment from GitHub

Your site will be live at a URL like:
**https://eugenie-fontugne.netlify.app**

Enjoy sharing your beautiful Franco-Swiss website! 🇫🇷🇨🇭
