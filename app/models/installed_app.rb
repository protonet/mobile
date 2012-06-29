class InstalledApp < ActiveRecord::Base
  has_many :app_dashboard_bindings, :dependent => :destroy

  validates :name, :presence => true, :uniqueness => true
  validates :uninstall_dep_path, :presence => true
  validates :install_dep_path, :presence => true

  def to_app
    AppInstaller::App.new(name, :dep_path => install_dep_path, :uninstall_dep_path => uninstall_dep_path)
  end

end
