class CreateProjectIntegrations < ActiveRecord::Migration[4.2]
  def change
    create_table :project_integrations do |t|
      t.string :name
      t.json :data
      t.belongs_to :project, foreign_key: true
      t.timestamps null: false
    end
  end
end
