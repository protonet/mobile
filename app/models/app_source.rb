class AppSource < ActiveRecord::Base
  class SourceCouldNotBeUpdated < StandardError; end

  validates :title, :url, :presence => true, :uniqueness => true
  before_create :fetch

  def fetch
    return self.definitions if self.url.blank?
    response = Net::HTTP.get_response(URI.parse(self.url))
    self.definitions = JSON.parse(response.body).to_json
  rescue JSON::ParserError
    raise SourceCouldNotBeUpdated.new("The target source file seems not to be a valid JSON file.")
  end

  def definitions_hash
    JSON.parse(definitions).with_indifferent_access
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
    [local.definitions_hash] + all.map(&:definitions_hash)
  end

  def self.app_index
    app_definitions.inject({}) do |app_index, source_hash|
      source_hash.each_pair do |app_key, configuration|
        app_index[app_key] = configuration
      end
      app_index
    end
  end

end
