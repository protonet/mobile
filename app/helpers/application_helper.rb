# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def button(name)
    content_tag(:button,
      content_tag(:span,
        content_tag(:em, name)
      ), :type => "submit", :name => "commit"
    )
  end

  def stylesheets
    ['/css/reset', '/css/general', '/css/login', '/css/channels', '/css/meeps', '/css/form', '/css/text_extension']
  end

  def avatar_url(avatar)
    avatar ? "/images/avatars/#{avatar.id}" : '/img/user_picture.png'
  end
  
  private
  
    def extract_file_name(path)
      match = path.match(/file_path=.*%2F(.*)/)
      match && match[1] && CGI.unescape(match[1])
    end
end
