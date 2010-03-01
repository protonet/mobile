class Images::ExternalsController < ApplicationController
  caches_page :show
  def show
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

end
