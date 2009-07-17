class FilesController < ApplicationController
  
  def index
    raw_files = FileSystem.all(params['path'])
    @files = raw_files.collect do |k,v|
      {:name => k, :type => v}
    end
    respond_to do |format|
      format.html # new.html.erb
      format.js  { render :json => @files }
    end
    
  end
  
  
end
