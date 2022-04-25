# frozen_string_literal: true

require "rails_helper"

RSpec.describe Catarse::Atom::DividerComponent, type: :component do
  subject(:rendered) { render_inline(described_class.new(orientation: orientation)) }

  context 'when orientation is horizontal' do
    let(:orientation) { 'horizontal' }
    
    it 'renders div with horizontal class' do
      expect(rendered.to_html).to eq '<div class="catarse-divider catarse-divider-horizontal"></div>'
    end
  end

  context 'when orientation is vertical' do
    let(:orientation) { 'vertical' }
    
    it 'renders div with vertical class' do
      expect(rendered.to_html).to eq '<div class="catarse-divider catarse-divider-vertical"></div>'
    end
  end
end
