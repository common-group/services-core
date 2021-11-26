# Introdução

O framework Ruby on Rails é um excelente framework que te entrega um algo valor sem necessitar de muito esforço por
parte dos desenvolvedores. Suas ótimas configurações padrões e a facilidade de fazer mais coisas com menos código,
são essênciais no início de um projeto, na entrega de um MVP para validar uma ideia. Entretanto essa estrutura básica
que o Ruby on Rails fornece não é preparada para softwares que serão mantidos por anos, por equipes de 4, 5 ou mais
desenvolvedores. No "rails way", conforme a complexidade da aplicação cresce, o código também sofre pois a organização
básica do projeto não foi pensada para escalar. A falta de uma estrutura rígida e a facilidade de fazer as coisas, acaba
se provando prejudicial ao longo do tempo, conforme mais e mais pessoas vão dando manutenção ao código.

O objetivo dessa arquitetura é aproveitar todas as vantagens do ecossistema Rails mas tentar organizar nossos códigos de
forma que seja um pouco mais fácil de escalar e manter. Então provavelmente terão implementações mais trabalhosas de na
arquitetura explicada a seguir, mas em contrapartida, acreditamos que ajudarão na manutenção do ao longo prazo.

Dentro da pasta `/app` temos as seguintes pastas:
- `/actions`
- `/api`
- `/assets`
- `/channels`
- `/clients`
- `/controllers`
- `/decorators`
- `/entities`
- `/enumerations`
- `/javascript`
- `/jobs`
- `/lib`
- `/mailers`
- `/models`
- `/observers`
- `/old_actions`
- `/policies`
- `/queries`
- `/state_machies`
- `/uploaders`
- `/views`


### Actions (`app/actions`)
A pasta actions é onde fica concentrada boa parte da regra de negócio, serve como uma ponte entre as requisições
externas e nossos modelos. Dessa forma evitamos ao máximo colocar regras de negócio em controllers, modelos ou classes
da API.

