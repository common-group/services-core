describe('AdminList',() => {
  let c = window.c,
      AdminList = c.AdminList,
      ctrl, fakeVM, $output,
      VMfaker = (opts) => {
        opts = opts || {};
        let total = opts.total || 0,
            collection = opts.collection || [],
            isLoading = opts.isLoading || false,
            error = opts.error || false;
        return {
          list: {
            total: m.prop(total),
            collection: m.prop(collection),
            firstPage: () => {
              let deferred = m.deferred();
              setTimeout(() => {
                deferred.resolve();
              });
              return deferred.promise;
            },
            isLoading: m.prop(isLoading)
          },
          error: m.prop(error)
        };
      };

  describe('controller', () => {
    beforeAll(() => {
      fakeVM = VMfaker();
      spyOn(fakeVM.list, 'firstPage').and.callThrough();
      ctrl = AdminList.controller({vm: fakeVM});
    });

    it('should call firstPage if collection is empty', () => {
      expect(fakeVM.list.firstPage).toHaveBeenCalled();
    });
  });
  describe('view', () => {
    beforeAll(() => {
      fakeVM = VMfaker({collection: ContributionDetailMockery(10)});
      $output = mq(AdminList, {vm: fakeVM});
    });

    it('should render fetched contributions cards', () => {
      expect($output.find('.card').length).toEqual(10);
    });
    describe('when loading', () => {
      beforeAll(() => {
        fakeVM = VMfaker({isLoading: true});
        $output = mq(AdminList, {vm: fakeVM});
      });

      it('should show a loading icon', () => {
        expect($output.has('img[alt="Loader"]')).toBeTrue();
      });
    });
    describe('when error', () => {
      beforeAll(() => {
        fakeVM = VMfaker({error: true});
        $output = mq(AdminList, {vm: fakeVM});
      });

      it('should show an error info', () => {
        expect($output.has('.card-error')).toBeTrue();
      });
    });
  });
});
