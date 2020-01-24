import m from 'mithril';
import xmlParser from 'simple-xml-parser/parser';

/**
 * Convert a string to HTML entities
 */
String.prototype.toHtmlEntities = function() {
    return this.replace(/./gm, function(s) {
        return "&#" + s.charCodeAt(0) + ";";
    });
};

/**
 * Create string from HTML entities
 */
String.fromHtmlEntities = function(string) {
    return (string+"").replace(/&#\d+;/gm,function(s) {
        return String.fromCharCode(s.match(/\d+/gm)[0]);
    })
};

var decodeHTML = function (html) {
	var txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
};

/**
 * @typedef {{tag: string, key: string, attrs: Object, children: VNode[], text: string, dom: Document, domSize: number, state: string, events: any[], instance: Document}} VNode  
 */

/**
 * @description Generates a mithril component tree based on parsed HTML provided.
 * @param {string} text 
 * @param {{tagsToFilter:string[], tagsFilterIsWhitelist:boolean, eliminateScriptTags:boolean = true}} options
 * @returns {VNode}
 */
export default function generativeTrust(text = '', options = {}, renderer = m) {
    options.eliminateScriptTags = options.eliminateScriptTags && true;
    options.tagsFilterIsWhitelist = options.tagsFilterIsWhitelist && true;

    if (!(options.tagsToFilter instanceof Array)) {
        options.tagsToFilter = [];
    }

    const tagsFilterFunction = (function() {
        if (options.eliminateScriptTags && options.tagsFilterIsWhitelist) {
            options.tagsToFilter = options.tagsToFilter.filter(tag => tag !== 'script');
        }
        else if (options.eliminateScriptTags && !options.tagsFilterIsWhitelist) {
            const hasScriptTagToFilter = options.tagsToFilter.filter(tag => tag !== 'script').length > 0;
            if (!hasScriptTagToFilter) {
                options.tagsToFilter.push('script');
            }
        }

        if (options.tagsFilterIsWhitelist && options.tagsToFilter.length > 0) {
            return createTagsFilter(options.tagsToFilter, true);
        }
        else if (!options.tagsFilterIsWhitelist && options.tagsToFilter.length > 0) {   
            return createTagsFilter(options.tagsToFilter, false);
        } else {
            return () => true;
        }
    })();

    const xmlParsed = xmlParser(text);
    return createElementTree(xmlParsed, tagsFilterFunction, renderer);
}

function createElementTree(parsedXML, tagsFilterFunction, renderer) {
    return renderer('font', {}, createElements(parsedXML, tagsFilterFunction, renderer));
}

function createElements(nodeEntries, tagsFilterFunction, renderer) {
    return nodeEntries.filter(tagsFilterFunction).filter(emptyElement).map(nodeEntry => createElement(nodeEntry, tagsFilterFunction, renderer));
}

/**
 * 
 * @param {string[]} tags 
 * @param {boolean} isWhitelist 
 */
function createTagsFilter(tags, isWhitelist) {
    if (isWhitelist) {
        return nodeEntry => tags.some(tag => tagMatch(nodeEntry, tag));
    } else {
        return nodeEntry => !tags.some(tag => tagMatch(nodeEntry, tag));
    }
}

function tagMatch(nodeEntry, tagName) {
    return (nodeEntry.type === 'node' || nodeEntry.type === 'self-close-tag') && nodeEntry.name === tagName;
}

function emptyElement(nodeEntry) {
    return !(nodeEntry.type === 'unmatch' && (isTextEmpty(nodeEntry.text) || (nodeEntry.text || '').length === 0));
}

function isTextEmpty(text) {
    return text && removeNewLines(text.trim()).trim().length === 0;
}

/** @param {string} text */
function isHTMLSpaceEntitySequence(text) {
    return /(&nbsp;){1,}/g.test(text.trim());
}

function removeNewLines(text) {
    return (text || '').replace(/\\n/g, '');
}

function createElement(nodeEntry, tagsFilterFunction, renderer) {
    if (nodeEntry.type === 'unmatch') {
        return renderer('font', nodeEntry.attrs, decodeHTML(nodeEntry.text || ''));
    } else if (nodeEntry.type === 'open-tag') {
        const closedTag = (nodeEntry.text || '').replace('>', '/>');
        return renderer('font', createElements(xmlParser(closedTag), tagsFilterFunction, renderer));
    } else {
        return renderer(nodeEntry.name, nodeEntry.attrs, nodeEntry.els && createElements(nodeEntry.els, tagsFilterFunction, renderer));
    }
}