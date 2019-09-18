
"use strict"

var urlParameter = new URLSearchParams(window.location.search).toString(); // preluam stringul de dupa ? de forma id=X

var invoiceId = urlParameter.split("=", 2)[1]; //citim valoarea idului facturii pe care dorim sa o afisam
console.log(invoiceId);
getInvoiceDetails(invoiceId);


function getInvoiceDetails(id) { //functia care populeaza pe DOM factura cu un anumit id 
    var idInvoice = id;
    var returnedInvoice = new Invoice();
    var returnedSupplier = new Supplier();
    var returnedCustomer = new Customer();
    var returnedItemsList = [];
    var suppliersList = [];
    var customersList = [];
    var productList = [];


    fetch(apiLink + "invoices")

        .then(function (response) {
            return response.json();
        })

        .then(function (invoices) {
            returnedInvoice = searchInvoice(idInvoice, invoices); // returnedInvoice este un obiect in care s-a copiat factura pe care o cautam
        })
        .then(function () { return fetch(apiLink + "suppliers"); })

        .then(function (response) {
            return response.json();
        })

        .then(function (suppliers) { // cautam furnizorul pentru factura returnata de searchInvoices
            returnedSupplier = searchSupplier(returnedInvoice.SupplierId, suppliers);
            suppliersList = suppliers;

        })
        .then(function () { return fetch(apiLink + "products"); })

        .then(function (response) {
            return response.json();
        })

        .then(function (products) { // cautam furnizorul pentru factura returnata de searchInvoices
            
            productList = products;

        })

        .then(function () { return fetch(apiLink + "customers"); })

        .then(function (response) {
            return response.json();
        })

        .then(function (customers) { // cautam clientul pentru factura

            returnedCustomer = searchCustomer(returnedInvoice.CustomerId, customers);
            customersList = customers;
        })

        .then(function () { return fetch(apiLink + "invoices/" + id + "/items"); })

        .then(function (response) {

            return response.json();

        })

        .then(function (items) { //creem un obiect nou cu toate pozitiile de produs din facturas avand ca referinta id-ul facturii

            returnedItemsList = searchItems(returnedInvoice.Id, items);

        })
        .then(function () {
            populateEditabilInvoiceDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList, suppliersList, customersList, productList); //afisam in DOM factura
        })
        .then(function () { // dupa publicare - asteptam eventuri
            getInvoiceClickDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList, suppliersList, customersList, productList);
        })

}

function populateOptionList(selectId, optionId, optionList) { // populam dropdown 
    //selectId este id-ul elementului caruia ii facem editarea in DOM
    //optionId - este id-ul corespunzator customer/supplier/product cautat
    //optionList - este lista intreaga de customers/suppliers/products
    var toBePopulated = document.getElementById(selectId);
    for (let i = 0; i < optionList.length; i++) {
        if (optionList[i].Id == optionId) {
            toBePopulated.innerHTML += '<option value="' + optionList[i].Id + '"selected="selected" name="' + optionList[i].Name + '">' + optionList[i].Name + '</option>';
        }
        else {
            toBePopulated.innerHTML += '<option value="' + optionList[i].Id + '"name="' + optionList[i].Name + '">' + optionList[i].Name + '</option>';
        }
    }

}


function populateCUI(selectId, optionId, optionList) { //extrage din lista de C/S dupa Id -  si populeaza in invoice CUI  coresp
    //selectId este id-ul elementului caruia ii facem editarea in DOM
    //optionId - este id-ul corespunzator customer/supplier cautat
    //optionList - este lista intreaga de customers/suppliers
    var toBePopulated = document.getElementById(selectId);
    toBePopulated.innerHTML = '';
    for (let i = 0; i < optionList.length; i++) {
        if (optionList[i].Id == optionId) {

            toBePopulated.innerHTML += optionList[i].CUI; //adaugam valoarea CUI ptr supplier/customer
        }
    }
}

