"use strict"

function searchSupplier(supplierId, suppliers) { // returneaza furnizorul pentru un id de furnizor din lista de furnizori - OBIECT
    var returnedSupplier = new Supplier();
    for (let i = 0; i < suppliers.length; i++) {
        if (supplierId == suppliers[i].Id) {
            returnedSupplier.Name = suppliers[i].Name;
            returnedSupplier.CUI = suppliers[i].CUI;
            returnedSupplier.Id = suppliers[i].Id;
        }
    }
    return returnedSupplier;
}

function searchInvoice(idInvoice, invoices) { // returneaza factura pentru un id de factura - OBIECT
    var returnedInvoice = new Invoice();
    for (let i = 0; i < invoices.length; i++) {

        if (idInvoice == invoices[i].Id) {
            returnedInvoice.Id = invoices[i].Id;
            returnedInvoice.Date = invoices[i].Date;
            returnedInvoice.Number = invoices[i].Number;
            returnedInvoice.Series = invoices[i].Series;
            returnedInvoice.SupplierId = invoices[i].SupplierId;
            returnedInvoice.CustomerId = invoices[i].CustomerId;

        }
    }
    return returnedInvoice;
}

function searchCustomer(customerId, customers) { //returneaza un client dupa id - OBIECT
    var returnedCustomer = new Customer();
    for (let i = 0; i < customers.length; i++) {
        if (customerId == customers[i].Id) {
            returnedCustomer.Name = customers[i].Name;
            returnedCustomer.Id = customers[i].Id;
            returnedCustomer.CUI = customers[i].CUI;
        }
    }
    return returnedCustomer;
}

function searchItems(invoiceId, items) { //returneaza un array de produse corespunzator facturii cu Id
    var returnedItemsList = [];
    for (let i = 0; i < items.length; i++) {
        if (invoiceId == items[i].InvoiceId) {
            var returnedItem = new InvoiceItem();
            returnedItem.Id = items[i].Id;
            returnedItem.ProductId = items[i].ProductId;
            returnedItem.Quantity = items[i].Quantity;
            returnedItem.Price = items[i].Price;
            returnedItem.VAT = items[i].VAT;
            returnedItem.InvoiceId = items[i].InvoiceId;
            returnedItem.Product.Id = items[i].Product.Id;
            returnedItem.Product.Name = items[i].Product.Name;
            returnedItem.Product.ProductType = items[i].Product.ProductType;

            returnedItemsList.push(returnedItem); // se adauga un obiect Item nou in sirul de obiecte
        }

    }
    return returnedItemsList;
}