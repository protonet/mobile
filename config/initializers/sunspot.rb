Sunspot.session = Sunspot::IndexQueue::SessionProxy.new


# Queue implementation backed by ActiveRecord
Sunspot::IndexQueue::Entry.implementation = :active_record

