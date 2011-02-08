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
    ['/css/reset', '/css/general', '/css/login', '/css/channels', '/css/meeps', '/css/form', '/css/text_extension', '/css/widget', '/css/modal_window']
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
  
  def avatar(user, opts = {})
    opts[:alt]    ||= ""
    opts[:width]  ||= 36
    opts[:height] ||= opts[:width]
    opts[:local]    = true
    image_tag(image_proxy(user.avatar.url, opts).html_safe, opts)
  end
  
  def image_proxy(url, opts)
    request.protocol + request.host + 
      ":#{configatron.nodejs.port}/image_proxy?url=#{(request.protocol + request.host_with_port) if opts[:local]}#{url}&width=#{opts[:width]}&height=#{opts[:height]}"
  end
  
  def server_name
    if request.env["SERVER_NAME"] == "_"
      request.env["HTTP_HOST"].sub(/:[0-9]*/, "")
    else
      request.env["SERVER_NAME"]
    end
  end
  
  def server_software
    request.env['SERVER_SOFTWARE'] && request.env['SERVER_SOFTWARE'].match(/^\w*/)[0]
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