As actions são implementações de um padrão conhecido como Interactors, que também pode ser encontrados na internet
sendo chamado de Service Objects, Operations, Use-cases, Mutations, Commands, variando poucas coisas entre um conceito e
outro. No nosso projeto estamos utilizando a gem [`actor`](https://github.com/sunny/actor). Leia o README dessa gem para
entender melhor o funcionamento.

Uma action é basicamente uma classe especializada em realizar 1 processo da nossa regra de negócio. Por exemplo: Ao
publicar um projeto, devemos notificar as pessoas que se cadastraram para receber o aviso e atualizar o estado dele para
`online`. Se formos fazer isso em um controller, seria:
```ruby
# app/controllers/projects_controller.rb
class ProjectsController < ApplicationController
  def publish
    project = Project.find(params[:id])
    if project.update(state: 'online')
      project.subscribers.each do |user|
        ProjectMailer.with(user: user).launch_notification.deliver_later
      end
      redirect_to project
    else
      ...
    end
  end
end
```

Caso essa mesma coisa fosse feita num modelo, seria:
```ruby
# app/models/project.rb
class Project < ApplicationRecord
  after_save :send_launch_notifications

  def send_launch_notifications
    if state_changed? && state == 'online'
      subscribers.each do |user|
        ProjectMailer.with(user: user).launch_notification.deliver_later
      end
    end
  end
end
```

Seja qual fosse a opção escolhida, isso iria dificultar a manutenção de controllers, APIs e modelos conforme novos
comportamentos fossem adicionados. Nesse ponto que o interactor entra para organizar melhor nossa regra de negócio e
ficaria assim:
```ruby
# app/controllers/projects_controller.rb
class ProjectsController < ApplicationController
  def publish
    result = Projects::Publish.result(id: params[:id])
    if result.success?
      redirect_to result.project
    else
      ...
    end
  end
end

# app/actions/projects/publish.rb
module Projects
  class Publish < Actor
    input :id, type: Integer
    output :project, type: Project

    def call
      self.project = Project.find(id)
      project.update!(state: 'online')
      project.subscribers.each do |user|
        ProjectMailer.with(user: user).launch_notification.deliver_later
      end
    end
  end
end
```

Dessa forma conseguimos concentrar tudo relacionado a publicação de projeto em uma classe apenas, facilitando a
manutenção e a implementação de testes.

Também existem os casos onde um processo é tão extenso que é necessário dividir a action em actions menores para ela não
ficar inchada e voltarmos para o problema inicial de dificuldade de testar/alterar código. Para exemplificar,
usarei o processamento do pagamento, que tem a action principal `Payments::Process` e ela é dividida em alguns passos:
Criar pagamento (`Payments::Create`), Autorizar transação (`Payments::AuthorizeTransaction`), Analizar transação
(`Payments::AnalyzeTransaction`) e Capturar ou Reembolsar transação (`Payments::CaptureOrRefundTransaction`).
A implementação disso ficaria assim:
```ruby
# app/actions/billing/payments/process.rb
module Billing
  module Payments
    class Process < Actor
      play Create, AutorizeTransaction, AnalyzeTransaction, CaptureOrRefundTransaction
    end
  end
end

# app/actions/billing/payments/create.rb
module Billing
  module Payments
    class Create < Actor
      ...
    end
  end
end
# app/actions/billing/payments/authorize_transaction.rb
module Billing
  module Payments
    class AutorizeTransaction < Actor
      ...
    end
  end
end

# etc...
```
Nos exemplos dados até aqui deu pra notar que as actions sempre tem nome de ações, com um verbo no infinitivo, exemplos
com o nome inglês e a tradução para português para ficar mais fácil o entendimento: `Payments::Expire`
(`Pagamentos::Expirar`),  `Users::Authenticate` (`Usuarios::Autenticar`), `Notifications::SendNewsletter`
(`Notificacoes::EnviarNovidades`).

As actions são organizadas dentro dos módulos de assuntos, que é um namespace que serve para agrupar modelos
relacionados por exemplo: billing (cobrança), membership (membros), integrations (integrações). E dentro dos assuntos,
são organizadas em um módulo utilizando nome do modelo/recurso no plural a qual aquela action se relaciona mais. Por
exemplo: payments (pagamentos), address (endereços), tiers (níveis de assinatura). Então se queremos uma action para
apagar uma assinatura, então criaríamos `Membership::Subscriptions::Destroy`, onde `Membership` é o assunto,
`Subscriptions` é o recurso que a action se relaciona mais, e `Destroy` = descrição da ação a ser feita.

### API (`app/api`)
Nessa pasta ficam as classes que definem as rotas de entrada. Salvo exceções, toda a interação do mundo externo com
nossa aplicação é realizada através de requisições para nossas rotas da API. Exemplos: Criar projetos, listar países,
desativar um nível de apoio, receber um webhook do gateway de pagamento e etc.

Utilizamos o framework [grape](https://github.com/ruby-grape/grape) para criar nossa API REST-like. Todos os detalhes de
uso do framework pode ser encontrado no seu README do Github.

As rotas estão definidas dentro das classes presentes nos arquivos `*_api.rb`. Esses arquivos são organizados da
seguinte forma: `app/api/catarse/VERSION/NAMESPACE/RESOURCES_api.rb`, onde `VERSION` é a versão da API, o `NAMESPACE` se
refere ao assunto do recurso e o `RESOURCES` é o nome do recurso no plural. Então se, por exemplo, queremos criar uma
rota para a versão 2 da nossa API (`v2`) que lidará com o recurso cartão de crédito (`credit_card`), que é um recurso da
cobrança (`billing`), deveríamos criar o seguinte arquivo `app/api/catarse/v2/billing/credit_cards_api.rb`.

No fim, toda classe da nossa API tem que ser montada num arquivo base do seu namespace. Continuando no exemplo do cartão
de crédito, existe um `base_api.rb` dentro de `app/api/catarse/v2/billing`, e nessa classe  são montadas as demais APIs
referente ao assunto cobrança, ex.:
```ruby
# app/api/catarse/v2/billing/base_api.rb
module Catarse
  module V2
    module Billing
      class BaseAPI < Grape::API
        namespace 'billing' do
          mount Catarse::V2::Billing::CreditCardsAPI
          mount Catarse::V2::Billing::PaymentsAPI
          # mais classes montadas aqui...
        end
      end
    end
  end
end
```

As APIs não devem ter regra de negócio implementada dentro delas. Exemplificando: elas não devem persistir um registro
no banco de dados ali, nem devem disparar e-mail ou executar um job. O único papel das APIs na nossa arquitetura é
definir como a requisição deve ser recebida (a rota, os parâmetros, o método HTTP), delegar a execução para alguma
[action](#Actions), capturar o resultado e renderizar esse resultado utilizando as [entities](#Entities), ficando algo
 assim:
```ruby
# app/api/catarse/v2/billing/credit_cards_api.rb
module Catarse
  module V2
    module Billing
      class CreditCardsAPI < Grape::API
        params do
          required :credit_card, type: Hash do
            required :hash, type: String
            optional :saved, type: Boolean
          end
        end

        post '/credit_cards' do
          credit_card_params = declared(params, include_missing: false)[:credit_card]
          result = ::Billing::CreditCards::Create.result(attributes: credit_card_params)

          present :credit_card, result.credit_card, using: ::Billing::CreditCardEntity
        end
      end
    end
  end
end
```

Geralmente as classes da API tem relação com um modelo do banco de dados, ou seja, se temos a
`CreditCardsAPI` podemos pensar que também existe o modelo `CreditCard`. Mas há situação que isso não é necessariamente
verdade. Por exemplo a classe `InstallmentSimulationsAPI`, que é uma API criada para retornar as simulações de
parcelamento mas não temos nenhum modelo `InstallmentSimulation`. Isso se deve ao padrão que queremos seguir para as
URL, que é o padrão RESTful. Onde as rotas representam recursos, assim evitando ações/verbos na URL. Seguem alguns
exemplos de como transformar em recurso aquilo que geralmente representamos utilizando verbos:
- `PUT /projects/:project_id/cancel` => `POST /project_cancelations`.

  Ao invés criar a rota utilizando o verbo cancelar (`cancel`), foi utilizado o recurso Cancelamento de Projeto
  (`project_cancelations`). E não precisa existir o modelo `ProjectCancelation`, e essa rota pode muito bem executar a
  action `Projects::Cancel`.

- `POST /users/:user_id/unfollow` => `DELETE /users/:id/follow`

  Ao invés de utilizar o verbo "deixar de seguir" (`unfollow`), passamos a utilizar o `follow` como recurso. Atenção ao
  verbo HTTP que era POST e passa a ser DELETE pra representar que estou deletando aquela "seguida".


- `POST /products/:id/add_to_wishlist` => `POST /wishlist_items`

  Outro exemplo é substituir o ação "adicionar à lista de desejos" (`add_to_wishlist`) para utilizar o recurso "Items da
  lista de desejo" (`wishlist_items`).


### Assets (`app/assets`)
> Essa pasta será descontinuada quando migrarmos nosso back-end inteiro para o Grape, e migrando o front-end para um app
> separado.

### Channels (`app/channels`)
> Essa pasta ainda não tem utilidade, mas quando for necessário criar alguma funcionalidade com websockets (ex.:
> *Atualizar contador de arrecadação em tempo real*), um cable poderá ser definido dentro dessa pasta.

### Clients (`app/clients`)
Nessa pasta entram as classes que servem para consumir serviços externos, como PagarMe, Konduto, Transfeera, eNotas e
qualquer outro serviço que seja necessário consumir seus serviços. Utilizamos a gem
[HTTParty](https://github.com/jnunemaker/httparty) para implementar os clientes. Mais detalhes sobre o uso da gem, ler
o README no link fornecido.

Exemplo de uma implementação de cliente:
```ruby
# app/clients/pagar_me/client.rb
module PagarMe
  class Client < HTTParty
    include HTTParty

    base_uri 'https://api.pagar.me/1/'

    def find_transaction(id)
      response = self.class.get("/transactions/#{id}")
      response.parsed_response
    end
  end
end
```

Dessa forma evitamos ao máximo o uso de gems como `pagarme-ruby`, `konduto-ruby` e etc, que em alguns casos ou ficam
desatualizadas, ou são abandonadas, ou engessam a forma de consumir o serviço. Não é necessário implementar o consumo
de todos os endpoints fornecidos pelo serviços. Por exemplo, o PagarMe tem centenas de rotas, mas implementamos no
nosso cliente apenas as rotas necessárias para nossa aplicação se integrar com os serviço deles.

A organização dos arquivos é feita da seguinte forma, dentro da pasta `app/clients`, é criado um módulo referente ao
serviço, por ex.: `konduto` e dentro são criados os arquivos necessários para a integração, ficando a classe
`Konduto::Client` no arquivo `app/clients/konduto/client.rb`.

### Controllers (`app/controllers`)
> Essa pasta será contém os controllers tradicionais do Rails. Ela será descontinuada quando migrarmos nosso back-end
> inteiro para o Grape, fazendo assim os controllers não serem mais necessários.

### Decorators (`app/decorators`)
> Aqui ficam as classes que implementam o padrão decorator, utilizando a gem draper. Na refatoração esse padrão não
> está sendo utilizado, então tudo indica que será descontinuada em breve.

### Entities (`app/entities`)
As entities podem ser entendidas como os serializers/jbuilders, ou como as "views" de uma API. Elas servem pra definir
as estruturas que serão retornadas como resposta da API. Nas entities que definimos quais campos de um recurso serão
apresentados na resposta da API, por exemplo, numa listagem de projetos, se quisermos mostrar o nome, o autor, a meta de
arrecadação dos projetos, isso será uma definição feita nas entities.

As entities são implementadas utilizando a gem [grape-entity](https://github.com/ruby-grape/grape-entity). Para mais
detalhes da utilização, ler o README do projeto no link fornecido.

Num cenário onde desejamos montar a resposta da API de níveis de assinatura (`Membership::TiersAPI`), a entity do nível
de assinatura seria definida da seguinte forma:
```ruby
# app/entities/membership/tiers_entity.rb
module Membership
  class TierEntity < Grape::Entity
    expose :id
    expose :name
    expose :description
  end
end
```

E na API, utilizaríamos a entity da seguinte forma:
```ruby
# app/api/catarse/v2/membership/tiers_api.rb
module Catarse
  module V2
    module Membership
      class TiersAPI < Grape::API
        get '/tiers' do
          result = ::Membership::Tiers::List.result

          present :tiers, result.tiers, with: ::Membership::TierEntity
        end

        get '/tiers/:id' do
          result = ::Membership::Tiers::Find.result(id: params[:id])

          present :tier, result.tier, with: ::Membership::TierEntity
        end
      end
    end
  end
end
```

Dessa forma, o resultado da listagem de níveis de assinatura seria:
```json
{
  "tiers": [
    { "id": 1, "name": "Example", "description": "Some description" },
    { "id": 2, "name": "Example 2", "description": "Some description" },
    { "...": "..." },
  ]
}
```
E o resultado para a rota que retorna um único nível de assinatura seria:
```json
{
  "tier": {
    "id": 1,
    "name": "Example",
    "description": "Some description"
  }
}
```

O padrão de nomenclatura das entities seguem o mesmo: um módulo para definir o assunto, por exemplo: billing, membership
e etc. E o nome do recurso com o sufixo `Entity`. Então a entity `Billing::CreditCardEntity` seria definida no arquivo
`app/entities/billing/credit_card_entity.rb`.

### Enumerations (`app/enumerations`)

As enumerações são classes que organizam listas de valores que dificilmente mudam, por isso que não precisam estar em uma
tabela do banco de dados, sendo escritos no próprio código e geralmente definem como um objeto deve se comportar. Alguns
exemplos de  enumerações: Métodos de pagamento (pix, boleto, cartão de crédito), Tipos de Empresa (mei, me, epp), Meios
de pagamento (PagarMe, PayPal, Stripe) e etc.

Utilizamos a gem [enumerate_it](https://github.com/lucascaton/enumerate_it) para definir as enumerações. Para mais
detalhes do uso da gem, ler o README do projeto no link fornecido.

Essas enumerações são organizadas em módulos por assunto e tem seu nome no plural. Por exemplo:
```ruby
# app/enumerations/billing/payment_methods.rb
module Billing
  class PaymentMethods < EnumerateIt::Base
    associate_values(:credit_card, :pix, :boleto)
  end
end

# app/models/billing/payment.rb
module Billing
  class Payment < ApplicationRecord
    has_enumeration_for :payment_method, with: Billing::PaymentMethods, required: true, create_helpers: true
  end
end
```

Dessa forma a coluna `payment_method` do modelo pagamento precisa estar presente e ser necessariamente algum dos três
valores definidos na enumeração. Outra coisa que o `has_enumeration_for` faz devido ao parâmetro `create_helpers` ser
verdadeiro, é criar os helpers `credit_card?`, `pix?` e `boleto?`, além de outras facilidades.

### Javascript  (`app/javascript`)
> Essa pasta não está em uso e será descontinuada quando migrarmos nosso back-end inteiro para o Grape, e migrando o
> front-end para um app separado.

### Jobs  (`app/jobs`)
Os jobs são classes que servem para executar código assíncronamente. Mais sobre o assunto pode ser encontrado [aqui.](
https://guides.rubyonrails.org/active_job_basics.html).

Os jobs devem ter o mínimo de conhecimento da regra de negócio, o papel deles se limita a buscar um objeto e chamar um
método ou delegar o processamento para uma action. Por exemplo:
```ruby
# app/jobs/notifications/send_newsletter_job.rb
module Notifications
  class SendNewsletterJob < ApplicationJob
    def perform(newsletter_id)
      newsletter = Newsletter.find(newsletter_id)
      Notifications::SendNewsletter.call(newsletter: newsletter)
    end
  end
end
```

### Lib (`app/lib`)
Na pasta lib ficam as classes que auxiliam o funcionamento das actions. Quando uma action fica muito complexa, e não faz
sentido separará-las em actions menores, uma classe auxiliar ajudar a limpar a action, facilitando a manutenção e a
implementação de testes. Um exemplo prático: Na action de criar pagamento, tem muito código complexo relacionado apenas
à construção do pagamento, tipo o código de calcular valores, duplicar endereços, construir os items do pagamento, entre
outras coisas. Então foi criada uma classe chamada PaymentBuilder, que é uma classe simples do Ruby e ela é utilizada da
seguinte forma:

```ruby
module Billing
  module Payments
    class Create < Actor
      def call
        payment = Billing::PaymentBuilder.build(params)
        # ...
      end
    end
  end
end
```

A nomenclatura das classes que ficam na lib seguem nome de objetos e não de verbos/ações. Então ao invés de criar as
classes `BuildPayment`, `SimulateInstallment`, `ActivateUser` são criadas as classes `PaymentBuilder`,
`InstallmentSimulator`, `UserActivator`. E essas classes também podem ser organizadas em modulos representando o assunto
que faz mais sentido para ela, como `billing`, `membership` e etc. Os conceitos dessas classes se aproximam ao padrão
que a comunidade chama de `Service Objects`.

### Mailers (`app/mailers`)
> WIP: Ainda não foi definido nenhum padrão de uso dos mailers

### Models (`app/models`)
Os modelos que utilizamos são os modelos padrão do Rails mesmo. Mas alguns pontos vale a pena ficar de olho:
- Evitar callbacks como `after_save`, `after_update`, `before_create` e afins, para escrever coisas que fujam da
da responsabilidade do modelo. Por exemplo: envio de e-mails, disparo de jobs, criação outros modelos. Essas coisas
devem ser implementadas dentro das actions relacionadas. No entanto é aceitável e recomendado utilizar os callbacks para
casos pontuais onde o código só "toca" no próprio modelo, como por exemplo a limpeza de formatação em um campo de
documento.
  ```ruby
    # ❌ Don't
    module Billing
      class Payment < ApplicationRecord
        after_create :notify_user

        def notify_user
          PaymentNotificationMailer.with(user: user).deliver_later
        end
      end
    end

    # ✅ Do
    module Billing
      class Payment < ApplicationRecord
        before_validation :sanitize_documents

        def sanitize_documents
          # ...
        end
      end
    end
  ```
- Evitar criar escopos (`scope`) com consultas complexas escritas dentro do próprio modelo. Nesses casos a solução é
utilizar um Query Object e atribuí-lo a um escopo. Por exemplo:
  ```ruby
    # ❌ Don't
    module Billing
      class Payment < ApplicationRecord
        scope :overdue, -> {
          left_joins(:model_a).joins(:model_b).where(state: 'some_state').where.not(expires_at: ..Time.zone.now)
        }
        scope :confirmed_last_day, -> {
          where("EXISTS(SELECT true FROM payments p WHERE p.contribution_id = contributions.id AND p.state = ...)")
        }
      end
    end

    # ✅ Do
    module Billing
      class Payment < ApplicationRecord
        scope :overdue, Billing::Payments::OverdueQuery
        scope :confirmed_last_day, Billing::Payments::ConfirmedLastDayQuery
      end
    end
  ```
- Evitar implementar comportamentos complexos dentro dos modelos, sempre que isso for necessário, criar uma action e
escrever o comportamento lá e caso ainda seja necessário que o modelo tenha o método de instância com esse comportamento
, delegar a execução para uma action. Exemplificando:
  ```ruby
    # ❌ Don't
    module Billing
      class Payment < ApplicationRecord
        def expire!
          update(state: 'expired')
          payment_items.each { |pi| pi.update(state: 'expired') }
          PaymentExpirationMailer.with(user: user).deliver_later
        end
      end
    end

    # ✅ Do
    module Billing
      module Payments
        class Expire < Actor
          # code
        end
      end
    end

    module Billing
      class Payment < ApplicationRecord
      end
    end

    # ✅ Ou
     module Billing
      class Payment < ApplicationRecord
        def expire
          Billing::Payments::Expire.result(payment: self)
        end
      end
    end
  ```

### Observers (`app/observers`)
> Aqui ficam as classes que implementam o padrão observer, utilizando a gem 'rails-observers'. Na refatoração esse
> padrão não está sendo utilizado, então tudo indica que será descontinuada em breve.

### Old Actions (`app/old_actions`)
> Aqui ficam as actions utilizadas ainda para as classes das estruturas antigas e não tem relação com a refatoração.

### Queries (`app/queries`)
Na pasta queries ficam as implementações do padrão Query Object (pode ser lido mais sobre esse padrão [aqui](
https://dev.to/renatamarques97/design-patterns-with-ruby-on-rails-part-2-query-object-1h65)). O objetivo das queries
objects é manter seus modelos livres de consultas complexas e isolar cada consulta complexa em sua própria classe. Dessa
forma facilita a implementação dos testes e reutilização de código. Queries com muitos `joins`, `includes`, `where`,
`or`, `group` e etc, ou mesmo código SQL nativo, indicam que é uma boa hora de utilizar o padrão QueryObject.

Um exemplo de query object, que serve para consultar os cartão de créditos seguros:
```ruby
module Billing
  module CreditCards
    class SafelistQuery
      attr_reader :relation

      class << self
        delegate :call, to: :new
      end

      def initialize(relation = Billing::CreditCard)
        @relation = relation
      end

      def call
        relation.joins(:payments).where(billing_payments: { state: 'paid' })
      end
    end
  end
end
```

Essa query pode ser utilizada tanto de forma isolada, assim:
```ruby
safe_credit_cards = Billing::CreditCards::SafelistQuery.call
```

Ou atrelar a query à um `scope` do modelo, dessa forma:
```ruby
module Billing
  class CreditCard < ApplicationRecord
    scope :safelist, Billing::CreditCards::SafelistQuery
  end
end

safe_credit_cards = Billing::CreditCard.safelist
```

As queries são organizadas em módulos simbolizando o assunto, e um módulo simbolizando o recurso que aquela query se
relaciona. Exemplo: `Membership::Subscriptions::OverdueQuery`, `Membership` é o assunto, `Subscriptions` é o recurso que
a query se relaciona, e `OverdueQuery` é o nome que identifica o objetivo da query.

### State Machines (`app/state_machines`)
A pasta state machines serve para colocar as máquinas de estados do projeto. São as máquinas de estados e controlam
todo o fluxo de mudança de estado de um objeto. Por exemplo: Contrar que um pagamento deve ir de pendente para pago, mas
não de pendente para reembolsado. Nesse exemplo, pagamento é o objeto, e pendente, pago e quitado são os estados.

Utilizamos a gem [statesman](https://github.com/gocardless/statesman) para a implementação das máquinas de estado.
Para qualquer dúvida sobre a utilização da gem, ler o README do projeto no link fornecido.

Há um concern que ajuda a não duplicar código e que contém as instruções de uso para utilizar uma state machine em um
modelo. O concern é o `Utils::HasStateMachine` (`app/models/concerns/utils/has_state_machine.rb`), nos comentários do
código explica como utilizá-lo.


### Uploaders (`app/uploaders`)
> WIP: Ainda não foi definido nenhum padrão de uso dos uploaders

### Views (`app/views`)
> Essa pasta será descontinuada quando migrarmos nosso back-end inteiro para o Grape, e migrando o front-end para um app
> separado.
