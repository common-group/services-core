module CommonModels
  class Contribution < ActiveRecord::Base
    self.table_name = 'payment_service.contributions'
    belongs_to :platform
    belongs_to :project
    belongs_to :reward
    belongs_to :shipping_fee
    belongs_to :user
    belongs_to :address
    belongs_to :origin
    has_many :catalog_payments
    accepts_nested_attributes_for :address, allow_destroy: true, limit: 1 #payment address

    validates_presence_of :project, :user, :value
    validates_numericality_of :value, greater_than_or_equal_to: 10.00
    validate :banned_user_validation, :on => :update

    scope :not_anonymous, -> { where(anonymous: false) }

    scope :ordered, -> { order(id: :desc) }
    scope :was_confirmed, -> { where('payment_service.was_confirmed(contributions.*)') }
    scope :is_confirmed, -> { where('payment_service.is_confirmed(contributions.*)') }
    delegate :address_city, :country_id, :state_id, :state, :phone_number, :country, :state, :address_complement, :address_neighbourhood, :address_zip_code, :address_street, :address_number, :address_state, to: :address, allow_nil: true

    # contributions that have not confirmed delivery after 14 days
    def self.need_notify_about_delivery_confirmation
      where("reward_received_at IS NULL AND reward_sent_at < current_timestamp - '14 days'::interval")
    end

    def international?
      (country || user.country).try(:name) != 'Brasil'
    end

    def change_reward!(reward)
      self.reward_id = reward
      save
    end

    def confirmed?
      @confirmed ||= CommonModels::Contribution.where(id: id).pluck('payment_service.is_confirmed(contributions.*)').first
    end

    def was_confirmed?
      @was_confirmed ||= CommonModels::Contribution.where(id: id).pluck('payment_service.was_confirmed(contributions.*)').first
    end

    # Used in payment engines
    def price_in_cents
      (value * 100).round
    end
  end
end
