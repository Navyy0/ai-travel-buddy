<?php
/**
 * Plugin Name: AI Travel Buddy
 * Description: Embed the AI Travel Buddy trip planner on your WordPress site
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL-2.0+
 * 
 * This plugin provides a shortcode to embed the AI Travel Buddy
 * itinerary generator as a responsive iframe on any WordPress page.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('AIR_TRAVEL_BUDDY_VERSION', '1.0.0');
define('AIR_TRAVEL_BUDDY_PATH', plugin_dir_path(__FILE__));
define('AIR_TRAVEL_BUDDY_URL', plugin_dir_url(__FILE__));

// Register shortcode
add_shortcode('ai_trip_planner', 'air_travel_buddy_shortcode');

/**
 * Render the AI Travel Buddy planner iframe
 * 
 * Usage in WordPress:
 * [ai_trip_planner]
 * [ai_trip_planner url="https://custom-domain.com/planner" height="800"]
 * 
 * @param array $atts Shortcode attributes
 * @return string HTML iframe
 */
function air_travel_buddy_shortcode($atts) {
    // Parse shortcode attributes with defaults
    $atts = shortcode_atts(array(
        'url'    => 'https://yourdomain.com/planner',
        'height' => '900',
        'title'  => 'AI Travel Buddy - Trip Planner'
    ), $atts, 'ai_trip_planner');
    
    // Sanitize attributes
    $url    = esc_url($atts['url']);
    $height = intval($atts['height']);
    $title  = esc_attr($atts['title']);
    
    // Ensure reasonable defaults
    if ($height < 600) {
        $height = 900;
    }
    if (empty($url)) {
        return '<p style="color: #ef4444;">Error: AI Travel Buddy URL is not configured. Please update the shortcode.</p>';
    }
    
    // Load plugin styles
    wp_enqueue_style('air-travel-buddy-styles');
    
    // Build iframe HTML
    $iframe_html = sprintf(
        '<div class="air-travel-buddy-container"><iframe src="%s" class="air-travel-buddy-iframe" title="%s" style="height: %dpx;" allow="geolocation; microphone; camera"></iframe></div>',
        $url,
        $title,
        $height
    );
    
    return $iframe_html;
}

// Enqueue styles
add_action('wp_enqueue_scripts', 'air_travel_buddy_enqueue_styles');
function air_travel_buddy_enqueue_styles() {
    wp_register_style(
        'air-travel-buddy-styles',
        AIR_TRAVEL_BUDDY_URL . 'css/iframe.css',
        array(),
        AIR_TRAVEL_BUDDY_VERSION
    );
}

// Register admin menu (optional settings page)
add_action('admin_menu', 'air_travel_buddy_admin_menu');
function air_travel_buddy_admin_menu() {
    add_options_page(
        'AI Travel Buddy Settings',
        'AI Travel Buddy',
        'manage_options',
        'air-travel-buddy-settings',
        'air_travel_buddy_settings_page'
    );
}

/**
 * Admin settings page
 */
function air_travel_buddy_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Save settings
    if (isset($_POST['air_travel_buddy_url'])) {
        check_admin_referer('air_travel_buddy_nonce');
        $url = esc_url_raw($_POST['air_travel_buddy_url']);
        update_option('air_travel_buddy_url', $url);
        echo '<div class="updated"><p>Settings saved.</p></div>';
    }
    
    $current_url = get_option('air_travel_buddy_url', 'https://yourdomain.com/planner');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post">
            <?php wp_nonce_field('air_travel_buddy_nonce'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="air-travel-buddy-url">Planner URL</label>
                    </th>
                    <td>
                        <input 
                            type="url" 
                            id="air-travel-buddy-url" 
                            name="air_travel_buddy_url" 
                            value="<?php echo esc_url($current_url); ?>" 
                            class="regular-text"
                            placeholder="https://yourdomain.com/planner"
                        />
                        <p class="description">Enter the full URL to your AI Travel Buddy planner application.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <hr />
        <h2>Shortcode Usage</h2>
        <p>Use the following shortcode on any page or post to embed the trip planner:</p>
        <code>[ai_trip_planner]</code>
        <p>You can also customize the URL and height:</p>
        <code>[ai_trip_planner url="https://your-custom-url.com/planner" height="1000"]</code>
    </div>
    <?php
}
