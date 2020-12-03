class MoveSurveyAnswerToContributions < ActiveRecord::Migration[4.2]
  def change
    add_reference :contributions, :address_answer, references: :addresses, index: true
    execute "alter table contributions add foreign key (address_answer_id) references addresses(id);"
  end
end
