import { supabase } from "./supabase.js";
import { mostrarToast } from "./utils/toast.js";
import { mostrarLoader, ocultarLoader } from "./utils/loader.js";

// ==============================
// ELEMENTOS DEL DOM
// ==============================

const form = document.getElementById("clienteForm");
const tabla = document.getElementById("tablaClientes");
const buscar = document.getElementById("buscar");

const txtId = document.getElementById("clienteId");
const txtRazon = document.getElementById("razon_social");
const txtRuc = document.getElementById("ruc");
const txtDireccion = document.getElementById("direccion");
const txtCorreo = document.getElementById("correo");
const txtTelefono = document.getElementById("telefono");
const txtContacto = document.getElementById("contacto");

let clientes = [];

// ==============================
// VERIFICAR SESION
// ==============================

async function verificarSesion() {

    const { data } = await supabase.auth.getSession();

    if (!data.session) {

        window.location.href = "../login.html";
        return;

    }

}

// ==============================
// CARGAR CLIENTES
// ==============================

async function cargarClientes() {

    const { data, error } = await supabase

        .from("clientes")

        .select("*")

        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        Swal.fire("Error", error.message, "error");

        return;

    }

    clientes = data;

    mostrarClientes(clientes);

}

// ==============================
// MOSTRAR CLIENTES
// ==============================

function mostrarClientes(lista) {

    tabla.innerHTML = "";

    if (lista.length === 0) {

        tabla.innerHTML = `

        <tr>

            <td colspan="5" class="text-center">

                No existen clientes registrados.

            </td>

        </tr>

        `;

        return;

    }

    lista.forEach(cliente => {

        tabla.innerHTML += `

        <tr>

            <td>${cliente.razon_social}</td>

            <td>${cliente.ruc ?? ""}</td>

            <td>${cliente.correo ?? ""}</td>

            <td>${cliente.telefono ?? ""}</td>

            <td>

                <button

                    class="btn btn-warning btn-sm editar"

                    data-id="${cliente.id}">

                    Editar

                </button>

                <button

                    class="btn btn-danger btn-sm eliminar"

                    data-id="${cliente.id}">

                    Eliminar

                </button>

            </td>

        </tr>

        `;

    });

}

// ==============================
// BUSCAR
// ==============================

buscar.addEventListener("keyup", () => {

    const texto = buscar.value.toLowerCase();

    const resultado = clientes.filter(c =>

        c.razon_social.toLowerCase().includes(texto)

        ||

        (c.ruc ?? "").includes(texto)

    );

    mostrarClientes(resultado);

});

// ==============================
// GUARDAR / ACTUALIZAR
// ==============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (txtRazon.value.trim() === "") {

        Swal.fire(
            "Campo obligatorio",
            "Ingrese la razón social.",
            "warning"
        );

        txtRazon.focus();

        return;

    }

    const cliente = {

        razon_social: txtRazon.value.trim(),

        ruc: txtRuc.value.trim(),

        direccion: txtDireccion.value.trim(),

        correo: txtCorreo.value.trim(),

        telefono: txtTelefono.value.trim(),

        contacto: txtContacto.value.trim()

    };

    // ==========================
    // INSERTAR
    // ==========================

    if (txtId.value === "") {

        const { error } = await supabase

            .from("clientes")

            .insert([cliente]);

        if (error) {

            Swal.fire(
                "Error",
                error.message,
                "error"
            );

            return;

        }

        Swal.fire(
            "Correcto",
            "Cliente registrado correctamente.",
            "success"
        );

    }

    // ==========================
    // ACTUALIZAR
    // ==========================

    else {

        const { error } = await supabase

            .from("clientes")

            .update(cliente)

            .eq("id", txtId.value);

        if (error) {

            Swal.fire(
                "Error",
                error.message,
                "error"
            );

            return;

        }

        Swal.fire(
            "Actualizado",
            "Cliente actualizado correctamente.",
            "success"
        );

    }

    limpiarFormulario();

    await cargarClientes();

});

// ==============================
// LIMPIAR
// ==============================

function limpiarFormulario(){

    txtId.value="";

    txtRazon.value="";

    txtRuc.value="";

    txtDireccion.value="";

    txtCorreo.value="";

    txtTelefono.value="";

    txtContacto.value="";

}

form.addEventListener("reset",()=>{

    limpiarFormulario();

});
// ==============================
// EDITAR Y ELIMINAR
// ==============================

tabla.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    // ==========================
    // EDITAR
    // ==========================

    if (e.target.classList.contains("editar")) {

        const cliente = clientes.find(c => c.id === id);

        if (!cliente) return;

        txtId.value = cliente.id;
        txtRazon.value = cliente.razon_social || "";
        txtRuc.value = cliente.ruc || "";
        txtDireccion.value = cliente.direccion || "";
        txtCorreo.value = cliente.correo || "";
        txtTelefono.value = cliente.telefono || "";
        txtContacto.value = cliente.contacto || "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    // ==========================
    // ELIMINAR
    // ==========================

    if (e.target.classList.contains("eliminar")) {

        const respuesta = await Swal.fire({

            title: "¿Eliminar cliente?",

            text: "Esta acción no se puede deshacer.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText: "Sí, eliminar",

            cancelButtonText: "Cancelar"

        });

        if (!respuesta.isConfirmed) return;

        const { error } = await supabase

            .from("clientes")

            .delete()

            .eq("id", id);

        if (error) {

            Swal.fire(
                "Error",
                error.message,
                "error"
            );

            return;

        }

        Swal.fire(
            "Eliminado",
            "Cliente eliminado correctamente.",
            "success"
        );

        await cargarClientes();

    }

});


// ==============================
// INICIALIZAR
// ==============================

(async () => {

    await verificarSesion();

    await cargarClientes();

})();