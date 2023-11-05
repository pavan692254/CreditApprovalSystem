const axios = require('axios');
const MySql = require('../Config/sql2')
const customerData = require('../Csv/customer_data.json');
const loanData = require('../Csv/loan_data.json');

const loadInitialData = async () => {
    for (const data of loanData) {

        const sql = 'INSERT INTO loan_data (customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_payment, emis_paid_on_time, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            data.customer_id,
            data.loan_id,
            data.loan_amount,
            data.tenure,
            data.interest_rate,
            data.monthly_payment,
            data['EMIs paid on Time'],
            new Date(data.start_date),
            new Date(data.end_date)
        ];
        await MySql.handleDb(sql, params)
    }
    return `loanData',${loanData.length},'customerData',${customerData.length}`
};

const addCustomer = async (query) => {
    const sql = 'INSERT INTO customer_data (customer_id, first_name, last_name, age, phone_number, monthly_salary, approved_limit) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [
        query.customer_id,
        query.first_name,
        query.last_name,
        query.age,
        query.phone_number,
        query.monthly_salary,
        query.approved_limit,
    ];
    const res = await MySql.handleDb(sql, params)
    return res;
}

const checkEligibility = async (query) => {
    const { customer_id, loan_amount, interest_rate, tenure } = query;
    const sql = `SELECT * FROM customer_data WHERE customer_id=${customer_id}`;
    const res = await MySql.handleDb(sql);
    const result = [];
    for (const data of res) {
        let temp = {};
        temp.customer_id = data.customer_id;
        temp.interest_rate = interest_rate;
        temp.tenure = tenure;
        temp.monthly_payment = loan_amount/12;
        if (data.credit_score > 50) {
            temp.approval = true;
            temp.corrected_interest_rate = 0;
        } else if (data.credit_score > 30  & data.credit_score <= 50) {
            temp.approval = true;
            temp.corrected_interest_rate = 12;
        }else if (data.credit_score >= 10  & data.credit_score <= 30) {
            temp.approval = true;
            temp.corrected_interest_rate = 16;
        }else {
            temp.approval = false;
        }
        result.push(temp);
    }
    return result;
};

const createLoan = async(query) => {
    const { customer_id, loan_amount, interest_rate, tenure} = query;
    const loan_id = Math.floor(1000 + Math.random() * 9000);
    const sql = `select credit_score from customer_data where customer_id = ${customer_id}`;
    const res = await MySql.handleDb(sql);
    const { credit_score } = res[0];
    const userData = {};
    if(credit_score >= 10) {
        userData.loan_id = loan_id;
        userData.customer_id = customer_id;
        userData.loan_approved = "Approved";
        userData.message = "Your loan has been approved";
        monthly_installment = loan_amount/12;
    } else{ 
        userData.loan_id = loan_id;
        userData.customer_id = customer_id;
        userData.loan_approved = "Disapproved";
        userData.message = "Your loan has been Disapproved";
        monthly_installment = 0;
    }
    return userData;
}

const getLoanDetails = async(query) => {
    const { loan_id } = query;
    const sql = `select * from loan_data where loan_id = ${loan_id}`;
    const res = await MySql.handleDb(sql);
    const { customer_id } = res[0];
    const cSql = `select * from customer_data where customer_id = ${customer_id}`;
    const customerData = await MySql.handleDb(sql);
    const data = {
        loan: res[0],
        customer: customerData[0],
    };
    return data;
}

module.exports = {
    loadInitialData,
    addCustomer,
    checkEligibility,
    createLoan,
    getLoanDetails
}