# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectDecorator do
  let(:project) { create(:project, about_html: 'Foo Bar http://www.foo.bar <javascript>xss()</javascript>"Click here":http://click.here') }

  describe '#time_to_go' do
    let(:project) { create(:project, state: 'draft', online_days: nil, mode: 'flex') }
    subject { project.time_to_go }
    before do
      I18n.locale = :pt
    end

    context 'when there is more than 1 day to go but less than 2' do
      before { project.update(expires_at:  Time.zone.now + 25.hours) }

      it { is_expected.to eq({ time: 1, unit: 'dia' }) }
    end

    context 'when there is less than 1 day to go' do
      before { project.update(expires_at:  Time.zone.now + 13.hours) }

      it { is_expected.to eq({ time: 13, unit: 'horas' }) }
    end

    context 'when there is less than 1 hour to go' do
      before { project.update(expires_at:  Time.zone.now + 59.minutes) }

      it { is_expected.to eq({ time: 59, unit: 'minutos' }) }
    end
  end

  describe '#progress' do
    subject { project.progress }
    let(:pledged) { 0.0 }
    let(:goal) { 0.0 }
    before do
      allow(project).to receive(:pledged).and_return(pledged)
      allow(project).to receive(:goal).and_return(goal)
    end

    context 'when goal == pledged > 0' do
      let(:goal) { 10.0 }
      let(:pledged) { 10.0 }
      it { is_expected.to eq(100) }
    end

    context 'when goal is > 0 and pledged is 0.0' do
      let(:goal) { 10.0 }
      it { is_expected.to eq(0) }
    end

    context 'when goal is 0.0 and pledged > 0.0' do
      let(:pledged) { 10.0 }
      it { is_expected.to eq(0) }
    end

    context 'when goal is 0.0 and pledged is 0.0' do
      it { is_expected.to eq(0) }
    end
  end

  describe '#display_expires_at' do
    subject { project.display_expires_at }

    context 'when online_at is nil' do
      let(:project) { create(:project, state: 'draft') }
      it { is_expected.to eq('') }
    end

    #TODO fixme
    #context 'when we have an online_date' do
      #let(:start_date) { DateTime.now.in_time_zone('Brasilia') }
      #let(:project) do
        #create_project(
          #{ state: 'online', online_days: 2 }, { to_state: 'online', created_at: start_date }
        #)
      #end
      #it { is_expected.to eq(I18n.l((start_date + 2.days).in_time_zone('Brasilia').end_of_day.to_date)) }
    #end
  end

  describe '#display_image' do
    subject { project.display_image }

    context 'when we have a video_url without thumbnail' do
      before do
        stub_request(:any, 'https://vimeo.com/17298435')
          .to_return(body: file_fixture('vimeo_default_request.txt'))
      end

      let(:project) { build(:project, state: 'draft', uploaded_image: nil, video_thumbnail: nil) }
      it { is_expected.to eq(project.video.thumbnail_large) }
    end

    context 'when we have a video_thumbnail' do
      let(:project) { build(:project, state: 'draft', uploaded_image: nil, video_thumbnail: File.open('spec/fixtures/files/image.png')) }
      it { is_expected.to eq(project.video_thumbnail.project_thumb.url) }
    end

    context 'when we have an uploaded_image' do
      let(:project) { build(:project, state: 'draft', uploaded_image: File.open('spec/fixtures/files/image.png'), video_thumbnail: nil) }
      it { is_expected.to eq(project.uploaded_image.project_thumb.url) }
    end
  end

  describe '#display_card_status' do
    subject { project.display_card_status }
    context 'when online and reached goal' do
      before do
        allow(project).to receive(:state).and_return('online')
        allow(project).to receive(:reached_goal?).and_return(true)
      end
      it { is_expected.to eq('reached_goal') }
    end
    context 'when online and have not reached goal yet' do
      before do
        allow(project).to receive(:state).and_return('online')
        allow(project).to receive(:reached_goal?).and_return(false)
      end
      it { is_expected.to eq('not_reached_goal') }
    end
    context 'when failed' do
      before do
        allow(project).to receive(:state).and_return('failed')
      end
      it { is_expected.to eq('failed') }
    end
    context 'when successful' do
      before do
        allow(project).to receive(:state).and_return('successful')
      end
      it { is_expected.to eq('successful') }
    end
    context 'when waiting funds' do
      before do
        allow(project).to receive(:state).and_return('waiting_funds')
      end
      it { is_expected.to eq('waiting_funds') }
    end
  end

  describe '#display_status' do
    subject { project.display_status }
    context 'when online' do
      before do
        allow(project).to receive(:state).and_return('online')
      end
      it { is_expected.to eq('online') }
    end
    context 'when failed' do
      before do
        allow(project).to receive(:state).and_return('failed')
      end
      it { is_expected.to eq('failed') }
    end
    context 'when successful' do
      before do
        allow(project).to receive(:state).and_return('successful')
      end
      it { is_expected.to eq('successful') }
    end
    context 'when waiting funds' do
      before do
        allow(project).to receive(:state).and_return('waiting_funds')
      end
      it { is_expected.to eq('waiting_funds') }
    end
  end

  describe '#status_flag' do
    let(:project) { create(:project) }

    context 'When the project is successful' do
      it 'should return a successful image flag when the project is successful' do
        allow(project).to receive(:successful?).and_return(true)

        expect(project.status_flag).to include("successful.#{I18n.locale}")
      end
    end

    context 'When the project was not successful' do
      it 'should return a not successful image flag when the project is not successful' do
        allow(project).to receive(:failed?).and_return(true)

        expect(project.status_flag).to include("not_successful.#{I18n.locale}")
      end
    end

    context 'When the project is in waiting funds' do
      it 'should return a waiting funds image flag when the project is waiting funds' do
        allow(project).to receive(:waiting_funds?).and_return(true)

        expect(project.status_flag).to include("waiting_confirmation.#{I18n.locale}")
      end
    end
  end
end
