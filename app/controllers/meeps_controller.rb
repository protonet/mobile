class MeepsController < ApplicationController
  include Rabbit
  
  filter_resource_access :collection => [:sync], :additional_member => [:before, :after]
  
  # request: { :channel_states => { 1 => 123123, 2 => 213123 } }
  # response: { 1 => [{ :message => 'foo bar' }, { :message => 'foo bar' }], 2 => [{ :message => 'foo bar' }] }
  def sync
    result = {}
    channel_states = params[:channel_states] || {}
    current_user.channels.each do |channel|
      channel_state = channel_states[channel.id.to_s]
      if channel_state
        meeps = channel.meeps.includes(:user).all(:conditions => ["meeps.id > ?", channel_state], :order => "meeps.id ASC", :limit => 100)
        result[channel.id] = Meep.prepare_many_for_frontend(meeps, { :channel_id => channel.id })
      elsif channel.has_unread_meeps
        publish "users", current_user.id, {
          :trigger    => "channel.load",
          :channel_id => channel.id
        }
      end
    end
    
    render :json => result
  end

  def show
    respond_to do |format|
      format.html {
        render
      }
      format.json {
        @meep = Meep.prepare_for_frontend(@meep, { :channel_id => @meep.channel.id })
        render :json => @meep.to_json
      }
    end
  end
  
  def before
    render :json => Meep.prepare_many_for_frontend(@meep.before(params[:count]), { :channel_id => @meep.channel.id })
  end
  
  def after
    render :json => Meep.prepare_many_for_frontend(@meep.after(params[:count]), { :channel_id => @meep.channel.id })
  end
  
  def destroy
    @meep.destroy
    head 204
  end
  
  private
    def handle_attached_files(meep_data, channel_id)
      text_extension = JSON.parse(meep_data['text_extension']) rescue nil

      success
    end
  
end