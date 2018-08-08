RSpec.shared_examples 'ensure policy scope usage' do
  before do
    expect(controller).to receive(:policy_scope)
      .with(
        policy_model_class,
        policy_scope_class: policy_scope_class
    ).and_call_original
  end
end
