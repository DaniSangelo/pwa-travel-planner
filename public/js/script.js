document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalOrigin = document.getElementById('total-origin');
    const totalDestination = document.getElementById('total-destination');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const fetchExchangeRates = async () => {
        try {
            const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
            const data = await response.json();
            return {
                'USD-BRL': parseFloat(data.USDBRL.bid),
                'EUR-BRL': parseFloat(data.EURBRL.bid)
            };
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return null;
        }
    };

    const renderExpenses = async () => {
        expenseList.innerHTML = '';
        let totalOriginValue = 0;
        let totalDestinationValue = 0;
        const exchangeRates = await fetchExchangeRates();

        if (!exchangeRates) {
            alert('Unable to obtain exchange rates. Please try again later.');
            return;
        }

        expenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.innerHTML = `
                ${expense.description}: ${expense.quantity} x ${expense.value} ${expense.currencyOrigin} -> ${expense.currencyDestination}
                <span>
                    <button class="btn btn-sm btn-warning edit-expense" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-expense" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </span>
            `;
            expenseList.appendChild(li);
            totalOriginValue += expense.value * expense.quantity;

            if (expense.currencyOrigin === 'BRL' && expense.currencyDestination === 'USD') {
                totalDestinationValue += (expense.value * expense.quantity) / exchangeRates['USD-BRL'];
            } else if (expense.currencyOrigin === 'BRL' && expense.currencyDestination === 'EUR') {
                totalDestinationValue += (expense.value * expense.quantity) / exchangeRates['EUR-BRL'];
            } else if (expense.currencyOrigin === 'USD' && expense.currencyDestination === 'BRL') {
                totalDestinationValue += (expense.value * expense.quantity) * exchangeRates['USD-BRL'];
            } else if (expense.currencyOrigin === 'EUR' && expense.currencyDestination === 'BRL') {
                totalDestinationValue += (expense.value * expense.quantity) * exchangeRates['EUR-BRL'];
            } else {
                totalDestinationValue += expense.value * expense.quantity;
            }
        });

        totalOrigin.textContent = totalOriginValue.toFixed(2);
        totalDestination.textContent = totalDestinationValue.toFixed(2);

        document.querySelectorAll('.delete-expense').forEach(button => {
            button.addEventListener('click', deleteExpense);
        });

        document.querySelectorAll('.edit-expense').forEach(button => {
            button.addEventListener('click', editExpense);
        });
    };

    const addExpense = async (event) => {
        event.preventDefault();
        const description = document.getElementById('description').value;
        const quantity = parseFloat(document.getElementById('quantity').value);
        const value = parseFloat(document.getElementById('value').value);
        const currencyOrigin = document.getElementById('currency-origin').value;
        const currencyDestination = document.getElementById('currency-destination').value;

        const expense = { description, quantity, value, currencyOrigin, currencyDestination };
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        await renderExpenses();
        form.reset();
    };

    const deleteExpense = (event) => {
        const index = event.target.closest('button').dataset.index;
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
    };

    const editExpense = (event) => {
        const index = event.target.closest('button').dataset.index;
        const expense = expenses[index];
        document.getElementById('description').value = expense.description;
        document.getElementById('quantity').value = expense.quantity;
        document.getElementById('value').value = expense.value;
        document.getElementById('currency-origin').value = expense.currencyOrigin;
        document.getElementById('currency-destination').value = expense.currencyDestination;
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
    };

    form.addEventListener('submit', addExpense);
    renderExpenses();
});
