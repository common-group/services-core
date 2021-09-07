class AddUuidRefToContributions < ActiveRecord::Migration[6.1]
  def change
    add_column :contributions, :uuid_ref, :uuid, null: false, index: { unique: true }, default: 'gen_random_uuid()'
  end
end
