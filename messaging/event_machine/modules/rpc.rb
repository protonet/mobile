class RPC
  include Rabbit
  
  def initialize
    bind 'rpc', 'requests' do |json|
      p json
      method, params = json['method'], json['params']
      
      case method
      when 'check_auth':
        
        # Find the claimed user
        user = User.find_by_id(params['user_id'])
        
        # Verify the communication token
        valid = user && user.communication_token_valid?(params['token'])
        
        puts "Result: #{valid.inspect}"
        
        # Send the result boolean back
        publish 'rpc', 'responses', json.merge(:result => valid)
        
      end
      
    end
  end
end
      