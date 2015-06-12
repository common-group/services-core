/*
    A Mithril.js plugin to authenticate requests against PostgREST
    Copyright (c) 2007 - 2015 Diogo Biazus
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.0.0
*/
!function(factory) {
    factory(m, window);
}(function(m, window) {
    var adminApp = window.adminApp = {};
    adminApp.submodule = function(module, args) {
        return module.view.bind(this, new module.controller(args));
    };
});