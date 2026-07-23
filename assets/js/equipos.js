import { supabase } from "./supabase.js";

// =======================================
// ELEMENTOS DEL DOM
// =======================================

const form = document.getElementById("equipoForm");

const tabla = document.getElementById("tablaEquipos");

const buscar = document.getElementById("buscar");

const txtId = document.getElementById("equipoId");

const cboCliente = document.getElementById("cliente");

const txtCodigo = document.getElementById("codigo");

const cboTipo = document.getElementById("tipo");

const txtUbicacion = document.getElementById("ubicacion");

const txtInstalacion = document.getElementById("instalacion");

const txtUltima = document.getElementById("ultima");

const txtProxima = document.getElementById("proxima");

const cboEstado = document.getElementById("estado");

let equipos = [];

let clientes = [];


// =======================================
// VERIFICAR SESIÓN
// =======================================

async function verificarSesion() {

    const { data } = await supabase.auth.getSession();

    if (!data.session) {

        window.location.href = "../login.html";

        return;

    }

}


// =======================================
// CARGAR CLIENTES
// =======================================

async function cargarClientes() {

    const { data, error } = await supabase

        .from("clientes")

        .select("id, razon_social")

        .order("razon_social");

    if (error) {

        console.error(error);

        return;

    }

    clientes = data;

    cboCliente.innerHTML = `

        <option value="">Seleccione...</option>

    `;

    clientes.forEach(cliente => {

        cboCliente.innerHTML += `

            <option value="${cliente.id}">

                ${cliente.razon_social}

            </option>

        `;

    });

}


// =======================================
// CARGAR EQUIPOS
// =======================================

async function cargarEquipos() {

    const { data, error } = await supabase

        .from("equipos")

        .select(`
            *,
            clientes (
                razon_social
            )
        `)

        .order("created_at", {

            ascending:false

        });

    if(error){

        console.error(error);

        Swal.fire(

            "Error",

            error.message,

            "error"

        );

        return;

    }

    equipos = data;

    mostrarEquipos(equipos);

}


// =======================================
// MOSTRAR TABLA
// =======================================

function mostrarEquipos(lista){

    tabla.innerHTML="";

    if(lista.length===0){

        tabla.innerHTML=`

        <tr>

            <td colspan="5"

            class="text-center">

            No existen equipos registrados.

            </td>

        </tr>

        `;

        return;

    }

    lista.forEach(equipo=>{

        let color="success";

        if(equipo.estado==="Próximo a vencer"){

            color="warning";

        }

        if(equipo.estado==="Vencido"){

            color="danger";

        }

        tabla.innerHTML+=`

        <tr>

            <td>

                ${equipo.codigo}

            </td>

            <td>

                ${equipo.clientes?.razon_social ?? ""}

            </td>

            <td>

                ${equipo.tipo}

            </td>

            <td>

                <span class="badge bg-${color}">

                    ${equipo.estado}

                </span>

            </td>

            <td>

                <button

                class="btn btn-warning btn-sm editar"

                data-id="${equipo.id}">

                Editar

                </button>

                <button

                class="btn btn-danger btn-sm eliminar"

                data-id="${equipo.id}">

                Eliminar

                </button>

            </td>

        </tr>

        `;

    });

}


// =======================================
// BUSCADOR
// =======================================

