
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".show-order-btn").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior

        const orderId = this.getAttribute("data-order-id"); // Get the order ID

        // Redirect to the server-rendered order page
        window.location.href = `/waiter/editorder/${orderId}`;
       });
    });
});
