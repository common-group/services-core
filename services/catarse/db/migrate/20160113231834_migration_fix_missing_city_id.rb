class MigrationFixMissingCityId < ActiveRecord::Migration[4.2]
  def up
    execute <<-SQL
    SET statement_timeout TO 0;
    SQL
    execute <<-SQL
-- Old data won't be validated here
ALTER TABLE projects DISABLE TRIGGER sent_validation;

-- Catch all for remaining cities (uses SP for is the highest probability of being correct)
UPDATE projects
SET city_id = 5274
WHERE
    city_id IS NULL
    AND projects.state_order >= 'sent';
ALTER TABLE projects ENABLE TRIGGER sent_validation;
    SQL
  end

  def down
  end
end
