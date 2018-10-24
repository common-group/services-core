module CommonModels
  class Reward < ActiveRecord::Base
    self.table_name = 'project_service.rewards'
    FIELDS = [:minimum_value, :title, :description, :maximum_contributions, :row_order, :deliver_at, :shipping_options, :welcome_message_subject, :welcome_message_body]
    store_accessor :data, FIELDS

    belongs_to :project
    has_one :survey
    has_many :payments, through: :contributions
    has_many :contributions, dependent: :nullify
  end
end
