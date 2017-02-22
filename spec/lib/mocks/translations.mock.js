beforeAll(function() {
  TranslationsFactory = function(attrs) {
      window.I18n.defaultLocale = "pt";
      window.I18n.locale = "pt";
      I18n.translations = attrs;
  };
  TranslationsFactory({
      pt: {
          projects: {
              faq: {
                  aon: {
                      description: 'fake descriptions',
                      questions: {
                          1: {
                              question: 'question_1',
                              answer: 'answer_1'
                          }
                      }
                  }
              }
          }
      }
  })
});
