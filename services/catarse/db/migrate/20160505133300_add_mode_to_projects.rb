class AddModeToProjects < ActiveRecord::Migration[4.2]
  def change
    add_column :projects, :mode, :text, null: false, default: 'aon'
  end
end
