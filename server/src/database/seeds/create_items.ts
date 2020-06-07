import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('Item').insert([
    { title: 'Lâmpadas', image: 'lampadas.svg'},
    { title: 'Pilas e Baterias', image: 'baterias.svg'},
    { title: 'Papéis e Papelão', image: 'papeis-papelão.svg'},
    { title: 'Resíduos Eletrônicos', image: 'eletronicos.svg'},
    { title: 'Resíduos Orgânicos', image: 'organicos.svg'},
    { title: 'Óleo de cozinha', image: 'oleo.svg'},
  ]);
}