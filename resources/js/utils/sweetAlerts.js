import Swal from 'sweetalert2';

export const askConfirmation = (message, agree = 'Yes, Proceed!') => {
    return Swal.fire({
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: agree,
        draggable: true,
        reverseButtons: true
    }).then((result) => result.isConfirmed);
}

// success alert
export const successAlert = (title, message) => {
    Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        confirmButtonText: 'OK',
        draggable: true,
    });
}

//error alert
export const errorAlert = (title, message) => {
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
        draggable: true,
    });
}
