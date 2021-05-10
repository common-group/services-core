# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Catarse::V2::Helpers::RequestHelpers, type: :api do
  subject(:dummy) do
    dummy_class = Class.new do
      attr_accessor :env

      include Catarse::V2::Helpers::RequestHelpers
    end

    dummy_class.new
  end

  describe '#raw_request_body' do
    let(:file_content) { Faker::Lorem.paragraph }
    let(:rack_request_form_input) do
      file = Tempfile.new
      file << file_content
      file.rewind
      file
    end

    before { dummy.env = { Grape::Env::RACK_REQUEST_FORM_INPUT => rack_request_form_input } }

    after do
      rack_request_form_input.close
      rack_request_form_input.unlink
    end

    it 'returns content from rack request form input file' do
      expect(dummy.raw_request_body).to eq file_content
    end

    it 'rewinds rack request form input file' do
      dummy.raw_request_body
      expect(rack_request_form_input.read).not_to be_blank
    end
  end
end
