# Landing Page Setup

## Overview
A beautiful 3D landing page has been configured for the Hackathon project, using Spline 3D scenes from AttentionLive.

## Features
- **Spline 3D Scene**: Interactive 3D visualization using `scene6.splinecode`
- **Click-to-Enter**: Click anywhere on the 3D scene or the interactive button area to enter the app
- **Responsive Design**: Works seamlessly on all screen sizes
- **Accessibility**: Full keyboard navigation support
- **Smooth Integration**: Seamless transition from landing page to main app

## Components

### LandingPage Component
- **Location**: `src/components/LandingPage.tsx`
- **Purpose**: Main landing page with Spline 3D scene
- **Props**:
  - `onEnter`: Callback function triggered when user clicks to enter
- **Dependencies**: 
  - `@splinetool/react-spline`: Already installed in package.json

### LandingPage Styles
- **Location**: `src/components/LandingPage.css`
- **Features**:
  - Full-screen 3D scene container
  - Clickable overlay area for interaction
  - Responsive positioning
  - Accessibility-friendly focus states

## Integration

The landing page is integrated into `App.tsx`:
```tsx
const [showLanding, setShowLanding] = useState(true);

if (showLanding) {
  return <LandingPage onEnter={() => setShowLanding(false)} />;
}
```

## 3D Scene File

- **File**: `public/scene6.splinecode`
- **Source**: Copied from AttentionLive project
- **Usage**: Automatically loaded by Spline component

## How It Works

1. User visits the app at `http://localhost:5173/`
2. Landing page displays with Spline 3D scene
3. User can:
   - Click anywhere on the 3D scene
   - Click the interactive button area (positioned at top: 55%, left: 20%)
   - Use keyboard (Tab to focus, Enter/Space to activate)
4. App transitions to main trading interface

## Customization

### Change 3D Scene
Replace `scene6.splinecode` in the public folder or update the scene path:
```tsx
<Spline
  scene="/your-scene.splinecode"
  ...
/>
```

### Adjust Clickable Area Position
Edit the CSS in `LandingPage.css`:
```css
.landing-clickable-area {
  top: 55%;     /* Vertical position */
  left: 20%;    /* Horizontal position */
  width: 18vw;  /* Width */
  height: 10vh; /* Height */
}
```

### Add Custom Interactions
Modify the event handlers in `LandingPage.tsx`:
```tsx
function onSplineMouseDown(e: any) {
  // Add custom mouse down logic
}

function onSplineClick(e: any) {
  // Add custom click logic
}
```

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/`

3. You should see the Spline 3D scene

4. Click to enter the main application

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with responsive design

## Accessibility
- Keyboard navigation: Tab to button area, Enter/Space to activate
- Focus indicators: Visible outline on keyboard focus
- Screen readers: Proper ARIA labels and semantic HTML

## Troubleshooting

### Scene not loading
- Ensure `scene6.splinecode` exists in `public/` folder
- Check browser console for errors
- Verify Spline package is installed: `npm list @splinetool/react-spline`

### Click not working
- Check the clickable area position matches your scene's button
- Adjust CSS positioning in `.landing-clickable-area`
- Test with keyboard navigation to verify functionality
