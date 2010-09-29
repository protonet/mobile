module System
  class FilesController < ApplicationController
    include Rabbit
    
    def index
      raw_files = FileSystem.all(params['path'])
      
      respond_to do |format|
        format.html
        format.js  { render :json => raw_files }
      end
    end
    
    def create_directory
      if params[:directory_name] && params[:file_path] && params[:channel_id]
        begin
          full_directory_path = "/#{params[:channel_id]}#{params[:file_path]}/#{params[:directory_name]}"
          FileUtils.mkdir(System::FileSystem.cleared_path(full_directory_path))
          
          channel = Channel.find(params[:channel_id])
          publish 'files', ['channel', channel.uuid],
            :trigger        => 'directory.added',
            :path           => params[:file_path],
            :directory_name => params[:directory_name],
            :channel_id     => params[:channel_id]
        rescue
          return head(409)
        else
          return head(:ok)
        end
      else
        return head(:error)
      end
    end
    
    def delete_directory
      if params[:file_path] && params[:channel_id]
        full_path = "/#{params[:channel_id]}#{params[:file_path]}"
        FileUtils.rm_rf(System::FileSystem.cleared_path(full_path))
          
        channel = Channel.find(params[:channel_id])
        publish 'files', ['channel', channel.uuid],
          :trigger        => 'directory.removed',
          :path           => params[:file_path],
          :channel_id     => params[:channel_id]
        return head(:ok)
      else
        return head(:error)
      end
    end
    
    def create
      if params[:file]
        # FIXME make sure this is not hackable (filename could now be ../../.. and move basically anywhere)
        filename = params[:file].original_filename.strip
        
        # Fix file name encoding bug
        if request.env['HTTP_X_FIX_ENCODING'] == 'true'
          latin1_to_utf8 = Iconv.new("UTF8//TRANSLIT//IGNORE", "LATIN1")
          filename       = latin1_to_utf8.iconv(filename)
        end
        
        full_file_path    = "#{params["file_path"]}/#{filename}"
        cleared_file_path = System::FileSystem.cleared_path("#{params["file_path"]}/#{filename}")
        target_file       = cleared_file_path
        FileUtils.mv(params[:file].path, target_file)
          
        channel = Channel.find(params[:channel_id])
        publish 'files', ['channel', channel.uuid],
          :trigger      => 'file.added',
          :path         => params["file_path"],
          :file_name     => filename
        return head(:ok)
      else
        return head(:error)
      end
    end
    
    def show
      if params[:file_path]
        mime_type = Mime::Type.lookup_by_extension((m = params[:file_path].match(/.*\.(.*)/)) && m[1].downcase) || Mime::Type.lookup("text/plain")
        send_file(System::FileSystem.cleared_path(params[:file_path]), :type => mime_type, :disposition => (params[:download] == 1 ? 'attachment': 'inline'))
      else
        return head(:error)
      end
      
    end
  
    def delete
      if params[:file_path] && params[:channel_id]
        full_path = "/#{params[:channel_id]}#{params[:file_path]}"
        FileUtils.rm(System::FileSystem.cleared_path(full_path))
        
        channel = Channel.find(params[:channel_id])
        publish 'files', ['channel', channel.uuid],
          :trigger      => 'file.removed',
          :path         => params[:file_path],
          :channel_id   => params[:channel_id]
        return head(:ok)
      else
        return head(:error)
      end
    end
  
  end
end
