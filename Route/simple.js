const data = require('../data.json');
const optionsController = require('../Controllers/options')
const MySql = require('../Config/sql2')

module.exports = [
  {
    method: 'GET',
    path: '/db',
    options: {
      handler: async (request) => {
        const a = await MySql.handleDb('SELECT * FROM customer_data');
        return a;
      },
    },
  },
  {
    method: 'GET',
    path: '/loadData',
    options: {
      handler: async (request) => {
        const data = await optionsController.loadInitialData();
        return data;
      },
    },
  },
  {
    method: 'GET',
    path: '/register',
    options: {
      handler: async (request) => {
        const { query } = request
        const data = await optionsController.addCustomer(query);
        return query;
      },
    },
  },
  {
    method: 'GET',
    path: '/check-eligiblity',
    options: {
      handler: async (request) => {
        const { query } = request
        const data = await optionsController.checkEligibility(query);
        return [...data];
      },
    },
  },
  {
    method: 'GET',
    path: '/create-loan',
    options: {
      handler: async (request) => {
        const { query } = request
        const data = await optionsController.createLoan(query);
        return data;
      },
    },
  },
  {
    method: 'GET',
    path: '/view-loan',
    options: {
      handler: async (request) => {
        const { query } = request
        const data = await optionsController.getLoanDetails(query);
        return data;
      },
    },
  },
];