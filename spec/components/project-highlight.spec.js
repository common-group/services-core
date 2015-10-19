describe('ProjectHighlight', () => {
    let $output, projectDetail,
        ProjectHighlight = window.c.ProjectHighlight;

    it('when project video is not filled should render image', () => {
        projectDetail = _.extend({}, ProjectDetailsMockery()[0], {
            original_image: 'original_image',
            video_embed_url: null
        });
        let component = m.component(ProjectHighlight, {
                project: projectDetail
            }),
            view = component.view(component.controller(), {
                project: projectDetail
            });
        $output = mq(view);

        expect($output.find('.project-image').length).toEqual(1);
        expect($output.find('iframe.embedly-embed').length).toEqual(0);
    });

    describe('view', () => {
        beforeAll(() => {
            spyOn(m, 'component').and.callThrough();
            projectDetail = ProjectDetailsMockery()[0];
            let component = m.component(ProjectHighlight, {
                    project: projectDetail
                }),
                view = component.view(component.controller(), {
                    project: projectDetail
                });
            $output = mq(ProjectHighlight, {
                project: projectDetail
            });
        });

        it('should render project video, headline, category and address info', () => {
            expect($output.find('iframe.embedly-embed').length).toEqual(1);
            expect($output.find('span.fa.fa-map-marker').length).toEqual(1);
            expect($output.contains(projectDetail.address.city)).toEqual(true);
        });

        it('should render project share box when click on share', () => {
            $output.click('#share-box');
            $output.redraw();
            $output.should.have('.pop-share');
        });
    });
});