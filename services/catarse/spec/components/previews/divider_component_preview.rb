# frozen_string_literal: true

class DividerComponentPreview < ViewComponent::Preview

  def horizontal
    render Catarse::Atom::DividerComponent.new(orientation: 'horizontal')
  end

  def vertical
    render Catarse::Atom::DividerComponent.new(orientation: 'vertical')
  end
end
