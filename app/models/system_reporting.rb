class SystemReporting
  class << self
    def send_message line
      Meep.create!(:message => line, :user => User.system, :channel => Channel.system)
    end
  end
end