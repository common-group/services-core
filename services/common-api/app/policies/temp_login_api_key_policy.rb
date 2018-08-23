class TempLoginApiKeyPolicy < UserApiKeyPolicy
  def permitted_attributes
    return %i[id] if is_platform_user?
    %i[email password]
  end
end
