describe('Address model', function() {

  describe('when instantiated', function() {
    beforeAll(function() {
      this.address_mock = {
        country_id : 1,
        address_number : 10,
        address_street : 'Rua dos Bôbos',
        address_complement : 'Casa nº',
        address_neighbourhood : 'Bairro',
        address_zip_code : '12345000',
        address_city : 'São Paulo',
        address_state : 'SP',
        phone_number : '1135431201'
      };
    });

    it('should exhibit attributes', function() {
      address = new adminApp.models.Address(this.address_mock);
      expect(address.country_id()).toEqual(1);
      expect(address.address_number()).toEqual(10);
      expect(address.address_street()).toEqual('Rua dos Bôbos');
      expect(address.address_complement()).toEqual('Casa nº');
      expect(address.address_neighbourhood()).toEqual('Bairro');
      expect(address.address_zip_code()).toEqual('12345000');
      expect(address.address_city()).toEqual('São Paulo');
      expect(address.address_state()).toEqual('SP');
      expect(address.phone_number()).toEqual('1135431201');
    });

  });

});