module System
  class FilesController < ApplicationController
  
    def index
      raw_files = FileSystem.all(params['path'])
      @files = raw_files.collect do |k,v|
        {:type => k, :name => v}
      end
      respond_to do |format|
        format.html # new.html.erb
        format.js  { render :json => @files }
      end
    end
    
    def create_directory
      if params[:directory_name]
        FileUtils.mkdir(System::FileSystem.cleared_path("#{params["file_path"]}/#{params["directory_name"]}"))
        return head(:ok)
      else
        return head(:error)
      end
    end
    
    def create
      if params[:file]
        # FIXME make sure this is not hackable (filename could now be ../../.. and move basically anywhere)
        cleared_file_path = System::FileSystem.cleared_path("#{params["file_path"]}/#{params[:file].original_filename}")
        target_file = cleared_file_path
        FileUtils.mv(params[:file].path, target_file)
        return head(:ok)
      else
        return head(:error)
      end
    end
    
    def show
      if params[:file_path]
        send_file System::FileSystem.cleared_path(params[:file_path])
      else
        return head(:error)
      end
      
    end
  
    def delete
      if params[:file_path]
        FileUtils.rm(System::FileSystem.cleared_path(params[:file_path]))
        return head(:ok)
      else
        return head(:error)
      end
    end
  
  end
end