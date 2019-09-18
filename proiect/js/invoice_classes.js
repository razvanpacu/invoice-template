


class Product {
    constructor(id, name, type) {
        this.Id = id;
        this.Name = name;
        this.ProductType = type;
    }
}


class Supplier {
    constructor(id, name, cui) {
        this.Id = id;
        this.Name = name;
        this.CUI = cui;
    }
}

class Customer {
    constructor(id, name, cui) {
        this.Id = id;
        this.Name = name;
        this.CUI = cui;
    }
}

class InvoiceItem {
    constructor(id, productId, quantity, price, vat, invoiceId, product) {
        this.Id = id;
        this.ProductId = productId;
        this.Quantity = quantity;
        this.VAT = vat;
        this.Price = price;
        this.InvoiceId = invoiceId;
        this.Product = new Product();

    }
}

class Invoice {
    constructor(id, series, number, date, supplierId, customerId, itemsList) {
        this.Id = id;
        this.Series = series;
        this.Number = number;
        this.Date = date;
        this.SupplierId = supplierId;
        this.CustomerId = customerId;
        //this.ItemsList = itemsList;

    }

}

class InvoiceRow {
    constructor(id, series, number, date, customer, customerId, supplier, supplierId) {
        this.Id = id;
        this.Series = series;
        this.Number = number;
        this.Date = date;
        this.Supplier = supplier;
        this.SupplierId = supplierId;
        this.CustomerId = customerId;
        this.Customer = customer;
    }
}

var apiLink = "http://beta.apexcode.ro/api/";


