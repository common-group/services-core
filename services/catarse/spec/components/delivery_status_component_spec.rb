# frozen_string_literal: true

require "rails_helper"

RSpec.describe DeliveryStatusComponent, type: :component do
  subject(:rendered) { render_inline(described_class.new(estimated_delivery_time: '', delivery_type: '')) }

  it 'renders without problems' do
    expect(rendered.to_html).to be_present
  end
end
