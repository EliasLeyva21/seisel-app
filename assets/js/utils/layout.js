// =======================================
// LAYOUT.JS
// Sidebar y Navbar reutilizables
// =======================================

export function cargarSidebar() {

    return `

    <aside class="sidebar">

        <div class="text-center py-4">

            <h3 class="fw-bold">

                SEISEL

            </h3>

            <small>

                Sistema de Gestión

            </small>

        </div>

        <hr>

        <a href="../dashboard.html">

            <i class="bi bi-speedometer2"></i>

            Dashboard

        </a>

        <a href="../pages/clientes.html">

            <i class="bi bi-buildings"></i>

            Clientes

        </a>

        <a href="../pages/equipos.html">

            <i class="bi bi-fire"></i>

            Equipos

        </a>

        <a href="../pages/inspecciones.html">

            <i class="bi bi-clipboard-check"></i>

            Inspecciones

        </a>

        <a href="../pages/ordenes.html">

            <i class="bi bi-list-task"></i>

            Órdenes

        </a>

    </aside>

    `;

}



export function cargarNavbar(){

    return `

    <nav class="navbar navbar-light bg-white shadow-sm px-4">

        <span class="fw-bold">

            Sistema Web de Gestión del Mantenimiento Preventivo

        </span>

        <button

            class="btn btn-danger"

            id="logout">

            Cerrar sesión

        </button>

    </nav>

    `;

}



// =======================================
// INSERTAR LAYOUT
// =======================================

export function iniciarLayout(){

    const sidebar=document.getElementById("sidebar");

    const navbar=document.getElementById("navbar");

    if(sidebar){

        sidebar.innerHTML=cargarSidebar();

    }

    if(navbar){

        navbar.innerHTML=cargarNavbar();

    }

}