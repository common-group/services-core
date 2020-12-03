class CreateProjectStates < ActiveRecord::Migration[4.2]
  def up
    execute <<-SQL
    CREATE TYPE public.project_state_order AS ENUM ('archived', 'created', 'sent', 'publishable', 'published', 'finished');
    CREATE TABLE public.project_states (
      state text primary key,
      state_order project_state_order not null
    );
    INSERT INTO public.project_states (state, state_order) VALUES
    ('deleted', 'archived'),
    ('rejected', 'created'),
    ('draft', 'created'),
    ('in_analysis', 'sent'),
    ('approved', 'publishable'),
    ('online', 'published'),
    ('waiting_funds', 'published'),
    ('failed', 'finished'),
    ('successful', 'finished');
    ALTER TABLE public.projects ADD FOREIGN KEY (state) REFERENCES public.project_states (state);
    ALTER TABLE public.projects ALTER state SET NOT NULL;
    ALTER TABLE public.projects ALTER state SET DEFAULT 'draft';
    SQL
  end

  def down
    execute <<-SQL
    DROP TABLE public.project_states CASCADE;
    DROP TYPE public.project_state_order CASCADE;
    SQL
  end
end
