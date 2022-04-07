require 'spec_helper'

describe CatarseSettingsDb::Setting do
  before do
    @config = CatarseSettingsDb::Setting.new(name: 'a_config', value: 'a_value')
  end

  it{ should validate_presence_of :name }

  it "should be valid from factory" do
    expect(@config).to be_valid
  end

  context "#get_without_cache" do
    before do
      @config.save
      CatarseSettingsDb::Setting.create(name: 'other_config', value: 'another_value')
    end

    it "should get config" do
      expect(CatarseSettingsDb::Setting.get_without_cache(:a_config)).to eq 'a_value'
    end
  end

  context "#get" do
    before do
      @config.save
      CatarseSettingsDb::Setting.create(name: 'other_config', value: 'another_value')
    end

    it "should get config" do
      expect(CatarseSettingsDb::Setting[:a_config]).to eq 'a_value'
    end

    it "should return nil when not founf" do
      expect(CatarseSettingsDb::Setting[:not_found_config]).to be_nil
    end

    it "should return array" do
      expect(CatarseSettingsDb::Setting[:a_config, :other_config]).to eq ['a_value', 'another_value']
    end
  end

end
