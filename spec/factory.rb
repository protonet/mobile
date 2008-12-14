# user fixtures
User.fixture(:complete) {{
  :login                => (login = /\w+/.gen),
  :email                => "#{name}@example.com",
  :password             => (password = /\w+/.gen),
  :pasword_confirmation => password
}}
  
User.fixture {{
  :login                => (login = /\w+/.gen),
  :password             => "#{login}@example.com"
}}

# chat room fixtures
ChatRoom.fixture {{
  :name                 => (name = /\w+/.gen)
}}

# chat message fixtures
ChatMessage.fixture {{
  :text                 => (text = /\w+/.gen)
}}

# assets fixtures
Asset.fixture {{
  :filename             => (filename = /\w+/.gen),
  :content_type         => (content_type = /\w+/.gen),
  :size                 => (size = /\d+/.gen)
}}