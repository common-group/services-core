# frozen_string_literal: true

module Common
  class AddressReplicator
    def self.by_id(address_id)
      address = ::Common::Address.find(address_id)
      address_replica = address.dup
      address_replica.save!
      address_replica
    end
  end
end
