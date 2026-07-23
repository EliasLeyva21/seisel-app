// =======================================
// SESSION.JS
// Verificación de sesión reutilizable
// =======================================

import { supabase } from "../supabase.js";

// =======================================
// VERIFICAR SESIÓN
// =======================================

export async function verificarSesion() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {

        console.error(error);

        window.location.href = "../login.html";

        return false;

    }

    if (!data.session) {

        const ruta = window.location.pathname;

        if (ruta.includes("/pages/")) {

            window.location.href = "../login.html";

        } else {

            window.location.href = "login.html";

        }

        return false;

    }

    return true;

}

// =======================================
// OBTENER USUARIO
// =======================================

export async function obtenerUsuario() {

    const { data } = await supabase.auth.getUser();

    return data.user;

}

// =======================================
// CERRAR SESIÓN
// =======================================

export async function cerrarSesion() {

    await supabase.auth.signOut();

    const ruta = window.location.pathname;

    if (ruta.includes("/pages/")) {

        window.location.href = "../login.html";

    } else {

        window.location.href = "login.html";

    }

}