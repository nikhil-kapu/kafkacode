# KafkaLabs Branding for Documentation

## Logo Implementation

### Current Setup
- **Logo File**: `/logo4.png` (1024x1024 PNG with transparency)
- **Display Name**: "KafkaLabs." (with period)
- **Logo Link**: Links to https://kafkalabs.com

### Logo Design
- **Left side**: Golden yellow gradient (#FDB913 / #F7931E)
- **Right side**: Orange to red gradient (#FF6B35 / #FF4500)
- **Center square**: Orange (#FF8C00)
- **Background**: Transparent

## Color Palette

### Primary Colors
```json
{
  "primary": "#FF6B35",  // Orange (primary brand color)
  "light": "#FDB913",    // Golden yellow (light accent)
  "dark": "#FF4500"      // Red-orange (dark accent)
}
```

### Gradient Colors
- **Amber-400**: #FBBF24 (gradient start)
- **Orange-500**: #F97316 (gradient end)
- **Amber-100**: #FEF3C7 (text gradient)
- **Amber-200**: #FDE68A (text gradient)

### Background Colors
- **Dark mode**: #0F1419
- **Light mode**: #FFFFFF

## Mintlify Configuration

The logo is configured in `mint.json`:

```json
{
  "name": "KafkaLabs.",
  "logo": {
    "dark": "/logo4.png",
    "light": "/logo4.png",
    "href": "https://kafkalabs.com"
  },
  "favicon": "/logo4.png",
  "colors": {
    "primary": "#FF6B35",
    "light": "#FDB913",
    "dark": "#FF4500",
    "background": {
      "dark": "#0F1419",
      "light": "#FFFFFF"
    },
    "anchors": {
      "from": "#FBBF24",
      "to": "#F97316"
    }
  }
}
```

## Logo Specifications for Custom Implementation

If you need to recreate the logo styling manually (not using Mintlify defaults):

### HTML/JSX Structure
```jsx
<a href="https://kafkalabs.com" className="flex items-center space-x-3 group">
  <div className="relative">
    <img
      src="/logo4.png"
      alt="KafkaLabs Logo"
      className="h-12 w-auto transform scale-125 origin-left transition-transform
                 duration-300 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20
                    rounded-full blur-xl opacity-0 group-hover:opacity-100
                    transition-opacity duration-300">
    </div>
  </div>
  <span className="text-white text-2xl font-extrabold tracking-tight
                   bg-gradient-to-r from-white via-amber-100 to-amber-200
                   bg-clip-text text-transparent">
    KafkaLabs.
  </span>
</a>
```

### Styling Details

**Logo Image:**
- Height: 48px
- Width: Auto-proportional
- Scale: 125% (scaled up)
- Hover: Scales to 110%
- Transition: 300ms

**Glow Effect (on hover):**
- Gradient: Amber-400 (20%) → Orange-500 (20%)
- Blur: Extra large
- Opacity: 0 → 100% on hover

**Text "KafkaLabs.":**
- Font size: 24px
- Font weight: Extra bold
- Letter spacing: Tight
- Gradient: White → Amber-100 → Amber-200
- Always includes period: "KafkaLabs."

## Files

- Logo image: `/docs/logo4.png`
- Config: `/docs/mint.json`
- This guide: `/docs/BRANDING.md`

## Usage Notes

1. The logo file is **893KB PNG** - consider optimizing for web if needed
2. Logo works on both light and dark backgrounds due to transparency
3. All colors match the KafkaLabs landing page branding
4. The documentation is now fully branded with KafkaLabs identity
