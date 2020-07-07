class AddChannelIdToUser < ActiveRecord::Migration
  def change
    add_reference :users, :channel, foreign_key: true
  end
end
