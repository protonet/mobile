class AppDashboardBinding < ActiveRecord::Base

  belongs_to :app

  validates :app_key, :presence => true, :uniqueness => true, :format => /[a-zA-Z0-9]+/

  after_initialize :add_defaults

  def app_url
    host_with_port = app_port == 80 ? app_host : "#{app_host}:#{app_port}"
    URI.join("http://#{host_with_port}", app_path).to_s
  end

  def app_url= value
    value = "http://" + value unless value.start_with?('http://')
    uri = URI.parse(value)
    self.app_host = uri.host
    self.app_port = uri.port
    self.app_path = uri.path
    self.app_url
  end

  private
  def add_defaults
    self.app_path = '/' if self.app_path.blank?
    self.app_host = SystemPreferences.public_host.split(':').first if self.app_host.blank?
    self.app_port = 80 if self.app_port.blank?
  end


end
