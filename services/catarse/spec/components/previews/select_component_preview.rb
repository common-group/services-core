# frozen_string_literal: true

class SelectComponentPreview < ViewComponent::Preview
  def default
    render Catarse::Atom::SelectComponent.new
  end
end
