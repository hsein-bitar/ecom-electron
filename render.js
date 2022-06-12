const electron = require('electron');
const { ipcRenderer } = electron;
const remote = electron.remote;

ipcRenderer.on('addItem', addItemForm);
ipcRenderer.on('addCategory', addCategoryForm);
ipcRenderer.on('home', populateHome);

function displayMessage(message, theme) {
    let className;
    if (theme == 0) { className = 'good' } else { className = 'bad' }
    let messag_div = document.createElement("div");
    messag_div.id = 'message_key'
    messag_div.classList.add('message-wrapper')
    messag_div.innerHTML = `
<div class="message ${className}">
    <span>
        ${message}
    </span>
</div>
`;
    let body = document.getElementsByTagName("BODY")[0]
    body.appendChild(messag_div);
    setTimeout(() => {
        document.getElementById('message_key').parentNode.removeChild(document.getElementById('message_key'));
    }, 1000)
}

// fired when user submits register form
function submitRegister() {
    let data = new FormData();
    data.append('name', document.getElementById('name').value)
    data.append('email', document.getElementById('register-email').value)
    data.append('date_of_birth', document.getElementById('date-of-birth').value)
    data.append('password', document.getElementById('register-password').value)
    data.append('gender', document.getElementById('gender').value)
    fetch('http://localhost:8000/api/v1/users/register', {
        method: 'post',
        body: data
    })
        .then(response => response.json())
        .then(response => {
            if (response.status = 'success') {
                displayMessage('User Created', 0)
                localStorage.setItem('user_token', response.authorisation.token);
                inlinks();
            } else {
                displayMessage('Could not register', 1);
            }
        })
        .catch(
            error => {
                console.log(error);
            }
        )
}

function submitLogin() {
    let data = new FormData();
    data.append('email', document.getElementById('login-email').value)
    data.append('password', document.getElementById('login-password').value)
    fetch('http://localhost:8000/api/v1/users/login', {
        method: 'post',
        body: data
    })
        .then(response => response.json())
        .then(response => {
            if (response.status = 'success') {
                if (!response.user.user_type) {
                    displayMessage('Access Denied', 1)
                } else {
                    console.log(response);
                    displayMessage('Login Successful', 0)
                    localStorage.setItem('user_token', response.authorisation.token);
                    inlinks();
                }
            } else {
                displayMessage('Could not login', 1);
            }
        })
        .catch(
            error => {
                console.log(error);
            }
        )

}

function populateHome() {
    let links = document.getElementById('in').children
    for (let link of links) {
        link.classList.remove('active')
    }
    // set home active
    document.getElementById('home').classList.add('active')
    // add none to all forms
    let wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    fetch('http://localhost:8000/api/v1/items/', {
        method: 'post',
        headers: new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
        })
    }).then(response => response.json())
        .then(response => {
            if (response.status == 'success') {
                let gallery = document.createElement("div");
                gallery.id = 'gallery'
                gallery.classList.add('gallery')
                let items = '';
                response.items.forEach(element => {
                    let item = `
          <div class="item">
            <a href="#" id=${element.id}>
              <div class="gradient">
                <span class="caption">
                  ${element.title} 
                  <div class="rating">
                    </div>
                    </span>
                    </div>
                    <img src="${element.image_uri}" />
                    </a>
                    </div>
                    `;
                    items += item;
                });
                gallery.innerHTML = items;
                wrapper.appendChild(gallery);
            }
        }).catch(error => {
            displayMessage('Invalid server response', 1);
            console.log(error);
        })
}

function addItemForm() {
    let links = document.getElementById('in').children;
    for (let link of links) {
        link.classList.remove('active')
    }
    document.getElementById('add-item').classList.add('active')
    let wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    let form_wrapper = document.createElement("div");
    form_wrapper.id = "form-wrapper";
    fetch('http://localhost:8000/api/v1/categories', {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('user_token')
        })
    })
        .then(response => response.json())
        .then(response => {
            let categories = '';
            response.categories.forEach(i => {
                let option = `
                <option value=${i.id}>${i.name}</option>
                `;
                categories += option;

            });
            // TODO call backend get all distinct categories
            let add_item_form = `
            <form id="add-item-form" class="" name="add-item-form" novalidate>
            <input type="text" id="title" placeholder="Enter item title" required/>
            <div>
                <label for="category-id">Category:</label>
                <select name="category-id" id="category-id" required>               
                <option value="" disabled selected hidden>Choose Category...</option>
                     ${categories}
                </select>
            </div>
            <input type="text" id="details" placeholder="Enter item details" required/>
            <div>
                <label for="price">Price:</label>
                <input type="number" id="price" min="1" step="any" required/>
            </div>
            <div>
                <label for="image">Cover:</label>
                <input type="file" id="image" required/>
            </div>
            <div>
                <button onclick="handleAddItem()" id="add-item-submit" class="action" type="button">Add Item</button>
                <button onclick="populateHome()" class="cancel-button" onclick="cancelForm()">Cancel</button>
            </div>
            </form>          
            `;
            form_wrapper.innerHTML = add_item_form;
            wrapper.appendChild(form_wrapper);
            console.log(i)
        })

}
// fired to submit an item
function handleAddItem() {
    let data = new FormData();
    data.append('title', document.getElementById('title').value);
    // TODO convert category selected to its id
    data.append('category_id', 1);
    data.append('details', document.getElementById('details').value);
    data.append('price', document.getElementById('price').value);
    data.append('image', document.getElementById('image').files[0]);
    fetch('http://localhost:8000/api/v1/items/create', {
        method: 'post',
        headers: new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
        }),
        body: data
    }).then(response => response.json())
        .then(response => {
            if (response.status == 'success') {

                document.getElementById('title').value = '';
                // TODO reset category selector to default value
                document.getElementById('details').value = '';
                document.getElementById('price').value = '';
                document.getElementById('image').value = null;
                displayMessage('Item added', 0)
                console.log(response.item);
            }
        }).catch(error => {
            displayMessage('Could not add item', 1)
            console.log(error)
        })
}



