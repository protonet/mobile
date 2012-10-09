protonet.i18n = {
  flash_message_page_loading_error: "Die Seite konnte nicht geladen werden.",
  flash_message_page_forbidden_error: "Sie haben nicht die nötige Berechtigung um diese Seite anzuzeigen.",
  flash_message_page_logged_out_error: "Bitte melden Sie sich an oder registrieren Sie sich kostenlos.",
  flash_message_submit_success: "Your changes have been successfully saved.",
  flash_message_submit_error: "Ihre Änderungen wurden erfolgreich gespeichert.",
  flash_message_submit_forbidden_error: "Sie haben nicht die Berechtigungen diese Aktion durchzuführen.",
  
  headline_confirm: "Sind Sie sicher?",
  label_ok: "OK",
  label_cancel: "Abbrechen",
  
  label_just_now: "Gerade eben",
  label_yesterday: "Gestern",
  label_minutes_ago: {
    one: "vor einer Minute",
    other: "vor %{count} Minuten"
  },
  label_hours_ago: {
    one: "vor einer Stunde",
    other: "vor %{count} Stunden"
  },
  label_days_ago: {
    one: "vor einem Tag",
    other: "vor %{count} Tagen"
  },
  label_weeks_ago: {
    one: "vor einer Woche",
    other: "vor %{count} Wochen"
  },
  label_months_ago: {
    one: "vor einem Monat",
    other: "vor %{count} Monaten"
  },
  
  link_show: "(anzeigen)",
  link_hide: "(schließen)",
  
  users: {
    label_play_sound: "Ton abspielen, wenn neue Nachricht angekommen ist",
    label_desktop_notifications: "Zeige Desktop-Benachrichtigungen bei neuen Nachrichten",
    hint_no_meeps_available: "Keine Nachrichten mit Anhang verfügbar",
    flash_message_avatar_upload_error: "Das Foto konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
    headline_widget_remote_channel: 'Nutzer die Online sind <a data-hover-hint="top" title="In globalen Kanälen werden nur Nutzer die gerade Online sind angezeigt" class="hint">(?)</a>',
    headline_widget_channel: "Nutzer",
    headline_user_types: "Vergleich der Nutzer-Typen",
    flash_message_update_settings_success: "Ihre Änderungen wurden erfolgreich gespeichert.",
    flash_message_update_settings_error: "Ihre Änderungen konnten nicht gespeichert werden.",
    link_profile: "Profil anzeigen",
    link_reply: "@Antwort schicken",
    link_private_chat: "Private Konversation starten"
  },
  
  meeps: {
    headline_detail: "%{avatar} Nachricht #%{id} geschrieben in '%{channel_name}'",
    hint_sent: "[gesendet!]",
    hint_error: "[Fehler!]",
    hint_sending: "[sendet ...]",
    hint_no_meeps_available: "Seien Sie der Erste, der in diesem Kanal eine Nachricht schreibt.",
    flash_message_send_error: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    flash_message_send_file_error: "Die Datei, die Sie versuchen zu teilen scheint nicht (mehr) zu existieren.",
    flash_message_loading_error: "Die Nachricht konnte nicht geladen werden.",
    flash_message_context_loading_error: "Der Kontext der Nachricht konnte nicht geladen werden.",
    flash_message_delete_success: "Die Nachricht wurde erfolgreich gelöscht.",
    flash_message_delete_error: "Die Nachricht konnte nicht gelöscht werden.",
    name_unknown_channel: "unbekannt/privat",
    link_share: "Weiterleiten oder antworten",
    link_show_detail_view: "Zeige Detailansicht",
    link_delete: "Nachricht löschen"
  },
  
  channels: {
    hint_no_channels_subscribed: "Sie können keine Nachrichten schreiben weil Sie keine Kanäle abonniert haben. Klicken Sie <a href='/channels'>hier</a> um dies zu tun oder kontaktieren Sie einen <a data-contact-admin href='/?rendezvous_with=%{user_id}'>Administrator</a>.",
    hint_verifications: {
      one: "Ein Nutzer wartet auf Freischaltung",
      other: "%{count} Nutzer warten auf Freischaltung"
    },
    hint_node_offline: "Das Protonet dieses Kanals ist momentan offline.",
    notification_new_reply: "Neue Antwort von %{author}",
    notification_new_message: "Neue Nachricht von %{author}",
    notification_system_message: "Neue Nachricht vom Protonet System",
    flash_message_subscribtion_error: "Konnte nicht dem Kanal '%{identifier}' abonnieren.",
    flash_message_subscribtion_success: "Sie haben den Kanal '%{identifier}' erfolgreich abonniert.",
    flash_message_loading_channels_error: "Ihre Kanäle konnten nicht geladen werden.",
    flash_message_loading_channel_error: "Der Kanal konnte nicht geladen werden.",
    flash_message_rendezvous_error: "Ein Fehler ist beim Starten der privaten Konversation aufgetreten.",
    flash_message_rendezvous_with_yourself_error: "Sie können keine private Konversation mit sich selbst starten."
  },
  
  instruments: {
    flash_message_socket_connection_error: "Es gibt ein Verbindungsproblem. Bitte warten Sie ein paar Sekunden. Das Problem könnte sich von selbst beheben.",
    flash_message_socket_reconnection_success: "Sie sind wieder online.",
    flash_message_socket_connection_establish_error: "Der Chat Server ist nicht erreichbar.",
    headline_captive_portal: "Hallo %{user_name}",
    text_captive_portal: 'Willkommen zu Protonet. Klicken Sie auf den folgenden Button um Internet-Zugang zu bekommen und um auf <strong>%{url}</strong> zu gelangen.<br><a class="button hide-overlay" data-avoid-ajax="1" href="%{href}" target="_blank">Internet-Zugang freischalten</a>'
  },
  
  search: {
    hint_enter_keyword: "Bitte geben Sie etwas ein",
    hint_no_results_found: "Keine Ergebnisse gefunden"
  },
  
  preferences: {
    headline_wlan_update_success: "Das WLAN wurde aktualisiert und neugestartet",
    text_wlan_update_success: "Sie haben wahrscheinlich die Verbindung zum WLAN verloren. Bitte verbinden Sie sich manuell erneut und aktualisieren Sie diese Seite.",
    headline_software_update_success: "Die Software-Aktualisierung war erfolgreich",
    text_software_update_success: "Alle Dienste werden jetzt neugestartet. Bitte warten Sie noch ein paar Sekunden. Sie werden dann automatisch zur Startseite weitergeleitet."
  },
  
  files: {
    name_untitled_folder: "Unbenannter Ordner",
    name_rendezvous_folder: "geteilt zwischen Ihnen und %{user_name}",
    name_rendezvous_folder_html: "geteilt zwischen <strong>Ihnen</strong> und <strong>%{user_name}</strong>",
    name_user_folder: "Mein privater Ordner",
    name_channels: "Kanäle",
    name_root_path: "Dateien",
    confirm_delete: "Möchten Sie wirklich die folgenden Dateien löschen? Es gibt kein zurück.",
    confirm_upload_cancel: "Dies wird zum Abbruch beim Hochladen der Dateien führen. Sind Sie sicher?",
    hint_folder_empty: "Dieser Ordner ist leer.",
    hint_drag_and_drop_here: "Ziehen Sie Ihre Dateien hier herein",
    hint_upload_success: {
      one:    "Datei hochgeladen <strong>(100 %)</strong>",
      other:  "<strong>%{count}</strong> Dateien hochgeladen <strong>(100 %)</strong>"
    },
    hint_uploading_files: {
      one:    "Lädt eine Datei hoch <strong>(%{percent} %)</strong>",
      other:  "Lädt Datei <strong>%{index}</strong> von <strong>%{count}</strong> hoch <strong>(%{percent} %)</strong>"
    },
    hint_no_preview_available: "Keine Vorschau verfügbar",
    hint_file_privacy: "Nur Sie können diese Datei sehen und ändern",
    hint_folder_privacy: "Nur Sie können diesen Ordner sehen",
    hint_channel_file_privacy: "Nur Abonnenten des Kanals können diese Datei sehen und ändern",
    hint_channel_folder_privacy: "Nur Abonnenten des Kanals können diesen Ordner sehen",
    hint_unknown_uploader: "Unbekannt",
    hint_virus: "Achtung, diese Datei könnte einen Virus enthalten!",
    hint_no_virus: "no",
    hint_upload_error: "Fehler beim Hochladen: ",
    hint_no_virus_scan_available: "Kein Virus-Scan verfügbar",
    link_upload: "Klicken Sie hier um Dateien hochzuladen",
    link_fullscreen: "Zum Vollbildmodus umschalten",
    flash_message_upload_error: "Die Datei '%{name}' konnte nicht hochgeladen werden",
    flash_message_file_exists: "Eine Datei mit dem Namen '%{name}' existiert bereits.",
    flash_message_folder_exists: "Ein Ordner mit dem Namen '%{name}' existiert bereits.",
    flash_message_rename_error: "Die Datei/Der Ordner konnte nicht umbenannt werden. Vielleicht existiert der Name bereits?",
    flash_message_folder_access_error: "Sie haben keinen Zugriff auf diesen Ordner.",
    flash_message_file_access_error: "Sie haben keinen Zugriff auf diese Datei.",
    flash_message_move_read_error: "Sie haben nicht die nötigen Berechtigungen um diese Datei oder diesen Ordner zu verschieben.",
    flash_message_move_write_error: "Sie haben nicht die nötigen Berechtigungen Dateien in diesen Ordner zu verschieben.",
    flash_message_auth_error: "Sie sind nicht (mehr) angemeldet. Bitte aktualisieren Sie die Seite.",
    flash_message_timeout_error: "Die Anfrage dauerte zu lange. Bitte versuchen Sie es erneut.",
    flash_message_unknown_error: "Unbekannter Fehler. Bitte versuchen Sie es erneut.",
    flash_message_rename_user_folder_error: "Dieser Ordner kann nicht unbenannt werden, da er zu einem Nutzer gehört.",
    flash_message_rename_channel_folder_error: "Dieser Ordner kann nicht unbenannt werden, da er zu einem Kanal gehört.",
    flash_message_rename_folder_error: "Dieser Ordner ist wesentlicher Bestandteil der Protonet Dateistruktur und kann deswegen nicht unbenannt werden.",
    flash_message_move_success: {
      one:    "Die Datei wurde erfolgreich in den Ordner '%{name}' verschoben.",
      other:  "Die Dateien wurden erfolgreich in den Ordner '%{name}' verschoben."
    },
    flash_message_move_between_nodes_error: "Sie können keine Dateien von einem Protonet zu einem anderen Protonet verschieben.",
    flash_message_delete_success: "Erfolgreich gelöscht",
    flash_message_added_song_success: {
      one: "Ein Lied wurde der Wiedergabeliste hinzugefügt.",
      other: "%{count} Lieder wurden der Wiedergabeliste hinzugefügt."
    }
  },
  
  snapshots: {
    hint_no_webcam: "Es scheint, dass Ihr Browser keinen Webcam-Zugriff unterstützt.",
    hint_uploading: "Lädt hoch ..."
  }
};