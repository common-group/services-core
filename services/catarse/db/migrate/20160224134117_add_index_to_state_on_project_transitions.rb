class AddIndexToStateOnProjectTransitions < ActiveRecord::Migration[4.2]
  def up
    execute <<-SQL
CREATE INDEX to_state_project_tran_idx ON public.project_transitions ( to_state );
CREATE INDEX to_state_flex_project_tran_idx ON public.flexible_project_transitions ( to_state );
    SQL
  end

  def down
    execute <<-SQL
DROP INDEX to_state_project_tran_idx;
DROP INDEX to_state_flex_project_tran_idx;
    SQL
  end
end
