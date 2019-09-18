getProductDetails();

function getProductDetails() { // functia care populeaza DOM
    var ProductList = [];
    var ProductList = [];

    fetch(apiLink + "products")

    .then(function(response) {
            return response.json();
        })
        .then(function(product) { // cautam furnizorul pentru factura returnata de searchInvoices
            productList = product;

        })
        .then(function() {
            populateDOM(productList); //afisam in DOM factura
        })
        .then(function() { // dupa publicare - asteptam eventuri
            getClickDOM(productList);
        })
}


function populateDOM(list) {

    var x = document.getElementById("tableBody");
    for (i = 0; i < list.length; i++) { // prima populare DOM
        var row = i + 1; //nu incepem numaratoarea randurilor de la 0
        x.innerHTML += '<tr><th>' + row + '</th><td>' + list[i].Name + '</td><td>' + list[i].ProductType + '</td>' +
            '<td><input type="image" class="btn" id="edit_' + list[i].Id + '" src="https://img.icons8.com/metro/17/000000/pencil.png" alt="edit button" style="margin-right: 0.5vw;">' +
            '<input type="image" class="btn" id="delete_' + list[i].Id + '" src="https://img.icons8.com/metro/17/000000/trash.png" alt="delete button"></td></tr>'
    }

}

function getClickDOM(customersList) {
    var x = document.getElementsByClassName("btn"); // atasam unei variabile toate obiectele buton

    for (var i = 0; i < x.length; i++) {

        x[i].addEventListener("click", function() {
            var that = this; // preluam butonul apasat
            var clickedAction = that.id.split("_", 2)[0]; //extragem tipul butonului save/edit/delete
            //exytragem id-ul companiei (pentru produs va fi id-ul produsului)


            switch (clickedAction) {
                case "edit":
                    editRow(that); //este apasat un buton de edit
                    break;
                case "delete":
                    deleteRow(that); //este apasat un buton delete
                    break;
                case "save":
                    publishNew(); //este apasat butonul save
                    break;
                case "edited":
                    {
                        publishEdited(that); //este apasat butonul de Save, dar dupa ce a fost apasat butonul de edit
                        console.log(that);
                    }
            }


        })
    }

}

function editRow(id) {

    var that = id; // preluam butonul apasat
    var x = id.parentElement.parentElement; //preluam continutul liniei pe care este butonul
    var name = x.cells[1].innerText; //preluam numele din coloana a doua a tabelului
    var productType = x.cells[2].innerText; //preluam CUI din coloana a doua a tabelului
    var elementId = that.id.split("_", 2)[1]; //preulam id-ul 
    var itemToEdit = new Product();
    itemToEdit.Id = parseInt(elementId);
    itemToEdit.Name = name;
    itemToEdit.ProductType = productType;
    var newName = document.getElementById("newName");
    newName.value = itemToEdit.Name
    var newProductType = document.getElementById("newProductType");
    newProductType.value = itemToEdit.ProductType;
    newName.focus();
    document.getElementById("save_new").id = "edited_" + itemToEdit.Id; //transformam butonul de save intr-unul de edit
    document.getElementById("edited_" + itemToEdit.Id).innerHTML = "SaveEdited"


}

function deleteRow(id) {

    var that = id; // preluam butonul apasat


    var x = id.parentElement.parentElement; //preluam continutul liniei pe care este butonul


    var elementId = that.id.split("_", 2)[1]; //preulam id-ul 


    var name = x.cells[1].innerText; //preluam numele din coloana a doua a tabelului
    var productType = x.cells[2].innerText; //preluam CUI din coloana a doua a tabelului
    fetch("http://beta.apexcode.ro/api/products/" + elementId, { //!!!!! pentru customers/products trebuie schimbat api link

            method: 'DELETE',
        })
        .then(function(response) {
            console.log(name, productType);
            alert("Item with name: " + name + " " + "and productType: " + productType + " " + " was deleted");
            location.reload(); //refresh la pagina dupa stergere
        });

}

function publishNew() {
    var newName = document.getElementById("newName").value;
    var productType = document.getElementById("newProductType").value;
    if (productType.length > 10) { // verificam daca CUI este lungime buna 
        alert("error min length 6 max length 10");
        document.getElementById("newProductType").focus();

    } else {

        var itemToPublish = {
            "Name": newName,
            "ProductType": productType
        };

        fetch("http://beta.apexcode.ro/api/products", { //!!!ATENTIE LA CALE

                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemToPublish)
            })
            .then(function(response) {
                location.reload();

            });


    }
}


function publishEdited(id) {
    var that = id;
    var newName = document.getElementById("newName").value;
    var newProductType = document.getElementById("newProductType").value;
    var elementId = that.id.split("_", 2)[1];
    console.log(elementId, newName, newProductType);
    if (newProductType.length > 10 || newProductType.length < 1) { // verificam daca CUI este lungime buna 
        alert("error min length 6 max length 10");
        document.getElementById("newProductType").focus();

    } else {

        var itemToPublish = new Product(elementId, newName, newProductType);
        fetch("http://beta.apexcode.ro/api/products/" + elementId, { //!!!ATENTIE LA CALE

                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemToPublish)
            })
            .then(function(response) {
                alert(itemToPublish.Name + " with ProductType" + " " + itemToPublish.ProductType + " " + "was edited");
            })
            .then(function() { // schimbam id-ulbutonului save din  "edited_"+itemToEdit.Id; la "save_new"
                that.id = "save_new";
                that.innerHTML = "Save"; //SCHIMBAM CEEA CE APARE IN TEXTL BUTONULUI

                location.reload(); //refresh la pagina dupa stergere

            })


    }
}