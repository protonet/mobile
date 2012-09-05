class DelayedJob < ActiveRecord::Base
  
  validates :command, :presence => true,
                      :uniqueness => true
                        
  # create a delayed job like this:
  # DelayedJob.create(:command => "User.long_method_run")
  
  def self.process
    all.each do |job|
      Rails.logger.info("start job #{job.command} at #{Time.now}" )
      begin 
        if eval(job.command)
          Rails.logger.info("job finished at #{Time.now}")
          job.delete
        else
          Rails.logger.warn("job failed at #{Time.now}")
        end
      rescue
        Rails.logger.warn("job failed with exception at #{Time.now}")
      end
    end
  end
  
end
