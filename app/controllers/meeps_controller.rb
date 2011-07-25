class MeepsController < ApplicationController
  
  def index
    channel = Channel.where(:id => params[:channel_id]).first
    
    if    params[:last_id] && channel
      meeps = channel.meeps.all(:conditions => ["meeps.id < ?", params[:last_id]], :order => "meeps.id DESC", :limit => 25)
    elsif params[:first_id] && channel
      meeps  = channel.meeps.all(:conditions => ["meeps.id > ?", params[:first_id]], :order => "meeps.id DESC", :limit => 100)
    else
      meeps  = []
    end
    
    render :json => Meep.prepare_for_frontend(meeps, { :channel_id => channel.id })
  end
  
  # request: { :channel_states => { 1 => 123123, 2 => 213123 } }
  # response: { 1 => [{ :message => 'foo bar' }, { :message => 'foo bar' }], 2 => [{ :message => 'foo bar' }] }
  def sync
    result = {}
    params[:channel_states].each do |channel_id, first_meep_id|
      channel = Channel.find(channel_id)
      result[channel_id] = Meep.prepare_for_frontend(
        channel.meeps.all(:conditions => ["meeps.id > ?", first_meep_id], :order => "meeps.id ASC", :limit => 100),
        { :channel_id => channel_id }
      )
    end
    render :json => result
  end

  def new
  end

  def show
    meep = Meep.find(params[:id])
    return head(404) if meep.nil?
    render :json => Meep.prepare_for_frontend([meep], { :channel_id => meep.channels.first.id }).first
  end
  
  def before
    meep = Meep.find(params[:id]) rescue head(404)
    return head(404) if meep.nil?
    render :json => Meep.prepare_for_frontend(meep.before(params[:count]), { :channel_id => meep.channels.first.id })
  end
  
  def after
    meep = Meep.find(params[:id])
    return head(404) if meep.nil?
    render :json => Meep.prepare_for_frontend(meep.after(params[:count]), { :channel_id => meep.channels.first.id })
  end
  
  def create
    channel_id = params[:meep].delete(:channel_id)
    params[:meep].reject! {|k,v| !Meep.valid_attributes.include?(k)}
    
    author = current_user.display_name
    
    # TODO: Restrict user from posting to channels he has not subscribed or is not verified to post to
    
    # current user is nil when not logged in, that's ok
    @meep = Meep.create!(params[:meep].merge({:author => author, :user => current_user, :channel_ids => [channel_id] }))
    
    respond_to do |format|
      format.js  { render :text => @meep.id }
      format.html { redirect_to :controller => :instruments, :channel_id => channel_id }
    end
  end
  
end