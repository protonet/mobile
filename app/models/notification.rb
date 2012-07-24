class Notification < ActiveRecord::Base
  
  belongs_to :actor,  :polymorphic => true
  belongs_to :subject,  :polymorphic => true
  belongs_to :secondary_subject,  :polymorphic => true

  after_create :enqueue_job
  
  def self.deliver_notifications
    pending = all
    pending.group_by(&:subject).each do |subject, notifications|
      notifications.group_by(&:actor).each do |actor, notifications|
        notifications.group_by(&:event_type).each do |event_type, notifications|
          Mailer.send(:"notify_#{event_type}", subject, actor, notifications).deliver
        end
      end
    end
    pending.map(&:destroy)
  end
  
  def enqueue_job
    DelayedJob.create(:command => "Notification.deliver_notifications")
  end
  
end