buscar.addEventListener("keyup",()=>{

    const texto=buscar.value.toLowerCase();

    const resultado=equipos.filter(e=>

        e.codigo.toLowerCase().includes(texto)

        ||

        e.tipo.toLowerCase().includes(texto)

        ||

        (e.clientes?.razon_social ?? "")

        .toLowerCase()

        .includes(texto)

    );

    mostrarEquipos(resultado);

});
// =======================================
// GUARDAR / ACTUALIZAR
// =======================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (cboCliente.value === "") {

        Swal.fire(
            "Campo obligatorio",
            "Seleccione un cliente.",
            "warning"
        );

        return;

    }

    if (txtCodigo.value.trim() === "") {

        Swal.fire(
            "Campo obligatorio",
            "Ingrese el código del equipo.",
            "warning"
        );

        txtCodigo.focus();

        return;

    }

    const equipo = {

        cliente_id: cboCliente.value,

        codigo: txtCodigo.value.trim(),

        tipo: cboTipo.value,

        ubicacion: txtUbicacion.value.trim(),

        fecha_instalacion: txtInstalacion.value || null,

        fecha_ultima_recarga: txtUltima.value || null,

        fecha_proxima_recarga: txtProxima.value || null,

        estado: cboEstado.value

    };

    // ===========================
    // INSERTAR
    // ===========================

    if (txtId.value === "") {

        const { error } = await supabase

            .from("equipos")

            .insert([equipo]);

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
            "Equipo registrado correctamente.",
            "success"
        );

    }

    // ===========================
    // ACTUALIZAR
    // ===========================

    else {

        const { error } = await supabase

            .from("equipos")

            .update(equipo)

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
            "Equipo actualizado correctamente.",
            "success"
        );

    }

    limpiarFormulario();

    await cargarEquipos();

});


// =======================================
// LIMPIAR FORMULARIO
// =======================================

function limpiarFormulario(){

    txtId.value = "";

    cboCliente.value = "";

    txtCodigo.value = "";

    cboTipo.value = "Extintor";

    txtUbicacion.value = "";

    txtInstalacion.value = "";

    txtUltima.value = "";

    txtProxima.value = "";

    cboEstado.value = "Operativo";

}

form.addEventListener("reset",()=>{

    limpiarFormulario();

});
// =======================================
// EDITAR / ELIMINAR
// =======================================

tabla.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    // ===================================
    // EDITAR
    // ===================================

    if (e.target.classList.contains("editar")) {

        const equipo = equipos.find(x => x.id === id);

        if (!equipo) return;

        txtId.value = equipo.id;

        cboCliente.value = equipo.cliente_id;

        txtCodigo.value = equipo.codigo;

        cboTipo.value = equipo.tipo;

        txtUbicacion.value = equipo.ubicacion || "";

        txtInstalacion.value = equipo.fecha_instalacion || "";

        txtUltima.value = equipo.fecha_ultima_recarga || "";

        txtProxima.value = equipo.fecha_proxima_recarga || "";

        cboEstado.value = equipo.estado;

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

        return;

    }

    // ===================================
    // ELIMINAR
    // ===================================

    if (e.target.classList.contains("eliminar")) {

        const respuesta = await Swal.fire({

            title:"¿Eliminar equipo?",

            text:"Esta acción no se puede deshacer.",

            icon:"warning",

            showCancelButton:true,

            confirmButtonText:"Sí, eliminar",

            cancelButtonText:"Cancelar"

        });

        if(!respuesta.isConfirmed){

            return;

        }

        const { error } = await supabase

            .from("equipos")

            .delete()

            .eq("id",id);

        if(error){

            Swal.fire(

                "Error",

                error.message,

                "error"

            );

            return;

        }

        Swal.fire(

            "Correcto",

            "Equipo eliminado correctamente.",

            "success"

        );

        await cargarEquipos();

    }

});


// =======================================
// ALERTAS AUTOMÁTICAS
// =======================================

function calcularEstado(fecha){

    if(!fecha) return "Operativo";

    const hoy = new Date();

    const vencimiento = new Date(fecha);

    const diferencia = Math.ceil(

        (vencimiento-hoy)/(1000*60*60*24)

    );

    if(diferencia<0){

        return "Vencido";

    }

    if(diferencia<=30){

        return "Próximo a vencer";

    }

    return "Operativo";

}


// =======================================
// CAMBIAR ESTADO AUTOMÁTICO
// =======================================

txtProxima.addEventListener("change",()=>{

    cboEstado.value = calcularEstado(

        txtProxima.value

    );

});


// =======================================
// INICIALIZAR
// =======================================

(async()=>{

    await verificarSesion();

    await cargarClientes();

    await cargarEquipos();

})();