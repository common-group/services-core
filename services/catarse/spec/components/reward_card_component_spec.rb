# frozen_string_literal: true

require "rails_helper"

RSpec.describe RewardCardComponent, type: :component do
  subject(:rendered) { render_inline(described_class.new(reward: {})) }

  it 'renders without problems' do
    expect(rendered.to_html).to be_present
  end
end
