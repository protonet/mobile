# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def button(name, opts = {})
    opts = { :type => "submit", :name => "commit" }.merge(opts)
    content_tag(:button, name, opts)
  end
  
  def link_button(name, url, opts = {})
    opts = { :class => 'button' }.merge(opts)
    link_to(name, url, opts)
  end
  
  def stylesheets
    ['/css/lib/fcbkcomplete', '/css/reset', '/css/general', '/css/header', '/css/subpage', '/css/logged_out', '/css/channels', '/css/meeps', '/css/form', '/css/text_extension', '/css/emoji.css', '/css/widget', '/css/pages/search', '/css/modal_window', '/css/context_menu', '/css/getting_started', '/css/pagination']
  end
  
  def custom_stylesheet
    return unless SystemPreferences.custom_css
    "<style>#{SystemPreferences.custom_css}</style>"
  end
  
  def avatar(user, opts = {})
    opts[:alt]              ||= ""
    opts[:width]            ||= 36
    opts[:height]           ||= opts[:width]
    opts[:title]            ||= user.display_name
    opts[:public]           ||= false
    opts['data-user-avatar']  = user.id
    
    if opts.delete(:lazy_load)
      opts['data-src'] = image_proxy(user.avatar.url, opts).html_safe
      src = configatron.default_avatar
    else
      src = image_proxy(user.avatar.url, opts).html_safe
    end
    image_tag(src, opts)
  end
  
  # Use with the same arguments as image_tag. Returns the same, except including
  # a full path in the src URL. Useful for templates that will be rendered into
  # emails etc.
  def public_image_tag(*args)
    protocol = SystemPreferences.public_host_https ? 'https' : 'http'
    host = SystemPreferences.public_host
    raw(image_tag(*args).sub /src="(.*?)"/, "src=\"#{protocol}://#{host}" + '\1"')
  end
  
  def image_proxy(url, opts)
    url = "#{request.protocol + request.host_with_port}#{url}"
    url = ERB::Util.u(url)
    "#{node_base_url(opts[:public])}/image_proxy?url=#{url}&width=#{opts[:width]}&height=#{opts[:height]}&type=.jpg"
  end
  
  def server_name
    if request.env["SERVER_NAME"] == "_"
      request.env["HTTP_HOST"].sub(/:[0-9]*/, "")
    else
      request.env["SERVER_NAME"]
    end
  end

  def is_apache?
    request.server_software == 'apache'
  end
  
  def node_base_url(public_domain = false)
    if public_domain
      "#{SystemPreferences.public_host_https ? 'https' : 'http'}://#{SystemPreferences.public_host}/node"
    else
      is_apache? ? "#{request.protocol}#{server_name}/node" : "#{request.protocol}#{server_name}:#{configatron.nodejs.port}"
    end
  end
  
  def xhr_streaming_url
    is_apache? ? "#{request.protocol}#{server_name}/xhr" : "#{request.protocol}#{server_name}:#{configatron.xhr_streaming.port}"
  end
  
  def include_stylesheet_if_exists(stylesheet)
    stylesheet_tag(stylesheet, {}) if File.exists?(File.join(Rails.root, 'public', stylesheet))
  end
  
  def page_class_names
    "subpage #{controller_name}-page #{controller_name}-#{action_name}-page"
  end
end


