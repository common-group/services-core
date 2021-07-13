# frozen_string_literal: true

RSpec.shared_examples 'authenticate routes' do |public_paths: []|
  def self.match_route?(route:, path_with_method:)
    method, path = path_with_method.split
    route.request_method == method && route.pattern.match?(path)
  end

  described_class.routes.each do |route|
    if public_paths.any? { |p| match_route?(route: route, path_with_method: p) }
      it "doesn`t need authentitcation for #{route.request_method} #{route.path}" do
        expect(route.settings.dig(:auth, :public)).to be_truthy
      end
    else
      it "needs authentitcation for #{route.request_method} #{route.path}" do
        expect(route.settings.dig(:auth, :public)).to be_falsey
      end
    end
  end
end
