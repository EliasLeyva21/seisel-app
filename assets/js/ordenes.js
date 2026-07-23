import { supabase } from "./supabase.js";

// =======================================
// ELEMENTOS DEL DOM
// =======================================

const form = document.getElementById("ordenForm");

const tabla = document.getElementById("tablaOrdenes");

const buscar = document.getElementById("buscar");

const txtId = document.getElementById("ordenId");

const cboEquipo = document.getElementById("equipo");

const txtTecnico = document.getElementById("tecnico");

const txtDescripcion = document.getElementById("descripcion");

const txtObservaciones = document.getElementById("observaciones");

const cboEstado = document.getElementById("estado");

const txtFecha = document.getElementById("fecha");

let ordenes = [];

let equipos = [];


// =======================================
// VERIFICAR SESIÓN
// =======================================

async function verificarSesion(){

    const { data } = await supabase.auth.getSession();

    if(!data.session){

        window.location.href="../login.html";

        return;

    }

}


// =======================================
// CARGAR EQUIPOS
// =======================================

async function cargarEquipos(){

    const { data,error } = await supabase

        .from("equipos")

        .select("id,codigo,tipo")

        .order("codigo");

    if(error){

        console.error(error);

        return;

    }

    equipos=data;

    cboEquipo.innerHTML=`

        <option value="">

            Seleccione...

        </option>

    `;

    equipos.forEach(equipo=>{

        cboEquipo.innerHTML+=`

            <option value="${equipo.id}">

                ${equipo.codigo} - ${equipo.tipo}

            </option>

        `;

    });

}


// =======================================
// CARGAR ÓRDENES
// =======================================

async function cargarOrdenes(){

    const { data,error } = await supabase

        .from("ordenes")

        .select(`

            *,

            equipos(

                codigo,

                tipo

            )

        `)

        .order("created_at",{

            ascending:false

        });

    if(error){

        Swal.fire(

            "Error",

            error.message,

            "error"

        );

        return;

    }

    ordenes=data;

    mostrarOrdenes(ordenes);

}


// =======================================
// MOSTRAR TABLA
// =======================================

function mostrarOrdenes(lista){

    tabla.innerHTML="";

    if(lista.length===0){

        tabla.innerHTML=`

        <tr>

            <td colspan="5"

            class="text-center">

            No existen órdenes registradas.

            </td>

        </tr>

        `;

        return;

    }

    lista.forEach(orden=>{

        let color="secondary";

        if(orden.estado==="Pendiente"){

            color="warning";

        }

        if(orden.estado==="En proceso"){

            color="primary";

        }

        if(orden.estado==="Finalizada"){

            color="success";

        }

        tabla.innerHTML+=`

        <tr>

            <td>

                ${orden.equipos?.codigo ?? ""}

            </td>

            <td>

                ${orden.tecnico}

            </td>

            <td>

                <span class="badge bg-${color}">

                    ${orden.estado}

                </span>

            </td>

            <td>

                ${orden.fecha ?? ""}

            </td>

            <td>

                <button

                class="btn btn-warning btn-sm editar"

                data-id="${orden.id}">

                Editar

                </button>

                <button

                class="btn btn-danger btn-sm eliminar"

                data-id="${orden.id}">

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

    const resultado=ordenes.filter(o=>

        (o.equipos?.codigo ?? "")

        .toLowerCase()

        .includes(texto)

        ||

        o.tecnico.toLowerCase()

        .includes(texto)

        ||

        o.estado.toLowerCase()

        .includes(texto)

    );

    mostrarOrdenes(resultado);

});
// =======================================
// GUARDAR / ACTUALIZAR
// =======================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (cboEquipo.value === "") {

        Swal.fire(
            "Campo obligatorio",
            "Seleccione un equipo.",
            "warning"
        );

        return;

    }

    if (txtTecnico.value.trim() === "") {

        Swal.fire(
            "Campo obligatorio",
            "Ingrese el nombre del técnico.",
            "warning"
        );

        txtTecnico.focus();

        return;

    }

    const orden = {

        equipo_id: cboEquipo.value,

        tecnico: txtTecnico.value.trim(),

        descripcion: txtDescripcion.value.trim(),

        observaciones: txtObservaciones.value.trim(),

        estado: cboEstado.value,

        fecha: txtFecha.value || null

    };

    // ===================================
    // INSERTAR
    // ===================================

    if (txtId.value === "") {

        const { error } = await supabase

            .from("ordenes")

            .insert([orden]);

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
            "Orden registrada correctamente.",
            "success"
        );

    }

    // ===================================
    // ACTUALIZAR
    // ===================================

    else {

        const { error } = await supabase

            .from("ordenes")

            .update(orden)

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
            "Orden actualizada correctamente.",
            "success"
        );

    }

    limpiarFormulario();

    await cargarOrdenes();

});


// =======================================
// LIMPIAR FORMULARIO
// =======================================

function limpiarFormulario(){

    txtId.value = "";

    cboEquipo.value = "";

    txtTecnico.value = "";

    txtDescripcion.value = "";

    txtObservaciones.value = "";

    cboEstado.value = "Pendiente";

    txtFecha.value = "";

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

        const orden = ordenes.find(o => o.id === id);

        if (!orden) return;

        txtId.value = orden.id;

        cboEquipo.value = orden.equipo_id;

        txtTecnico.value = orden.tecnico || "";

        txtDescripcion.value = orden.descripcion || "";

        txtObservaciones.value = orden.observaciones || "";

        cboEstado.value = orden.estado;

        txtFecha.value = orden.fecha || "";

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

            title:"¿Eliminar orden?",

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

            .from("ordenes")

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

            "Orden eliminada correctamente.",

            "success"

        );

        await cargarOrdenes();

    }

});


// =======================================
// INICIALIZAR
// =======================================

(async()=>{

    await verificarSesion();

    await cargarEquipos();

    await cargarOrdenes();

})();