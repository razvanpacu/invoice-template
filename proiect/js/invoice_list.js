
"use strict"
getInvoiceList();

function getInvoiceList() { //functia care creeaza array de obiecte pentru a putea ulterior popula DOM cu numele de Customer si Supplier si nu doar cu ID-ul
    var returnedInvoice = new Invoice();
    var returnedSupplier = new Supplier();
    var returnedCustomer = new Customer();
    var returnedInvoiceList = [];
    var returnedCustomersList = [];
    var returnedSuppliersList = [];
    var invoiceListToBePrinted = [];


    // obiectele pe care le vom insera in invoiceListToBePrinted

    fetch(apiLink + "invoices")

        .then(function (response) {
            return response.json();
        })

        .then(function (invoices) {
            for (let i = 0; i < invoices.length; i++) {
                returnedInvoice = searchInvoice(invoices[i].Id, invoices); // returnedInvoice este un obiect in care s-a copiat factura pe care o cautam
                returnedInvoiceList.push(returnedInvoice); //adauga in array factura

            }

            return (returnedInvoiceList);
        })
        .then(function () { return fetch(apiLink + "customers"); })
        .then(function (response) {
            return response.json();
        })
        .then(function (customers) {
            for (let i = 0; i < customers.length; i++) {
                returnedCustomer = searchCustomer(customers[i].Id, customers); // returneaza datele pentru customer cu Id - din raspunsul din fetch
                returnedCustomersList.push(returnedCustomer); //adauga in array de obiecte customers

            }

        })
        .then(function () { return fetch(apiLink + "suppliers"); })
        .then(function (response) {
            return response.json();
        })
        .then(function (suppliers) {
            for (let i = 0; i < suppliers.length; i++) {
                returnedSupplier = searchSupplier(suppliers[i].Id, suppliers); //// returneaza datele pentru customer cu Id - din raspunsul din fetch
                returnedSuppliersList.push(returnedSupplier); //adauga in array customers


            }


        })
        .then(function () { // adaugam in array-ul invoiceListToBePrinted  elemente de tipul invoiceToBePrinted


            invoiceListToBePrinted.length = 0; //initializarea array de facturi cu 0


            for (let i = 0; i < returnedInvoiceList.length; i++) {
                var invoiceToBePrinted = new InvoiceRow();
                invoiceToBePrinted.Id = returnedInvoiceList[i].Id;
                invoiceToBePrinted.Series = returnedInvoiceList[i].Series;
                invoiceToBePrinted.Number = returnedInvoiceList[i].Number;

                invoiceToBePrinted.Date = returnedInvoiceList[i].Date.substr(0, 10); //extragem doar an/luna/zi;
                invoiceToBePrinted.CustomerId = returnedInvoiceList[i].CustomerId;

                invoiceToBePrinted.Customer = searchCustomer(returnedInvoiceList[i].CustomerId, returnedCustomersList).Name; //cautam in array-ul returnedCustomersList 
                // numele care ii corespunde clientului cu idul returnedInvoiceList[i].CustomerId
                invoiceToBePrinted.Supplier = searchSupplier(returnedInvoiceList[i].SupplierId, returnedSuppliersList).Name;
                // // adaugam in array invoice-ul in care id-ul supplierului a fost inlocuit cu numele
                invoiceToBePrinted.SupplierId = returnedInvoiceList[i].SupplierId;
                invoiceListToBePrinted.push(invoiceToBePrinted);
            }
        })
        .then(function () {
            populateInvoiceListDOM(invoiceListToBePrinted)
        })
        .then(function () { // dupa publicare factura pe DOM, asteptam event (click) pe factura
            getListClickDOM();

        })
}



