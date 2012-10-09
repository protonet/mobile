class User
  attr_reader :id, :login, :email, :password_salt,
    :communication_token

  def initialize(connection, attributes = {})
    @connection = connection
    @id = attributes["id"]
    @login = attributes["login"]
    @email = attributes["email"]
    @communication_token = attributes["communication_token"]
    @password_salt = attributes["password_salt"]
  end

  def subscribed_channels
    @subscribed_channels ||= connection.find_subscribed_channels
  end

  protected
    def connection
      @connection
    end
end