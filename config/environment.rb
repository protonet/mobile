# Load the rails application
require File.expand_path('../application', __FILE__)

# Silence warning
LDAP_ENV = Rails.env

# Initialize the rails application
Dashboard::Application.initialize!
