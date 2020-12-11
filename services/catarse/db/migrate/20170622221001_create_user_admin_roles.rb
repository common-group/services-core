class CreateUserAdminRoles < ActiveRecord::Migration[4.2]
  def change
    create_table :user_admin_roles do |t|
      t.references :user, null: false
      t.string :role_label, null: false

      t.timestamps null: false
    end
  end
end
