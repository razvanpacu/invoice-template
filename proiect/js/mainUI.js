function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle('active');
  document.getElementById("toggle").classList.toggle('on');
}

// dropdown list content supplier   pagina new invoice
function myFunction() {
  document.getElementById("supplierContent").classList.toggle("show");
}



// dropdown list content customer
function customerFunction() {
  document.getElementById("customerContent").classList.toggle("show");
}




//  add new row to the table pagina new invoice

function insert_Row() {
  var x = document.getElementById('newRow').insertRow(0);
  var y = x.insertCell(0);
  x.appendChild(y);
  document.getElementById("newRow").appendChild(x);
}

// delete the current row
function delete_Row(r) {
  var i = r.parentNode.parentNode.rowindex;
  document.getElementById("newRow").deleteRow(i);
}



//dropdown la navbar

// loops through dropdown buttons to toggle between hiding and showing content
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}



