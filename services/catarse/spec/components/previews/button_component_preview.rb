# frozen_string_literal: true

class ButtonComponentPreview < ViewComponent::Preview

  def primary
    render Catarse::Atom::ButtonComponent.new(label: 'Label', type: 'primary')
  end

  def secondary
    render Catarse::Atom::ButtonComponent.new(label: 'Label', type: 'secondary')
  end

  def danger
    render Catarse::Atom::ButtonComponent.new(label: 'Label', type: 'danger')
  end
end
