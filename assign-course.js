const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function addCourseToUser(email, courseSlugOrId) {
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const adminUser = process.env.WP_ADMIN_USER;
    let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

    if (!wpUrl || !adminUser || !adminPass) {
        console.error("❌ Error: Faltan variables de entorno en .env.local");
        return;
    }

    adminPass = adminPass.replace(/\s/g, '');
    const auth = Buffer.from(`${adminUser}:${adminPass}`).toString("base64");
    const authHeader = `Basic ${auth}`;

    try {
        // 1. Get Course ID (if slug is provided)
        let courseId = parseInt(courseSlugOrId);
        if (isNaN(courseId)) {
            console.log(`🔍 Buscando ID para el slug: ${courseSlugOrId}...`);
            const courseRes = await fetch(`${wpUrl}/wp-json/wp/v2/cursos?slug=${courseSlugOrId}`, {
                headers: { 'Authorization': authHeader }
            });
            const courses = await courseRes.json();
            if (!courses || courses.length === 0) {
                console.error(`❌ No se encontró el curso con slug: ${courseSlugOrId}`);
                return;
            }
            courseId = courses[0].id;
        }
        console.log(`✅ ID del curso: ${courseId}`);

        // 2. Buscar el usuario por email
        console.log(`🔍 Buscando usuario: ${email}...`);
        const userRes = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}&context=edit`, {
            headers: { 'Authorization': authHeader }
        });

        const users = await userRes.json();
        if (!users || users.length === 0) {
            console.error(`❌ No se encontró ningún usuario con el email: ${email}`);
            return;
        }

        const user = users[0];
        const userId = user.id;

        // 3. Obtener cursos actuales y limpiar formato
        let currentCourses = user.acf?.purchased_courses || [];
        if (!Array.isArray(currentCourses)) {
            currentCourses = [];
        } else {
            currentCourses = currentCourses.map(c => {
                if (typeof c === 'object' && c !== null) return c.ID || c.id;
                return parseInt(c);
            }).filter(id => !isNaN(id));
        }

        console.log(`📚 Cursos actuales (IDs):`, currentCourses);

        // 4. Agregar el nuevo curso si no lo tiene
        if (currentCourses.includes(courseId)) {
            console.log(`ℹ️ El usuario ya tiene el curso ID: ${courseId}`);
            return;
        }

        currentCourses.push(courseId);

        // 5. Actualizar en WordPress
        console.log(`🚀 Asignando curso ${courseId} al usuario ${userId}...`);
        const updateRes = await fetch(`${wpUrl}/wp-json/wp/v2/users/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                acf: {
                    purchased_courses: currentCourses
                }
            })
        });

        if (updateRes.ok) {
            console.log(`✅ ¡Éxito! El curso ha sido asignado a ${email}`);
        } else {
            const error = await updateRes.json();
            console.error(`❌ Error al actualizar:`, error);
        }

    } catch (error) {
        console.error(`❌ Error inesperado:`, error.message);
    }
}

// --- CONFIGURACIÓN ---
// Cambia estos valores por los tuyos
const userEmail = "TU_EMAIL_AQUI";
const courseSlug = "SLUG_DEL_CURSO_AQUI";

if (userEmail === "TU_EMAIL_AQUI") {
    console.log("⚠️ Por favor, edita el archivo 'assign-course.js' y pon tu email y el slug del curso.");
} else {
    addCourseToUser(userEmail, courseSlug);
}
