Sunspot.session = Sunspot::IndexQueue::SessionProxy.new

module Sunspot::IndexQueue::Entry
  class NilImpl < ActiveRecordImpl
    def self.add(*args)
      Rails.logger.info("no solr indexing")
      true
    end
  end
end

# Queue implementation backed by ActiveRecord
Sunspot::IndexQueue::Entry.implementation = :active_record

require "sunspot/rails/solr_logging"
