class Sprocket
  include SprocketsMechanism

  def initialize(configuration)
    if configuration.is_a? Symbol or configuration.is_a? String
      @configuration = load_configuration(configuration)
    else
      @configuration = configuration
    end
  end

  protected

  def configuration
    @configuration || {}
  end
end
