# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project::VideoHandler, type: :model do
  let(:project) { create(:project) }

  describe '#download_video_thumbnail' do
    before do
      expect(project).to receive(:download_video_thumbnail).and_call_original
      expect(project).to receive(:open).and_return(File.open('spec/fixtures/files/image.png'))
      stub_request(:any, 'https://vimeo.com/17298435')
          .to_return(body: file_fixture('vimeo_default_request.txt'))
      project.download_video_thumbnail
    end

    it 'should open the video_url and store it in video_thumbnail' do
      expect(project.video_thumbnail.url).to eq("/uploads/project/video_thumbnail/#{project.id}/image.png")
    end
  end
end
