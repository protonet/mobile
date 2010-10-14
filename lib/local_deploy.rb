require 'fileutils'

class LocalDeploy
  ARCHIVE_NAME = "protonet"
  PACKING_TYPE = ".tar.gz"
  KEY = "adbasdbaskjdbjk1b23123kjasndjkbas"
  DEPLOY_ROOT = "/home/protonet/dashboard"
  MAX_NUM_RELEASES = 5

  class << self
    attr_accessor :env

    def first_run(env)
      self.env = env
      create_directories
      setup_db
    end

    def deploy(env)
      self.env = env
      get_code
      release_dir
      unpack
      bundle
      migrate
      clean_up
      link
      restart
    end

    def create_directories
      create_directory "#{shared_path}/log"
      create_directory "#{shared_path}/db"
      create_directory "#{shared_path}/system"
      create_directory "#{shared_path}/config"
      create_directory "#{shared_path}/config/monit.d"
      create_directory "#{shared_path}/config/hostapd.d"
      create_directory "#{shared_path}/config/dnsmasq.d"
      create_directory "#{shared_path}/config/ifconfig.d"
      create_directory "#{shared_path}/solr/data"
      create_directory "#{shared_path}/user-files", 0770
      create_directory "#{shared_path}/pids", 0770
      create_directory "#{shared_path}/avatars", 0770
    end

    def create_directory(dir_name, permissions = nil)
      FileUtils.mkdir_p dir_name
      FileUtils.chmod permissions, dir_name if permissions
    end

    def setup_db
      FileUtils.cd current_path
      system "mysql -u root dashboard_production -e 'show tables;' 2>&1 > /dev/null"
      if $?.exitstatus != 0
        system "RAILS_ENV=#{self.env} bundle exec rake db:setup"
      end
    end

    def get_code
      FileUtils.cd "/tmp"
      system "wget http://releases.protonet.info/latest/#{KEY}"
    end

    def release_dir
      FileUtils.mkdir_p shared_path if !File.exists? shared_path
      FileUtils.mkdir_p releases_path if !File.exists? releases_path
    end

    def unpack
      if File.exists?("/tmp/#{ARCHIVE_NAME}#{PACKING_TYPE}")
        FileUtils.cd "/tmp"
        system "tar -xzf #{ARCHIVE_NAME}#{PACKING_TYPE}"
        FileUtils.mv ARCHIVE_NAME, "#{release_path}/#{Time.now.strftime('%Y%m%d%H%M%S')}"
        # remove old symlink
        # create new symlink
      end
    end

    def clean_up
      all_releases = Dir["#{release_path}/*"].sort

      while true
        if all_releases.size > MAX_NUM_RELEASES
          FileUtils.r_rf "#{release_path}/#{all_releases.first}"
          all_releases.delete(0)
        else
          break
        end
      end
    end

    def bundle
      shared_dir = File.join(shared_path, 'bundle')
      release_dir = File.join(release_path, '.bundle')

      FileUtils.mkdir_p shared_dir
      FileUtils.ln_s shared_dir, release_dir

      FileUtils.cd release_path

      system "bundle check 2>&1 > /dev/null"

      if $?.exitstatus != 0
        system "bundle install --without test --without cucumber"
      end
    end

    def migrate
      FileUtils.cd current_path
      system "RAILS_ENV=#{env} rake db:migrate"
    end

    def passenger_restart
      system "touch #{current_path}/tmp/restart.txt"
    end

    private

    def current_path
      "#{DEPLOY_ROOT}/dashboard/current"
    end

    def shared_path
      "#{DEPLOY_ROOT}/dashboard/shared"
    end

    def release_path
      "#{DEPLOY_ROOT}/dashboard/releases"
    end
  end
end
