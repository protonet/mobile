  # create_table "app_dashboard_bindings", :force => true do |t|
  #   t.string   "app_name"
  #   t.string   "link_title"
  #   t.string   "app_path"
  #   t.string   "app_key"
  #   t.string   "app_host"
  #   t.integer  "app_port"
  #   t.integer  "installed_app_id"
  #   t.string   "binding_file_path"
  #   t.datetime "created_at"
  #   t.datetime "updated_at"
  # end



class AppDashboardBinding < ActiveRecord::Base

  belongs_to :installed_app

  validates :app_key, :presence => true

  after_initialize :add_defaults

  def app_url
    host_with_port = app_port == 80 ? app_host : "#{app_host}:#{app_port}"
    "http://#{host_with_port}#{app_path}"
  end

  private
  def add_defaults
    self.app_path = '/' if self.app_path.blank?
    self.app_host = SystemPreferences.public_host.split(':').first if self.app_host.blank?
    self.app_port = 80 if self.app_port.blank?
  end


end
