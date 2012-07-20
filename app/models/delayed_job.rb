class DelayedJob < ActiveRecord::Base
  
  validates :command, :presence => true,
                      :uniqueness => true
                        
  # create a delayed job like this:
  # DelayedJob.create(:command => "User.long_method_run")
  
  def self.process
    all.each do |job|
      Rails.logger.info("start job #{job.command} at #{Time.now}" )
      if eval(job.command)
        Rails.logger.info("job finished at #{Time.now}")
      else
        Rails.logger.warn("job failed at #{Time.now}")
      end
      job.delete
    end
  end
  
end
