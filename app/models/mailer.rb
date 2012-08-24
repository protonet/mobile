class Mailer < ActionMailer::Base  
  
  default_url_options[:host]      = SystemPreferences.public_host
  default_url_options[:protocol]  = SystemPreferences.public_host_https ? 'https' : 'http'
  helper :application
  
  def invitation(invitation)
    @invitation = invitation
    mail(
      :from => "\"#{invitation.user.display_name}\" <#{invitation.user.email}>",
      :reply_to => "\"#{invitation.user.display_name}\" <#{invitation.user.email}>",
      :to => invitation.email,
      :subject => "#{invitation.user.display_name} has invited you to join the protonet of #{Node.local.name}"
    )
  end
  
  def password_reset(password, receiver)
    @receiver = receiver
    @password = password
    from = "admin@#{SystemPreferences.public_host}"
    mail(:from => from, :to => receiver.email, :subject => "protonet password reset for #{SystemPreferences.public_host}")
  end
  
  def update_log(node_name, license_key, log_file, current_user)
    from = current_user.email
    to = "team@protonet.info"
    content = <<-eos
      
      Dear support team,
      
      somone has a problem. Here is the update log.
      
      Node name: #{node_name} (#{SystemPreferences.public_host})
      
      Admin name: #{current_user.display_name}
      Admin email: #{current_user.email}
      
      License key: #{license_key}
      
      #{log_file}
      
    eos
    mail(:from => from, :to => to, :subject => "protonet update log for #{node_name} (#{SystemPreferences.public_host})") do |format|
      format.text { render :text => content }
    end
  end


  def reset_password_instructions(user, host)
    @host = host
    @user = user
    mail(
      :from => "protonet <mailer@protonet.info>",
      :to => user.email,
      :subject => "Reset your protonet password for #{SystemPreferences.public_host}"
    )
  end
  
  def notify_atreply(user, actor, notifications)
    @user = user
    @actor = actor
    @notifications = notifications
    @meep = notifications.last.secondary_subject
    mail(
      :from => "protonet <mailer@protonet.info>",
      :to => @user.email,
      :subject => "#{actor.display_name} mentioned you!"
    )
  end
  
  def notify_private_message(user, actor, notifications)
    @user = user
    @actor = actor
    @notifications = notifications
    @meep = notifications.last.secondary_subject
    mail(
      :from => "protonet <mailer@protonet.info>",
      :to => @user.email,
      :subject => "New message from #{actor.display_name}!"
    )
  end
  
  def broken_ssl
    mail(
      :from => "protonet <mailer@protonet.info>",
      :to => "Protonet Team <team@protonet.info>",
      :subject => "SSL keyset broken on #{SystemPreferences.publish_to_web_name}"
    ) do |format|
      format.html { render :text => "<html><body><h2>Go chase down danopia.</h2><p>Node name:</p><pre>#{SystemPreferences.publish_to_web_name}</pre><p>Users of this node may get a red-page error when loading their node's interface over SSL from within their network.</p><p>This may not be ideal. :)</p></body></html>" }
    end
  end

end
