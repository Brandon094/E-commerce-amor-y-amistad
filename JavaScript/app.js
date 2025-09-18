// ========================================
// CONFIGURACIÓN INICIAL
// ========================================

// Variable global para almacenar los productos
let productos = [];

// Número de WhatsApp (CAMBIAR por el número real)
const numeroWhatsApp = "573222824941"; // Formato: código país + número

// ========================================
// FUNCIONES PARA CARGAR DATOS
// ========================================

// Función para cargar productos desde JSON
async function cargarProductos() {
    try {
        const response = await fetch('./DB/productos.json');
        if (!response.ok) throw new Error('Error al cargar productos');

        productos = await response.json();
        mostrarProductos();
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('products-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.9); border-radius: 20px; margin: 20px 0;">
                <h3 style="color: #d63384; margin-bottom: 15px;">⚠️ Cargando productos de ejemplo</h3>
                <p style="color: #6c757d;">No se pudo cargar el archivo productos.json</p>
                <p style="color: #6c757d; font-size: 0.9rem;">Asegúrate de que el archivo productos.json esté en la misma carpeta</p>
            </div>
        ` + container.innerHTML;
    }
}

// ========================================
// FUNCIONES DE VISUALIZACIÓN
// ========================================

function mostrarProductos(productosAMostrar = productos) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    productosAMostrar.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Menú de accesorios + mensaje opcional
        let accesoriosHTML = `
            <div class="product-accessories">
                <label>Accesorios:</label>
                <select id="accesorio-${producto.id}" onchange="mostrarCampoMensaje(${producto.id})">
                    <option value="">-- Seleccionar --</option>
                    ${producto.accesorios.map(acc => `<option value="${acc}">${acc}</option>`).join('')}
                    <option value="mensaje">Mensaje personalizado</option>
                </select>
                <input type="text" id="mensaje-${producto.id}" placeholder="Escribe tu mensaje aquí" style="display:none; margin-top:5px;">
            </div>
        `;

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                ${accesoriosHTML}
                <div class="product-price">$${producto.precio.toLocaleString()}</div>
                <button class="whatsapp-btn" onclick="enviarWhatsApp(${producto.id})">
                    <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Pedir por WhatsApp
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// Mostrar campo mensaje solo si selecciona "mensaje"
function mostrarCampoMensaje(id) {
    const select = document.getElementById(`accesorio-${id}`);
    const inputMensaje = document.getElementById(`mensaje-${id}`);
    inputMensaje.style.display = (select.value === "mensaje") ? "block" : "none";
}

// ========================================
// FUNCIONES DE NAVEGACIÓN
// ========================================

function showSection(categoria, event) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filtrar productos
    if (categoria === 'todos') {
        mostrarProductos(productos);
    } else {
        const productosFiltrados = productos.filter(p => p.categoria === categoria);
        mostrarProductos(productosFiltrados);
    }
}

// ========================================
// FUNCIONES DE WHATSAPP
// ========================================

function enviarWhatsApp(productoId) {
    const producto = productos.find(p => p.id === productoId);
    const accesorio = document.getElementById(`accesorio-${productoId}`).value;
    const mensajePersonalizado = document.getElementById(`mensaje-${productoId}`)?.value || "";

    let extras = "🎀 Incluye moño decorativo";
    if (accesorio && accesorio !== "mensaje") {
        extras += ` + ${accesorio}`;
    }
    if (accesorio === "mensaje" && mensajePersonalizado.trim() !== "") {
        extras += ` + Mensaje: "${mensajePersonalizado}"`;
    }

    const mensaje = `¡Hola! 😊 Me interesa el siguiente producto de su catálogo:

📦 *${producto.nombre}*
💰 Precio: $${producto.precio.toLocaleString()}

${producto.descripcion}

✨ Opciones seleccionadas: ${extras}

¿Está disponible?
¿Cuáles son las formas de pago y entrega?

¡Gracias! 💕`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', cargarProductos);
