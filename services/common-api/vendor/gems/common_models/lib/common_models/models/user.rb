# coding: utf-8
require 'bcrypt'
module CommonModels
  class User < ActiveRecord::Base
    include ::BCrypt
    self.table_name = 'community_service.users'
    FIELDS = [:name, :newsletter, :created_at, :updated_at, :admin, :locale, :cpf, :encrypted_password, :reset_password_token, :reset_password_sent_at, :remember_created_at, :sign_in_count, :current_sign_in_at, :last_sign_in_at, :current_sign_in_ip, :last_sign_in_ip, :twitter, :facebook_link, :other_link, :uploaded_image, :moip_login, :state_inscription, :channel_id, :deactivated_at, :reactivate_token, :authentication_token, :zero_credits, :about_html, :cover_image, :permalink, :subscribed_to_project_posts, :full_text_index, :subscribed_to_new_followers, :subscribed_to_friends_contributions, :banned_at, :whitelisted_at, :sendgrid_recipient_id, :confirmed_email_at, :public_name, :account_type, :birth_date]
    store_accessor :data, FIELDS
    attr_accessor :publishing_project, :publishing_user_settings, :publishing_user_about, :reseting_password

    has_many :projects
    has_many :temp_login_api_keys
    has_many :user_api_keys
    belongs_to :platform
    belongs_to :address
    has_many :user_role

    has_many :published_projects, -> do
      with_states(Project::PUBLISHED_STATES)
    end, class_name: 'Project'

    validates :name, :cpf, presence: true, if: ->(user) { !user.reseting_password && (user.published_projects.present? || user.publishing_project || user.publishing_user_settings) }
    validates :birth_date, presence: true, if: ->(user) { user.publishing_user_settings && user.account_type == 'pf' }

    validates_presence_of :email
    validates_uniqueness_of :email, allow_blank: true, if: :email_changed? #, message: I18n.t('activerecord.errors.models.user.attributes.email.taken')
    validates_uniqueness_of :permalink, allow_nil: true
    validates :permalink, exclusion: { in: %w[api cdn secure suporte],
                                      message: 'Endereço já está em uso.' }
    validates_format_of :email, with: /\A[^@\s]+@([^@\s]+\.)+[^@\W]+\z/, allow_blank: true, if: :email_changed?

    validates_presence_of :password, if: :password_required?
    validates_confirmation_of :password, if: :password_confirmation_required?
    validates_length_of :password, within: 6..128, allow_blank: true
    validates_length_of :public_name, { maximum: 70 }
    validates :account_type, inclusion: { in: %w[pf pj mei] }

    def is_admin?      
      user_role.role == 'admin'
    end

    def password_required?
      !persisted? || !password.nil? || !password_confirmation.nil?
    end

    def password_confirmation_required?
      !new_record?
    end

    def password_hash
      @password_hash ||= Password.new(password)
    end

    def password_hash=(new_password)
      @password_hash = Password.create(new_password)
      self.password = @password_hash
    end
  end
end
