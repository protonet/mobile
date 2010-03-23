#!/usr/bin/env ruby
# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true
require File.dirname(__FILE__) + '/../../config/environment'
require 'xmpp4r'
require 'xmpp4r-simple'
require 'xmpp4r/muc/helper/simplemucclient'

configatron.messaging_bus_active = true

jabber = Jabber::Simple.new("ali.jelveh@im.xing.com", ENV["DUDE"])

muc = Jabber::MUC::SimpleMUCClient.new(jabber.client)
muc.join("test@conference.im.xing.com/robot")

EM.run do
  
  amq = MQ.new
  channel_queue = amq.queue("consumer-jabber-bridge", :auto_delete => true)
  channel_queue.bind(amq.topic("channels"), :key => "channels.a#{1}").subscribe do |msg|
    message = JSON(msg)
    muc.say("#{message["author"]}{p}: #{message["message"]}") unless message["author"].match(/\{x\}/)
  end
  
  EM::PeriodicTimer.new(1) do
    muc.on_message do |time,user_name,msg|
      
      if(!time && !msg.match(/\{p\}/)) && !msg.match(/\{x\}/)
        begin
          user = User.find_by_login(user_name)
          tweet = Tweet.new({:author => "#{user_name}{x}", :user => user, :channels => Channel.find([1]), :message => msg.to_s})
          tweet.socket_id = '0'
          tweet.save
        rescue Exception => e
          puts "BAM!"
          puts e.inspect
        end
      end
      
    end
  end
end