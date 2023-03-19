<?php

namespace ticketing_addon_setting;

use WP_Roles;

require_once ticketing_addon_path . "helper/ticketing_addon_api_routes.php";

class ticketing_addon_helper
{
    /**
     * Constructor for the Ticketing Addon class.
     * Sets up WordPress action hooks and initializes the API routes.
     */
    public function __construct()
    {
        add_action('init', [$this, 'setUserAuthSession']);
        add_action('admin_menu', [$this, 'ticketing_addon_menue']);
        add_action('admin_enqueue_scripts', [$this, 'ticketing_addon_selectively_enqueue_admin_script']);
        new ticketing_addon_api_routes();
    }

    /**
     * Registers the default configuration for ticket rules if it does not exist.
     */
    public function resister_option_config_rule_ticket()
    {
        if (!get_option("ticket_addon_config_rule")) {
            $arrayBuilder = array('age_less_then_equal_4' => 'free', 'age_greater_then_or_equal_5_to_11' => '3000', 'age_greater_then_or_equal_12' => '5000');
            $storable_json_string = trim(json_encode($arrayBuilder));
            add_option("ticket_addon_config_rule", "$storable_json_string", '', 'no');
        }
    }

    /**
     * Sets up the user authentication session using WordPress functions.
     */
    public function setUserAuthSession()
    {
        if (is_user_logged_in()) {
            $user = wp_get_current_user(); // getting & setting the current user
            $roles = (array)$user->roles; // obtaining the role
            $_SESSION['index_permission'] = $roles[0];
        }
    }

    /**
     * Adds menu pages for Ticketing Manager in WordPress dashboard.
     */
    public function ticketing_addon_menue()
    {
        add_menu_page('Ticketing List', 'Ticketing Manager', 'ticketing_addon_view', 'ticketing-addon', array($this, 'ticketing_addon_listing'), 'dashicons-chart-area', 56);
        add_submenu_page(
            'ticketing-addon',
            'Ticketing List',
            'Ticket List(قائمة التذاكر)',
            'ticketing_addon_view',
            'ticketing-addon',
            [$this, 'ticketing_addon_listing']
        );
        add_submenu_page(
            'ticketing-addon',
            'Add Ticket',
            'Add Ticket(اضافة تذكرة)',
            'ticketing_addon_view',
            'ticketing_addon_add_ticket',
            [$this, 'ticketing_addon_add']
        );
        add_submenu_page(
            'ticketing-addon',
            'Ticket Config',
            'Ticket Config(تكوين التذاكر)',
            'manage_options',
            'ticketing_addon_config_ticket',
            [$this, 'ticketing_addon_config']
        );
    }

    /**
     * Adds the 'ticketing_addon_view' capability to 'editor' and 'administrator' roles and registers the default configuration for ticket rules.
     */
    public function add_role_ticketing_addon_manger()
    {
        $ticketing_editor_role = get_role('editor');
        $admin_role = get_role('administrator');
        if (!$ticketing_editor_role->has_cap("ticketing_addon_view") || !$admin_role->has_cap("ticketing_addon_view")) {
            $ticketing_editor_role->add_cap('ticketing_addon_view', true);
            $admin_role->add_cap('ticketing_addon_view', true);
        }
        $this->resister_option_config_rule_ticket();
    }

    /**
     * Checks whether the given role exists in WordPress.
     * @param string $role The name of the role to check.
     * @return bool Returns true if the role exists, false otherwise.
     */
    public function role_exists_addon($role)
    {
        if (!empty($role)) {
            $wpRoles = new WP_Roles();
            return $wpRoles->is_role($role);
        }
        return false;
    }

    /**
     * Displays the HTML for the ticketing addon listing page
     */
    public function ticketing_addon_listing()
    {
        echo '<div id="list_ticket_addon"></div>';
    }

    /**
     * Displays the HTML for the ticketing addon add page
     */
    public function ticketing_addon_add()
    {
        echo '<div id="add_ticket_addon"></div>';
    }

    /**
     * Displays the HTML for the ticketing addon configuration page
     */
    public function ticketing_addon_config()
    {
        echo '<div id="config_ticket_addon"></div>';
    }

    /**
     * Enqueues the necessary JavaScript and CSS files for the ticketing addon admin pages
     */
    public function ticketing_addon_selectively_enqueue_admin_script()
    {
        if (isset($_GET['page'])) {
            $pages = ['ticketing_addon_add_ticket', 'ticketing_addon_config_ticket', 'ticketing-addon'];
            if (in_array($_GET['page'], $pages)) {
                $react_app_js = plugins_url('static/js/bundle.js', __FILE__);
                $react_app_css = plugins_url('static/css/styles.css', __FILE__);
                $version = '1.0.0';
                wp_enqueue_script('ticketing-addon-admin-js', $react_app_js, array(), $version, true);
                wp_enqueue_style('ticketing-addon-css', $react_app_css, array(), $version);
            }
        }
    }
}
