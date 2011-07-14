# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def button(name)
    content_tag(:button, name, :type => "submit", :name => "commit")
  end
  
  def stylesheets
    ['/css/reset', '/css/general', '/css/login', '/css/channels', '/css/meeps', '/css/form', '/css/text_extension', '/css/emoji.css', '/css/widget', '/css/modal_window', '/css/context_menu']
  end
  
  def custom_stylesheet
    return unless SystemPreferences.custom_css
    "<style type=\"text/css\">#{SystemPreferences.custom_css}</style>"
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
    opts[:escape] ||= true
    if opts[:delayed]
      image_tag("data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=", opts.merge({"data-src" => image_proxy(user.avatar.url, opts).html_safe})).gsub("/images/", "")
    else
      image_tag(image_proxy(user.avatar.url, opts).html_safe, opts)
    end
  end
  
  def image_proxy(url, opts)
    url = "#{(request.protocol + request.host_with_port) if opts[:local]}#{url}"
    url = CGI::escape(url) if opts[:escape]
    "#{node_base_url}/image_proxy?url=#{url}&width=#{opts[:width]}&height=#{opts[:height]}"
  end
  
  def server_name
    if request.env["SERVER_NAME"] == "_"
      request.env["HTTP_HOST"].sub(/:[0-9]*/, "")
    else
      request.env["SERVER_NAME"]
    end
  end
  
  def node_base_url
    request.server_software != 'apache' ? "#{request.protocol}#{server_name}:#{configatron.nodejs.port}" : "#{request.protocol}#{server_name}/node"
  end
  
  def xhr_streaming_url
    request.server_software != 'apache' ? "#{request.protocol}#{server_name}:#{configatron.xhr_streaming.port}" : "#{request.protocol}#{server_name}/xhr"
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
    
    def return_anchor_path
      hidden_field_tag(:anchor, action_name)
    end
end


