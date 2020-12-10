class FixNotificationGrants < ActiveRecord::Migration[4.2]
  def change
    execute <<-SQL
      grant all ON contribution_notifications to web_user;
      grant all ON contribution_notifications to admin;
    SQL
  end
end
