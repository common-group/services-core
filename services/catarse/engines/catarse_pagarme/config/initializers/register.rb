begin
  PaymentEngines.register(CatarsePagarme::PaymentEngine.new)
rescue Exception => e
  puts "Error while registering payment engine: #{e}"
end
