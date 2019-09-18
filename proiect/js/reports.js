// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };


    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };


    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };


    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // new de ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // noi produse pe baza de "inc"(client) si "exp"(supplier)
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push 
            data.allItems[type].push(newItem);

            // Returnam elementul nou
            return newItem;
        },


        deleteItem: function (type, id) { // functie stergere item
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },


        calculateBudget: function () {

            // calculam total client/ supplier
            calculateTotal('exp');
            calculateTotal('inc');

            // calculam bugetul client - suuplier
            data.budget = data.totals.inc - data.totals.exp;

            // calculam procentaj, cat am cheltuit din client
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();




// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };


    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };


    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },


        addListItem: function (obj, type) {
            var html, newHtml, element;
            //  HTML string cu placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // inlocuim placeholder cu datele actuale
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // inseram HTML in DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },


        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },


        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },


        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },


        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },


        displayMonth: function () {
            var now, months, month, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },


        changedType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },


        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();




// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };


    var updateBudget = function () {

        // 1.calculam budget
        budgetCtrl.calculateBudget();

        // 2. returnam budget
        var budget = budgetCtrl.getBudget();

        // 3. afisam budget in UI
        UICtrl.displayBudget(budget);
    };


    var updatePercentages = function () {

        // 1. calculam percentage
        budgetCtrl.calculatePercentages();

        // 2. citim percentage din budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update UI cu noul percentage
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function () {
        var input, newItem;

        // 1.  input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. adaugam item in budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. adaugam item in UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. calc si actualizam budget
            updateBudget();

            // 6. calc si actualizam percentage
            updatePercentages();
        }
    };


    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. stergem item din data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. stergem item din UI
            UICtrl.deleteListItem(itemID);

            // 3. actualizam si aratam noul budget
            updateBudget();

            // 4. calc si actualizam percentage
            updatePercentages();
        }
    };


    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);


controller.init();

/********* api  *************/

var linkAPI = "http://beta.apexcode.ro/api/"

/******************************** Customer  **************************/

class Customer {
    constructor(id, name, cui) {
        this.Id = id;
        this.Name = name;
        this.CUI = cui;
    }
}

class CustomerRow {
    constructor(id, name, customer, customerId, ) {
        this.Id = id;
        this.Name = name;
        this.CustomerId = customerId;
        this.Customer = customer;
    }
}

// functia care arata numele clientiilor in lista

function reloadAllCostumer() {
    fetch(linkAPI + "customers")
        .then(resp => resp.json())
        .then(function (json) {

            for (var i = 0; i < json.length; i++) {

                document.getElementById("posts").innerHTML +=
                    "<option value='" + json[i].Id + "'>" + json[i].Name + "</option>";
            }

        })
}
reloadAllCostumer();


function getSelectedValue() { // functie de selectare a valorii 
    var selectedValue = document.getElementById("posts").value;

};

getSelectedValue();




function getAllCustomer() { // functie care afiseaza toate datele din db customer
    document.getElementById("posts").addEventListener('click', function (event) {
        fetch(linkAPI + "customers")
            .then((res) => res.json())
            .then((data) => {
                let output = '<h2 class="mb-4">All Customer</h2>';
                data.forEach(function (post) {
                    output += `
                  
                    <tbody id="customerTableList"></tbody>
                    <table class="table">
                    <thead class="thead-dark">
                        <tr id="tabelRow">
                            <th >${post.Id}</th>
                            <th >${post.Name}</th>
                            <th >${post.CUI}</th>
                        </tr>
                    </thead>
       `;
                });
                document.getElementById('output').innerHTML = output;
            })
    })
};

getAllCustomer();




/****************** Supplier  ********************/
class Supplier {
    constructor(id, name, cui) {
        this.Id = id;
        this.Name = name;
        this.CUI = cui;
    }
}

function reloadAllSupplier() {
    fetch(linkAPI + "suppliers")
        .then(resp => resp.json())
        .then(function (json) {

            for (var i = 0; i < json.length; i++) {

                document.getElementById("posts1").innerHTML +=
                    "<option value='" + json[i].Id + "'>" + json[i].Name + "</option>";
            }

        })
}
reloadAllSupplier();

function getAllSupplier() { // functie care afiseaza toate datele din db supplier
    document.getElementById("posts1").addEventListener('click', function (event) {
        fetch(linkAPI + "suppliers")
            .then((res) => res.json())
            .then((data) => {
                let output = '<h2 class="mb-4">All Supplier</h2>';
                data.forEach(function (post) {
                    output += `
                    <table class="table">
                    <thead class="thead-dark">
                        <tr>
                            <th scope="col">${post.Id}</th>
                            <th scope="col">${post.Name}</th>
                            <th scope="col">${post.CUI}</th>
                        </tr>
                    </thead>
        `;
                });
                document.getElementById('output1').innerHTML = output;
            })
    })
};

getAllSupplier();

/*********************** Products  **********************/
function reloadAllProduct() {
    fetch(linkAPI + "products")
        .then(resp => resp.json())
        .then(function (json) {

            for (var i = 0; i < json.length; i++) {

                document.getElementById("posts2").innerHTML +=
                    "<option value='" + json[i].Id + "'>" + json[i].Name + "</option>";
            }

        })
}
reloadAllProduct();

function getAllProduct() { // functie care afiseaza toate datele din db supplier
    document.getElementById("posts2").addEventListener('click', function (event) {
        fetch(linkAPI + "products")
            .then((res) => res.json())
            .then((data) => {
                let output = '<h2 class="mb-4">All Product</h2>';
                data.forEach(function (post) {
                    output += `
                    <table class="table">
                    <thead class="thead-dark">
                        <tr>
                            <th scope="col">${post.Id}</th>
                            <th scope="col">${post.Name}</th>
                            <th scope="col">${post.ProductType}</th>
                        </tr>
                    </thead>
        `;
                });
                document.getElementById('output').innerHTML = output;
            })
    })
};

getAllProduct();