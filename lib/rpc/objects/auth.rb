require 'lib/rpc/base'

class Rpc::Objects::Auth < Rpc::Base
  attr_invokable :check_token

  # Checks a user_id and token to ensure that the combination is valid.
  # Basically represents our version of SSO-like authentication.
  def check_token params
    # Find the acclaimed user
    return false unless user = User.find_by_id(params['user_id'])

    # Verify the communication token
    return false unless user.communication_token_valid?(params['token'])

    # If a channel_id is specified, check that as well
    if params.include?('channel_id')
      subscribed = user.channels.verified.map(&:id)
      return false unless subscribed.include? params['channel_id'].to_i
    end

    # Passed all tests. You shalt pass
    true
  end
end
