const MySql = require('../Config/sql2')
const customerData = require('../Csv/customer_data.json');
const loanData = require('../Csv/loan_data.json');

// Helper to calculate EMI
const calculateEMI = (principal, annualRate, tenureMonths) => {
    const r = annualRate / 12 / 100;
    return principal * r * Math.pow(1+r, tenureMonths) / (Math.pow(1+r, tenureMonths)-1);
};

// Load initial loan & customer data
const loadInitialData = async () => {
    for (const data of customerData) {
        const sql = `INSERT INTO customer_data 
            (customer_id, first_name, last_name, age, phone_number, monthly_salary, approved_limit, credit_score) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            data.customer_id,
            data.first_name,
            data.last_name,
            data.age,
            data.phone_number,
            data.monthly_salary,
            data.approved_limit || 0,
            data.credit_score || 50
        ];
        await MySql.handleDb(sql, params);
    }

    for (const data of loanData) {
        const sql = `INSERT INTO loan_data 
            (customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_payment, emis_paid_on_time, start_date, end_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
        await MySql.handleDb(sql, params);
    }
    return `Loaded ${loanData.length} loans, ${customerData.length} customers`;
};

// Add new customer
const addCustomer = async (query) => {
    const sql = `INSERT INTO customer_data 
        (customer_id, first_name, last_name, age, phone_number, monthly_salary, approved_limit, credit_score) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        query.customer_id,
        query.first_name,
        query.last_name,
        query.age,
        query.phone_number,
        query.monthly_salary,
        query.approved_limit || 0,
        query.credit_score || 50
    ];
    return await MySql.handleDb(sql, params);
};

// Check loan eligibility
const checkEligibility = async (query) => {
    const { customer_id, loan_amount, tenure } = query;
    const sql = 'SELECT * FROM customer_data WHERE customer_id = ?';
    const res = await MySql.handleDb(sql, [customer_id]);

    if (!res.length) return { error: "Customer not found" };

    const customer = res[0];
    const result = { customer_id: customer.customer_id };

    // Age & income rules
    if (customer.age < 21 || customer.age > 60) {
        result.approval = false;
        result.reason = "Age not eligible";
        return result;
    }

    if (customer.monthly_salary < 15000) {
        result.approval = false;
        result.reason = "Income too low";
        return result;
    }

    // Credit score-based interest
    let baseRate;
    if (customer.credit_score >= 750) baseRate = 8;
    else if (customer.credit_score >= 650) baseRate = 10;
    else if (customer.credit_score >= 550) baseRate = 12;
    else {
        result.approval = false;
        result.reason = "Low credit score";
        return result;
    }

    const emi = calculateEMI(loan_amount, baseRate, tenure);
    result.approval = true;
    result.interest_rate = baseRate;
    result.monthly_payment = Math.round(emi);
    return result;
};

// Create loan
const createLoan = async (query) => {
    const eligibility = await checkEligibility(query);

    if (!eligibility.approval) {
        return { ...eligibility, loan_id: Math.floor(1000 + Math.random() * 9000) };
    }

    const loan_id = Math.floor(1000 + Math.random() * 9000);
    const sql = `INSERT INTO loan_data 
        (customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_payment, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const start_date = new Date();
    const end_date = new Date();
    end_date.setMonth(end_date.getMonth() + query.tenure);

    await MySql.handleDb(sql, [
        query.customer_id,
        loan_id,
        query.loan_amount,
        query.tenure,
        eligibility.interest_rate,
        eligibility.monthly_payment,
        start_date,
        end_date
    ]);

    return {
        loan_id,
        loan_approved: "Approved",
        message: "Your loan has been approved",
        ...eligibility
    };
};

// Get loan & customer details
const getLoanDetails = async (query) => {
    const sql = 'SELECT * FROM loan_data WHERE loan_id = ?';
    const loans = await MySql.handleDb(sql, [query.loan_id]);
    if (!loans.length) return { error: "Loan not found" };

    const loan = loans[0];
    const customers = await MySql.handleDb('SELECT * FROM customer_data WHERE customer_id = ?', [loan.customer_id]);
    return { loan, customer: customers[0] };
};

module.exports = {
    loadInitialData,
    addCustomer,
    checkEligibility,
    createLoan,
    getLoanDetails
};
