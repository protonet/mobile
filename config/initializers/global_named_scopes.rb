class ActiveRecord::Base
  named_scope :conditions, lambda { |*args| {:conditions => args} }

  # general merging of conditions, names following the searchlogic pattern
  # conditions_all is a more descriptively named enhancement of the above
  named_scope :conditions_all, lambda { |*args| {:conditions => [args].flatten} }

  # forming the disjunction of a list of conditions (as strings)
  named_scope :conditions_any, lambda { |*args| 
    args = [args].flatten
    raise "non-strings in conditions_any" unless args.all? {|s| s.is_a? String}
    { :conditions => args.map {|c| "(#{c})"}.join(" OR ") }
  }
end
