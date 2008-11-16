module DataMapper
  class Collection
    # todo aj tests needed for dm_ext fucntionalities
    # adding to json functionality to the collection
    def to_json(*args)
      '[' + self.map{|m| m.attributes(*args).to_json }.join(',') + ']'
    end  
  end
end