function populateProduct(selectId, productList) {
    var toBePopulated = document.getElementById(selectId);

}
function getInvoiceClickDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList, suppliersList, customersList) {

    document.getElementById("container").addEventListener("change", e => {
        // event listener pentru orice dropdown avem in DOM
        let el = e.target;

        switch (el.id) {
            case "supplierOptions": { // daca s-a schimbat dropdown suppliers
                let selectId = "supplierCUI";
                let value = el.value;
                populateCUI(selectId, value, suppliersList); //schimbam cui afisat in factura
                break;
            }
            case "customerOptions": { // daca s-a schimbat dropdown customers
                let selectId = "customerCUI";
                let value = el.value;
                populateCUI(selectId, value, customersList);
                break;
            }
        }
    });

    document.getElementById("container").addEventListener("click", e => {
        // event listener pentru orice dropdown avem in DOM
        let el = e.target;
        var butonClicked = el.id.split("_", 2)[0];
        var butonId = el.id.split("_", 2)[1]
        switch (butonClicked) {
            case "addNewRow": {
                console.log("addNewRow");
                addNewRow("tableBody");
                break;

            }
            case "deleteRow": {
                console.log("delete row", butonId);
                let x = el.parentElement.parentElement;
                let deletedRowNumber = parseInt(x.cells[0].innerHTML);
                console.log(deletedRowNumber);
                document.getElementById("tableBody").deleteRow(deletedRowNumber - 1);
                combTable();
                calcInvoiceTotal();
                //deleteInvoiceRow(row);
                break;

            }
        }
    });

    function combTable() { // renumeroteaza randurile tabelului 
        var table = document.getElementById("tableBody");
        var rows = table.getElementsByTagName("th");

        for (let i = 0; i < rows.length; i++) {
            let newRow = i + 1;
            //id-ul invoiceRowNumber alcatuit din id="invoiceRowNumber_' + row + '_' + returnedItemsList[i].Id
            rows[i].parentElement.childNodes[0].innerHTML = newRow; // se renumeroteaza randul daca este sters


        }
    }

    document.getElementById("saveInvoice").addEventListener("click", e => {
        console.log("SAVE");
    });

    document.getElementById("cancelInvoice").addEventListener("click", e => {
        console.log("cancelInvoice");
        //apelam pagina in care este factura originala
        window.open("invoice_singular_needitabil.html?id=" + invoiceId, "_self");

    });

}

function deleteInvoiceRow(row) { // sterge randul pe care este butonul apasat
    let x = row.parentElement.parentElement;
    deletedRowNumber = parseInt(x.cells[0].innerHTML); // valoarea randului pe care dorim sa il stergem
    document.getElementById("tableBody").deleteRow(deletedRowNumber - 1);
    combTable(); // renumeroteaza randurile
    calcInvoiceTotal(); // recalculeaza totalul in factura
}

