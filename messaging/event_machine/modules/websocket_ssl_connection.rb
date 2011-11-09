class WebsocketSslConnection < WebsocketConnection

  def post_init(*args)
    path  = Rails.env.production? ? "#{configatron.shared_file_path}/config/protonet.d" : "#{Rails.root}/config/ssl"
    key   = "#{path}/local.protonet.info.key"
    cert  = "#{path}/local.protonet.info.crt"
    start_tls(:private_key_file => key, :cert_chain_file => cert, :verify_peer => false)
    super
  end

end
