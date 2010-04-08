#!/usr/bin/env ruby
# this is here to make sure environment.rb doens't recreate the EventMachine Loop
RUN_FROM_DISPATCHER = true
require File.dirname(__FILE__) + '/../../config/environment'
require 'xmpp4r'
require 'xmpp4r-simple'
require 'xmpp4r/muc/helper/simplemucclient'

configatron.messaging_bus_active = true

jabber = Jabber::Simple.new("xe.bot@im.xing.com", 'vv7/äÖ5!')

askrails = Jabber::MUC::SimpleMUCClient.new(jabber.client)
askrails.join("askrails@conference.im.xing.com/robot")

cp = Jabber::MUC::SimpleMUCClient.new(jabber.client)
cp.join("cp@conference.im.xing.com/robot")


EM.run do

  amq = MQ.new
  channel_queue = amq.queue("consumer-jabber-bridge", :auto_delete => true)
  channel_queue2 = amq.queue("consumer-jabber-bridge2", :auto_delete => true)

  channel_queue.bind(amq.topic("channels"), :key => "channels.a#{4}").subscribe do |msg|
    message = JSON(msg)
    askrails.say("#{message["author"]}{p}: #{message["message"]}") unless message["author"].match(/\{x\}/)
  end

  channel_queue2.bind(amq.topic("channels"), :key => "channels.a#{16}").subscribe do |msg|
    message = JSON(msg)
    cp.say("#{message["author"]}{p}: #{message["message"]}") unless message["author"].match(/\{x\}/)
  end
  
  EM::PeriodicTimer.new(1) do

    cp.on_message do |time,nick,msg|
      user_name = user_from_nickname(nick)
      if(!time && !msg.match(/\{p\}/)) && !msg.match(/\{x\}/)
        begin
          user = User.find_by_login(user_name)
          tweet = Tweet.new({:author => "#{user_name}{x}", :user => user, :channels => Channel.find([16]), :message => msg.to_s})
          tweet.socket_id = '0'
          tweet.save
        rescue Exception => e
          puts "BAM!"
          puts e.inspect
        end
      end
    end

    askrails.on_message do |time,nick,msg|
      user_name = user_from_nickname(nick)
      if(!time && !msg.match(/\{p\}/)) && !msg.match(/\{x\}/)
        begin
          user = User.find_by_login(user_name)
          tweet = Tweet.new({:author => "#{user_name}{x}", :user => user, :channels => Channel.find([4]), :message => msg.to_s})
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

def user_from_nickname(nick)
  nick.downcase!
  [{
    'Wolfram Müller-Grabellus' => 'wolfram.mgrabellus',
    'Ralph von der Heyden'     => 'ralph.heyden',
    'ü' => 'ue',
    'ö' => 'oe',
    'ä' => 'ae'
  }].each do |k,v|
    nick.sub!(k, v)
  end
  
  nick.gsub(/ /, '.')
end