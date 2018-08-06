RSpec.shared_examples 'with anonymous' do
  before do
    allow(controller).to receive(:decoded_api).and_return(nil)
    allow(controller).to receive(:platform_token).and_return(platform.token)
  end

  it { is_expected.to have_http_status('403') }
end
