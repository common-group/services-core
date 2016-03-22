describe('Dashboard Info', () => {
    let $output,
        c = window.c,
        m = window.m,
        content = {
            icon: 'url://to.icon',
            title: 'title',
            href: '#where-to',
            cta: 'next step'
        };

    describe('view', () => {
        beforeEach(() => {
            $output = mq(m.component(c.DashboardInfo, {content: content}));
            console.log(JSON.stringify($output));
        });

        it('should render an given icon', () => {
            expect($output.has(`img[src="${content.icon}"]`)).toBeTrue();
        });
        it('should render an given title', () => {
            expect($output.contains(content.title)).toBeTrue();
        });
        it('should render an given href', () => {
            expect($output.has(`a[href="${content.href}"]`)).toBeTrue();
        });
        it('should render an given cta', () => {
            expect($output.contains(content.cta)).toBeTrue();
        });
    });
});