function populateInvoiceListDOM(invoices) { // functia care populeaza lista de facturi in tabel

    for (let i = 0; i < invoices.length; i++) { //prima populare a DOMului 
        var row = i + 1;//nu incepem numaratoarea randurilor de la 0
        document.getElementById("invoiceTableList").innerHTML += '<tr><th  scope="row" id="invoiceId_' + invoices[i].Id + '">' + row + '</th><td>' + invoices[i].Series + '</td><td>'
            + invoices[i].Number + '</td><td>' + invoices[i].Date + '</td><td>' + invoices[i].Customer + '</td><td>' + invoices[i].Supplier +
            '</td><td><input class = "btn" type="image" value = "viewBtn" src="https://img.icons8.com/metro/17/000000/visible.png" alt="edit button"style="margin-right: 0.5vw;"><input class = "btn" type="image" value = "editBtn" src="https://img.icons8.com/metro/17/000000/pencil.png" alt="edit button"style="margin-right: 0.5vw;"><input type="image" value = "deleteBtn" class = "btn" src="https://img.icons8.com/metro/17/000000/trash.png" alt="delete button"></td></tr>';

    }

}



function deleteInvoiceFromRow(row) { // sterge randul pe care este butonul apasat si factura respectiva
    let x = row.parentElement.parentElement;
    var deletedRowNumber = parseInt(x.cells[0].innerHTML); // valoarea randului pe care dorim sa il stergem
    var invoiceId = x.cells[0].id.split("_", 2)[1]; //extragem id-ul facturii pe care dorim sa o afisam
    //document.getElementById("invoiceTableList").deleteRow(deletedRowNumber - 1);
    //combTable(); // renumeroteaza randurile
    console.log("delete  invoice", invoiceId);
    console.log("delete  row", deletedRowNumber);
    document.getElementById("invoiceTableList").deleteRow(deletedRowNumber - 1);
    fetch(apiLink + "invoices/" + invoiceId, {

        method: 'DELETE',
    })
        .then(function (response) {
            alert(response.statusText);
        });

}



function getListClickDOM() { //functia care citeste pe care buton este dat click  
    var x = document.getElementsByClassName("btn"); // atasam unei variabile toate obiectele buton

    for (var i = 0; i < x.length; i++) {

        x[i].addEventListener("click", function () {
            var that = this; // preluam butonul apasat

            var clickedAction = this.value;

            switch (clickedAction) {
                case "editBtn":
                    editInvoiceFromRow(that); //este apasat un buton de edit
                    break;
                case "deleteBtn": deleteInvoiceFromRow(that); //este apasat un buton delete
                    break;
                case "viewBtn": viewInvoiceFromRow(that); //este apasat un buton delete
                    break;

            }

        })

    }

}




function viewInvoiceFromRow(row) {
    var x = row.parentElement.parentElement;
    var invoiceId = x.cells[0].id.split("_", 2)[1]; //extragem id-ul facturii pe care dorim sa o afisam
    window.open("invoice_singular_needitabil.html?id=" + invoiceId, "_blank");
}





function editInvoiceFromRow(row) { // functia de editare a unui rand - a unei facturi
    var x = row.parentElement.parentElement;
    var invoiceId = x.cells[0].id.split("_", 2)[1]; //extragem id-ul facturii pe care dorim sa o afisam
    console.log("edit invoice", invoiceId);
    window.open("invoice_singular_editabil.html?id=" + invoiceId, "_blank");

}




function combTable() { // renumeroteaza randurile tabelului 
    var table = document.getElementById("invoiceTableList");
    var rows = table.getElementsByTagName("th");
    searchedRowNumber = "invoiceRowNumber_";
    searchedProduct = "product_";

    for (let i = 0; i < rows.length; i++) {
        newRow = i + 1;
        invoiceRowNumberID = rows[i].parentElement.childNodes[0].id; //id-ul invoiceRowNumber alcatuit din id="invoiceRowNumber_' + row + '_' + returnedItemsList[i].Id
        rows[i].parentElement.childNodes[0].innerHTML = newRow; // se renumeroteaza randul daca este sters

        searchedRowNumber += newRow + "_" + invoiceRowNumberID.split("_")[2]; // in ID-ul randului am pastrat valoarea de id a produsului, dar am schimbat numarul randului
        rows[i].parentElement.childNodes[0].id = searchedRowNumber;  //pastram un id unic rand+ id-ul produsului din itemslist                                                                     // ne va folosi atunci cand publicam o factura noua

        searchedProductId = rows[i].parentElement.childNodes[1].id;
        searchedProduct += newRow + "_" + searchedProductId.split("_")[2];

        rows[i].parentElement.childNodes[1].id = searchedProduct;

    }
}






