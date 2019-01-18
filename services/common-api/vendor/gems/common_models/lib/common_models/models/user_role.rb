# coding: utf-8
module CommonModels
    class UserRole < ActiveRecord::Base
      self.table_name = 'community_service.user_roles'
      belongs_to :platform
      belongs_to :user

      attr_accessor :platform, :role
    end
  end
  