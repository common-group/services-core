import { defineDeepObject, createObjectFromTemplate } from '../../src/utils/deep-object-operators';

describe('DeepObjectOperator', function () {

    describe('defineDeepObject', function() {

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

        it('should create a object with false value', function() {
            const obj1 = defineDeepObject('test.test', false);
            expect(obj1.test.test).toBeFalse();
        });

        it('should not create a object with null or undefined', function() {
            const obj1 = defineDeepObject('test', undefined);
            expect(obj1.test).toBeUndefined();

            const obj2 = defineDeepObject('test', null);
            expect(obj2.test).toBeUndefined();
        });
    });

    describe('createObjectFromTemplate', function () {
        
        it('should create a deeper object definition if the value is valid', function () {
            const obj = createObjectFromTemplate({ test: '$1', test1: { test1: '$2'}}, true, true);
            expect(obj.test).toBeTrue();
            expect(obj.test1.test1).toBeTrue();
        });

        it('should create deeper object when not null, undefined or empty string', function() {
            const obj = createObjectFromTemplate({ test: '$1', test1: '$2', test2: '$3', test3: '$4'}, true, null, undefined, '');
            expect(obj.test).toBeTrue();
            expect(obj.test1).toBeUndefined();
            expect(obj.test2).toBeUndefined();
            expect(obj.test3).toBeUndefined();
        });
    });
});