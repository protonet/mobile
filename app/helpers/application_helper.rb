# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def button(name)
    content_tag(:button,
      content_tag(:span,
        content_tag(:em, name)
      ), :type => "submit", :name => "commit"
    )
  end

end
