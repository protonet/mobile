class Images::ExternalsController < ApplicationController
  caches_page :show
  
  def show
    # handle apache rewrite magic
    # & ? ; are reserved characters in URIs if you use them in your url (like /images/externals/resize/280/200/http://foo/bar?size=medium&devkey=1)
    # apache rewrite will split that url up nicely, this is not something we want in this context, this takes the original URI right out of rack
    # and handles the parameters manually
    if match = request.env['REQUEST_URI'].match(/^\/images\/externals\/resize\/(\d*)\/(\d*)\/(.*)/)
      if match[3] && match[3].match(/\?/)
        params[:width]  = match[1]
        params[:height] = match[2]
        params[:image_file_url] = match[3]
      end
    end
    @width = params[:width] unless params[:width] == '0'
    @height = params[:height] unless params[:height] == '0'
    if params[:image_file_url]
      @external = Images::External.find_or_create_by_image_url(params[:image_file_url])
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
end
