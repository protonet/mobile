module Rpc; end

# Class for making RPC requests over RabbitMQ.
class Rpc::Client
  include Rabbit

  attr_accessor :request_queue
  attr_reader :handlers, :seq

  def initialize request_queue='requests'
    @request_queue = request_queue
    @handlers ||= {}
    @seq = -1

    bind_response_queue
  end

  def seq!
    @seq += 1
  end

  def call object, method, params={}, data={}, &handler
    data.merge!(
      :object => object,
      :method => method,
      :params => params,
      :queue => queue_id,
      :seq => seq!
    )

    @handlers[@seq] = handler

    publish 'rpc', @request_queue, data
  end

  def bind_response_queue
    bind 'rpc', queue_id do |data|
      if @handlers[data['seq']]
        @handlers.delete(data['seq']).call(data)
      else
        _log "Received stray RPC response (seq #{data['seq']}); ignoring"
      end
    end
  end
end
