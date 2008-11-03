migration 1, :create_default_chat_room  do
  up do
    ChatRoom.new(:id => 1, :user_id => 0, :name => 'Lobby').save
  end

  down do
    r = ChatRoom.get(1)
    r.destroy if r
  end
end
