# frozen_string_literal: true

require "rails_helper"

RSpec.describe Catarse::Atom::ButtonComponent, type: :component do
  let(:label) { 'Button Label' }
  let(:type) { 'primary' }
  
  subject(:rendered) { render_inline(described_class.new(label: label, type: type)) }

  it 'renders with the label informed' do
    expect(rendered.to_html).to include label
  end

  it 'renders the type informed' do
    expect(rendered.to_html).to include type
  end
end
