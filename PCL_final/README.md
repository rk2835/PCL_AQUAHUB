# AquaHub - Complete Water Management System

A comprehensive water delivery and management platform connecting customers with water suppliers and vendors.

## Features

- **Frontend Features**:
  - Responsive Design: Fully responsive layout that works on desktop, tablet, and mobile devices
  - Modern UI/UX: Clean and modern design with smooth animations and transitions
  - Advanced Water Animations: SVG-based water effects with particles and waves
  - Interactive Elements: Mobile navigation, FAQ accordion, contact forms
  - Customer and vendor registration pages

- **Backend Features**:
  - User registration and authentication system
  - Customer profile management
  - Vendor business profile management
  - Water requirement tracking
  - Service offerings management
  - PostgreSQL database integration
  - REST API endpoints

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Authentication**: bcrypt password hashing
- **Environment**: Python virtual environment

## Quick Setup

### 1. Run the automated setup script:
```cmd
setup.bat
```

### 2. Manual Database Setup:

1. **Find PostgreSQL Installation**
   - Usually located at: `C:\Program Files\PostgreSQL\[version]\bin`

2. **Open Command Prompt as Administrator**

3. **Navigate to PostgreSQL bin directory**
   ```cmd
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```

4. **Connect to PostgreSQL**
   ```cmd
   psql -U postgres
   ```

5. **Execute Database Scripts**
   ```sql
   \i "C:\Codex\AquaHub\PCL_final\database\create_database.sql"
   \i "C:\Codex\AquaHub\PCL_final\database\schema.sql"
   \i "C:\Codex\AquaHub\PCL_final\database\sample_data.sql"
   ```

### 3. Configure Environment
```cmd
copy backend\.env.example backend\.env
```
Edit `backend\.env` with your PostgreSQL password.

### 4. Start the Backend
```cmd
aquahub_env\Scripts\activate
python backend\app.py
```

## API Endpoints

- `POST /api/register/customer` - Register new customer
- `POST /api/register/vendor` - Register new vendor
- Server runs on `http://localhost:5000`

## Database Structure

- `users` - Base user authentication
- `customer_profiles` - Customer information and preferences
- `vendor_profiles` - Vendor business details
- `customer_water_requirements` - Water delivery requirements
- `vendor_services` - Services and pricing offered by vendors

## Project Structure

```
aquahub/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── assets/             # Images and media files
│   ├── logo.png
│   ├── hero-tanker.jpg
│   ├── app-mockup.jpg
│   ├── google-play.png
│   ├── app-store.png
│   └── ...
└── README.md           # This file
```

## Setup Instructions

1. **Clone or Download**: Download all files to your local machine
2. **Add Images**: Place the following images in the `assets/` folder:
   - `logo.png` - Main logo
   - `logo-small.png` - Small logo for bottom bar
   - `hero-tanker.jpg` - Hero section water tanker image
   - `app-mockup.jpg` - Mobile app mockup image
   - `google-play.png` - Google Play Store button
   - `app-store.png` - Apple App Store button
   - `construction-water.jpg` - STP water section image
   - `customer1.jpg`, `customer2.jpg`, `customer3.jpg` - Customer testimonial photos
   - Media logos: `yourstory-logo.png`, `bangalore-mirror-logo.png`, `hashtag-magazine-logo.png`

3. **Open in Browser**: Open `index.html` in any modern web browser

## Key Sections

### 1. Header/Navigation
- Fixed header with transparent background
- Responsive mobile menu
- Call-to-action button

### 2. Hero Section
- Gradient background
- 3-step process explanation
- Responsive grid layout

### 3. App Download Section
- Feature highlights
- App store download buttons
- Image showcase

### 4. Testimonials
- Customer reviews in card layout
- Hover effects
- Responsive grid

### 5. Featured Media
- Media outlet logos
- Grayscale to color hover effect

### 6. STP Water Section
- Construction water booking
- Call-to-action button

### 7. FAQ Section
- Accordion-style questions
- Smooth expand/collapse animations

### 8. Contact Section
- Contact information
- Working contact form with validation

### 9. Footer
- Multiple sections with links
- Social media links
- Company information

### 10. Bottom Fixed Bar
- Logo and call button
- Always visible at bottom

## Customization

### Colors
The main color scheme uses:
- Primary Blue: `#007bff`
- Gradient: `#667eea` to `#764ba2`
- Background: `#f8f9fa`
- Text: `#333`

### Fonts
- Main font: Poppins (Google Fonts)
- Font weights: 300, 400, 500, 600, 700

### Responsive Breakpoints
- Desktop: 1200px and above
- Tablet: 768px to 1199px
- Mobile: 767px and below

## JavaScript Features

- Mobile navigation toggle
- FAQ accordion functionality
- Smooth scrolling
- Form validation
- Scroll-to-top button
- Loading animations
- Intersection Observer for scroll animations
- Performance optimizations

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance Features

- Optimized CSS with minimal unused styles
- Lazy loading for images
- Efficient JavaScript with event delegation
- CSS animations using transform and opacity
- Minimized reflows and repaints

## SEO Considerations

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Meta tags for social sharing
- Fast loading times

## Accessibility Features

- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators
- ARIA labels where needed

## Future Enhancements

- Service Worker for offline functionality
- Progressive Web App (PWA) features
- Advanced animations with GSAP
- Backend integration for contact form
- Analytics integration
- A/B testing setup

## Images Needed

To complete the replica, you'll need to add these images to the `assets/` folder:

1. **Logo Images**:
   - `logo.png` (main header logo)
   - `logo-small.png` (bottom bar logo)

2. **Hero Section**:
   - `hero-tanker.jpg` (water tanker image)

3. **App Section**:
   - `app-mockup.jpg` (mobile app screenshot)
   - `google-play.png` (Google Play badge)
   - `app-store.png` (App Store badge)

4. **Testimonials**:
   - `customer1.jpg`, `customer2.jpg`, `customer3.jpg`

5. **Media Logos**:
   - `yourstory-logo.png`
   - `bangalore-mirror-logo.png`
   - `hashtag-magazine-logo.png`

6. **STP Section**:
   - `construction-water.jpg`

## Contact

For any questions or issues with this replica, please contact the development team.

---

**Note**: This is a replica for educational/demonstration purposes. All content and branding belong to their respective owners.
