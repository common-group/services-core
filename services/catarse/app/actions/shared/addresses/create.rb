# frozen_string_literal: true

module Shared
  module Addresses
    class Create < Actor
      input :user, type: User
      input :attributes, type: Hash

      output :address, type: Shared::Address

      def call
        self.address = Shared::Address.create!(attributes.merge(user: user))
      end
    end
  end
end
