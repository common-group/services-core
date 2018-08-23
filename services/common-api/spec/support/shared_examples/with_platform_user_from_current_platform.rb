RSpec.shared_examples 'with platform user from another platform' do
  let(:platform_token) { another_platform.token }
  let(:user_id) { nil }
  let(:token_role) { 'platform_user' }
end
