import { supabase } from "./supabase.js";
import { iniciarLayout } from "./utils/layout.js";

// =======================================
// ELEMENTOS DEL DOM
// =======================================

const clientesTotal = document.getElementById("clientesTotal");

const equiposTotal = document.getElementById("equiposTotal");

const inspeccionesTotal = document.getElementById("inspeccionesTotal");

const ordenesTotal = document.getElementById("ordenesTotal");

const logout = document.getElementById("logout");

// =======================================
// VERIFICAR SESIÓN
// =======================================

async function verificarSesion() {

    const { data } = await supabase.auth.getSession();

    if (!data.session) {

        window.location.href = "login.html";

        return;

    }

}

// =======================================
// CONTAR CLIENTES
// =======================================

async function contarClientes() {

    const { count, error } = await supabase

        .from("clientes")

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error(error);

        return;

    }

    clientesTotal.textContent = count;

}

// =======================================
// CONTAR EQUIPOS
// =======================================

async function contarEquipos() {

    const { count, error } = await supabase

        .from("equipos")

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error(error);

        return;

    }

    equiposTotal.textContent = count;

}

// =======================================
// CONTAR INSPECCIONES
// =======================================

async function contarInspecciones() {

    const { count, error } = await supabase

        .from("inspecciones")

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error(error);

        return;

    }

    inspeccionesTotal.textContent = count;

}

// =======================================
// CONTAR ORDENES
// =======================================

async function contarOrdenes() {

    const { count, error } = await supabase

        .from("ordenes")

        .select("*", {

            count: "exact",

            head: true

        });

    if (error) {

        console.error(error);

        return;

    }

    ordenesTotal.textContent = count;

}

// =======================================
// CERRAR SESIÓN
// =======================================

logout.addEventListener("click", async () => {

    const respuesta = await Swal.fire({

        title: "Cerrar sesión",

        text: "¿Desea salir del sistema?",

        icon: "question",

        showCancelButton: true,

        confirmButtonText: "Sí",

        cancelButtonText: "Cancelar"

    });

    if (!respuesta.isConfirmed) return;

    await supabase.auth.signOut();

    window.location.href = "login.html";

});

// =======================================
// INICIALIZAR
// =======================================

(async () => {

    await verificarSesion();

    await Promise.all([

        contarClientes(),

        contarEquipos(),

        contarInspecciones(),

        contarOrdenes()

    ]);

})();
// =======================================
// VARIABLES GRÁFICOS
// =======================================

let graficoEquipos = null;

let graficoOrdenes = null;


// =======================================
// GRÁFICO EQUIPOS POR TIPO
// =======================================

async function cargarGraficoEquipos(){

    const { data, error } = await supabase

        .from("equipos")

        .select("tipo");

    if(error){

        console.error(error);

        return;

    }

    const contador={};

    data.forEach(item=>{

        contador[item.tipo]=(contador[item.tipo] || 0)+1;

    });

    const etiquetas=Object.keys(contador);

    const valores=Object.values(contador);

    const ctx=document

        .getElementById("graficoEquipos")

        .getContext("2d");

    if(graficoEquipos){

        graficoEquipos.destroy();

    }

    graficoEquipos=new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:etiquetas,

            datasets:[{

                data:valores,

                backgroundColor:[

                    "#0d6efd",

                    "#198754",

                    "#ffc107",

                    "#dc3545"

                ]

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    position:"bottom"

                }

            }

        }

    });

}


// =======================================
// GRÁFICO ÓRDENES
// =======================================

async function cargarGraficoOrdenes(){

    const { data,error } = await supabase

        .from("ordenes")

        .select("estado");

    if(error){

        console.error(error);

        return;

    }

    const contador={};

    data.forEach(item=>{

        contador[item.estado]=(contador[item.estado] || 0)+1;

    });

    const etiquetas=Object.keys(contador);

    const valores=Object.values(contador);

    const ctx=document

        .getElementById("graficoOrdenes")

        .getContext("2d");

    if(graficoOrdenes){

        graficoOrdenes.destroy();

    }

    graficoOrdenes=new Chart(ctx,{

        type:"bar",

        data:{

            labels:etiquetas,

            datasets:[{

                label:"Órdenes",

                data:valores,

                borderWidth:1,

                backgroundColor:[

                    "#ffc107",

                    "#0d6efd",

                    "#198754"

                ]

            }]

        },

        options:{

            responsive:true,

            scales:{

                y:{

                    beginAtZero:true,

                    ticks:{

                        precision:0

                    }

                }

            }

        }

    });

}
// =======================================
// ALERTAS AUTOMÁTICAS
// =======================================

async function cargarAlertas(){

    const { data, error } = await supabase

        .from("equipos")

        .select("fecha_proxima_recarga");

    if(error){

        console.error(error);

        return;

    }

    let operativos = 0;
    let proximos = 0;
    let vencidos = 0;

    const hoy = new Date();

    data.forEach(e => {

        if(!e.fecha_proxima_recarga){

            return;

        }

        const fecha = new Date(e.fecha_proxima_recarga);

        const diferencia = Math.ceil(

            (fecha - hoy) / (1000 * 60 * 60 * 24)

        );

        if(diferencia < 0){

            vencidos++;

        }

        else if(diferencia <= 30){

            proximos++;

        }

        else{

            operativos++;

        }

    });

    equiposOperativos.textContent = operativos;

    equiposProximos.textContent = proximos;

    equiposVencidos.textContent = vencidos;

}

// =======================================
// ÚLTIMAS ÓRDENES
// =======================================

async function cargarUltimasOrdenes(){

    const { data,error } = await supabase

        .from("ordenes")

        .select(`

            *,

            equipos(

                codigo

            )

        `)

        .order("created_at",{

            ascending:false

        })

        .limit(5);

    if(error){

        console.error(error);

        return;

    }

    tablaUltimasOrdenes.innerHTML="";

    if(data.length===0){

        tablaUltimasOrdenes.innerHTML=`

        <tr>

            <td colspan="4"

            class="text-center">

            No existen órdenes.

            </td>

        </tr>

        `;

        return;

    }

    data.forEach(o=>{

        let color="secondary";

        if(o.estado==="Pendiente"){

            color="warning";

        }

        if(o.estado==="En proceso"){

            color="primary";

        }

        if(o.estado==="Finalizada"){

            color="success";

        }

        tablaUltimasOrdenes.innerHTML+=`

        <tr>

            <td>

                ${o.equipos?.codigo ?? ""}

            </td>

            <td>

                ${o.tecnico}

            </td>

            <td>

                <span class="badge bg-${color}">

                    ${o.estado}

                </span>

            </td>

            <td>

                ${o.fecha ?? ""}

            </td>

        </tr>

        `;

    });

}