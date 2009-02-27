require 'faker'
require 'random_data'

Sham.login    { Random.firstname }
Sham.password { Random.alphanumeric(8) }

User.blueprint do
  login
  password
end
