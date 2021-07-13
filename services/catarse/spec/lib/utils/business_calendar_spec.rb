# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Utils::BusinessCalendar, type: :lib do
  describe '#business_day?' do
    context 'with holiday' do
      it 'returns false' do
        holiday_date = Holidays.between(1.year.ago, 2.years.from_now, :br).sample[:date]

        expect(described_class.business_day?(holiday_date)).to be false
      end
    end

    context 'with weekend' do
      it 'returns false' do
        weekend_date = '2021-01-09'.to_date

        expect(described_class.business_day?(weekend_date)).to be false
      end
    end

    context 'with non-holiday weekday' do
      it 'returns true' do
        date = '2021-01-06'.to_date

        expect(described_class.business_day?(date)).to be true
      end
    end
  end

  describe '#add_business_day' do
    context 'when adding business day over the weekend' do
      it 'returns first date after weekend' do
        date = '2021-01-08'.to_date

        expect(described_class.add_business_days(date, 1).to_s).to eq '2021-01-11'
      end
    end

    context 'when adding business day over the holiday' do
      it 'returns first date after holiday' do
        holiday_date = '2021-09-06'.to_date

        expect(described_class.add_business_days(holiday_date, 1).to_s).to eq '2021-09-08'
      end
    end

    context 'when adding business day over business days' do
      it 'returns business day without skips' do
        working_day = '2021-05-24'.to_date

        expect(described_class.add_business_days(working_day, 4).to_s).to eq '2021-05-28'
      end
    end
  end
end
