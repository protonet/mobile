class ProtonetEmailService

  def initialize(settings)
    @settings = settings
    
  end

  def deliver!(mail)
    response = Net::HTTP.post_form(URI.parse("http://localhost:3001/email/send"), {
      :license_key => SystemBackend.license_key,
      :to => mail.to,
      :bcc => mail.bcc,
      :reply_to => mail.reply_to,
      :subject => mail.subject,
      :body => mail.body.to_s,
      :html_body => mail.body.to_s,
    })
    response
  end
end
