require 'faker'
require 'random_data'

Sham.login    { Random.firstname }
Sham.password { Random.alphanumeric(8) }
puts 'test'
User.blueprint do
  login
  password
  password_confirmation { password }
end

# @mm Kaffee?
# 
# 
# im xe (perl)
# > hey dudes (implizit an xe)
#   
# > @perl Hey Luschen (an perl)
# > @perl.
# > @xe
# events maintenance
# > @.new dudes
# @xe
# dudes...
# > @dudes.add lumpi
# > @xe.release! Deploy, epic fail...
# > @ Deploy µ√ ª ©ƒ∂‚åπø⁄†®€∑«
# 
# > @events#encrypt#! 
# 
# > @protonet
# proto
# 
# 
# > @xe.encrypt Hey Dudes, hier das Password: hutzf
# 
# in mm
# in der Nähe gibt es galao
# @galao Wer ist so da?