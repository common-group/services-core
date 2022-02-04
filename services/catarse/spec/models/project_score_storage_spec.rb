# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectScoreStorage, type: :model do
  include Chewy::Rspec::Helpers

  describe 'project_index' do
    let(:hits) do
      [
        {
          '_index' => 'projects',
          '_type' => '_doc',
          '_id' => '1'
        }
      ]
    end

    let(:raw_response) do
      {
        'took' => 4,
        'hits' => {
          'total' => {
            'value' => 1,
            'relation' => 'eq'
          },
          'max_score' => 1.0,
          'hits' => hits
        }
      }
    end

    context 'when project_score_storage is updated' do
      let(:project_score_storage) { create(:project_score_storage) }

      it 'updates project index' do
        mock_elasticsearch_response(ProjectsIndex, raw_response) do
          expect(project_score_storage.update!(score: 5)).to update_index(ProjectsIndex)
        end
      end
    end
  end
end
