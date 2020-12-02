class ChangeProductDefaultTotalInstallments < ActiveRecord::Migration[4.2]
  def change
    execute <<-SQL
      ALTER TABLE ONLY projects ALTER COLUMN total_installments SET DEFAULT 6;
    SQL
  end
end
