module DataMapper
  class Collection

    # adding to_json functionality to the dm collection
    def to_json(*args)
      '[' + self.map{|m| m.attributes(*args).to_json }.join(',') + ']'
    end  

  end
end

