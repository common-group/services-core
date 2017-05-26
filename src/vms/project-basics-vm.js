import m from 'mithril';
import _ from 'underscore';
import models from '../models';
import postgrest from 'mithril-postgrest';
import projectVM from './project-vm';
import h from '../h';
import generateErrorInstance from '../error';
import replaceDiacritics from 'replaceDiacritics';

const e = generateErrorInstance();

const fields = {
    tracker_snippet_html: m.prop(''),
    user_id: m.prop(''),
    public_tags: m.prop(''),
    admin_tags: m.prop(''),
    service_fee: m.prop(''),
    name: m.prop(''),
    permalink: m.prop(''),
    category_id: m.prop(''),
    city_id: m.prop(''),
    city_name: m.prop('')
};

const fillFields = (data) => {
    fields.tracker_snippet_html(data.tracker_snippet_html||'');
    fields.user_id(data.user_id);
    fields.admin_tags(data.admin_tag_list||'');
    fields.public_tags(data.tag_list||'');
    fields.service_fee(data.service_fee);
    fields.name(data.name);
    fields.permalink(data.permalink);
    fields.category_id(data.category_id);
    fields.city_id(data.city_id||'');
    if(data.address.city) {
        fields.city_name(`${data.address.city} - ${data.address.state}`);
    }
};

const updateProject = (project_id) => {
    const projectData = {
        tracker_snippet_html: fields.tracker_snippet_html(),
        user_id: fields.user_id(),
        all_tags: fields.admin_tags(),
        all_public_tags: fields.public_tags(),
        service_fee: fields.service_fee(),
        name: fields.name(),
        permalink: fields.permalink(),
        category_id: fields.category_id(),
        city_id: fields.city_id };

    return projectVM.updateProject(project_id, projectData);
};

const loadCategoriesOptionsTo = (prop, selected) => {
    const filters = postgrest.filtersVM;
    models.category.getPage(filters({}).order({
        name: 'asc'
    }).parameters()).then((data) => {
        let mapped = _.map(data, (item, index) => {
            return m(`option[value='${item.id}']`, {
                selected: selected == item.id
            }, item.name);
        });

        prop(mapped);
    });
};

const generateSearchCity = (prop) => {
    const filters = postgrest.filtersVM({
        search_index: 'ilike'
    }).order({name: 'asc'});

    const genSelectClickCity = (city, citiesProp) => {
        return () => {
            fields.city_name(`${city.name} - ${city.acronym}`);
            fields.city_id(city.id);
            citiesProp('');
        };
    };

    return (event) => {
        const value = event.currentTarget.value;
        filters.search_index(replaceDiacritics(value));
        fields.city_name(value);

        models.city.getPage(filters.parameters()).then((data) => {
            const map = _.map(data, (item) => {
                return m('.table-row.fontsize-smallest.fontcolor-secondary', [
                    m('.city-select.fontsize-smallest.link-hidden-light', {
                        onclick: genSelectClickCity(item, prop)
                    }, `${item.name} - ${item.acronym}`)
                ]);
            });

            prop(m('.table-outer.search-pre-result', { style: { 'z-index': 9999}}, map));
        }).catch((err) => {
            prop('');
        });
    };
};


const projectBasicsVM = {
    fields,
    fillFields,
    updateProject,
    loadCategoriesOptionsTo,
    e,
    generateSearchCity
};

export default projectBasicsVM;
