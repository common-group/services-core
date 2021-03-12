# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project::VideoHandler, type: :model do
  let(:project) { create(:project) }
  let(:uuid_regexp) { /[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/ }

  describe '#download_video_thumbnail' do
    before do
      expect(project).to receive(:download_video_thumbnail).and_call_original
      expect(project).to receive(:open).and_return(File.open('spec/fixtures/files/image.png'))
      stub_request(:any, 'https://vimeo.com/17298435')
          .to_return(body: file_fixture('vimeo_default_request.txt'))
      project.download_video_thumbnail
    end

    it 'should open the video_url and store it in video_thumbnail' do
      url_regexp = Regexp.new("/uploads/project/video_thumbnail/#{project.id}/#{uuid_regexp}\.png")
      expect(project.video_thumbnail.url).to match(url_regexp)
    end
  end
end
