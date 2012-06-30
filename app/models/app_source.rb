class AppSource < ActiveRecord::Base

  validates :title, :url, :presence => true, :uniqueness => true
  before_create :fetch

  scope :without_errors, where("parser_error IS NULL OR parser_error = ''")

  def fetch
    return self.definitions if self.url.blank?
    response = Net::HTTP.get_response(URI.parse(self.url))
    self.definitions = JSON.parse(response.body).to_json
    reset_errors
  rescue JSON::ParserError => e
    self.error_message = "Not a valid json file."
    self.parser_error = e.message
  rescue Errno::ECONNREFUSED => e
    self.error_message = "Couldn't connect to server."
  end

  def has_errors?
    parser_error? || error_message?
  end

  def definitions_hash
    if has_errors?
      {}
    else
      JSON.parse(definitions).with_indifferent_access
    end
  end

  def application_titles
    definitions_hash.inject([]) do |titles, value|
      titles << (value.last[:display_name] || value.first)
      titles
    end
  end

  def fetch!
    fetch
    save!
  end

  def self.fetch_all!
    all.each {|source| source.fetch! }
  end

  def self.local
    path = Rails.root.join('config/apps.json')
    definitions = File.exists?(path) ? JSON.parse(File.read(path)).to_json : ''
    new(:title => 'local', :definitions => definitions)
  end

  def self.app_definitions
    [local.definitions_hash] + without_errors.map(&:definitions_hash)
  end

  def self.app_index
    app_definitions.inject({}) do |app_index, source_hash|
      source_hash.each_pair do |app_key, configuration|
        app_index[app_key] = configuration
      end
      app_index
    end
  end

  private
  def reset_errors
    self.parser_error = nil
    self.error_message = nil
  end

end
