# frozen_string_literal: true

module Catarse
  module Molecule
    class CardComponent < ViewComponent::Base
      renders_one :header, Catarse::Molecule::Card::HeaderComponent
    end
  end
end

