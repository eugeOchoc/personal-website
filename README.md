# Eugénie's Personal Website

A beautiful, modern personal website showcasing a Franco-Swiss journey from food industry veteran to AI enthusiast.

## 🌟 Features

- **Modern Design**: Clean, professional UI with smooth animations and transitions
- **Responsive Layout**: Fully responsive design that works on all devices
- **Smooth Scrolling**: Enhanced navigation with smooth scroll behavior
- **Interactive Elements**: Floating cards, hover effects, and scroll animations
- **Performance Optimized**: Fast loading with minimal dependencies
- **Accessibility**: Semantic HTML and ARIA labels for better accessibility

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser by double-clicking the file.

### Option 2: Local Server (Recommended)
For the best experience, run a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then open your browser and navigate to `http://localhost:8000`

## 📁 Project Structure

```
personal-website/
├── index.html          # Main HTML file
├── styles.css          # All styling and animations
├── script.js           # Interactive functionality
└── README.md          # This file
```

## 🎨 Customization

### Update Personal Information

1. **Contact Information**: Edit the contact section in `index.html` (lines 185-205)
   - Update email address
   - Add your LinkedIn URL
   - Add your GitHub URL

2. **About Section**: Modify the about text in `index.html` (lines 70-100)
   - Update years of experience
   - Customize your story

3. **Experience Timeline**: Edit timeline items in `index.html` (lines 110-140)
   - Add more timeline entries
   - Update descriptions

4. **Skills**: Customize skill cards in `index.html` (lines 150-180)
   - Add or remove skills
   - Update expertise areas

### Customize Colors

Edit CSS variables in `styles.css` (lines 2-20):

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #ec4899;    /* Accent color */
    --accent-color: #f59e0b;       /* Additional accent */
    /* ... more variables */
}
```

### Add Your Photo

To add a profile photo to the hero section:

1. Add an image file to your project folder
2. In `index.html`, add an `<img>` tag in the hero section:

```html
<div class="hero-visual">
    <img src="your-photo.jpg" alt="Eugenie" class="profile-photo">
    <!-- existing floating cards -->
</div>
```

3. Add styling in `styles.css`:

```css
.profile-photo {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: var(--shadow-xl);
}
```

## 🔧 Advanced Features

### Enable Typing Effect

Uncomment the typing effect code in `script.js` (lines 67-78) for an animated hero title.

### Add More Sections

To add new sections, follow this template in `index.html`:

```html
<section id="your-section" class="section">
    <div class="container">
        <h2 class="section-title">Your Section Title</h2>
        <!-- Your content here -->
    </div>
</section>
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Next Steps

1. **Update all placeholder content** with your real information
2. **Add your actual contact details** (email, LinkedIn, GitHub)
3. **Customize colors** to match your personal brand
4. **Add a profile photo** for a more personal touch
5. **Deploy your website** using:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static hosting service

## 📝 Deployment

### GitHub Pages

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select main branch as source
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Netlify

1. Drag and drop your project folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your site will be live instantly with a custom URL

## 💡 Tips

- Keep your content concise and impactful
- Use high-quality images if you add photos
- Test on multiple devices and browsers
- Update your information regularly
- Consider adding a blog section for AI insights

## 📄 License

This project is open source and available for personal use.

---

Built with ❤️ | Fait avec passion 🇫🇷🇨🇭 | Bridging French Heritage, Swiss Precision & AI Innovation
