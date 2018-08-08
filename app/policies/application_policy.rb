class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    false
  end

  def show?
    scope.where(:id => record.id).exists?
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  def is_platform_user?
    user.is_a?(CommonModels::Platform)
  end

  def current_platform_id
    is_platform_user? ? user.id : user.platform_id
  end

  def is_platform_user_and_owner?
    is_platform_user? && record.platform_id == user.id
  end

  def is_owner?
    record.user_id == user.id
  end

  def scope
    Pundit.policy_scope!(user, record.class)
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end


    def is_platform_user?
      @user.is_a?(CommonModels::Platform)
    end


    def resolve
      scope
    end
  end
end
