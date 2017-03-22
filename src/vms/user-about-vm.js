import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import generateErrorInstance from '../error';

const e = generateErrorInstance();

const fields = {
    password: m.prop(''),
    current_password: m.prop(''),
    uploaded_image: m.prop(''),
    cover_image: m.prop(''),
    email: m.prop(''),
    permalink: m.prop(''),
    public_name: m.prop(''),
    facebook_link: m.prop(''),
    twitter: m.prop(''),
    links: m.prop([]),
    about_html: m.prop(''),
    email_confirmation: m.prop('')
};

const mapRailsErrors = (rails_errors) => {
    let parsedErrors;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch(e) {
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

    //extractAndSetErrorMsg("about_html", ["user.about_html", "about_html"]);
    //extractAndSetErrorMsg("public_name", ["user.public_name", "public_name"]);

    return e;
};

const userAboutVM = {
    fields,
    mapRailsErrors
};

export default userAboutVM;
