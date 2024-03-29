# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Authorization, type: :model do
  let(:oauth_data) do
    Hashie::Mash.new({
                       credentials: {
                         expires: true,
                         expires_at: 1_366_644_101,
                         token: 'AAAHuZCwF61OkBAOmLTwrhv52pZCriPnTGIasdasdasdascNhZCZApsZCSg6POZCQqolxYjnqLSVH67TaRDONx72fXXXB7N7ZBByLZCV7ldvagm'
                       },
                       extra: {
                         raw_info: {
                           bio: 'I, simply am not there',
                           email: 'diogob@gmail.com',
                           first_name: 'Diogo',
                           gender: 'male',
                           id: '547955110',
                           last_name: 'Biazus',
                           link: 'http://www.facebook.com/diogo.biazus',
                           locale: 'pt_BR',
                           name: 'Diogo, Biazus',
                           timezone: -3,
                           updated_time: '2012-08-01T18:22:50+0000',
                           username: 'diogo.biazus',
                           verified: true
                         }
                       },
                       info: {
                         description: 'I, simply am not there',
                         email: 'diogob@gmail.com',
                         first_name: 'Diogo',
                         image: 'http://graph.facebook.com/547955110/picture?type:, square',
                         last_name: 'Biazus',
                         name: 'Diogo, Biazus',
                         urls: {
                           Facebook: 'http://www.facebook.com/diogo.biazus'
                         },
                         verified: true
                       },
                       provider: 'facebook',
                       uid: '547955110'
                     })
  end

  describe 'Associations' do
    it { is_expected.to belong_to :user }
    it { is_expected.to belong_to :oauth_provider }
  end

  describe 'Validations' do
    it { is_expected.to validate_presence_of :oauth_provider }
    it { is_expected.to validate_presence_of :user }
    it { is_expected.to validate_presence_of :uid }

    before do
      create(:authorization)
    end

    it { is_expected.to validate_uniqueness_of(:uid).scoped_to(:oauth_provider_id) }
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:oauth_provider_id) }
  end

  describe '.find_from_hash' do
    before do
      provider = create(:oauth_provider, name: oauth_data[:provider])
      @authotization = create(:authorization, oauth_provider: provider, uid: oauth_data[:uid])
      create(:authorization, oauth_provider: provider)
    end
    subject { Authorization.find_from_hash(oauth_data) }
    it { is_expected.to eq(@authotization) }
  end

  describe '.create_from_hash' do
    before do
      create(:oauth_provider, name: oauth_data[:provider])
      stub_request(:get, 'https://graph.facebook.com/v9.0/547955110/picture?type=large').to_return(status: 200)
    end

    subject { Authorization.create_from_hash(oauth_data, user) }
    context 'when user exists' do
      let(:user) { create(:user, email: oauth_data['info']['email']) }
      it { is_expected.to be_persisted }
      it { expect(subject.uid).to eq oauth_data['uid'] }
      it { expect(subject.user).to eq user }
    end

    context 'when user is new' do
      let(:user) {}
      it { is_expected.to be_persisted }
      it { expect(subject.uid).to eq oauth_data['uid'] }
      it { expect(subject.user).to be_persisted }
    end
  end
end
