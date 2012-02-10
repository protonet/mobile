require 'lib/rpc/base'

class Rpc::Objects::Auth < Rpc::Base
  attr_invokable :check_session

  # Validates a session
  # Either checks a given session_id or a given communication token + user_id
  def check_session params, user, &handler
    if !user
      if params.include?('session_id')
        # session_id given
        verifier = ActiveSupport::MessageVerifier.new(SystemPreferences.session_secret, 'SHA1')
        p verifier.verify(params['session_id'])
        params['user_id'] = verifier.verify(params['session_id'])["warden.user.user.key"][1][0] rescue nil
        return handler.call nil, false unless user = User.find_by_id(params['user_id'])
      else
        # Find the acclaimed user
        return handler.call nil, false unless user = User.find_by_id(params['user_id'])

        # Verify the communication token
        return handler.call nil, false unless user.communication_token_valid?(params['token'])
      end
    end
    
    # If a channel_id is specified, check that as well
    if params.include?('channel_id')
      subscribed = user.channels.verified.map(&:id)
      return handler.call nil, false unless subscribed.include? params['channel_id'].to_i
    end
    
    # Passed all tests. You shalt pass
    handler.call nil, true
  end
end
