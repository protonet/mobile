# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def button(name)
    content_tag(:button,
      content_tag(:span,
        content_tag(:em, name)
      ), :type => "submit", :name => "commit"
    )
  end

  def nl2br(str)
    str.gsub(/\n/, '<br />')
  end

  def convert_to_rfc(str)
    Time.at(str.to_i).rfc2822
  end

  def auto_link_file_paths(str)
    str.gsub(/file:(.*?[^\<\s\,]+)/) {|s|
      path = $1
      file_name = extract_file_name($1)

      file_name ? ('<a href="' + path + '">' + truncate(file_name, {:length => 40}) + '</a>') : s
    }
  end

  def highlight_replies(str)
    str.gsub(/(\s|^)@([\w\.\-_@]+)/) {|s|
      reply_type = case
        when Channel.names.include?($2.downcase)
          "#{$1}@<a class='reply channel' href='#channel_name=#{$2.downcase}'>#{$2}</a>"
        when $2.downcase == current_user.login
          "#{$1}@<span class='reply to-me'>#{$2}</span>"
        else
          "#{$1}@<span class='reply'>#{$2}</span>"
      end
    }
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

  def format_tweet(message)
    message = h(message)
    message = unescape_search_highlights(message)
    message = highlight_replies(message)
    message = auto_link(message, :urls, :target => '_blank') { |url|
      CGI.unescapeHTML(truncate(url, 55))
    }
    message = nl2br(message)
    message = auto_link_file_paths(message)
  end

  def avatar_url(avatar)
    avatar ? "/images/avatars/#{avatar.id}" : '/images/userpicture.jpg'
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
