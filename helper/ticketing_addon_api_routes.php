<?php

namespace ticketing_addon_setting;

use JetBrains\PhpStorm\NoReturn;
use WP_REST_Response;

class ticketing_addon_api_routes
{
    public function __construct()
    {
        $namespace = 'ticket-addon';
        add_action('rest_api_init', function () use ($namespace) {
            register_rest_route(
                $namespace,
                '/get-pre-config-ticket-rule',
                array(
                    'methods' => 'GET',
                    'callback' => array($this, 'get_pre_config_ticket_rule'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/set-pre-config-ticket-rule',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'set_pre_config_ticket_rule'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/save-ticket',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'saveTicket'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/upload-ticket-picture',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'uploadTicketPicture'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/set-ticket-status',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'ChangeTicketStatus'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/update-ticket',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'UpdateTicketData'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/delete-ticket-data',
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'DeleteTicketData'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
            register_rest_route(
                $namespace,
                '/get-tickets',
                array(
                    'methods' => 'GET',
                    'callback' => array($this, 'getTicketsList'),
                    'permission_callback' => array($this, 'PermissionAccessRoutesAddonTicket')
                )
            );
        });
    }

    /**
     * This function retrieves the pre-configured ticket rules from the database and returns it as a REST response.
     * @return WP_REST_Response A REST response containing the pre-configured ticket rules in the form of an array.
     */
    public function get_pre_config_ticket_rule(): WP_REST_Response
    {
        $rules = get_option("ticket_addon_config_rule");
        $rules = json_decode($rules);
        $data['rules'] = $rules;
        return new WP_REST_Response($data, 200);
    }

    /**
     * This function updates the status of tickets in the database based on the data received via a POST request.
     * @return WP_REST_Response A REST response indicating that the status has been updated.
     */
    public function ChangeTicketStatus()
    {
        global $wpdb;
        $db_table_name = $wpdb->prefix . 'tickets';
        $tmp_data = $_POST["data"];
        $tmp_data = stripslashes($_POST["data"]);
        $tmp_data = json_decode($tmp_data);

        // Used a prepared statement to avoid SQL injection attacks
        $stmt = $wpdb->prepare(
            "SELECT * FROM $db_table_name WHERE id IN (%s)",
            implode(',', array_fill(0, count($tmp_data), '?'))
        );
        $ids = array_column($tmp_data, 'row_id');
        $ticket_data = $wpdb->get_results($wpdb->prepare($stmt, $ids));

        foreach ($ticket_data as $td) {
            $jsonDecode = json_decode($td->data);
            $jsonDecode->ticket_status = ($jsonDecode->ticket_status != "read") ? "read" : $jsonDecode->ticket_status;

            $wpdb->update(
                $db_table_name,
                array(
                    'data' => trim(json_encode($jsonDecode)),
                ),
                array('id' => $td->id)
            );
        }

        return new WP_REST_Response("Status Updated", 200);
    }

    /**
     * Updates an existing ticket in the WordPress database with new data.
     * @return WP_REST_Response A REST API response object indicating that the ticket has been updated.
     */
    public function UpdateTicketData(): WP_REST_Response
    {
        global $wpdb;
        $db_table_name = $wpdb->prefix . 'tickets';
        $row_id = $_POST['row_id'];
        unset($_POST['row_id']);
        $wpdb->update(
            $db_table_name,
            array(
                'data' => trim(json_encode($_POST)),
            ),
            array('id' => $row_id)
        );
        return new WP_REST_Response("Updated", 200);
    }

    /**
     * Saves a pre-configured ticket rule to the WordPress options table.
     * @return WP_REST_Response A REST API response object indicating that the pre-configured ticket rule has been saved.
     */
    public function set_pre_config_ticket_rule(): WP_REST_Response
    {
        $storable_json_string = trim(json_encode($_POST));
        update_option("ticket_addon_config_rule", "$storable_json_string");
        return new WP_REST_Response($_POST, 200);
    }

    /**
     * Saves a new ticket to the WordPress database with a generated barcode image file.
     * @return WP_REST_Response A REST API response object containing the URL of the saved barcode image and a default print ticket path.
     */
    public function saveTicket(): WP_REST_Response
    {
        $base64_img = $_POST['bar_code'];
        $title = "BAR_CODE_" . $_POST['ticket_id'];
        $_POST["bar_code"] = self::base64ToImg($base64_img, $title);;
        global $wpdb;
        $db_table_name = $wpdb->prefix . 'tickets';
        $wpdb->insert($db_table_name, array(
            'data' => trim(json_encode($_POST))
        ));
        $data["print_ticket_path"] = ticketing_addon_url . 'assets/static/img/target001.png';
        return new WP_REST_Response($data, 200);
    }

    /**
     * Converts a base64-encoded image string to a PNG image file and saves it in the WordPress uploads directory.
     * @param string $base64_img A base64-encoded image string to convert.
     * @param string $title A title for the converted image file.
     * @return string The URL of the saved PNG image file in the WordPress uploads directory.
     */
    public function base64ToImg($base64_img, $title)
    {
        $upload_dir = wp_upload_dir();
        $upload_path = str_replace('/', DIRECTORY_SEPARATOR, $upload_dir['path']) . DIRECTORY_SEPARATOR;
        $img = str_replace('data:image/png;base64,', '', $base64_img);
        $img = str_replace(' ', '+', $img);
        $decoded = base64_decode($img);
        $filename = $title . '.png';
        $upload_file = file_put_contents($upload_path . $filename, $decoded);
        return $upload_dir['url'] . '/' . $filename;
    }

    /**
     * Retrieves a list of tickets from the WordPress database and prepares a response object for the REST API endpoint.
     * @return WP_REST_Response A REST API response object containing an array of ticket data, the path to the ticket image,
     * and a boolean indicating whether the current user has administrative permissions.
     */
    public function getTicketsList(): WP_REST_Response
    {
        global $wpdb;
        $db_table_name = $wpdb->prefix . 'tickets';
        $tickets = $wpdb->get_results($wpdb->prepare("SELECT * FROM %s ORDER BY time_stamp DESC", $db_table_name));
        $response_data["ticket_data"] = $tickets;
        $response_data["print_ticket_path"] = ticketing_addon_url . 'assets/static/img/target001.png';
        $response_data["is_admin"] = ($_SESSION['index_permission'] === "administrator") ? true : false;
        return new WP_REST_Response($response_data, 200);
    }


    /**
     * This function uploads a ticket picture to the WordPress media library. It first checks whether the image data was captured via a web camera or not.
     * If the image data is not from a web camera, it sanitizes the file name, appends a timestamp to it, and uploads the file using the wp_handle_upload function.
     * If the image data is from a web camera, it generates a random title, extracts the base64-encoded image data, and converts it to an image using the base64ToImg function.
     * The final uploaded image URL is returned as a response in the form of a WP_REST_Response object.
     * @return WP_REST_Response The uploaded image URL as a WP_REST_Response object.
     */
    public function uploadTicketPicture(): WP_REST_Response
    {
        $final_upload_stage = null;

        if ($_POST["web_cam"] === false || $_POST["web_cam"] === "false") {
            $sanitizedFileName = sanitize_file_name($_FILES["image_data"]["name"]);
            $fileName = time() . '-' . $sanitizedFileName;
            $upload = wp_handle_upload($_FILES["image_data"], array('test_form' => false));
            if (isset($upload['error'])) {
                return new WP_REST_Response('Error uploading file', 500);
            }
            $final_upload_stage = $upload["url"];
        } elseif (!empty($_POST["image_data"])) {
            if ($_POST["web_cam"]) {
                $title = rand() . time();
                $base64 = $_POST["image_data"];
                $final_upload_stage = self::base64ToImg($base64, $title);
            }
        }

        if (is_null($final_upload_stage)) {
            return new WP_REST_Response('Error uploading file', 500);
        }

        return new WP_REST_Response($final_upload_stage, 200);
    }


    /**
     * DeleteTicketData function deletes ticket data from the WordPress database using the WordPress database class, $wpdb.
     * @return WP_REST_Response Returns the status of the deletion operation as a WP_REST_Response object.
     */
    public function DeleteTicketData()
    {
        global $wpdb;
        $db_table_name = $wpdb->prefix . 'tickets';
        $tmp_data = stripslashes($_POST["data"]);
        $tmp_data = json_decode($tmp_data);

        if (isset($tmp_data->row_id)) {
            $wpdb->prepare("DELETE FROM $db_table_name WHERE id = %d", $tmp_data->row_id);
            $wpdb->query();
        } else {
            foreach ($tmp_data as $td) {
                $wpdb->prepare("DELETE FROM $db_table_name WHERE id = %d", $td->row_id);
                $wpdb->query();
            }
        }

        $response = new WP_REST_Response("Deleted Successfully", 200);
        return $response;
    }


    /**
     * Checks if the user has permission to access the routes for the Addon Ticket feature.
     * @return bool True if the user has permission, false otherwise.
     */
    public function PermissionAccessRoutesAddonTicket(): bool
    {
        if (($_SESSION['index_permission'] == 'administrator') || ($_SESSION['index_permission'] === 'editor')) {
            return true;
        }
        return false;
    }
}
