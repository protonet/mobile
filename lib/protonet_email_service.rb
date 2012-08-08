class ProtonetEmailService

  def initialize(settings)
    @settings = settings
  end

  def deliver!(mail)
    response = Net::HTTP.post_form(URI.parse("http://email.protonet.info/send"), {
      :license_key => SystemBackend.license_key,
      :from => mail[:from].formatted,
      :to => mail.to,
      :bcc => mail.bcc,
      :reply_to => mail.reply_to,
      :subject => mail.subject,
      :body => mail.body.to_s,
    })
    response.code.match(/2../) rescue false
  end
end
