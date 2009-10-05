module System
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
    
    def create
      if params[:file]
        target_file = "#{RAILS_ROOT}/../shared/user-files/#{params["Filename"]}"
        FileUtils.mv(params[:file].path, target_file)
        return head :ok
      else
        return head :error
      end
    end
    
    def show
      if params[:file_path]
        send_file System::FileSystem.cleared_path(params[:file_path])
      else
        return head :error
      end
      
    end
  
    def delete
      if params[:file_path]
        FileUtils.rm(System::FileSystem.cleared_path(params[:file_path]))
        return head :ok
      else
        return head :error
      end
    end
  
  end
end