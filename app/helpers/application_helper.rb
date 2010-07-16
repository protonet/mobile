# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def button(name)
    content_tag(:button,
      content_tag(:span,
        content_tag(:em, name)
      ), :type => "submit", :name => "commit"
    )
  end
  
  def greet_user(user_name)
    case
    when Time.now >= Time.parse("00:00") && Time.now < Time.parse("12:00")
      o = "Good morning "
    when Time.now >= Time.parse("12:00") && Time.now < Time.parse("18:00")
      o = "Good day "
    when Time.now >= Time.parse("18:00")
      o = "Good evening "
    end
    #o + link_to(user_name, preferences_path) # not yet!
    o + user_name
  end

  def stylesheets
    ["/css/reset", "/css/general", "/css/login", "/css/channels", "/css/meeps", "/css/text_extension"]
  end

  def avatar_url(avatar)
    avatar ? "/images/avatars/#{avatar.id}" : '/images/userpicture.jpg'
  end
  
  private
  
    def extract_file_name(path)
      match = path.match(/file_path=.*%2F(.*)/)
      match && match[1] && CGI.unescape(match[1])
    end
end
