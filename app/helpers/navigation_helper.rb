module NavigationHelper
  
  def navigation_link(name, path, css_class=nil)
    css_class ||= name.downcase
    <<-EOS
    <li class="#{css_class}#{" disabled" unless @allowed[path]}">
      #{ link_to(name, path, { :rel => (@allowed[path] ? '' : 'disabled') }) }
    </li>
    EOS
  end
end
