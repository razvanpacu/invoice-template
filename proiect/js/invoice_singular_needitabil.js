
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
        })

        .then(function () { return fetch(apiLink + "customers"); })

        .then(function (response) {
            return response.json();
        })

        .then(function (customers) { // cautam clientul pentru factura

            returnedCustomer = searchCustomer(returnedInvoice.CustomerId, customers);
        })

        .then(function () { return fetch(apiLink + "invoices/" + id + "/items"); })

        .then(function (response) {

            return response.json();

        })

        .then(function (items) { //creem un obiect nou cu toate pozitiile de produs din facturas avand ca referinta id-ul facturii

            returnedItemsList = searchItems(returnedInvoice.Id, items);

        })
        .then(function () {
            populateInvoiceDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList); //afisam in DOM factura
        })

}

function populateInvoiceDOM(returnedInvoice, returnedSupplier, returnedCustomer, returnedItemsList) {

    document.getElementById("supplierName").innerHTML += returnedSupplier.Name;
    document.getElementById("supplierCUI").innerHTML += returnedSupplier.CUI;
    document.getElementById("supplierID").title = returnedSupplier.Id; // stocam id-ul furnizorului in DOM
    document.getElementById("invoiceSeries").innerHTML = returnedInvoice.Series;
    document.getElementById("invoiceNumber").innerHTML = returnedInvoice.Number;
    document.getElementById("invoiceSeries").title = returnedInvoice.Id; // stocam id-ul facturii in DOM

    let invoiceDate = returnedInvoice.Date.substr(0, 10); //extragem doar an/luna/zi
    document.getElementById("invoiceDate").innerHTML = invoiceDate;
    document.getElementById("customerName").innerHTML += returnedCustomer.Name;
    document.getElementById("customerCUI").innerHTML += returnedCustomer.CUI;
    document.getElementById("customerID").title = returnedCustomer.Id;
    var totalValue = 0; // valoarea cu tva insumata  ptr fiecare produs in parte
    var totalValueNoVat = 0; // valoarea fara tva

    for (let i = 0; i < returnedItemsList.length; i++) { //prima populare a DOMului 
        var row = i + 1;//nu incepem numaratoarea randurilor de la 0
        var value = returnedItemsList[i].Price * returnedItemsList[i].Quantity;
        totalValue += value * returnedItemsList[i].VAT;
        totalValueNoVat += value;
        document.getElementById("tableBody").innerHTML += '<tr><th id="invoiceRowNumber_' + row + '_' + returnedItemsList[i].Id + '">' + row + '</th><td title = "' + returnedItemsList[i].Product.ProductType + '"id="product_' + row + '_' + returnedItemsList[i].Product.Id
            + '">' + returnedItemsList[i].Product.Name + '</td><td>' + returnedItemsList[i].Quantity + '</td><td>' +
            returnedItemsList[i].Price + '</td><td>' + value.toFixed(2) +
            '</td><td>' + returnedItemsList[i].VAT + '</td>';

    }

    document.getElementById("tableBody").innerHTML += '<tr><td class="font-weight-bold" colspan="6" align="right" id="totalInvoice">TOTAL VALUE&nbsp;' + totalValueNoVat.toFixed(2) + '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;TOTAL +VAT&nbsp;' + totalValue.toFixed(2) + '</td>'

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