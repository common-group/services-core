# frozen_string_literal: true

module Utils
  class BusinessCalendar
    include Singleton

    attr_reader :calendar

    def initialize
      @calendar = Business::Calendar.new(
        working_days: %w[mon tue wed thu fri],
        holidays: Holidays.between(1.year.ago, 2.years.from_now, :br).pluck(:date)
      )
    end

    def self.business_day?(date)
      instance.calendar.business_day? date
    end

    def self.add_business_days(date, number)
      instance.calendar.add_business_days(date, number)
    end
  end
end
