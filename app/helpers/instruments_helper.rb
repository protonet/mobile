module InstrumentsHelper

  def active(s, d)
    'class="active"' if s == d
  end

end
