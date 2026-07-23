import { supabase } from "./supabase.js";

// =======================================
// ELEMENTOS DEL DOM
// =======================================

const form = document.getElementById("inspeccionForm");

const tabla = document.getElementById("tablaInspecciones");

const buscar = document.getElementById("buscar");

const txtId = document.getElementById("inspeccionId");

const cboEquipo = document.getElementById("equipo");

const cboEstado = document.getElementById("estado");

const txtPresion = document.getElementById("presion");

const txtFecha = document.getElementById("fecha");

const txtObservaciones = document.getElementById("observaciones");

let inspecciones = [];

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
// CARGAR INSPECCIONES
// =======================================

async function cargarInspecciones(){

    const { data,error } = await supabase

        .from("inspecciones")

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

    inspecciones=data;

    mostrarInspecciones(inspecciones);

}


// =======================================
// MOSTRAR TABLA
// =======================================

function mostrarInspecciones(lista){

    tabla.innerHTML="";

    if(lista.length===0){

        tabla.innerHTML=`

        <tr>

            <td colspan="5"

            class="text-center">

            No existen inspecciones registradas.

            </td>

        </tr>

        `;

        return;

    }

    lista.forEach(inspeccion=>{

        let color="success";

        if(inspeccion.estado==="Con observaciones"){

            color="warning";

        }

        if(inspeccion.estado==="Fuera de servicio"){

            color="danger";

        }

        tabla.innerHTML+=`

        <tr>

            <td>

                ${inspeccion.equipos?.codigo ?? ""}

            </td>

            <td>

                <span class="badge bg-${color}">

                    ${inspeccion.estado}

                </span>

            </td>

            <td>

                ${inspeccion.presion ?? ""}

            </td>

            <td>

                ${inspeccion.fecha ?? ""}

            </td>

            <td>

                <button

                class="btn btn-warning btn-sm editar"

                data-id="${inspeccion.id}">

                Editar

                </button>

                <button

                class="btn btn-danger btn-sm eliminar"

                data-id="${inspeccion.id}">

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

    const resultado=inspecciones.filter(i=>

        (i.equipos?.codigo ?? "")

        .toLowerCase()

        .includes(texto)

        ||

        i.estado.toLowerCase()

        .includes(texto)

        ||

        (i.presion ?? "")

        .toLowerCase()

        .includes(texto)

    );

    mostrarInspecciones(resultado);

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

    const inspeccion = {

        equipo_id: cboEquipo.value,

        estado: cboEstado.value,

        presion: txtPresion.value.trim(),

        fecha: txtFecha.value || null,

        observaciones: txtObservaciones.value.trim()

    };

    // ===================================
    // INSERTAR
    // ===================================

    if (txtId.value === "") {

        const { error } = await supabase

            .from("inspecciones")

            .insert([inspeccion]);

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
            "Inspección registrada correctamente.",
            "success"
        );

    }

    // ===================================
    // ACTUALIZAR
    // ===================================

    else {

        const { error } = await supabase

            .from("inspecciones")

            .update(inspeccion)

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
            "Inspección actualizada correctamente.",
            "success"
        );

    }

    limpiarFormulario();

    await cargarInspecciones();

});


// =======================================
// LIMPIAR FORMULARIO
// =======================================

function limpiarFormulario(){

    txtId.value = "";

    cboEquipo.value = "";

    cboEstado.value = "Operativo";

    txtPresion.value = "";

    txtFecha.value = "";

    txtObservaciones.value = "";

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

        const inspeccion = inspecciones.find(i => i.id === id);

        if (!inspeccion) return;

        txtId.value = inspeccion.id;

        cboEquipo.value = inspeccion.equipo_id;

        cboEstado.value = inspeccion.estado;

        txtPresion.value = inspeccion.presion || "";

        txtFecha.value = inspeccion.fecha || "";

        txtObservaciones.value = inspeccion.observaciones || "";

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

            title:"¿Eliminar inspección?",

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

            .from("inspecciones")

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

            "Inspección eliminada correctamente.",

            "success"

        );

        await cargarInspecciones();

    }

});


// =======================================
// INICIALIZAR
// =======================================

(async()=>{

    await verificarSesion();

    await cargarEquipos();

    await cargarInspecciones();

})();