import m from 'mithril';
import h from '../h';

/**
 * @typedef {Object} Report
 * @property {string} report_type
 * @property {string} report_type_ext
 * @property {string} state
 * @property {string} created_at
 */

export const createProjectReportExports = async (projectId, report_type, report_type_ext) => {

    return m.request({
        method: 'POST',
        url: `/projects/${projectId}/project_report_exports/`,
        config: h.setCsrfToken,
        data: {
            report_type,
            report_type_ext,
        }
    });
}

export const listProjectReportExports = async (projectId) => {
    
    try {
        const options = {
            method: 'GET',
            url: `/projects/${projectId}/project_report_exports/`,
            config: h.setCsrfToken
        };

        /** @type {{data:Report[]}} */
        const response = await m.request(options);

        console.log('response', response);

        return response.data;

        const reportIds = await m.request(options);
        console.log('reportIds', reportIds);

        return await Promise.all(reportIds.report_ids.map(reportId => getProjectReportExport(projectId, reportId)));
    } catch(e) {
        return [];
    }
}

export const getProjectReportExport = async (projectId, reportId) => {
    try {
        /** @type {m.RequestOptions} */
        const options = {   
            method: 'GET',
            url: `/projects/${projectId}/project_report_exports/${reportId}/`,
            config: h.setCsrfToken
        };

        console.log('options', options);

        return await m.request(options);
    } catch(e) {
        h.captureException(e);
        h.captureMessage(`Error loading project ${projectId} report ${reportId}`);
        throw e;
    }
}