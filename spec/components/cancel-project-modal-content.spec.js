import m from 'mithril';
import h from '../../src/h';
import cancelProjectModalContent from '../../src/c/cancel-project-modal-content';

describe('cancelProjectModalContent', () => {
    let toggle, $output,
        c = window.c;

    describe('view', () => {
        beforeAll(() => {
            toggle = h.toggleProp(true, false);
            $output = mq(m.component(cancelProjectModalContent, {
                    displayModal: toggle
                }
            ));
        });

        it('should build a modal with .cancel-project-modal', function() {
            expect($output.has('.cancel-project-modal')).toBeTrue();
        });
    });
});
