# frozen_string_literal: true

module User::CustomValidators
    extend ActiveSupport::Concern

    included do
        # This code might come back in a near future
        # validate :ensure_at_least_one_reward_validation, unless: :is_flexible?
        validate :no_base64_images

        def no_base64_images
            errors.add(:about_html, :base64_images_not_allowed) if about_html.try(:match?, 'data:image/.*;base64')
        end
    end
end