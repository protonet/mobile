class AppDashboardBinding < ActiveRecord::Base

  belongs_to :app

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
