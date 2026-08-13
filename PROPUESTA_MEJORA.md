# Propuesta de mejora — Obsidian Motors

**Estado:** propuesta implementada en demo frontend  
**Referencia visual analizada:** [D&C Motor Company — Luxury Vehicles for Sale in Portland, OR](https://www.dcmotorcompany.com/luxury-vehicles-for-sale-in-portland-or)  
**Alcance de esta iteración:** mejorar la sección de carrusel, ordenar la densidad visual de la landing y mantener las funciones de conversación y appointment en modo mockup.

## 1. Diagnóstico

La referencia actual concentra demasiadas decisiones en el mismo plano: navegación extensa, filtros, inventario, llamadas a la acción y estados de carga. En desktop, el inventario puede generar zonas blancas cuando las tarjetas todavía están cargando; en tablet, el sidebar y la grilla compiten por ancho; en celular, una experiencia horizontal compleja puede producir recortes, scroll accidental y pérdida de contexto.

En el proyecto de Obsidian Motors, el carrusel anterior mezclaba un scroll vertical con una pista horizontal, perspectiva 3D, capítulos de contenido y alturas calculadas en runtime. Aunque técnicamente ambicioso, ese patrón elevaba el riesgo de overflow, solape con la navegación y espacios muertos en ventanas bajas. También hacía que el contenido editorial no tuviera una jerarquía única.

> **Decisión de diseño:** reemplazar la interacción “cinemática” por un carrusel editorial de selección curada. La experiencia conserva sensación premium, pero prioriza legibilidad, control, accesibilidad y conversión.

## 2. Mejora aplicada

La sección `Journey` fue rediseñada como **The Obsidian edit / A better way to arrive**. Ahora muestra una tarjeta principal de vehículo con imagen dominante, marca, tipo, precio diario, descripción, especificaciones esenciales y CTA a detalle. Las tarjetas vecinas permanecen parcialmente visibles para comunicar continuidad y permitir descubrimiento.

| Área | Antes | Ahora |
|---|---|---|
| Interacción | Scroll vertical que controla un carrusel horizontal con 3D | Carrusel horizontal con snap, flechas, dots y autoplay pausible |
| Contenido | Capítulos y tarjetas de proceso mezclados | Selección curada de cuatro vehículos con información accionable |
| Desktop | Altura calculada y riesgo de recorte en ventanas bajas | Altura basada en proporción de imagen + contenido natural |
| Tablet | Pista compleja difícil de controlar | Tarjetas de ancho intermedio con peek lateral y swipe |
| Celular | Riesgo de scroll secuestrado | Una tarjeta por viewport, swipe nativo y controles accesibles |
| Conversión | CTA diluido dentro del relato | `Explore vehicle` y `Talk to a specialist` claramente visibles |
| Confianza | Beneficios dispersos | Rail compacto: inspección, delivery y reserva flexible |

El nuevo carrusel también respeta `prefers-reduced-motion`, mantiene controles con foco visible y pausa el autoplay al entrar con mouse o teclado. Las imágenes se cargan con `eager` solo para la primera tarjeta y `lazy` para las demás.

## 3. Reglas responsive y corrección de espacios

El layout usa una composición fluida en lugar de reservar alturas artificiales. En desktop la tarjeta activa ocupa la mayor parte del ancho y deja una vista parcial de la siguiente; en tablet la pista reduce el ancho de cada slide para preservar contexto; en celular el slide ocupa aproximadamente el viewport útil y la navegación se vuelve táctil.

La revisión debe conservar estas reglas en futuras secciones: no usar `min-height` para compensar contenido que puede crecer; no ocultar contenido importante dentro de `overflow-hidden`; no dejar columnas vacías cuando una tarjeta no tiene datos; y usar estados de carga explícitos si el inventario se conecta a una API. En la grilla de inventario, los skeletons deben reservar exactamente la misma relación de aspecto que las imágenes para que la página no “salte”.

## 4. Chatbot y appointment: estado de demo

Por ahora no se debe conectar el chatbot ni el appointment a servicios reales, calendarios, CRM o mensajería. La interfaz debe comunicar que es una demostración: puede abrir un panel visual, aceptar entradas locales y mostrar un estado de confirmación simulado, pero no debe prometer disponibilidad, crear una cita real ni enviar mensajes externos.

El formulario de contacto existente sigue el patrón correcto para esta fase: usa estado local, evita persistencia y presenta un estado `sent` de demostración. En el repositorio revisado no se encontró un módulo backend ni una integración operativa de chatbot o appointment; por ello, estas funcionalidades deben considerarse **pendientes de conectar**, no fallas de la experiencia visual actual.

## 5. Backend propuesto para la siguiente fase

La implementación productiva debe separar el contenido de marketing del inventario operativo. El frontend consumirá una API para obtener vehículos, disponibilidad, precios y leads; el carrusel podrá seguir usando una selección editorial administrable desde el backend.

| Módulo | Responsabilidad | Entidades principales |
|---|---|---|
| Inventario | CRUD de vehículos, fotos, specs, precio y estado | `vehicles`, `vehicle_images`, `vehicle_features` |
| Disponibilidad | Bloqueos por fecha y estado de reserva | `availability_blocks`, `reservations` |
| Leads | Guardar solicitudes de contacto y origen | `leads`, `lead_events`, `consent_records` |
| Appointments | Solicitud, confirmación, reprogramación y cancelación | `appointments`, `appointment_slots`, `appointment_status_history` |
| Chatbot | Conversaciones, handoff a humano y respuestas guardadas | `conversations`, `messages`, `handoffs` |
| Notificaciones | Email/SMS/WhatsApp y recordatorios | `notification_jobs`, `notification_templates` |
| Administración | Roles, auditoría y edición de contenido | `users`, `roles`, `audit_logs` |

### API inicial sugerida

`GET /api/vehicles` debe soportar filtros por marca, tipo, precio, características y estado. `GET /api/vehicles/:id` devolverá detalle y galería. `GET /api/availability?vehicleId=&from=&to=` verificará fechas antes de mostrar una propuesta. `POST /api/leads` guardará una solicitud con consentimiento explícito. `POST /api/appointments` creará una solicitud pendiente, nunca una confirmación automática. Para el chatbot, `POST /api/conversations` creará la sesión y `POST /api/conversations/:id/messages` registrará cada mensaje, aplicando límites, moderación y handoff.

La API debe validar con esquemas, aplicar rate limiting, registrar consentimiento y proteger datos personales. Las claves de proveedores externos deben vivir solo en el servidor. El frontend no debe asumir que un precio o disponibilidad sigue vigente: debe revalidar antes de confirmar.

## 6. Orden recomendado de desarrollo

Primero se debe modelar inventario y disponibilidad, porque el carrusel y el detalle necesitan una fuente única de verdad. Después se implementa el pipeline de leads y el appointment con estado pendiente. En una tercera etapa se agrega el chatbot con respuestas acotadas a inventario, preguntas frecuentes y derivación a un especialista. Finalmente se incorporan notificaciones, analítica de conversiones y un panel de administración.

## 7. Criterios de aceptación

La mejora se considera lista cuando el carrusel es navegable con mouse, teclado y swipe; no produce scroll horizontal en el `body`; se mantiene legible en desktop, tablet y celular; no muestra espacios vacíos artificiales; pausa el autoplay cuando el usuario interactúa; mantiene foco visible; y cada CTA lleva a un destino coherente. Las funciones de chatbot y appointment deben identificarse como demo hasta que exista persistencia y una confirmación proveniente del backend.

## Referencias

[1]: https://www.dcmotorcompany.com/luxury-vehicles-for-sale-in-portland-or "D&C Motor Company — Luxury Vehicles for Sale in Portland, OR"
