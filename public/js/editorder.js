
let order = window.currentOrders

document.addEventListener('click', function (e) {
 e.preventDefault();

        const inputField = e.target.nextElementSibling; // Get the input field next to the minus button
        let currentValue = parseInt(inputField.value); // Get current value of the input field
        const orderId = e.target.closest('li').dataset.orderid; // Get the food ID from the closest parent list item
        const foodId = e.target.closest('li').dataset.foodid; // Get the food ID from the closest parent list item
        const foodName = e.target.closest('li').dataset.foodname;
        const foodQuantity = e.target.closest('li').dataset.quantity;


    if (e.target.classList.contains('minus-btn')) {

        if (currentValue > 1) {
            // Update the input field's value in the UI
            inputField.value = currentValue - 1;

            // Update the corresponding quantity in the order object
            order.orderedfood.forEach(item => {
                if (item.id == foodId) {
                    item.quantity -= 1; // Decrease the quantity
                }
            });
        } else {
            order.orderedfood = order.orderedfood.filter(
                (order) => order.id.toString() !== foodId.toString()
            );
        }
    }

    // Handle cancel button click
    if (e.target.classList.contains('cancel-button')) {
        order.orderedfood = order.orderedfood.filter(
            (order) => order.id.toString() !== foodId.toString()
        );
    }

    // Make a POST request to cancel the order item
    fetch(`/waiter/editorder/${foodName}/1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order, orderId })
    })
    .then(response => response.redirected ? window.location.href = response.url : response.json())
    .catch(error => console.error('Error updating order:', error));
})

