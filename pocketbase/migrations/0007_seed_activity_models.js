migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('advanced_activities')

    const activities = [
      {
        title: 'Fundamentos de JavaScript: Variáveis e Loops',
        type: 'Código',
        difficulty: 'Médio',
        order_number: 1,
      },
      {
        title: 'Manipulação de DOM com TypeScript',
        type: 'Código',
        difficulty: 'Médio',
        order_number: 2,
      },
      {
        title: 'Introdução a Hooks: useState e useEffect',
        type: 'Código',
        difficulty: 'Médio',
        order_number: 3,
      },
      {
        title: 'Playground CSS: Grid e Flexbox',
        type: 'Sandbox',
        difficulty: 'Médio',
        order_number: 4,
      },
      {
        title: 'Experimentação com Tailwind CSS',
        type: 'Sandbox',
        difficulty: 'Médio',
        order_number: 5,
      },
      {
        title: 'Laboratório de Lógica Proposicional',
        type: 'Sandbox',
        difficulty: 'Médio',
        order_number: 6,
      },
      {
        title: 'Algoritmos de Ordenação de Arrays',
        type: 'Exercício',
        difficulty: 'Médio',
        order_number: 7,
      },
      {
        title: 'Validação de Formulários Reativos',
        type: 'Exercício',
        difficulty: 'Médio',
        order_number: 8,
      },
      {
        title: 'Consumo de APIs com Fetch API',
        type: 'Exercício',
        difficulty: 'Médio',
        order_number: 9,
      },
      {
        title: 'Desenvolvimento de Portfolio Pessoal',
        type: 'Projeto',
        difficulty: 'Médio',
        order_number: 10,
      },
      {
        title: 'Sistema de Gerenciamento de Tarefas',
        type: 'Projeto',
        difficulty: 'Médio',
        order_number: 11,
      },
      {
        title: 'Landing Page Responsiva para E-commerce',
        type: 'Projeto',
        difficulty: 'Médio',
        order_number: 12,
      },
      {
        title: 'Otimização de Performance em Listas Longas',
        type: 'Desafio',
        difficulty: 'Médio',
        order_number: 13,
      },
      {
        title: 'Refatoração de Código Legado',
        type: 'Desafio',
        difficulty: 'Médio',
        order_number: 14,
      },
      {
        title: 'Criação de um Custom Hook para Autenticação',
        type: 'Desafio',
        difficulty: 'Médio',
        order_number: 15,
      },
    ]

    for (const act of activities) {
      try {
        app.findFirstRecordByData('advanced_activities', 'title', act.title)
      } catch (_) {
        const record = new Record(collection)
        record.set('title', act.title)
        record.set('type', act.type)
        record.set('difficulty', act.difficulty)
        record.set('order_number', act.order_number)
        record.set('is_active', true)
        app.save(record)
      }
    }
  },
  (app) => {
    const titles = [
      'Fundamentos de JavaScript: Variáveis e Loops',
      'Manipulação de DOM com TypeScript',
      'Introdução a Hooks: useState e useEffect',
      'Playground CSS: Grid e Flexbox',
      'Experimentação com Tailwind CSS',
      'Laboratório de Lógica Proposicional',
      'Algoritmos de Ordenação de Arrays',
      'Validação de Formulários Reativos',
      'Consumo de APIs com Fetch API',
      'Desenvolvimento de Portfolio Pessoal',
      'Sistema de Gerenciamento de Tarefas',
      'Landing Page Responsiva para E-commerce',
      'Otimização de Performance em Listas Longas',
      'Refatoração de Código Legado',
      'Criação de um Custom Hook para Autenticação',
    ]

    for (const title of titles) {
      try {
        const record = app.findFirstRecordByData('advanced_activities', 'title', title)
        app.delete(record)
      } catch (_) {}
    }
  },
)
