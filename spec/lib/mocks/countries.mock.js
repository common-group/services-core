beforeAll(() => {
    CountriesMockery = function (attrs) {
    // @TODO refactor code to get id from name
        const data = [
            {
                id: 74,
                name: 'Estados Unidos'
            },
            {
                id: 36,
                name: 'Brasil'
            }
        ];

        return data;
    };

    jasmine.Ajax.stubRequest(new RegExp(`(${apiPrefix}\/countries)` + '(.*)')).andReturn({
        responseText: JSON.stringify(CountriesMockery())
    });
});
