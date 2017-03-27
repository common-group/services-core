import _ from 'underscore';

const mapRailsErrors = (rails_errors, errors_fields, e) => {
    let parsedErrors;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch(err) {
        parsedErrors = {};
    }
    const extractAndSetErrorMsg = (label, fieldArray) => {
        const value = _.first(_.compact(_.map(fieldArray, (field) => {
            return _.first(parsedErrors[field]);
        })));

        if(value) {
            e(label, value);
            e.inlineError(label, true);
        }
    };

    _.each(errors_fields, (item, i) => {
        extractAndSetErrorMsg(item[0], item[1]);
    });
};

const railsErrorsVM = {
    mapRailsErrors
};

export default railsErrorsVM;
