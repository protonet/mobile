module DataMapper
  class Collection
    # todo aj tests needed for dm_ext fucntionalities
    # adding to json functionality to the collection
    def to_json
      '[' + self.map{|m| m.attributes.to_json }.join(',') + ']'
    end  
  end
end

