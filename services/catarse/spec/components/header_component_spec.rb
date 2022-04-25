# frozen_string_literal: true

require "rails_helper"

RSpec.describe HeaderComponent, type: :component do
  subject(:rendered) { render_inline(described_class.new(title: 'Título da Recompensa', price: '20', type: nil, has_image: nil)) }

  it 'renders without problems' do
    expect(rendered.to_html).to be_present
  end
end