function dateValidation(date) { //nu poate fi setata o data din viitor

}
function selectProduct(row, productList) {

}
function addNewRow(tableId) {
    let tableRef = document.getElementById(tableId);



}
function populateEditabilInvoiceDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList, suppliersList, customersList) {


    //  //PRIMA POPULARE CU DATE

    //DROPDOWN SUPPLIERS
    var selectId = "supplierOptions"; // id-ul selectului care urmeaza sa fie populat
    var optionId = returnedSupplier.Id; // supplier original al facturii
    var optionList = suppliersList;
    populateOptionList(selectId, optionId, optionList);
    var selectId = "supplierCUI";
    populateCUI(selectId, optionId, optionList);

    //DROPDOWN CUSTOMERS

    var selectId = "customerOptions"; // id-ul selectului care urmeaza sa fie populat
    var optionId = returnedCustomer.Id; // customer original al facturii
    var optionList = customersList;
    populateOptionList(selectId, optionId, optionList);
    var selectId = "customerCUI";
    populateCUI(selectId, optionId, optionList);

    document.getElementById("invoiceSeries").title = returnedInvoice.Id;  // stocam id-ul facturii in DOM
    document.getElementById("invoiceSeries").value = returnedInvoice.Series;
    document.getElementById("invoiceNumber").value = returnedInvoice.Number;
    let invoiceDate = returnedInvoice.Date.split("T", 2)[0]; //luam data facturii, fara ora:minute
    console.log(invoiceDate);
    document.getElementById("invoiceDate").value = invoiceDate;

    var totalValue = 0; // valoarea cu tva insumata  ptr fiecare produs in parte
    var totalValueNoVat = 0; // valoarea fara tva

    for (let i = 0; i < returnedItemsList.length; i++) { //prima populare a DOMului 
        var row = i + 1;//nu incepem numaratoarea randurilor de la 0
        var value = returnedItemsList[i].Price * returnedItemsList[i].Quantity;
        totalValue += value * returnedItemsList[i].VAT;
        totalValueNoVat += value;
        document.getElementById("tableBody").innerHTML += '<tr><th>' + row + '</th><td title = "' + returnedItemsList[i].Product.ProductType + '"id="product_' + row + '_' + returnedItemsList[i].Product.Id
            + '">' + returnedItemsList[i].Product.Name + '</td><td>' + returnedItemsList[i].Quantity + '</td><td>' +
            returnedItemsList[i].Price + '</td><td>' + value.toFixed(2) +
            '</td><td>' + returnedItemsList[i].VAT + '</td><td><input type="image" id="deleteRow_' + returnedItemsList[i].Id + '" class = "btn" src="https://img.icons8.com/metro/17/000000/trash.png" alt="delete button"></td>';
    }
    document.getElementById("tableBody").innerHTML += '<tr><td class="font-weight-bold" colspan="6" align="right" id="totalInvoice">TOTAL VALUE&nbsp;' + totalValueNoVat.toFixed(2) + '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;TOTAL +VAT&nbsp;' + totalValue.toFixed(2) + '</td>'
    calcInvoiceTotal();


    // document.getElementById("supplierName").innerHTML += returnedSupplier.Name;
    // // document.getElementById("supplierOptions").innerHTML += '<option id="' + optionList[i].Id + '"selected="selected">' + optionList[i].Name + '</option>'
    // document.getElementById("supplierName").value = returnedSupplier.Id;
    // document.getElementById("supplierCUI").innerHTML += returnedSupplier.CUI;
    // document.getElementById("supplierID").title = returnedSupplier.Id; // stocam id-ul furnizorului in DOM

    // 
    // document.getElementById("invoiceSeries").title = returnedInvoice.Id; // stocam id-ul facturii in DOM

    // let invoiceDate = returnedInvoice.Date.substr(0, 10); //extragem doar an/luna/zi
    // document.getElementById("invoiceDate").value = invoiceDate;
    // document.getElementById("customerName").innerHTML += returnedCustomer.Name;
    // document.getElementById("customerCUI").innerHTML += returnedCustomer.CUI;
    // document.getElementById("customerID").title = returnedCustomer.Id;


    // for (let i = 0; i < returnedItemsList.length; i++) { //prima populare a DOMului 
    //     var row = i + 1;//nu incepem numaratoarea randurilor de la 0
    //     var value = returnedItemsList[i].Price * returnedItemsList[i].Quantity;
    //     totalValue += value * returnedItemsList[i].VAT;
    //     totalValueNoVat += value;
    //     document.getElementById("tableBody").innerHTML += '<tr><th id="invoiceRowNumber_' + row + '_' + returnedItemsList[i].Id + '">' + row + '</th><td title = "' + returnedItemsList[i].Product.ProductType + '"id="product_' + row + '_' + returnedItemsList[i].Product.Id
    //         + '">' + returnedItemsList[i].Product.Name + '</td><td>' + returnedItemsList[i].Quantity + '</td><td>' +
    //         returnedItemsList[i].Price + '</td><td>' + value.toFixed(2) +
    //         '</td><td>' + returnedItemsList[i].VAT + '</td>';

    // }

    // document.getElementById("tableBody").innerHTML += '<tr><td class="font-weight-bold" colspan="6" align="right" id="totalInvoice">TOTAL VALUE&nbsp;' + totalValueNoVat.toFixed(2) + '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;TOTAL +VAT&nbsp;' + totalValue.toFixed(2) + '</td>'

}



function calcInvoiceTotal() { //calculeaza totalul facturii

    var invoiceTotal = 0;
    var invoiceTotalNoVat = 0;

    var table = document.getElementById("tableBody");
    var rows = table.getElementsByTagName("th");

    for (let i = 0; i < rows.length; i++) {

        let itemPrice = parseFloat(rows[i].parentElement.childNodes[3].innerHTML); //pretul 

        let itemQuantity = parseFloat(rows[i].parentElement.childNodes[2].innerHTML); // cantitatea
        let itemVat = parseFloat(rows[i].parentElement.childNodes[5].innerHTML); // TVA
        let itemValue = itemPrice * itemQuantity;

        if (Number.isNaN(itemValue)) { // daca nu este introdus un numar, punem valoarea pe 0
            rows[i].parentElement.childNodes[4].innerHTML = 0; //valoare
        }
        else {
            rows[i].parentElement.childNodes[4].innerHTML = itemValue.toFixed(2); //valoare cu doua zecimale

        }


        invoiceTotal += itemPrice * itemQuantity * itemVat;
        invoiceTotalNoVat += itemPrice * itemQuantity;

    }
    if (isNaN(invoiceTotal)) { }
    else {
        let totalInvoiceHTML = "TOTAL VALUE&nbsp; " + invoiceTotalNoVat.toFixed(2) + " &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;TOTAL +VAT&nbsp; " + invoiceTotal.toFixed(2);
        document.getElementById("totalInvoice").innerHTML = totalInvoiceHTML;
        console.log("invoiceTotal", invoiceTotal);
    }

}