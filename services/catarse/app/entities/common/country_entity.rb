# frozen_string_literal: true

module Common
  class CountryEntity < BaseEntity
    expose :alpha2, as: :code

    expose :name do |country|
      country.translation(I18n.locale)
    end
  end
end
