# 🪐 Adhara - Explorador de la NASA

Bienvenidos a la documentación técnica de **Adhara**, una plataforma diseñada para acercar las maravillas del cosmos a los usuarios mediante la integración de datos científicos de la NASA y análisis avanzados con Inteligencia Artificial.

## Una Estructura de Tres Pilares

Para garantizar que la aplicación sea robusta, escalable y fácil de mantener, Adhara se ha construido siguiendo un patrón de arquitectura de tres niveles. Esta separación de responsabilidades permite que cada parte del sistema se especialice en una tarea concreta.

### 1. Capa de Presentación (El Rostro)

Construida íntegramente con **React**, esta capa es la encargada de la interfaz de usuario. Su objetivo es renderizar componentes visuales de forma eficiente, manejando desde la visualización multimedia del APOD (Imagen Astronómica del Día) hasta los paneles donde la IA despliega sus hallazgos científicos. Aquí, la experiencia del usuario es la prioridad, asegurando transiciones suaves y estados de carga visualmente agradables.

### 2. Capa de Gestión de Estado (El Cerebro)

A través de **Hooks personalizados**, esta capa actúa como el orquestador central. No solo decide cuándo solicitar nuevos datos, sino que también gestiona la persistencia de los favoritos del usuario en el almacenamiento local del navegador y controla los ciclos de vida de las peticiones, permitiendo incluso abortar procesos para optimizar el rendimiento.

### 3. Capa de Servicios (El Motor de Datos)

Es la encargada de la comunicación con el exterior. Contiene la lógica necesaria para hablar con la **API de la NASA** y el servicio de **Google Gemini**. Esta capa abstrae la complejidad de las llamadas HTTP y transforma la información cruda en datos estructurados y listos para ser consumidos por el resto de la aplicación.

---

## Flujo de Datos y Carga Progresiva

Adhara implementa una estrategia de carga **no bloqueante**. Entendemos que la curiosidad no puede esperar, por lo que la arquitectura prioriza la entrega de contenido:

1. **Impacto Inmediato:** El usuario recibe la imagen o video astronómico directamente desde la NASA casi al instante.
2. **Análisis en Paralelo:** Mientras el usuario explora la imagen, un pipeline asíncrono activa a Gemini para generar un análisis profundo.
3. **Entrega Final:** Los hallazgos de la IA se inyectan en la interfaz de forma fluida conforme están listos, sin haber congelado la aplicación en ningún momento.

---

## Inteligencia Artificial con Rigor Científico

El servicio de IA no se limita a traducir; realiza una **investigación en dos etapas**. Primero, utiliza herramientas de búsqueda en tiempo real para contextualizar la imagen con noticias y descubrimientos científicos recientes (2023-2025). Segundo, refina esa información mediante un modelo de lenguaje que garantiza un tono divulgativo, preciso y completamente en español.

---

## Modernidad en el Desarrollo

Fiel a las tendencias más actuales, el proyecto utiliza **Import Maps**. Esta decisión nos permite cargar dependencias directamente desde la nube, simplificando enormemente el flujo de desarrollo y aprovechando las capacidades nativas de los navegadores modernos para gestionar módulos de JavaScript sin necesidad de intermediarios pesados.

---

### Resiliencia y Fiabilidad

Adhara está preparada para los imprevistos. El sistema cuenta con mecanismos de **reintento automático**: si la NASA aún no ha publicado la imagen del día (debido a diferencias horarias), la aplicación retrocede inteligentemente al día anterior para asegurar que siempre haya contenido disponible para el explorador.

---
