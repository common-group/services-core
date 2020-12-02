class MigrateGoals < ActiveRecord::Migration[4.2]
  def change
    execute <<-SQL
        WITH project_goals AS (
              select * from  projects
              )
            INSERT INTO goals
                (project_id,description, value)
              select id, ''::text, goal from project_goals
    SQL
  end
end
