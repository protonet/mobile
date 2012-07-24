class SystemReporting
  class << self
    def send_message line
      Meep.create_system_message(line)
    end
  end
end