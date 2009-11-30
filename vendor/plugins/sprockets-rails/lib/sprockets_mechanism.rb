module SprocketsMechanism
  def source
    concatenation.to_s
  end
  
  def install_script
    concatenation.save_to(asset_path)
  end
  
  def install_assets
    secretary.install_assets
  end

  protected
    def secretary
      @secretary ||= Sprockets::Secretary.new(configuration.merge(:root => Rails.root))
    end
  
    def configuration
      load_configuration
    end

    def load_configuration(key = :default)
      conf = YAML.load(IO.read(File.join(Rails.root, "config", "sprockets.yml"))) || {}
      if conf[key]
        conf[key]
      elsif conf.any? { |k, v| k.to_s == key }
        conf[key.to_sym]
      elsif key == :default
        conf || {}
      else
        {}
      end
    end

    def concatenation
      secretary.reset! unless source_is_unchanged?
      secretary.concatenation
    end

    def asset_path
      File.join(Rails.public_path, "sprockets.js")
    end

    def source_is_unchanged?
      previous_source_last_modified, @source_last_modified = 
        @source_last_modified, secretary.source_last_modified
        
      previous_source_last_modified == @source_last_modified
    end
end
