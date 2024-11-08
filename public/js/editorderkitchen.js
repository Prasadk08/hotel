function markasDeliver(e){
    const listItem = e.target.closest('.list-group-item');
    console.log(listItem)

        // Change status to delivered (front-end simulation)
        listItem.classList.remove('red');
        listItem.classList.add('green');

        // Disable the button after marking as delivered
        e.target.textContent = 'Delivered';
        e.target.disabled = true;
        e.target.style.backgroundColor = '#6c757db'
        const foodid= e.target.closest('li').dataset.foodid
        const orderid= e.target.closest('li').dataset.orderid
        const addat= e.target.closest('li').dataset.addat
        const quantity= e.target.closest('li').dataset.quantity
        fetch('/waiter/kitchenstatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderid ,foodid,addat,quantity})
        })
        .then(response => response.redirected ? window.location.href = response.url : response.json())
        .catch(error => console.error('Error updating order:', error));
}