# AI Travel Buddy - WordPress Plugin

A WordPress plugin that embeds the AI Travel Buddy trip planner as a responsive iframe on your website.

## Installation

1. Download or clone this plugin folder to your WordPress plugins directory: `/wp-content/plugins/ai-travel-buddy/`
2. Go to the WordPress admin dashboard
3. Navigate to **Plugins** → **Installed Plugins**
4. Find **AI Travel Buddy** and click **Activate**

## Configuration

1. Go to **Settings** → **AI Travel Buddy** in the WordPress admin
2. Enter your AI Travel Buddy planner URL (e.g., `https://yourdomain.com/planner`)
3. Save changes

## Usage

### Basic Shortcode

Add the following shortcode to any WordPress page or post:

```
[ai_trip_planner]
```

This will embed the planner using the URL configured in the plugin settings.

### Custom URL and Height

You can override the default URL and height in the shortcode:

```
[ai_trip_planner url="https://custom-domain.com/planner" height="800"]
```

**Shortcode Attributes:**

- `url` (string): The full URL to your AI Travel Buddy planner. Default: `https://yourdomain.com/planner`
- `height` (integer): Height of the iframe in pixels. Default: `900`. Minimum: `600`
- `title` (string): Accessibility title for the iframe. Default: `AI Travel Buddy - Trip Planner`

## Responsive Design

The plugin includes responsive CSS that:

- Adjusts iframe height on tablets (700px)
- Adjusts iframe height on mobile devices (600px)
- Maintains proper aspect ratio across all screen sizes
- Adds subtle shadows and rounded corners for a modern look

## Features

- ✅ Simple shortcode: `[ai_trip_planner]`
- ✅ Customizable URL via admin settings or shortcode
- ✅ Responsive iframe with mobile-friendly breakpoints
- ✅ Accessibility-friendly (focus states, ARIA attributes)
- ✅ Security: URL sanitization and capability checks
- ✅ Nonce verification for settings updates

## Security Considerations

- URLs are sanitized using WordPress `esc_url()` and `esc_url_raw()`
- Only administrators can access the settings page (`manage_options` capability)
- Settings updates are protected with nonce verification
- The iframe has limited permissions (geolocation, microphone, camera only when explicitly allowed)

## Troubleshooting

### Shortcode not rendering

- Ensure the plugin is activated in WordPress
- Check that your planner URL is correctly set in plugin settings
- Verify the URL is accessible (not blocked by CORS or other restrictions)

### iframe not loading

- Check browser console for CORS errors
- Ensure your planner supports embedding via iframe
- Verify the URL is using HTTPS (recommended for production)

### Layout issues

- The plugin CSS uses standard responsive breakpoints (768px, 480px)
- You can override CSS by adding custom rules in your WordPress theme's `style.css`

## Example Custom CSS Override

Add this to your theme's `style.css` to customize the appearance:

```css
.air-travel-buddy-container {
  border: 2px solid #your-color;
  margin: 3rem 0;
}

.air-travel-buddy-iframe {
  height: 1000px;
}
```

## Support

For issues or feature requests, please contact support@yourdomain.com or refer to the AI Travel Buddy documentation.
