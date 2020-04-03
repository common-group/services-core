require 'rails_helper'

RSpec.describe Catarse::V2::Helpers::RequestHelpers, type: :api do
  subject do
    dummy_class = Class.new do
      include Catarse::V2::Helpers::RequestHelpers

      def env; end
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

    before do
      allow(subject).to receive(:env).and_return(
        Grape::Env::RACK_REQUEST_FORM_INPUT => rack_request_form_input
      )
    end

    after do
      rack_request_form_input.close
      rack_request_form_input.unlink
    end

    it 'returns content from rack request form input file' do
      expect(subject.raw_request_body).to eq file_content
    end

    it 'rewinds rack request form input file' do
      subject.raw_request_body
      expect(rack_request_form_input.read).to_not be_blank
    endjhjh
  end
end
