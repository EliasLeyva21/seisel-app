// =======================================
// LOADER.JS
// Spinner reutilizable
// =======================================

let loader = null;

// =======================================
// MOSTRAR LOADER
// =======================================

export function mostrarLoader(texto = "Cargando...") {

    if (loader) return;

    loader = Swal.fire({

        title: texto,

        html: "Por favor espere...",

        allowOutsideClick: false,

        allowEscapeKey: false,

        showConfirmButton: false,

        didOpen: () => {

            Swal.showLoading();

        }

    });

}

// =======================================
// OCULTAR LOADER
// =======================================

export function ocultarLoader() {

    Swal.close();

    loader = null;

}