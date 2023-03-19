<?php

/**
 * Plugin Name: Ticketing Plugin
 * Plugin URI: https://github.com/devlobb
 * Description: This plugin provides the functionality to create, read, update, and delete tickets. It also allows users to attach photos to their tickets using either their device's camera or by uploading an image file.
 * Version: 1.0
 * Author: Abdul Rahman
 * Author Email: devlobb@gmail.com
 * Author URI: https://github.com/devlobb
 * Text Domain: dev
 * Domain Path: /languages
 */


use ticketing_addon_setting\ticketing_addon_helper;

define('ticketing_addon_path', plugin_dir_path(__FILE__));
define('ticketing_addon_url', plugin_dir_url(__FILE__));

register_activation_hook(__FILE__, 'ticket_addon_activate');
function ticket_addon_activate()
{
    global $wpdb;
    $db_table_name = $wpdb->prefix . 'tickets';
    $charset_collate = $wpdb->get_charset_collate();

    if ($wpdb->get_var("SHOW TABLES LIKE '$db_table_name'") != $db_table_name) {
        $sql = "CREATE TABLE $db_table_name (
                 id int(11) NOT NULL auto_increment,
                 data LONGTEXT NOT NULL,
                 time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                 UNIQUE KEY id (id)  
         ) $charset_collate;";
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    $ticketing_addon_helper = new ticketing_addon_helper();
    $ticketing_addon_helper->add_role_ticketing_addon_manger();
}
