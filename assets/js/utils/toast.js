// =======================================
// TOAST.JS
// Notificaciones reutilizables
// =======================================

export function mostrarToast(
    icon = "success",
    title = "Operación realizada correctamente."
) {

    Swal.fire({

        toast: true,

        position: "top-end",

        icon,

        title,

        showConfirmButton: false,

        timer: 2500,

        timerProgressBar: true

    });

}