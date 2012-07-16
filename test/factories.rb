FactoryGirl.define do
  factory :user do
    login                 { Faker::Internet.user_name }
    email                 { Faker::Internet.email }
    password              123456
  end

  factory :channel do
    name { Faker::Company.name }
  end

  factory :meep do
    message { Faker::Lorem.sentence }
    user
    channel
  end
end