function addCategoryForm() {
    let links = document.getElementById('in').children;
    for (let link of links) {
        link.classList.remove('active')
    }
    document.getElementById('add-category').classList.add('active')
    let wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    let form_wrapper = document.createElement("div");
    form_wrapper.id = "form-wrapper";
    let add_category_form = `
      <form id="add-category-form" class="" name="add-category-form" novalidate>
        <input type="text" id="name" placeholder="Enter category name" required>
        <input type="text" id="description" placeholder="Enter category description" required>
        <div>
        <label for="icon">SVG Icon:</label>
        <input type="file" id="icon" required/>
    </div>
        <div>
          <button onclick="handleAddCategory()" id="add-category-submit" class="action" type="button"> Add Category</button>
          <button onclick="populateHome()" class="cancel-button">Cancel</button>
        </div>
      </form>
         `;
    form_wrapper.innerHTML = add_category_form;
    wrapper.appendChild(form_wrapper);
}
// fired to submit an item
function handleAddCategory() {
    let data = new FormData();
    data.append('name', document.getElementById('name').value);
    data.append('description', document.getElementById('description').value);
    // TODO svg string store and input
    data.append('icon', 'icon');
    fetch('http://localhost:8000/api/v1/categories/add', {
        method: 'post',
        headers: new Headers({
            'Authorization': 'Bearer ' + localStorage.getItem('user_token')
        }),
        body: data
    }).then(response => response.json())
        .then(response => {
            if (response.status == 'success') {
                document.getElementById('name').value = '';
                document.getElementById('description').value = '';
                displayMessage('Category added', 0)
                console.log(response.item);
            } else {
                displayMessage('Could not add category', 1)
            }
        }).catch(error => {
            console.log(error)
        })
}

function addLoginForm() {
    let links = document.getElementById('out').children;
    for (let link of links) {
        link.classList.remove('active')
    }
    document.getElementById('login').classList.add('active')
    let wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    let form_wrapper = document.createElement("div");
    form_wrapper.id = "form-wrapper";
    let add_category_form = `
        <form id="login-form" class="" name="login-form" novalidate>
          <input type="email" id="login-email" placeholder="Enter your email" required>
          <!-- password -->
          <label for="password">Password (8 characters minimum):</label>
          <input type="password" id="login-password" name="password" minlength="8" required>
          <div>
            <button onclick="submitLogin()" id="login-submit" class="action" type="button"> Login</button>
            <button onclick="populateHome()" class="cancel-button"> Cancel</button>
          </div>
        </form>
         `;
    form_wrapper.innerHTML = add_category_form;
    wrapper.appendChild(form_wrapper);
}
function addRegisterForm() {
    let links = document.getElementById('out').children;
    for (let link of links) {
        link.classList.remove('active')
    }
    document.getElementById('register').classList.add('active')
    let wrapper = document.getElementById("wrapper");
    wrapper.innerHTML = "";
    let form_wrapper = document.createElement("div");
    form_wrapper.id = "form-wrapper";
    let add_category_form = `
    <form id="register-form" class="" name="register-form" novalidate>
    <input type="text" id="name" placeholder="Enter your name" required>
    <input type="email" id="register-email" placeholder="Enter your email" required>
    <!-- dob -->
    <div>
      <label for="dob">Birthday:</label>
      <input type="date" id="date-of-birth" name="date-of-birth" required>
    </div>
    <!-- gender -->
    <div>
      <label for="gender">Gender:</label>
      <select name="gender" id="gender" required>
        <option value="0">Male</option>
        <option value="1">Female</option>
      </select>
    </div>
    <!-- password -->
    <label for="password">Password (8 characters minimum):</label>
    <input type="password" id="register-password" name="password" minlength="8" required>
    <div>
      <button onclick="submitRegister()" id="register-submit" class="action" type="button"> Register</button>
      <button onclick="populateHome()" class="cancel-button"> Cancel</button>
    </div>
    </form>
         `;
    form_wrapper.innerHTML = add_category_form;
    wrapper.appendChild(form_wrapper);
}
function exit() {
    if (process.platform !== 'darwin') { remote.app.exit(); }
}
function outlinks() {
    let links = document.getElementById('links');
    links.innerHTML = `
  <ul id="out" class="">
    <li onclick="addLoginForm()" id="login"> <a href="#">Login</a></li>
    <li onclick="addRegisterForm()" id="register"> <a href="#">Register</a></li>
    <li onclick="exit()" class="x"> <a href="#">X</a></li>
    </ul>
    `;
    addLoginForm();
}
function inlinks() {
    // TODO add the reviews tab to get all inactive reviews and activate them
    let links = document.getElementById('links');
    links.innerHTML = '';
    links.innerHTML = `
    <ul id="in" class="">
      <li onclick="populateHome()" id="home"> <a href="#">Home</a></li>
      <li onclick="addItemForm()" id="add-item" class=""> <a href="#">Add Item</a></li>
      <li onclick="addCategoryForm()" id="add-category" class=""> <a href="#">Add Category</a></li>
      <li onclick="exit()" class="x"> <a href="#">X</a></li>
    </ul>
      `;
    setTimeout(populateHome, 1000)


}
window.onload = outlinks;