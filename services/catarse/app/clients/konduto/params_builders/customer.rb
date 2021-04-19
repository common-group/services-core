module Konduto
  module ParamsBuilders
    class Customer
      attr_reader :user

      ATTRIBUTES = %i[id name email dob tax_id phone1 created_at].freeze

      def initialize(user)
        @user = user
      end

      def build
        ATTRIBUTES.index_with { |attribute| send(attribute) }
      end

      def id
        user.id.to_s
      end

      def name
        user.name.to_s[0..99]
      end

      def email
        user.email.to_s[0..99]
      end

      def dob
        user.birth_date.try(:iso8601)
      end

      def tax_id
        user.unformatted_document
      end

      def phone1
        user.phone_number.to_s[0..99]
      end

      def created_at
        user.created_at.to_date.iso8601
      end
    end
  end
end
