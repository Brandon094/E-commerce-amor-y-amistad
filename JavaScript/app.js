// ========================================
// CONFIGURACIÓN INICIAL
// ========================================

// Variable global para almacenar los productos cargados
let productos = [];

// Número de WhatsApp (⚠️ CAMBIAR por el número real)
// Formato correcto: código país + número (sin +, espacios o símbolos)
const numeroWhatsApp = "573209538728";


// ========================================
// FUNCIONES PARA CARGAR DATOS
// ========================================

/**
 * Cargar productos desde el archivo productos.json
 * Muestra un mensaje de error si no se puede cargar el archivo.
 */
async function cargarProductos() {
    try {
        const response = await fetch('./DB/productos.json');
        if (!response.ok) throw new Error('Error al cargar productos');

        // Guardamos los productos en la variable global
        productos = await response.json();

        // Pintamos los productos en la página
        mostrarProductos();

        // Esperar que todas las imágenes estén cargadas antes de mostrar
        await esperarImagenesCargadas();

        // Ocultar loader y mostrar productos ya cargados
        document.getElementById("loader").style.display = "none";
        document.getElementById("products-container").style.display = "grid";

    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('products-container');
        container.innerHTML = `
            <p>Error cargando productos. 
            Verifica que el archivo <b>productos.json</b> exista en la carpeta DB.</p>
        `;
    }
}


// ========================================
// FUNCIONES DE VISUALIZACIÓN
// ========================================

/**
 * Renderiza los productos en el contenedor principal
 * @param {Array} productosAMostrar - Lista de productos a mostrar (por defecto todos).
 */
function mostrarProductos(productosAMostrar = productos) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    productosAMostrar.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Menú de accesorios + campo para mensaje personalizado
        let accesoriosHTML = `
            <div class="product-accessories">
                <label>Accesorios:</label>
                <select id="accesorio-${producto.id}">
                    <option value="">-- Seleccionar --</option>
                    ${producto.accesorios.map(acc => `<option value="${acc}">${acc}</option>`).join('')}
                </select>
                <input type="text" id="mensaje-${producto.id}" placeholder="Escribe un mensaje personalizado (opcional)" style="margin-top:5px;">
            </div>
        `;

        // Tarjeta del producto
        productCard.innerHTML = `
            <div class="product-image" onclick="abrirCarrusel(${producto.id})" style="cursor: pointer;">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>

            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                ${accesoriosHTML}
                <div class="product-price">$${producto.precio.toLocaleString()}</div>

                <!-- Botón de WhatsApp -->
                <button class="whatsapp-btn" onclick="enviarWhatsApp(${producto.id})">
                    <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..."/>
                    </svg>
                    Pedir por WhatsApp
                </button>
            </div>
        `;

        container.appendChild(productCard);
    });
}


// ========================================
// FUNCIONES DE WHATSAPP
// ========================================

/**
 * Arma el mensaje de WhatsApp con datos del producto seleccionado
 * y abre la conversación en una nueva pestaña.
 * @param {Number} productoId - ID del producto.
 */
function enviarWhatsApp(productoId) {
    const producto = productos.find(p => p.id === productoId);
    const accesorio = document.getElementById(`accesorio-${productoId}`).value;
    const mensajePersonalizado = document.getElementById(`mensaje-${productoId}`).value.trim();

    // Opciones adicionales seleccionadas
    let extras = "🎀 Incluye moño decorativo";
    if (accesorio) extras += ` + ${accesorio}`;
    if (mensajePersonalizado) extras += ` + Mensaje: "${mensajePersonalizado}"`;

    // Texto del mensaje
    const mensaje = `¡Hola! 😊 Me interesa el siguiente producto de su catálogo:

📦 *${producto.nombre}*
💰 Precio: $${producto.precio.toLocaleString()}

${producto.descripcion}

✨ Opciones seleccionadas: ${extras}

¿Está disponible?
¿Cuáles son las formas de pago y entrega?

¡Gracias! 💕`;

    // Abrir WhatsApp
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}


// ========================================
// FUNCIONES DE GALERÍA / CARRUSEL
// ========================================

// Variables para manejar la galería
let galeria = [];
let imagenActual = 0;
let imagenesProducto = [];

/**
 * Cargar datos de la galería desde galeria.json
 */
async function cargarGaleria() {
    try {
        const response = await fetch('./DB/galeria.json');
        galeria = await response.json();
    } catch (error) {
        console.error("Error cargando galeria:", error);
    }
}

/**
 * Abre el modal de imágenes. Si el producto tiene varias imágenes se activa el carrusel,
 * si solo tiene una, se muestra esa única imagen.
 */
function abrirCarrusel(productoId) {
    const galeriaProducto = galeria.find(g => g.id === productoId);

    if (galeriaProducto && galeriaProducto.imagenes.length > 1) {
        // Caso 1: varias imágenes
        imagenesProducto = galeriaProducto.imagenes;
        imagenActual = 0;
        document.getElementById("carrusel-img").src = imagenesProducto[imagenActual];
        document.querySelector(".prev").style.display = "block";
        document.querySelector(".next").style.display = "block";
    } else {
        // Caso 2: una sola imagen
        const producto = productos.find(p => p.id === productoId);
        imagenesProducto = [producto.imagen];
        imagenActual = 0;
        document.getElementById("carrusel-img").src = producto.imagen;
        document.querySelector(".prev").style.display = "none";
        document.querySelector(".next").style.display = "none";
    }

    // Mostrar modal
    document.getElementById("modal-carrusel").style.display = "flex";
}

/**
 * Cambiar la imagen en el carrusel
 * @param {Number} direccion - 1 para siguiente, -1 para anterior
 */
function cambiarImagen(direccion) {
    imagenActual = (imagenActual + direccion + imagenesProducto.length) % imagenesProducto.length;
    document.getElementById("carrusel-img").src = imagenesProducto[imagenActual];
}

// Eventos para cerrar el carrusel y navegar
document.querySelector(".cerrar").addEventListener("click", () => {
    document.getElementById("modal-carrusel").style.display = "none";
});
document.querySelector(".prev").addEventListener("click", () => cambiarImagen(-1));
document.querySelector(".next").addEventListener("click", () => cambiarImagen(1));
window.addEventListener("click", (e) => {
    if (e.target.id === "modal-carrusel") {
        document.getElementById("modal-carrusel").style.display = "none";
    }
});


// ========================================
// LOADER (espera a que se carguen las imágenes)
// ========================================

/**
 * Espera hasta que todas las imágenes del contenedor estén cargadas
 * antes de resolver la promesa.
 */
function esperarImagenesCargadas() {
    return new Promise((resolve) => {
        const container = document.getElementById("products-container");
        const imagenes = container.querySelectorAll("img");

        let cargadas = 0;
        const total = imagenes.length;

        if (total === 0) resolve(); // si no hay imágenes

        imagenes.forEach(img => {
            if (img.complete) {
                cargadas++;
                if (cargadas === total) resolve();
            } else {
                img.addEventListener("load", () => {
                    cargadas++;
                    if (cargadas === total) resolve();
                });
                img.addEventListener("error", () => {
                    cargadas++;
                    if (cargadas === total) resolve();
                });
            }
        });
    });
}


// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    cargarGaleria();   // primero cargamos la galería
    cargarProductos(); // luego los productos
});
