export function alert(message,type = "success") {
    Toastify({
        text: message,
        duration: 3000,
        newWindow: true,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: type === "error" ? "red" : "green",
        },
        onClick: function(){} // Callback after click
      }).showToast();
}