module Catarse
  module Organism
    class RewardCardComponent < ViewComponent::Base
      attr_reader :reward

      def initialize(reward:)
        @reward = reward
      end

      def delivery_info
        Catarse::Organism::RewardCard::DeliveryInfoComponent.new(estimated_delivery_time: reward[:estimated_delivery_time], delivery_type: reward[:delivery_type]);
      end

      def header
        Catarse::Organism::RewardCard::HeaderComponent.new(price: reward[:value],  title: reward[:title], type: reward[:project_type], has_image: reward[:image])
      end

      def label
        'Apoiar'
      end
    end
  end
end
