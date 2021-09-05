"use strict";

const storageKey = "visma-pizzas";
const tabBtns = document.querySelectorAll("#tab-btns .tab-btn");
const noItemsMsg = document.querySelector("#no-items-msg");
const itemImgs = document.querySelectorAll("#item-photos img");
const itemImgInput = document.querySelector("#item-img-url");
const itemNameInput = document.querySelector("#item-name");
const itemPriceInput = document.querySelector("#item-price");
const itemHeatInput = document.querySelector("#item-heat");
const itemToppingsInput = document.querySelector("#item-toppings");
const newItemForm = document.querySelector("#add-new-item-form");
const sortingForm = document.querySelector("#sorting-form");
const menuContainer = document.querySelector("#items");

const tabOpen = (e) => {
    const elClicked = e.target;
    tabBtns.forEach((item) => {
        const tabId = item.getAttribute("data-tab-id");
        if (item === elClicked) {
            item.classList.remove("tab-btn-inactive");  
            item.classList.add("tab-btn-active");
            document.getElementById(tabId).style.display = "block";

        }
        else {
            item.classList.remove("tab-btn-active");  
            item.classList.add("tab-btn-inactive");
            document.getElementById(tabId).style.display = "none";
        }
    });
};

const imgSelect = (e) => {
    const imgClicked = e.target;
    const url = imgClicked.src;
    itemImgInput.value = url;
    itemImgs.forEach((item) => {
        if (item === imgClicked) {
            item.classList.add("selected");
        }
        else {
            item.classList.remove("selected");
        }
    });
    
};

const formReset = () => {
    itemNameInput.value = "";
    itemPriceInput.value = "";
    itemHeatInput.value = "";
    itemToppingsInput.value = "";
    itemImgInput.value = "img/pizza-06.jpg"
    itemImgs.forEach((item) => {
        item.classList.remove("selected");
    });
}

const duplicateToppings = (arr) => {
    const nonEmptyArr = [];
    arr.forEach((item) => {
        let trimmedVal = item.trim();
        if (trimmedVal) {
            nonEmptyArr.push(trimmedVal);
        }
    });

    const uniqueArray = Array.from(new Set(nonEmptyArr));

    return uniqueArray;
};

const duplicateNames = (itemName) => {
    let found = false;

    const itemsData = JSON.parse(sessionStorage.getItem(storageKey)) || [];

    for (let i = 0; i < itemsData.length; i++) {
        if (itemsData[i].itemName == itemName) {
            found = true;
            break;
        }
    }

    return found;
};

const displayMenu = () => {
    const itemsData = JSON.parse(sessionStorage.getItem(storageKey)) || []; 
    const sortBy = sortingForm.sort.value;
    const orderBy = sortingForm.order.value;
    let html = "";

    if (itemsData.length === 0) {
        noItemsMsg.style.display = "block";
        menuContainer.innerHTML = "";
    }
    else {
        noItemsMsg.style.display = "none";
        if (sortBy === "by-name") {
            itemsData.sort((a, b) => (a.itemName < b.itemName ? -1 : 1));
        }
    
        if (sortBy === "by-price") {
            itemsData.sort((a, b) => (a.itemPrice < b.itemPrice ? -1 : 1));
        }
    
        if (sortBy === "by-heat") {
            itemsData.sort((a, b) => (a.itemHeat < b.itemHeat ? -1 : 1));
        }
        
        if (orderBy === "desc") {
            itemsData.reverse();
        }
    
        itemsData.forEach((item) => {
            html += `
                <div class="card">
                    <img src="${item.itemImg}">
                    <div class="item-data">
                        <div class="name-price">
                            <h3><img src="img/heat${item.itemHeat ? item.itemHeat : "1"}.png"> ${item.itemName}</h3>
                            <span class="price">${new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(item.itemPrice)}</span>
                        </div>
                        <div class="toppings">${item.itemToppings.join(", ")}</div>
                        <div class="action"><button data-item-name="${item.itemName}">Delete</button></div>
                    </div> 
                </div>
            `;
        });
        menuContainer.innerHTML = html;
    }
    formReset();
};

const deleteItem = (e) => {
    const clickedEl = e.target;
    if (clickedEl.tagName.toLowerCase() === "button") {
        const itemName = clickedEl.getAttribute("data-item-name");
        let items = JSON.parse(sessionStorage.getItem(storageKey));
        let itemsResult = JSON.parse(sessionStorage.getItem(storageKey));
        for (let i = 0; i < items.length; i++) {
            if (items[i].itemName === itemName) {
                const response = confirm('Do you really want to delete pizza "' + itemName + '" ?');
                console.log("response: " + response);
                if (response) {
                    itemsResult.splice(i, 1);
                    console.log("itemsResult: " + JSON.stringify(itemsResult));
                    sessionStorage.setItem(storageKey, JSON.stringify(itemsResult));
                    displayMenu();
                    return;
                }
            }
        }
    }
};

const submitForm = (e) => {
    e.preventDefault();
    const itemName = itemNameInput.value; 
    const itemPrice = itemPriceInput.value; 
    const itemHeat = itemHeatInput.value; 
    let itemToppings = itemToppingsInput.value.split(",");
    const itemImg = itemImgInput.value;

    itemToppings = duplicateToppings(itemToppings);
    if (itemToppings.length < 2) {
        alert("At lest 2 toppings should be entered.");
        return;
    }

    if (duplicateNames(itemName) === true) {
        alert('Pizza named "' + itemName + '" already exists in the menu.');
        return;
    }
    
    const item = {
        itemName,
        itemPrice,
        itemHeat,
        itemToppings,
        itemImg 
    };
    let items = JSON.parse(sessionStorage.getItem(storageKey)) || [];
    items = [...items, item];
    sessionStorage.setItem(storageKey, JSON.stringify(items));
    displayMenu();
    alert('Pizza "' + itemName + '"  been added to the menu.')
}

tabBtns.forEach((item) => {
    item.addEventListener("click", tabOpen);
});

itemImgs.forEach((item) => {
    item.addEventListener("click", imgSelect);
});

newItemForm.addEventListener("submit", submitForm);

sortingForm.addEventListener("change", displayMenu);

menuContainer.addEventListener("click", deleteItem);

displayMenu();
