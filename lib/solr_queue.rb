# Use the default queue settings.
queue = Sunspot::IndexQueue.new

Thread.new do
  loop do
    begin
      queue.process
      sleep(10)
    rescue Exception => e
      Rails.logger.info "Exception"
      # Make sure we can exit the loop on a shutdown
      raise e if e.is_a?(SystemExit) || e.is_a?(Interrupt)
      # If Solr isn't responding, wait a while to give it time to get back up
      if e.is_a?(Sunspot::IndexQueue::SolrNotResponding)
        sleep(30)
      else
        Rails.logger.error(e)
      end
    end
  end
end

