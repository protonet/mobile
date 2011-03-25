# Be sure to restart your server when you modify this file.
Dashboard::Application.config.session_store :cookie_store, :key => '_rails_dashboard_session'

# ActionController::Dispatcher.middleware.insert_before(ActionController::Base.session_store, FlashSessionCookieMiddleware, ActionController::Base.session_options[:key])