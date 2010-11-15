# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20101101213201) do

  create_table "channels", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "uuid"
    t.integer  "flags",       :default => 1
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "owner_id"
    t.integer  "network_id",  :default => 1
  end

  create_table "images_avatars", :force => true do |t|
    t.string   "name"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "images_externals", :force => true do |t|
    t.text     "image_url"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "listens", :force => true do |t|
    t.integer  "channel_id"
    t.integer  "user_id"
    t.integer  "flags",      :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "networks", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.string   "key"
    t.string   "supernode"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "coupled"
    t.datetime "last_data_exchanged"
    t.string   "uuid"
  end

  create_table "nodes", :force => true do |t|
    t.string   "name"
    t.string   "type"
    t.integer  "network_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "nodes", ["name"], :name => "index_nodes_on_name"
  add_index "nodes", ["network_id"], :name => "index_nodes_on_network_id"

  create_table "says", :force => true do |t|
    t.integer  "channel_id"
    t.integer  "tweet_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "system_preferences", :force => true do |t|
    t.string   "var",                       :null => false
    t.text     "value"
    t.integer  "object_id"
    t.string   "object_type", :limit => 30
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "system_preferences", ["object_type", "object_id", "var"], :name => "index_system_preferences_on_object_type_and_object_id_and_var", :unique => true

  create_table "tweets", :force => true do |t|
    t.integer  "user_id"
    t.string   "author"
    t.text     "message"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "text_extension"
    t.integer  "network_id",     :default => 1
  end

  create_table "users", :force => true do |t|
    t.string   "login",                          :limit => 40
    t.string   "name",                           :limit => 100, :default => ""
    t.string   "email",                          :limit => 100
    t.string   "encrypted_password",             :limit => 128, :default => "",    :null => false
    t.string   "password_salt",                                 :default => "",    :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",                 :limit => 40
    t.string   "communication_token"
    t.datetime "communication_token_expires_at"
    t.string   "temporary_identifier"
    t.boolean  "admin",                                         :default => false
    t.boolean  "guest",                                         :default => true
    t.datetime "remember_created_at"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

end
