class AddDeliverAtToDonationNotifications < ActiveRecord::Migration[4.2]
  def up
    add_column :donation_notifications, :deliver_at, :timestamp
    execute "ALTER TABLE donation_notifications ALTER deliver_at SET DEFAULT current_timestamp"
  end
end
