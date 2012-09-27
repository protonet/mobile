protonet.i18n = {
  flash_message_page_loading_error: "Page couldn't be loaded.",
  flash_message_page_forbidden_error: "You are not allowed to see this page.",
  flash_message_page_logged_out_error: "Please login or sign up.",
  flash_message_submit_success: "Your changes have been successfully saved.",
  flash_message_submit_error: "Your changes couldn't be saved.",
  flash_message_submit_forbidden_error: "You are not allowed to perform this action.",
  
  headline_confirm: "Are you sure?",
  label_ok: "OK",
  label_cancel: "Cancel",
  
  label_just_now: "Just now",
  label_yesterday: "Yesterday",
  label_minutes_ago: {
    one: "%{count} minute ago",
    other: "%{count} minutes ago"
  },
  label_hours_ago: {
    one: "%{count} hour ago",
    other: "%{count} hours ago"
  },
  label_days_ago: {
    one: "%{count} day ago",
    other: "%{count} days ago"
  },
  label_weeks_ago: {
    one: "%{count} week ago",
    other: "%{count} weeks ago"
  },
  label_months_ago: {
    one: "%{count} month ago",
    other: "%{count} months ago"
  },
  
  link_show: "(show)",
  link_hide: "(hide)",
  
  users: {
    label_play_sound: "Play a sound when a message arrived",
    label_desktop_notifications: "Show desktop notifications",
    hint_no_meeps_available: "No messages with attachments available",
    flash_message_avatar_upload_error: "Your photo couldn't be upload. Please try again.",
    headline_widget_remote_channel: 'Online users <a data-hover-hint="top" title="Only online users are displayed in global channels" class="hint">(?)</a>',
    headline_widget_channel: "Users",
    headline_user_types: "Comparison of user types",
    flash_message_update_settings_success: "Your changes have been successfully saved.",
    flash_message_update_settings_error: "Your changes couldn't be saved.",
    link_profile: "Show profile",
    link_reply: "Send @reply",
    link_private_chat: "Start private chat"
  },
  
  meeps: {
    headline_detail: "%{avatar} Message #%{id} posted in '%{channel_name}'",
    hint_sent: "[sent!]",
    hint_error: "[error!]",
    hint_sending: "[sending ...]",
    hint_no_meeps_available: "Hurry! Be the first one to post a message here.",
    flash_message_send_error: "Your message hasn't been sent. Please try again.",
    flash_message_send_file_error: "The file you are trying to share doesn't seem to exist.",
    flash_message_loading_error: "Something went wrong while loading the message.",
    flash_message_context_loading_error: "Something went wrong while loading the context for the message.",
    flash_message_delete_success: "The message has been successfully deleted.",
    flash_message_delete_error: "The message couldn't be deleted.",
    name_unknown_channel: "unknown/private",
    link_share: "Share or reply",
    link_show_detail_view: "Show detail view",
    link_delete: "Delete message"
  },
  
  channels: {
    hint_no_channels_subscribed: "You can't post any messages because you haven't subscribed to any channels. Click <a href='/channels'>here</a> to do so or contact an <a data-contact-admin href='/?rendezvous_with=%{user_id}'>admin</a>.",
    hint_verifications: {
      one: "1 user needs to be verified",
      other: "%{count} users need to be verified"
    },
    hint_node_offline: "The Protonet of this channel is currently offline.",
    notification_new_reply: "new reply from %{author}",
    notification_new_message: "new message from %{author}",
    notification_system_message: "new message from the Protonet system",
    flash_message_subscribtion_error: "Could not subscribe to channel '%{identifier}'.",
    flash_message_subscribtion_success: "You successfully subscribed to channel '%{identifier}'.",
    flash_message_loading_channels_error: "Your channels couldn't be loaded.",
    flash_message_loading_channel_error: "The channel couldn't be loaded.",
    flash_message_rendezvous_error: "An error appeared while setting up a private chat.",
    flash_message_rendezvous_with_yourself_error: "You can't do a private chat with yourself."
  },
  
  instruments: {
    flash_message_socket_connection_error: "There has been a connection problem. Please wait a few seconds. It might heal itself.",
    flash_message_socket_reconnection_success: "You are online again.",
    flash_message_socket_connection_establish_error: "Something went wrong. The chat server seems to be unreachable.",
    headline_captive_portal: "Hi %{user_name}",
    text_captive_portal: 'Welcome to Protonet. Click the following button to enable internet access and to open <strong>%{url}</strong>.<br><a class="button hide-overlay" data-avoid-ajax="1" href="%{href}" target="_blank">Get internet access</a>'
  },
  
  search: {
    hint_enter_keyword: "Please enter a keyword to search",
    hint_no_results_found: "No results found"
  },
  
  preferences: {
    headline_wlan_update_success: "WLAN has been updated and restarted",
    text_wlan_update_success: "You probably lost your connection. Please reconnect and reload this page.",
    headline_software_update_success: "The software update was successful",
    text_software_update_success: "All services are going down for reboot now. Please wait a few more seconds. You will then be redirected to the home page."
  },
  
  files: {
    name_untitled_folder: "Untitled folder",
    name_rendezvous_folder: "shared between you and %{user_name}",
    name_rendezvous_folder_html: "shared between <strong>you</strong> and <strong>%{user_name}</strong>",
    name_user_folder: "my private folder",
    name_root_path: "Files",
    confirm_delete: "Do you really want to delete the following files? There's no undo.",
    confirm_upload_cancel: "This will cancel the upload. Are you sure?",
    hint_folder_empty: "This folder is empty.",
    hint_drag_and_drop_here: "Drag & drop your files here",
    hint_upload_success: "All files uploaded (100 %)",
    hint_upload_error: "The file '%{name}' couldn't be uploaded",
    hint_uploading_files: {
      one:    "Uploading file (%{percent} %)",
      other:  "Uploading %{count} files (%{percent} %)"
    },
    hint_no_preview_available: "No preview available",
    hint_file_privacy: "Only you can see and edit this file",
    hint_folder_privacy: "Only you can see this folder",
    hint_channel_file_privacy: "Only subscribers of this channel can see and edit this file",
    hint_channel_folder_privacy: "Only subscribers of this channel can see this folder",
    hint_unknown_uploader: "unknown",
    hint_virus: "Caution, this file might be malware or a virus!",
    hint_no_virus: "no",
    hint_upload_error: "(error) ",
    hint_no_virus_scan_available: "no virus scan available",
    link_upload: "Click here to upload files",
    link_fullscreen: "Toggle fullscreen mode",
    flash_message_file_exists: "A file named '%{name}' already exists.",
    flash_message_folder_exists: "A folder named '%{name}' already exists.",
    flash_message_rename_error: "Couldn't rename file/folder. Maybe name already exists?",
    flash_message_folder_access_error: "You don't have access to this folder.",
    flash_message_file_access_error: "You don't have access to this file.",
    flash_message_move_read_error: "You are not allowed to move this file or folder.",
    flash_message_move_write_error: "You are not allowed to move files into this folder.",
    flash_message_auth_error: "You are not logged in anymore. Please reload.",
    flash_message_timeout_error: "The request took too long to complete. Please try again.",
    flash_message_unknown_error: "Unknown error. Please try again.",
    flash_message_rename_user_folder_error: "This folder can't be renamed because it belongs to a user.",
    flash_message_rename_channel_folder_error: "This folder can't be renamed because it belongs to a channel.",
    flash_message_rename_folder_error: "This folder is essential to the Protonet file structure and therefore can't be renamed.",
    flash_message_move_success: {
      one:    "Successfully moved the file into '%{name}'.",
      other:  "Successfully moved the files into '%{name}'."
    },
    flash_message_move_between_nodes_error: "You can't move files from one Protonet to another.",
    flash_message_delete_success: "Successfully removed.",
    flash_message_added_song_success: {
      one: "Added a song to the playlist.",
      other: "Added %{count} songs to the playlist."
    }
  },
  
  snapshots: {
    hint_no_webcam: "It seems that your browser doesn't support webcam access.",
    hint_uploading: "uploading ..."
  }
};