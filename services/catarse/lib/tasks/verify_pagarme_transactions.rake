# -*- coding: utf-8 -*-
# frozen_string_literal: true


def sync_balance_operations(status)
  PagarMe.api_key = CatarsePagarme.configuration.api_key

    page = 1
    loop do
      params = { page: page, count: 100, status: status }
      begin
        operations = PagarMe::Request.get('/balance/operations', params: params).call
        puts page
        break if operations.empty?
        operations.map do |op|
          opjson = op.to_json
          gateway_operation = GatewayBalanceOperation.find_or_create_by operation_id: ActiveSupport::JSON.decode(opjson)['id']
          gateway_operation.update(operation_data: opjson)
        end
        sleep 0.2
      rescue Exception => e
        puts e.inspect
      end
      page += 1
    end
  end


desc 'Sync all "available" balance operations'
task sync_balance_operations_available: [:environment] do
  sync_balance_operations('available')
end

desc 'Sync all "waiting_funds" balance operations'
task sync_balance_operations_waiting_funds: [:environment] do
  sync_balance_operations('waiting_funds')
end

desc 'Sync all "transferred" balance operations'
task sync_balance_operations_transferred: [:environment] do
  sync_balance_operations('transferred')
end

desc 'Sync payment_transfers with pagar.me transfers'
task verify_pagarme_transfers: [:environment] do
  PagarMe.api_key = CatarsePagarme.configuration.api_key

  PaymentTransfer.pending.each do |payment_transfer|
    transfer = PagarMe::Transfer.find_by_id payment_transfer.transfer_id

    if transfer.status == 'transferred' && !payment_transfer.payment.refunded?
      payment_transfer.payment.update_column(:state, 'refunded')
      payment_transfer.payment.update_column(:refunded_at, transfer.try(:funding_estimated_date).try(:to_datetime))
    end

    payment_transfer.update(transfer_data: transfer.to_hash)
  end
end

desc 'Sync balance_transfers with pagar.me transfers'
task verify_balance_transfers: [:environment] do
  PagarMe.api_key = CatarsePagarme.configuration.api_key

  BalanceTransfer.processing.each do |bt|
    transfer = PagarMe::Transfer.find_by_id bt.transfer_id

    case transfer.status
    when 'transferred' then
      bt.transition_to(:transferred, transfer_data: transfer.to_hash)
    when 'failed', 'canceled' then
      bt.transition_to(:error, transfer_data: transfer.to_hash)
    end
  end
end

desc 'Sync user_transfers with pagar.me transfers'
task verify_pagarme_user_transfers: [:environment] do
  PagarMe.api_key = CatarsePagarme.configuration.api_key

  UserTransfer.pending.each do |payment_transfer|
    transfer = PagarMe::Transfer.find_by_id payment_transfer.gateway_id

    payment_transfer.update_column(:status, transfer.status)

    payment_transfer.update(transfer_data: transfer.to_hash)
    next unless transfer.status == 'failed'
    payment_transfer.notify(:invalid_refund, payment_transfer.user)
    if payment_transfer.over_refund_limit?
      backoffice_user = User.find_by(email: CatarseSettings[:email_contact])
      payment_transfer.notify(:over_refund_limit, backoffice_user) if backoffice_user
    end
  end
end

desc 'Verify all paid credit card payments for failed project'
task verify_pagarme_not_refunded_cards: [:environment] do
  PagarMe.api_key = CatarsePagarme.configuration.api_key
  Payment.joins(contribution: [:project]).where(%{
    projects.state = 'failed' and payments.state = 'paid'
    and lower(payments.gateway) = 'pagarme' and lower(payments.payment_method) = 'cartaodecredito'
    }).each do |p|
    Rails.logger.info "Refunding credit card on failed projects #{p.gateway_id}"
    p.direct_refund
  end
end

desc 'Verify all pending_refund transactions in pagarme and adjusts'
task verify_pagarme_refunds: [:environment] do
  PagarMe.api_key = CatarsePagarme.configuration.api_key
  Payment.where(state: 'pending_refund').where("lower(gateway) = 'pagarme'").each do |p|
    t = p.pagarme_delegator.transaction
    next unless t.status != p.state
    Rails.logger.info "updating #{p.gateway_id} #{p.state} -> to -> #{t.status}"
    p.pagarme_delegator.update_transaction
    p.pagarme_delegator.change_status_by_transaction t.status
  end
end

desc 'Sync all gateway payments using all transactions'
task :gateway_payments_sync, %i[nthreads page_size] => [:environment] do |t, args|
  args.with_defaults nthreads: 3, page_size: 500
  ActiveRecord::Base.connection_pool.with_connection do
    PagarMe.api_key = CatarsePagarme.configuration.api_key
    page = 1
    per_page = args.page_size.to_i

    loop do
      Rails.logger.info "[GatewayPayment SYNC] -> running on page #{page}"

      transactions = PagarMe::Transaction.all(page, per_page)

      if transactions.empty?
        Rails.logger.info '[GatewayPayment SYNC] -> exiting no transactions returned'
        break
      end

      Rails.logger.info '[GatewayPayment SYNC] - sync transactions'
      Parallel.map(transactions, in_threads: args.nthreads.to_i) do |transaction|
        postbacks = begin
                      transaction.postbacks.to_json
                    rescue
                      nil
                    end
        payables = begin
                     transaction.payables.to_json
                   rescue
                     nil
                   end
        operations = begin
                       transaction.operations.to_json
                     rescue
                       nil
                     end
        events = begin
                   transaction.events.to_json
                 rescue
                   nil
                 end

        gpayment = GatewayPayment.find_or_create_by transaction_id: transaction.id.to_s
        gpayment.update(
          gateway_data: transaction.to_json,
          postbacks: postbacks,
          payables: payables,
          events: events,
          operations: operations,
          last_sync_at: DateTime.now
        )
        print '.'
      end
      Rails.logger.info "[GatewayPayment SYNC] - transactions synced on page #{page}"

      page += 1
      sleep 1
    end
  end
