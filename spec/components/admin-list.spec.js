describe('AdminList', function(){
  var c = window.c,
      AdminList = c.AdminList,
      ctrl,
      VMfaker = function(opts){
        opts = opts || {};
        var total = opts.total || 0,
            collection = opts.collection || [],
            isLoading = opts.isLoading || false,
            error = opts.error || false;
        return {
          list: {
            total: m.prop(total),
            collection: m.prop(collection),
            firstPage: function(){
              var deferred = m.deferred();
              setTimeout(function(){
                deferred.resolve();
              });
              return deferred.promise;
            },
            isLoading: m.prop(isLoading)
          },
          error: m.prop(error)
        };
      };

  describe('controller', function(){
    beforeAll(function(){
      fakeVM = VMfaker();
      spyOn(fakeVM.list, 'firstPage').and.callThrough();
      ctrl = AdminList.controller({vm: fakeVM});
    });

    it('should call firstPage if collection is empty', function(){
      expect(fakeVM.list.firstPage).toHaveBeenCalled();
    });
  })
  describe('view', function(){
    beforeAll(function(){
      fakeVM = VMfaker({collection: ContributionDetailMockery(10)});
      $output = mq(AdminList, {vm: fakeVM});
    });

    it('should render fetched contributions cards', function(){
      expect($output.find('.card').length).toEqual(10);
    });
    describe('when loading', function(){
      beforeAll(function(){
        fakeVM = VMfaker({isLoading: true});
        $output = mq(AdminList, {vm: fakeVM});
      });

      it('should show a loading icon', function(){
        expect($output.has('img[alt="Loader"]')).toBeTrue();
      });
    });
    describe('when error', function(){
      beforeAll(function(){
        fakeVM = VMfaker({error: true});
        $output = mq(AdminList, {vm: fakeVM});
      });

      it('should show an error info', function(){
        expect($output.has('.card-error')).toBeTrue();
      });
    });
  });
});
