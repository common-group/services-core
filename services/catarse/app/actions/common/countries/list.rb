# frozen_string_literal: true

module Common
  module Countries
    class List < Actor
      output :countries, type: Array

      def call
        self.countries = ISO3166::Country.translations.map { |attr| { code: attr.first, name: attr.last } }
      end
    end
  end
end
