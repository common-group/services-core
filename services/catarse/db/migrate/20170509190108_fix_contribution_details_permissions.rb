class FixContributionDetailsPermissions < ActiveRecord::Migration[4.2]
  def change
    execute <<-SQL
    grant select on "1".contribution_details to admin, web_user, anonymous;
    SQL
  end
end
