# coding: utf-8
# frozen_string_literal: true

require 'spec_helper.rb'
require "shoulda/matchers"

RSpec.describe CommonModels::Project, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to :user }
    it { is_expected.to belong_to :platform }
  end

  describe 'validations' do
    %w[name user].each do |field|
      it { is_expected.to validate_presence_of field }
    end
    it { is_expected.to allow_value(10).for(:goal) }
    it { is_expected.not_to allow_value(8).for(:goal) }
    it { is_expected.to validate_length_of(:headline).is_at_most(CommonModels::Project::HEADLINE_MAXLENGTH) }
    it { is_expected.to allow_value('testproject').for(:permalink) }
    it { is_expected.to allow_value('test-project').for(:permalink) }
    it { is_expected.not_to allow_value('agua.sp.01').for(:permalink) }
  end

end
