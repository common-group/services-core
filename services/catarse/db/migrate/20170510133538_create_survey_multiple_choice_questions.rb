class CreateSurveyMultipleChoiceQuestions < ActiveRecord::Migration[4.2]
  def change
    create_table :survey_multiple_choice_questions do |t|
      t.references :survey, null: false
      t.text :question
      t.text :description

      t.timestamps
    end
  end
end
