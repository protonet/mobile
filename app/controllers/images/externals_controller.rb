class Images::ExternalsController < ApplicationController
  
  def show
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
