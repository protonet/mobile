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
      
      file_name ? ('<a href="' + path + '">' + truncate(file_name, 40) + '</a>') : s
    }
  end
  
  def highlight_replies(str)
    str.gsub(/(\s|^)@([^@\s$"')]+)/) {|s|
      $1 + "@" + '<span class="reply">' + $2 + '</span>';
    }
  end
  
  def format_tweet(message)
    message = h(message)
    message = highlight_replies(message)
    message = auto_link(message, :urls, :target => '_blank') { |url|
      CGI.unescapeHTML(truncate(url, 55))
    }
    message = nl2br(message)
    message = auto_link_file_paths(message)
  end
  
  private
    def extract_file_name(path)
      match = path.match(/file_path=.*%2F(.*)/)
      match && match[1] && CGI.unescape(match[1])
    end
end
