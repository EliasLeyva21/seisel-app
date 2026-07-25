import { supabase } from "./supabase.js";

// =======================================
// ELEMENTOS DEL DOM
// =======================================

const clientesTotal = document.getElementById("clientesTotal");

const equiposTotal = document.getElementById("equiposTotal");

const inspeccionesTotal = document.getElementById("inspeccionesTotal");

const ordenesTotal = document.getElementById("ordenesTotal");

const equiposVencidos = document.getElementById("equiposVencidos");

const equiposProximos = document.getElementById("equiposProximos");

const equiposOperativos = document.getElementById("equiposOperativos");

const tablaUltimasOrdenes = document.getElementById("tablaUltimasOrdenes");

const logout = document.getElementById("logout");

// =======================================
// VERIFICAR SESIÓN
// =======================================

async function verificarSesion() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {

        console.error(error);

        return;

    }

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

    clientesTotal.textContent = count ?? 0;

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

    equiposTotal.textContent = count ?? 0;

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

    inspeccionesTotal.textContent = count ?? 0;

}

// =======================================
// CONTAR ÓRDENES
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

    ordenesTotal.textContent = count ?? 0;

}

// =======================================
// CERRAR SESIÓN
// =======================================

if (logout) {

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

}
// =======================================
// VARIABLES GRÁFICOS
// =======================================

let graficoEquipos = null;

let graficoOrdenes = null;

// =======================================
// GRÁFICO EQUIPOS POR TIPO
// =======================================

async function cargarGraficoEquipos() {

    const { data, error } = await supabase

        .from("equipos")

        .select("tipo");

    if (error) {

        console.error(error);

        return;

    }

    const contador = {};

    data.forEach((equipo) => {

        const tipo = equipo.tipo || "Sin tipo";

        contador[tipo] = (contador[tipo] || 0) + 1;

    });

    const etiquetas = Object.keys(contador);

    const valores = Object.values(contador);

    const canvas = document.getElementById("graficoEquipos");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficoEquipos) {

        graficoEquipos.destroy();

    }

    graficoEquipos = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: etiquetas,

            datasets: [

                {

                    label: "Equipos",

                    data: valores,

                    backgroundColor: [

                        "#0d6efd",

                        "#198754",

                        "#ffc107",

                        "#dc3545",

                        "#6f42c1",

                        "#20c997",

                        "#fd7e14"

                    ]

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom"

                }

            }

        }

    });

}

// =======================================
// GRÁFICO ÓRDENES POR ESTADO
// =======================================

async function cargarGraficoOrdenes() {

    const { data, error } = await supabase

        .from("ordenes")

        .select("estado");

    if (error) {

        console.error(error);

        return;

    }

    const contador = {};

    data.forEach((orden) => {

        const estado = orden.estado || "Sin estado";

        contador[estado] = (contador[estado] || 0) + 1;

    });

    const etiquetas = Object.keys(contador);

    const valores = Object.values(contador);

    const canvas = document.getElementById("graficoOrdenes");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (graficoOrdenes) {

        graficoOrdenes.destroy();

    }

    graficoOrdenes = new Chart(ctx, {

        type: "bar",

        data: {

            labels: etiquetas,

            datasets: [

                {

                    label: "Órdenes",

                    data: valores,

                    backgroundColor: [

                        "#ffc107",

                        "#0d6efd",

                        "#198754",

                        "#dc3545"

                    ],

                    borderWidth: 1

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0,

                        stepSize: 1

                    }

                }

            },

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}
// =======================================
// ALERTAS AUTOMÁTICAS
// =======================================

async function cargarAlertas() {

    const { data, error } = await supabase

        .from("equipos")

        .select("fecha_proxima_recarga");

    if (error) {

        console.error(error);

        return;

    }

    let operativos = 0;

    let proximos = 0;

    let vencidos = 0;

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    data.forEach((equipo) => {

        if (!equipo.fecha_proxima_recarga) return;

        const fecha = new Date(equipo.fecha_proxima_recarga);

        fecha.setHours(0, 0, 0, 0);

        const diferencia = Math.floor(

            (fecha - hoy) / (1000 * 60 * 60 * 24)

        );

        if (diferencia < 0) {

            vencidos++;

        }

        else if (diferencia <= 30) {

            proximos++;

        }

        else {

            operativos++;

        }

    });

    equiposVencidos.textContent = vencidos;

    equiposProximos.textContent = proximos;

    equiposOperativos.textContent = operativos;

}

// =======================================
// ÚLTIMAS ÓRDENES
// =======================================

async function cargarUltimasOrdenes() {

    const { data, error } = await supabase

        .from("ordenes")

        .select(`
            *,
            equipos(codigo)
        `)

        .order("created_at", {

            ascending: false

        })

        .limit(5);

    if (error) {

        console.error(error);

        return;

    }

    tablaUltimasOrdenes.innerHTML = "";

    if (!data || data.length === 0) {

        tablaUltimasOrdenes.innerHTML = `

            <tr>

                <td colspan="4" class="text-center">

                    No existen órdenes registradas.

                </td>

            </tr>

        `;

        return;

    }

    data.forEach((orden) => {

        let color = "secondary";

        switch (orden.estado) {

            case "Pendiente":

                color = "warning";

                break;

            case "En proceso":

                color = "primary";

                break;

            case "Finalizada":

                color = "success";

                break;

        }

        tablaUltimasOrdenes.innerHTML += `

            <tr>

                <td>${orden.equipos?.codigo ?? "-"}</td>

                <td>${orden.tecnico ?? "-"}</td>

                <td>

                    <span class="badge bg-${color}">

                        ${orden.estado ?? "-"}

                    </span>

                </td>

                <td>${orden.fecha ?? "-"}</td>

            </tr>

        `;

    });

}

// =======================================
// CARGAR DASHBOARD
// =======================================

async function cargarDashboard() {

    await verificarSesion();

    await Promise.all([

        contarClientes(),

        contarEquipos(),

        contarInspecciones(),

        contarOrdenes(),

        cargarAlertas(),

        cargarGraficoEquipos(),

        cargarGraficoOrdenes(),

        cargarUltimasOrdenes()

    ]);

}

// =======================================
// INICIAR
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    cargarDashboard();

});