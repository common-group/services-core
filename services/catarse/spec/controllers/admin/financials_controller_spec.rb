# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Admin::FinancialsController, type: :controller do
  let(:admin) { create(:user, admin: true) }

  before do
    allow(controller).to receive(:current_user).and_return(admin)
  end

  describe 'GET index' do
    context 'as html format' do
      before { get :index, params: { locale: 'pt' } }

      it { is_expected.to render_template :index }
      it { expect(response).to have_http_status(200) }
    end

    context 'as csv format' do
      before { get :index, params: { format: :csv, locale: 'pt' } }

      it { expect(response.content_type).to include 'text/csv' }
      it { expect(response).to have_http_status(200) }
    end
  end

  describe '.collection' do
    let(:project) { create(:project, name: 'Foo Bar Project') }

    context 'when there is a match' do
      before do
        get :index, params: { locale: :pt, name_contains: 'Foo Bar Project' }
      end
      it { expect(assigns(:projects)).to eq([project]) }
    end

    context 'when there is no match' do
      before do
        get :index, params: { locale: :pt, name_contains: 'Other search' }
      end
      it { expect(assigns(:projects)).to eq([]) }
    end
  end
end
