module CommonModels
  class Goal < ActiveRecord::Base
    FIELDS = [:title, :description, :value]

    self.table_name = 'project_service.goals'
    belongs_to :project
    belongs_to :platform
    store_accessor :data, FIELDS
    validates_presence_of FIELDS
    validates_numericality_of :value, greater_than: 9, allow_blank: true
  end
end
