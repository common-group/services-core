module CatarseSettingsDb
  class Setting < ActiveRecord::Base
    self.table_name = 'settings'

    validates_presence_of :name
    class << self
      # This method returns the values of the config simulating a Hash, like:
      #   Configuration[:foo]
      # It can also bring Arrays of keys, like:
      #   Configuration[:foo, :bar]
      # ... so you can pass it to a method using *.
      # It is memoized, so it will be correctly cached.
      def [] *keys
        if keys.size == 1
          get keys.shift
        else
          keys.map{|key| get key }
        end
      end
      def []= key, value
        set key, value
      end

      def get_without_cache(key)
        find_by_name(key).value rescue nil
      end

      private
      def get key
        get_without_cache(key)
      end

      def set key, value
        find_or_create_by!(name: key).update(value: value)
        value
      end

    end
  end
end
