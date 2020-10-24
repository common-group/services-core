class RemoveImageUrlFromProjects < ActiveRecord::Migration[4.2]
  def up
    execute "ALTER TABLE projects DROP IF EXISTS image_url;"
  end

  def down
    add_column :projects, :image_url, :string
  end
end
