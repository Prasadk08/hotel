let order = [];

function demo(event) {
    event.preventDefault(); // Prevent default form action
    const button = event.target;
    const listItem = button.closest('li');
    const foodName = listItem.querySelector('span').innerText;
    const foodPrice = listItem.querySelector('span:nth-child(2)').innerText.replace('₹', '');
    const foodId = listItem.dataset.foodid;
    const foodType = listItem.dataset.foodtype; // Capture the food type

    button.style.display = 'none';

    const counterContainer = button.nextElementSibling;
    counterContainer.style.display = 'flex';
    
    const inputField = counterContainer.querySelector('.counter-input');
    inputField.value = 1;

    // Add item to order array with food type
    order.push({
        id: foodId,
        foodname: foodName,
        foodprice: parseInt(foodPrice),
        quantity: 1,
        type: foodType // Include food type
    });
    console.log(order);
}

function updateOrder(id, quantity) {
    const itemIndex = order.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        order[itemIndex].quantity = quantity;
    }
    console.log(order);
}

function removeOrder(id) {
    order = order.filter(item => item.id !== id);
    console.log(order);
}

document.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.classList.contains('plus-btn')) {
        const inputField = e.target.previousElementSibling;
        const newValue = parseInt(inputField.value) + 1;
        inputField.value = newValue;

        const foodId = e.target.closest('li').dataset.foodid;
        updateOrder(foodId, newValue);
    }

    if (e.target.classList.contains('minus-btn')) {
        const inputField = e.target.nextElementSibling;
        const newValue = parseInt(inputField.value) - 1;

        if (newValue <= 0) {
            const listItem = e.target.closest('li');
            const counterContainer = e.target.closest('.counter-container');
            counterContainer.style.display = 'none';

            const addButton = listItem.querySelector('.add-btn');
            addButton.style.display = 'block';

            const foodId = listItem.dataset.foodid;
            removeOrder(foodId);
        } else {
            inputField.value = newValue;

            const foodId = e.target.closest('li').dataset.foodid;
            updateOrder(foodId, newValue);
        }
    }
});

document.getElementById('placeorder').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const tableNumber = document.querySelector('input[name="listing[title]"]').value;

    fetch('/kitchen/placeorder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            order: order,
            tableNumber: tableNumber
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to /hotel/services
            window.location.href = '/hotel/services';
        } else {
            console.error('Order failed:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