end

desc 'Verify all transactions in pagarme for a given date range and check their consistency in our database'
task :verify_pagarme_transactions, %i[start_date end_date] => :environment do |task, args|
  args.with_defaults(start_date: Date.today - 1, end_date: Date.today)
  Rails.logger.info "Verifying transactions in range: #{args.inspect}"
  PAGE_SIZE = 50

  def find_transactions_by_dates(start_date, end_date, from = 0, size = PAGE_SIZE)
    request = PagarMe::Request.new('/search', 'GET')
    query = {
      type: 'transaction',
      query: {
        from: from,
        size: size,
        query: {
          range: {
            date_created: {
              gte: start_date,
              lte: end_date
            }
          }
        }
      }.to_json
    }
    Rails.logger.info query.inspect
    request.parameters.merge!(query)
    request.run
  end

  def find_payment(source)
    gateway_id = source['id'].to_s
    p = Payment.find_by(gateway_id: gateway_id)
    unless p
      key = find_key source
      puts "Trying to find by key #{key}"
      p = Payment.where('gateway_id IS NULL AND key = ?', key).first # Só podemos pegar o mesmo pagamento se o gateway_id for nulo para evitar conflito
    end
    p
  end

  def find_key(source)
    source['metadata'].try(:[], 'key').to_s
  end

  def find_contribution(source)
    id = source['metadata'].try(:[], 'contribution_id').to_s
    if id.present?
      Contribution.find(id)
    else
      project_id = source['metadata'].try(:[], 'project_id').to_s
      attributes = { project_id: project_id, payer_email: source['customer']['email'], value: (source['amount'] / 100) }
      Contribution.find_by(attributes)
    end
  end

  def find_payment_method(source)
    source['payment_method'] == 'boleto' ? 'BoletoBancario' : 'CartaoDeCredito'
  end

  def all_transactions(start_date, end_date)
    first_collection = find_transactions_by_dates(start_date, end_date)
    total_pages = first_collection['hits']['total'] / PAGE_SIZE
    total_pages.times do |page|
      puts "Loading page #{page} / #{total_pages}..."
      result = find_transactions_by_dates(start_date, end_date, page * PAGE_SIZE)
      result['hits']['hits'].each do |hit|
        _source = hit['_source']
        payment = find_payment _source
        yield _source, payment if _source['status'] != 'processing'
      end
    end
  end

  def fix_payments(start_date, end_date)
    all_transactions(start_date, end_date) do |source, payment|
      begin
        puts "Verifying transaction #{source['id']}"
        if payment
          # Caso tenha encontrado o pagamento pela chave mas ele tenha gateway_id nulo nós atualizamos o gateway_id antes de prosseguir
          if payment.gateway_id.nil?
            puts "Updating payment gateway_id to #{source['id']}"
            payment.update(gateway_id: source['id'])
          end

          # Atualiza os dados usando o pagarme_delegator caso o status não esteja batendo
          yield(source, payment)
        else
          puts "\n\n>>>>>>>>>   Inserting payment not found in Catarse: #{source.inspect}"
          c = find_contribution source
          if c
            puts "\n\n>>>>>>>>>   FOUND"
            payment = c.payments.new({
                                       gateway: 'Pagarme',
                                       gateway_id: source['id'],
                                       payment_method: find_payment_method(source),
                                       value: c.value,
                                       key: find_key(source)
                                     })
            payment.generate_key
            payment.save!(validate: false)
            yield(source, payment)
          end
        end
      rescue Exception => e
        if source.present? && source['id'].present?
          puts "\n\n>>>>>>>>>> Creating PaymentLog can't create payment"
          PaymentLog.create(
            gateway_id: source['id'],
            data: source
          )
        end
        puts e.inspect
      end
    end
  end

  PagarMe.api_key = CatarsePagarme.configuration.api_key

  puts "Verifying all payment from #{args[:start_date]} to #{args[:end_date]}"
  fix_payments(args[:start_date], args[:end_date]) do |source, payment|
    raise "Gateway_id mismatch #{payment.gateway_id} (catarse) != #{source['id']} (pagarme)" if payment.gateway_id.to_s != source['id'].to_s
    if payment.state != source['status'] && source['status'] != 'waiting_payment'
      puts "Updating #{source['id']}(pagarme) - #{payment.gateway_id}(catarse)..."
      puts "Changing state to #{source['status']}"
      payment.pagarme_delegator.change_status_by_transaction source['status']
    end
    payment.pagarme_delegator.update_transaction
  end
end
