# Dark Mode Implementation

## ✅ Complete Dark Mode Setup

Dark mode has been fully implemented for both the shop and admin dashboard using `next-themes` and Tailwind CSS v4.

## What Was Done

### 1. Theme Provider Setup

**File:** [components/ThemeProvider.tsx](../components/ThemeProvider.tsx)
- Wraps the entire app with `next-themes` provider
- Supports system preference detection
- Persists user theme choice in localStorage
- Prevents flash of unstyled content on page load

### 2. Theme Toggle Component

**File:** [components/ThemeToggle.tsx](../components/ThemeToggle.tsx)
- Beautiful sun/moon icon toggle button
- Properly handles hydration to avoid mismatches
- Shows loading state before mounted
- Accessible with proper ARIA labels

### 3. Root Layout Integration

**File:** [app/layout.tsx](../app/layout.tsx)
- Added `ThemeProvider` wrapper around all providers
- Added `suppressHydrationWarning` to `<html>` tag
- Theme state available throughout entire app

### 4. Admin Dashboard

**File:** [components/admin/AdminSidebar.tsx](../components/admin/AdminSidebar.tsx)
- Theme toggle added to sidebar footer
- Positioned above logout button
- Clean label for clarity

### 5. Shop Interface

**File:** [components/Navbar.tsx](../components/Navbar.tsx)
- Theme toggle added to navbar
- Positioned before user account and cart buttons
- Consistent with navbar styling

## CSS Configuration

**File:** [app/globals.css](../app/globals.css)

Dark mode CSS variables were already defined:
- Light mode colors (`:root`) - lines 49-82
- Dark mode colors (`.dark`) - lines 84-116
- Custom dark variant - line 4

The setup uses Tailwind v4's CSS-based configuration with OKLCH color space for better color consistency.

## How It Works

### Theme Detection
1. **First visit:** Uses system preference (light/dark based on OS)
2. **Return visits:** Restores user's last choice from localStorage
3. **Manual toggle:** Switches between light/dark and saves preference

### Color System
- All colors use CSS custom properties (CSS variables)
- Theme changes by swapping variable values
- Components automatically adapt using Tailwind classes
- Smooth transitions with `disableTransitionOnChange` option

### Dark Mode Classes
Components use Tailwind's dark mode classes:
```tsx
// Example usage in components
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">
    Content
  </p>
</div>
```

## Testing

### Test Dark Mode

```bash
npm run dev
```

Then:

1. **Shop (Public Pages):**
   - Visit http://localhost:3000
   - Click sun/moon icon in navbar
   - Theme should switch instantly
   - Reload page - theme persists

2. **Admin Dashboard:**
   - Visit http://localhost:3000/admin
   - Click theme toggle in sidebar footer
   - Navigate between pages - theme persists
   - Check all pages render correctly in both modes

3. **System Preference:**
   - Change OS theme (System Preferences → Appearance)
   - Open app in new incognito/private window
   - Should match system theme by default

### Visual Testing Checklist

- [ ] Navbar changes colors properly
- [ ] Admin sidebar adapts to dark mode
- [ ] Cards and buttons look good in both modes
- [ ] Text is readable in both themes
- [ ] Forms and inputs work in dark mode
- [ ] Modals/dialogs support dark mode
- [ ] No flash of wrong theme on reload
- [ ] Theme toggle icons switch correctly

## Customization

### Change Default Theme

Edit [components/ThemeProvider.tsx](../components/ThemeProvider.tsx):

```typescript
<NextThemesProvider
  attribute="class"
  defaultTheme="dark"  // Change from "system" to "dark" or "light"
  enableSystem
>
```

### Customize Dark Mode Colors

Edit [app/globals.css](../app/globals.css) lines 84-116:

```css
.dark {
  --background: oklch(0.145 0 0);  /* Adjust for darker/lighter background */
  --foreground: oklch(0.985 0 0);  /* Adjust text color */
  /* ... other colors ... */
}
```

### Add Theme-Specific Styles

Use Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
  <h1 className="text-primary dark:text-primary-foreground">
    Title
  </h1>
</div>
```

## Technical Details

### Dependencies
- `next-themes`: ^0.4.6 (already installed)
- Tailwind CSS v4 with PostCSS plugin

### Theme Storage
- Stored in: `localStorage` under key `theme`
- Values: `"light"`, `"dark"`, or `"system"`
- Persists across sessions

### Performance
- No flash of unstyled content (FOUC)
- CSS variables enable instant theme switching
- Minimal JavaScript - mostly CSS-based
- No re-renders when theme changes

### Browser Support
- All modern browsers
- Graceful fallback for older browsers
- Works without JavaScript (defaults to light mode)

## Troubleshooting

### Theme Not Persisting
**Cause:** localStorage blocked or cleared
**Fix:** Check browser privacy settings

### Flash on Page Load
**Cause:** Missing `suppressHydrationWarning` on `<html>`
**Fix:** Already added to [app/layout.tsx](../app/layout.tsx#L31)

### Components Not Updating
**Cause:** Not using CSS variables or `dark:` classes
**Fix:** Use Tailwind's semantic color classes (bg-background, text-foreground, etc.)

### Icons Not Changing
**Cause:** Theme not detected before mount
**Fix:** ThemeToggle already handles this with mounted state

## Future Enhancements

Consider adding:

1. **Multiple Themes**
   - Add custom themes beyond light/dark
   - "Sepia", "High Contrast", etc.

2. **Auto Theme Switching**
   - Schedule theme changes (dark at night)
   - Based on time of day

3. **Theme Customizer**
   - Let users customize colors
   - Save custom theme preferences

4. **Reduced Motion**
   - Detect `prefers-reduced-motion`
   - Disable theme transition animations

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode Guide](https://tailwindcss.com/docs/dark-mode)
- [OKLCH Color Picker](https://oklch.com/)

---

**Dark mode is now fully functional!** 🌙✨

Users can switch between light and dark themes seamlessly across both the shop and admin dashboard.
