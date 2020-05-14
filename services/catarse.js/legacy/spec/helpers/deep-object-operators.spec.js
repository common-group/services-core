import { defineDeepObject } from '../../src/utils/deep-object-operators';

describe('DeepObjectOperator', function () {

    describe('createDeepObjectForValidValue', function() {

        it('should create 1 level object', function () {
            const obj = defineDeepObject('test', true);
            expect(obj.test).toBeTrue();
        });

        it('should create 2 level object', function () {
            const obj = defineDeepObject('test.test', true);
            expect(obj.test.test).toBeTrue();
        });

        it('should create 3 level object', function () {
            const obj = defineDeepObject('test.test.test', true);
            expect(obj.test.test.test).toBeTrue();
        });

        it('should create 2 level object with 2 propreties', function () {
            const obj1 = defineDeepObject('test.test', true);
            const obj2 = defineDeepObject('test1.test1', true, obj1);
            expect(obj2.test.test).toBeTrue();
            expect(obj2.test1.test1).toBeTrue();
        });

        it('should create 2 level object with overlap', function () {
            const obj1 = defineDeepObject('test.test', true);
            const obj2 = defineDeepObject('test.test1', true, obj1);
            expect(obj2.test.test).toBeTrue();
            expect(obj2.test.test1).toBeTrue();
        });
    });
});