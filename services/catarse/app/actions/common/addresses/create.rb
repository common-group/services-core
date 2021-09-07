# frozen_string_literal: true

module Common
  module Addresses
    class Create < Actor
      input :user, type: User
      input :attributes, type: Hash

      output :address, type: Common::Address

      def call
        self.address = Common::Address.create!(attributes.merge(user: user))
      end
    end
  end
end
