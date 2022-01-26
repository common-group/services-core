# frozen_string_literal: true

class Authorization < ApplicationRecord
  belongs_to :user
  belongs_to :oauth_provider

  validates_presence_of :oauth_provider, :user, :uid
  validates :uid, uniqueness: { scope: :oauth_provider_id }
  validates :user_id, uniqueness: { scope: :oauth_provider_id }

  scope :facebook, -> {
    joins(:oauth_provider).where(oauth_providers: { name: 'facebook' })
  }

  scope :google_oauth2, -> {
    joins(:oauth_provider).where(oauth_providers: { name: 'google_oauth2' })
  }

  scope :from_hash, ->(hash) {
    joins(:oauth_provider)
      .where('oauth_providers.name = :name AND uid = :uid', { name: hash[:provider], uid: hash[:uid] })
  }

  def self.find_from_hash(hash)
    from_hash(hash).first
  end

  def self.create_from_hash(hash, user = nil)
    user ||= User.create_from_hash(hash)
    create!(user: user, uid: hash[:uid], oauth_provider: OauthProvider.find_by_name(hash[:provider]))
  end
end
