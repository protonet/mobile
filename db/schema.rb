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

ActiveRecord::Schema.define(:version => 20100104184406) do

  create_table "assets", :force => true do |t|
    t.string   "filename"
    t.string   "content_type"
    t.integer  "size"
    t.integer  "download_counter"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "channels", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "images_avatars", :force => true do |t|
    t.string   "name"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "listens", :force => true do |t|
    t.integer  "channel_id"
    t.integer  "user_id"
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
  end

  create_table "says", :force => true do |t|
    t.integer  "channel_id"
    t.integer  "tweet_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "tweets", :force => true do |t|
    t.integer  "user_id"
    t.string   "author"
    t.text     "message"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "text_extension"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                          :limit => 40
    t.string   "name",                           :limit => 100, :default => ""
    t.string   "email",                          :limit => 100
    t.string   "crypted_password",               :limit => 40
    t.string   "salt",                           :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",                 :limit => 40
    t.datetime "remember_token_expires_at"
    t.string   "communication_token"
    t.datetime "communication_token_expires_at"
    t.string   "temporary_identifier"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

end
