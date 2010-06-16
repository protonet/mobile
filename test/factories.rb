Factory.define :user do |u|
  u.login { Random.firstname }
  u.password              123456
  u.password_confirmation 123456
end

Factory.define :channel do |c|
  c.name { Random.city }
end