class Images::ExternalsController < ApplicationController
  before_filter :set_cache_header, :only => [:show] if perform_caching
  
  def cache_page(content = nil, options = nil)
    return unless perform_caching && caching_allowed
    
  
    path = case options
      when Hash
        url_for(options.merge(:only_path => true, :skip_relative_url_root => true, :format => params[:format]))
      when String
        options
      else
        uri = request.env['REQUEST_URI']
        file_path = request.path + '/' + Digest::MD5.hexdigest(uri) + ".jpg"
        return if File.exists?(RAILS_ROOT + "/public" + file_path)
        file_path
    end
      
    self.class.cache_page(content || response.body, path)
  end
  
  caches_page :show
  
  def show
    uri = request.env['REQUEST_URI']
    file_path = RAILS_ROOT + "/public" + request.path + '/' + Digest::MD5.hexdigest(uri) + ".jpg"
    if File.exists?(file_path)
      return send_file(file_path, :type => 'image/jpeg', :disposition => 'inline')
    end
    @width = params[:width] unless params[:width] == '0'
    @height = params[:height] unless params[:height] == '0'

    # local file
    if file_path = params[:image_file_url].gsub(/.*file_path=/, '')
      params.delete(:image_file_url)
      @external = Images::External.new(:image_file => File.new(configatron.user_file_path.to_s + URI.decode(file_path), "r"))
      @external.save
    # global file
    elsif params[:image_file_url]
      begin
        @external = Images::External.find_or_create_by_image_url(params[:image_file_url])
      rescue OpenURI::HTTPError
        return head 404
      end
    # by id
    elsif params[:id]
      @external = Images::External.find_by_id(params[:id])
    end

    respond_to do |format|
      format.jpg
    end
  end
  
  def is_available
    is_available = Images::External.is_available(params[:image_file_url])
    
    respond_to do |format|
      format.json do
        render :text => { :is_available => is_available }.to_json
      end
    end
  end
  
  private
    def set_cache_header
      response.headers['Cache-Control'] = 'public, max-age=31536000'
    end
end
