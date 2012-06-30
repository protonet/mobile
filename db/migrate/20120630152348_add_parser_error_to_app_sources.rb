class AddParserErrorToAppSources < ActiveRecord::Migration
  def self.up
    add_column :app_sources, :parser_error, :text
    add_column :app_sources, :error_message, :string
  end

  def self.down
    remove_column :app_sources, :parser_error
    remove_column :app_sources, :error_message
  end
end
