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
    ['/css/reset', '/css/general', '/css/login', '/css/channels', '/css/meeps', '/css/form', '/css/text_extension', '/css/widget', '/css/search', '/css/modal_window']
  end

  def search_highligh_tag(phrase)
    "#{search_highlight_start_tag}#{phrase}#{search_highlight_end_tag}"
  end

  def unescape_search_highlights(message)
    regexp = /#{Regexp.escape(h(search_highlight_start_tag))}(.+?)#{Regexp.escape(h(search_highlight_end_tag))}/
    message = message.gsub(regexp) do |match|
      "#{search_highlight_start_tag}#{$1}#{search_highlight_end_tag}"
    end
  end

  def avatar_url(avatar)
    avatar ? "/images/avatars/#{avatar.id}" : '/img/user_picture.png'
  end
  
  def server_name
    if request.env["SERVER_NAME"] == "_"
      request.env["HTTP_HOST"].sub(/:[0-9]*/, "")
    else
      request.env["SERVER_NAME"]
    end
  end

  private
  
    def extract_file_name(path)
      match = path.match(/file_path=.*%2F(.*)/)
      match && match[1] && CGI.unescape(match[1])
    end

    def search_highlight_start_tag
      "<span class='highlight'>"
    end

    def search_highlight_end_tag
      "</span>"
    end
end
