Factory.define :user do |u|
  u.login { Random.firstname }
end

Factory.define :channel do |c|
  c.name { Random.city }
end