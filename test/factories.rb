Factory.define :user do |u|
  u.login { Random.firstname + Random.alphanumeric(5) }
  u.email { Random.email     }
  u.password              123456
  u.password_confirmation 123456
end

Factory.define :channel do |c|
  c.name { Random.city }
end

Factory.define :meep do |t|
  t.message { Faker::Lorem.sentence }
  t.user {|u| u.association(:user) }
  t.channels {|c| [c.association(:channel)]}
end