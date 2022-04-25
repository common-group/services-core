# frozen_string_literal: true

class CardComponentPreview < ViewComponent::Preview
  
  def default
    render Catarse::Atom::CardComponent.new
  end
end
