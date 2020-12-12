# coding: utf-8
# frozen_string_literal: true

class User < ApplicationRecord
  acts_as_token_authenticatable

  include I18n::Alchemy
  include Users::OmniauthHandler
  include Users::CustomValidators
  include Shared::CommonWrapper

  has_notifications
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  # :validatable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :omniauthable

  delegate :display_name, :display_image, :short_name, :display_image_html,
           :medium_name, :display_credits, :display_total_of_contributions, :contributions_text,
           :twitter_link, :display_bank_account, :display_bank_account_owner, to: :decorator
  :fb_parsed_link
  delegate :bank, to: :bank_account

  delegate :address_city, :country_id, :state_id, :phone_number, :country, :state, :address_complement, :address_neighbourhood, :address_zip_code, :address_street, :address_number, :address_state, to: :address, allow_nil: true

  attr_accessor :publishing_project, :publishing_user_settings, :publishing_user_about, :reseting_password

  mount_uploader :uploaded_image, UserUploader
  mount_uploader :cover_image, CoverUploader

  before_validation :sanitize_fields

  validates :name, :cpf, presence: true, if: ->(user) { !user.reseting_password && (user.published_projects.present? || user.publishing_project || user.publishing_user_settings) }
  validates :birth_date, presence: true, if: ->(user) { user.publishing_user_settings && user.account_type == 'pf' }

  validates_presence_of :email
  validates_uniqueness_of :email, allow_blank: true, if: :will_save_change_to_email?, message: I18n.t('activerecord.errors.models.user.attributes.email.taken')
  validates_uniqueness_of :permalink, allow_nil: true
  validates :permalink, exclusion: { in: %w[api cdn secure suporte], message: 'Endereço já está em uso.' }
  validates_format_of :email,
    with:  /\A[a-zA-Z0-9!#\\&$%'*+=?^`{}|~_-](\.?[a-zA-Z0-9\\!#$&%'*+=?^`{}|~_-]){0,}@[a-zA-Z0-9]+(?:\.|\-)(?!-)([a-zA-Z0-9]?((-?[a-zA-Z0-9]+)+\.(?!-))){0,}[a-zA-Z0-9]{2,8}\z/,
    allow_blank: true,
    if: :will_save_change_to_email?

  validates_presence_of :password, if: :password_required?
  validates_confirmation_of :password, if: :password_confirmation_required?
  validates_length_of :password, within: Devise.password_length, allow_blank: true
  validates_length_of :public_name, { maximum: 70 }
  validates :account_type, inclusion: { in: %w[pf pj mei] }

  validate :owner_document_validation
  validate :address_fields_validation

  belongs_to :address, optional: true
  has_one :user_total
  has_one :user_credit
  has_one :bank_account, dependent: :destroy
  has_many :admin_roles, class_name: 'UserAdminRole'
  has_many :user_friends
  has_many :login_activities
  has_many :feeds, class_name: 'UserFeed'
  has_many :follows, class_name: 'UserFollow'
  has_many :credit_cards
  has_many :authorizations
  has_many :oauth_providers, through: :authorizations
  has_many :contributions
  has_many :contribution_details
  has_many :reminders, class_name: 'ProjectReminder', inverse_of: :user
  has_many :payments, through: :contributions
  has_many :projects, -> do
    without_state(:deleted)
  end
  has_many :published_projects, -> do
    with_states(Project::PUBLISHED_STATES)
  end, class_name: 'Project'
  has_many :unsubscribes
  has_many :user_transfers
  has_many :project_posts
  has_many :donations
  has_many :public_contributed_projects, -> do
    distinct.where("contributions.was_confirmed and anonymous='f'")
  end, through: :contributions, source: :project
  has_many :contributed_projects, -> do
    distinct.where('contributions.was_confirmed')
  end, through: :contributions, source: :project
  has_many :category_followers, dependent: :destroy
  has_many :categories, through: :category_followers
  has_many :links, class_name: 'UserLink', inverse_of: :user
  has_many :balance_transactions
  has_many :mail_marketing_users
  has_many :subscriptions,  foreign_key: :user_id, primary_key: :common_id
  has_and_belongs_to_many :recommended_projects, join_table: :recommendations, class_name: 'Project'

  begin
    accepts_nested_attributes_for :unsubscribes, allow_destroy: true
  rescue
    puts "No association found for name 'unsubscribes'. Has it been defined yet?"
  end
  accepts_nested_attributes_for :address, allow_destroy: true
  accepts_nested_attributes_for :links, allow_destroy: true, reject_if: ->(x) { x['link'].blank? }
  accepts_nested_attributes_for :bank_account, allow_destroy: true, reject_if: ->(attr) { attr[:bank_id].blank? }
  accepts_nested_attributes_for :category_followers, allow_destroy: true
  accepts_nested_attributes_for :mail_marketing_users, allow_destroy: true

  scope :with_permalink, -> { where.not(permalink: nil) }
  scope :active, -> { where(deactivated_at: nil) }
  scope :with_user_totals, -> {
    joins('LEFT OUTER JOIN user_totals on user_totals.user_id = users.id')
  }

  scope :who_contributed_project, ->(project_id) {
    where('id IN (SELECT user_id FROM contributions WHERE contributions.was_confirmed AND project_id = ?)', project_id)
  }

  scope :who_subscribed_to_project, ->(project_id) {
    where("common_id IN (SELECT user_id FROM common_schema.subscriptions WHERE status = 'active' AND project_id = ?)", project_id)
  }

  scope :who_subscribed_reward, ->(reward_id) {
    where("common_id IN (SELECT user_id FROM common_schema.subscriptions WHERE status = 'active' AND reward_id = ?)", reward_id)
  }

  scope :who_chose_reward, ->(reward_id) {
    where('id IN (SELECT user_id FROM contributions WHERE contributions.was_confirmed AND reward_id = ?)', reward_id)
  }

  scope :who_subscribed_to_one_reward_of_the_project, ->(post_id) {
    where("common_id IN (SELECT user_id FROM common_schema.subscriptions WHERE status = 'active' AND reward_id IN (SELECT common_id FROM rewards WHERE id IN (SELECT reward_id FROM post_rewards WHERE project_post_id = ?)))", post_id)
  }

  scope :who_choose_one_rewards_of_the_project, ->(post_id) {
    where('id IN (SELECT user_id FROM contributions WHERE contributions.was_confirmed AND reward_id IN (SELECT reward_id FROM post_rewards WHERE project_post_id = ?))', post_id)
  }

  scope :subscribed_to_posts, -> {
    where('subscribed_to_project_posts')
  }

  scope :with_contributing_friends_since_last_day, -> {
    joins('join user_follows on user_follows.user_id = users.id')
      .where("(EXISTS (
        SELECT true
        from contributions
        join payments on payments.contribution_id = contributions.id
        WHERE user_follows.follow_id = contributions.user_id
            and contributions.is_confirmed
            and not contributions.anonymous
            and payments.paid_at > CURRENT_TIMESTAMP - '1 day'::interval
            ))")
  }

  scope :contributed_to_project, ->(project_id) {
    who_contributed_project(project_id)
      .where('id NOT IN (SELECT user_id FROM unsubscribes WHERE project_id = ?)', project_id)
  }

  scope :subscribed_to_project, ->(project_id) {
    who_subscribed_to_project(project_id)
      .where('id NOT IN (SELECT user_id FROM unsubscribes WHERE project_id = (select id from projects where common_id = ? limit 1))', project_id)
  }

  scope :to_send_category_notification, ->(category_id) {
    where("NOT EXISTS (
          select true from category_notifications n
          where n.template_name = 'categorized_projects_of_the_week' AND
          n.category_id = ? AND
          (current_timestamp - n.created_at) <= '1 week'::interval AND
          n.user_id = users.id)", category_id)
  }

  scope :order_by, ->(sort_field) { order(sort_field) }

  def self.followed_since_last_day
    where(id: UserFollow.since_last_day.pluck(:follow_id))
  end

  def self.find_active!(id)
    active.where(id: id).first!
  end

  def address_fields_validation
    if !reseting_password && (published_projects.present? || publishing_project || publishing_user_settings)
      required_address_attributes = address.try(:required_attributes) || Address::REQUIRED_ATTRIBUTES
      required_address_attributes.each do |attribute|
        errors.add(attribute, :invalid) if address.try(:send, attribute).blank?
      end
    end
  end

  def owner_document_validation
    is_blacklisted = false

    if cpf.present?
      document = BlacklistDocument.find_document cpf
      unless document.nil?
        is_blacklisted = true
      end
    end

    document_is_invalid = cpf.present? && !(account_type != 'pf' ? CNPJ.valid?(cpf) : CPF.valid?(cpf))
    is_contributing_or_publishing_project = published_projects.present? || contributed_projects.present? || publishing_project

    if cpf.present? && (is_blacklisted || (is_contributing_or_publishing_project && document_is_invalid))
      errors.add(:cpf, :invalid)
    end
  end

  def fb_parsed_link
    User.where(id: id).pluck('users.fb_parsed_link').first
  end

  def followers_since_last_day
    followers.where(created_at: Time.current - 1.day..Time.current)
  end

  def has_fb_auth?
    @has_fb_auth ||= fb_auth.present?
  end

  def fb_auth
    @fb_auth ||= authorizations.facebook.first
  end

  # Return the projects that user has pending refund payments
  def pending_refund_payments_projects
    pending_refund_payments.map(&:project)
  end

  # Return the pending payments to refund for failed projects
  def pending_refund_payments
    payments.joins(contribution: :project).where({
                                                   projects: {
                                                     state: 'failed'
                                                   },
                                                   state: 'paid',
                                                   gateway: 'Pagarme',
                                                   payment_method: 'BoletoBancario'
                                                 }).reject do |payment|
      payment.already_in_refund_queue?
    end
  end

  def has_pending_legacy_refund?
    user_transfers.where(status: %w[pending_transfer processing]).exists?
  end

  # in cents
  def credits_amount
    (credits * 100).to_i
  end

  def has_online_project?
    projects.with_state('online').exists?
  end

  def has_sent_notification?
    projects.any? { |p| p.posts.exists? }
  end

  def created_projects
    projects.with_state(%w[online waiting_funds successful failed])
  end

  def following_this_category?(category_id)
    category_followers.pluck(:category_id).include?(category_id)
  end

  def failed_contributed_projects
    contributed_projects.where(state: 'failed')
  end

  def change_locale(language)
    update(locale: language) if locale != language
  end

  def reactivate
    update_columns deactivated_at: nil, reactivate_token: nil
  end

  def deactivate
    notify(:user_deactivate)
    update(deactivated_at: Time.current, reactivate_token: Devise.friendly_token)
    contributions.update_all(anonymous: true)
    cancel_all_subscriptions
  end

  def made_any_contribution_for_this_project?(project_id)
    contribution_details.was_confirmed.where(project_id: project_id).exists?
  end

  def decorator
    @decorator ||= UserDecorator.new(self)
  end

  def credits
    return 0 if zero_credits
    user_credit.try(:credits).to_f
  end

  def total_contributed_projects
    user_total.try(:total_contributed_projects).to_i
  end

  def contributing_friends_since_last_day(project)
    follows.joins('join contributions on contributions.user_id = user_follows.follow_id
                    join payments on payments.contribution_id = contributions.id
                    join projects on projects.id = contributions.project_id')
           .where("contributions.is_confirmed
                        and not contributions.anonymous
                        and payments.paid_at > CURRENT_TIMESTAMP - '1 day'::interval and projects.id = ?", project.id).distinct
  end

  def projects_backed_by_friends_in_last_day
    Project.joins(:contributions)
           .joins('join user_follows on user_follows.follow_id = contributions.user_id
            join payments on payments.contribution_id = contributions.id')
           .where('contributions.is_confirmed and not contributions.anonymous')
           .where("payments.paid_at > CURRENT_TIMESTAMP - '1 day'::interval
                  and user_follows.user_id = ?", id).distinct
  end

  def has_no_confirmed_contribution_to_project(project_id)
    contributions.where(project_id: project_id).where('contributions.was_confirmed').empty?
  end

  def created_today?
    created_at.to_date == Time.zone.today && sign_in_count <= 1
  end

  def to_analytics
    {
      id: id,
      user_id: id,
      common_id: common_id,
      public_name: public_name,
      email: email,
      name: name,
      contributions: total_contributed_projects,
      projects: projects.count,
      published_projects: published_projects.count,
      created: created_at,
      has_fb_auth: has_fb_auth?,
      has_online_project: has_online_project?,
      has_created_post: has_sent_notification?,
      last_login: last_sign_in_at,
      created_today: created_today?,
      follows_count: follows.count,
      followers_count: followers.count,
      is_admin_role: admin? || false
    }
  end

  def to_analytics_json
    to_analytics.to_json
  end

  def to_param
    return id.to_s unless display_name
    "#{id}-#{display_name.parameterize}"
  end

  def project_unsubscribes
    contributed_projects.map do |project|
      unsubscribes.posts_unsubscribe(project.id)
    end
  end

  def subscribed_to_posts?
    unsubscribes.where(project_id: nil).empty?
  end

  def project_owner?
    projects.present?
  end

  def fix_twitter_user
    if twitter.present?
      splited = twitter.split('/').last
      self.twitter = splited.gsub(/@/, '') if splited.present?
    end
  end

  def nullify_permalink
    self.permalink = nil if permalink.blank?
  end

  def fix_facebook_link
    if facebook_link.present?
      self.facebook_link = ('http://' + facebook_link) unless facebook_link[/^https?:\/\//]
    end
  end

  def password_required?
    !persisted? || !password.nil? || !password_confirmation.nil?
  end

  def password_confirmation_required?
    !new_record?
  end

  def has_valid_contribution_for_project?(project_id)
    contributions.where(project_id: project_id).where('contributions.was_confirmed').present?
  end

  def followers
    @followers ||= UserFollow.where(follow_id: id).where.not(user_id: id)
  end

  def generate_reset_password_token
    raw, enc = Devise.token_generator.generate(self.class, :reset_password_token)
    self.reset_password_token   = enc
    self.reset_password_sent_at = Time.now.utc
    save(validate: false)
    raw
  end

  def update_tracked_fields(request)
    super
    login_activities.build(ip_address: current_sign_in_ip)
  end

  def account_active?
    banned_at.nil?
  end

  def active_for_authentication?
    super && account_active? && deactivated_at.nil?
  end

  def inactive_message
    account_active? ? super : :locked
  end

  def self.reset_password_by_token(attributes = {})
    original_token       = attributes[:reset_password_token]
    reset_password_token = Devise.token_generator.digest(self, :reset_password_token, original_token)

    recoverable = find_or_initialize_with_error_by(:reset_password_token, reset_password_token)

    recoverable.reseting_password = true
    if recoverable.persisted?
      if recoverable.reset_password_period_valid?
        recoverable.reset_password(attributes[:password], attributes[:password_confirmation])
      else
        recoverable.errors.add(:reset_password_token, :expired)
      end
    end

    recoverable.reset_password_token = original_token if recoverable.reset_password_token.present?
    recoverable
  end

  def total_balance
    @total_balance ||= balance_transactions.sum(:amount).to_f
  end

  def common_index
    id_hash = if common_id.present?
                {id: common_id }
              else
                {}
              end

    phone_matches = phone_number.
      gsub(/[\s,-]/, '').match(/\((.*)\)(\d+)/) rescue nil

    {
      external_id: id,
      name: name,
      public_name: public_name,
      about_html: about_html,
      permalink: permalink,
      facebook_link: facebook_link,
      other_link: other_link,
      email: email,
      thumbnail_url: uploaded_image.thumb_avatar.url,
      password: encrypted_password,
      password_encrypted: true,
      document_number: cpf,
      document_type: (account_type == 'pf' ? "CPF" : "CNPJ"),
      born_at: birth_date,
      address: {
        street: address_street,
        street_number: address_number,
        neighborhood: address_neighbourhood,
        zipcode: address_zip_code,
        country: address.try(:country).try(:name),
        state: address_state,
        city: address_city,
        complementary: address_complement
      },
      phone: {
        ddi: "55",
        ddd: phone_matches.try(:[], 1),
        number: phone_matches.try(:[], 2)
      },
      bank_account: {
        bank_code: bank_account.try(:bank_code),
        account: bank_account.try(:account),
        account_digit: bank_account.try(:account_digit),
        agency: bank_account.try(:agency),
        agency_digit: bank_account.try(:agency_digit)
      },
      created_at: created_at,
      deactivated_at: deactivated_at
    }.merge(id_hash)
  end

  def index_on_common
    common_wrapper.index_user(self) if common_wrapper
  end

  def sanitize_fields
    self.about_html =  SanitizeScriptTag.sanitize(about_html)
  end

  private
  def cancel_all_subscriptions
    subscriptions.where(status: %w(inactive active started canceling)).order(id: :desc).find_each do |_sub|
      common_wrapper.cancel_subscription(_sub)
    end
  end
end
