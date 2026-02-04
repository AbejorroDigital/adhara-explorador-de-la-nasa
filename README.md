# Resumen
Voy a traducir al español la documentación de "Architecture Overview" del repositorio AbejorroDigital/adhara-explorador-de-la-nasa, preservando diagramas, tablas y referencias técnicas.

---

# Vista General de la Arquitectura

## Propósito y Alcance

Este documento describe la arquitectura de alto nivel de Adhara - Explorador de la NASA, explicando cómo la aplicación está estructurada en capas distintas y cómo fluyen los datos a través del sistema. Cubre la arquitectura de tres niveles que consiste en la capa de presentación (componentes React), la capa de gestión de estado (hooks personalizados) y la capa de servicios (clientes API), así como los puntos de integración con APIs externas. [1](#0-0) 

## Capas Arquitectónicas

La aplicación sigue un patrón de arquitectura de tres niveles con clara separación de responsabilidades:

**Diagrama de Arquitectura de Tres Niveles**

```mermaid
graph TB
    subgraph PresentationLayer["Capa de Presentación"]
        App["App.tsx<br/>Orquestador principal"]
        ApodViewer["ApodViewer<br/>Visualización multimedia"]
        InsightPanel["InsightPanel<br/>Visualización de insights de IA"]
        SkeletonLoader["SkeletonLoader<br/>Estados de carga"]
    end
    
    subgraph StateLayer["Capa de Gestión de Estado"]
        useApodData["useApodData<br/>Obtención de APOD e insights"]
        useFavorites["useFavorites<br/>Persistencia de favoritos"]
    end
    
    subgraph ServiceLayer["Capa de Servicios"]
        nasaService["nasaService.ts<br/>fetchAPOD()<br/>fetchRandomAPOD()"]
        geminiService["geminiService.ts<br/>generateCosmicInsight()"]
    end
    
    subgraph ExternalAPIs["APIs Externas"]
        NASA["NASA APOD API"]
        Gemini["Google Gemini API"]
        GoogleSearch["Google Search"]
    end
    
    subgraph Storage["Almacenamiento del Navegador"]
        LocalStorage["localStorage<br/>array de favoritos"]
    end
    
    App -->|"usa"| useApodData
    App -->|"usa"| useFavorites
    App -->|"renderiza"| ApodViewer
    App -->|"renderiza"| InsightPanel
    App -->|"renderiza"| SkeletonLoader
    
    useApodData -->|"llama"| nasaService
    useApodData -->|"llama"| geminiService
    useFavorites -->|"lee/escribe"| LocalStorage
    
    nasaService -->|"HTTP GET"| NASA
    geminiService -->|"pipeline de 2 etapas"| Gemini
    geminiService -.->|"Etapa 1: investigación"| GoogleSearch
``` [2](#0-1) 

### Responsabilidades de las Capas

| Capa | Responsabilidad | Archivos Clave |
|-------|----------------|-----------|
| **Presentación** | Renderizado de UI, interacciones del usuario, lógica de visualización condicional | `App.tsx`, `ApodViewer.tsx`, `InsightPanel.tsx`, `SkeletonLoader.tsx` |
| **Gestión de Estado** | Orquestación de obtención de datos, estados de carga, control de aborto, sincronización con localStorage | `useApodData.ts`, `useFavorites.ts` |
| **Servicios** | Integración con APIs externas, manejo de errores, lógica de reintentos, transformación de datos | `services/nasaService.ts`, `services/geminiService.ts` | [3](#0-2) 

## Arquitectura de Flujo de Datos

La aplicación implementa un patrón de flujo de datos unidireccional con operaciones paralelas no bloqueantes:

**Diagrama de Secuencia de Flujo de Datos**

```mermaid
sequenceDiagram
    participant User
    participant App
    participant useApodData
    participant nasaService
    participant geminiService
    participant NASA_API
    participant Gemini_API
    
    User->>App: "Selecciona fecha o aleatorio"
    App->>useApodData: "loadData(date, random)"
    
    useApodData->>nasaService: "fetchAPOD(date)"
    nasaService->>NASA_API: "GET /planetary/apod"
    NASA_API-->>nasaService: "objeto NASA_APOD"
    nasaService-->>useApodData: "NASA_APOD"
    
    useApodData-->>App: "{apod, loading:false}"
    App-->>User: "Muestra imagen APOD"
    
    par "Generación de IA no bloqueante"
        useApodData->>geminiService: "generateCosmicInsight(title, explanation)"
        geminiService->>Gemini_API: "Etapa 1: Investigación"
        Gemini_API-->>geminiService: "rawAnalysis + groundingChunks"
        geminiService->>Gemini_API: "Etapa 2: Traducción"
        Gemini_API-->>geminiService: "JSON estructurado en español"
        geminiService-->>useApodData: "AI_Insight"
        useApodData-->>App: "{insight, insightLoading:false}"
        App-->>User: "Muestra insights de IA"
    end
``` [4](#0-3) 

### Patrón de Carga Progresiva

La arquitectura implementa una estrategia de carga progresiva donde los datos APOD y los insights de IA se obtienen independientemente:

1. **Inmediato**: Imagen/video APOD cargado desde la API de NASA
2. **Paralelo**: La generación de insights de IA ocurre de forma asíncrona
3. **No bloqueante**: El usuario ve contenido astronómico inmediatamente mientras continúa el procesamiento de IA

Esto se implementa a través del hook `useApodData` que gestiona dos estados de carga separados: `loading` (para APOD) y `insightLoading` (para insights de IA). [5](#0-4) 

## Capa de Servicios Principal

La capa de servicios proporciona abstracciones limpias sobre APIs externas con patrones de programación defensiva:

**Integración de la Capa de Servicios**

```mermaid
graph LR
    subgraph nasaService["nasaService.ts"]
        fetchAPOD["fetchAPOD(date?, signal?)"]
        fetchRandomAPOD["fetchRandomAPOD(signal?)"]
        getNASADate["getNASADate(offsetDays)"]
    end
    
    subgraph geminiService["geminiService.ts"]
        generateCosmicInsight["generateCosmicInsight(title, explanation)"]
        Stage1["Etapa 1: Llamada de investigación"]
        Stage2["Etapa 2: Llamada de traducción"]
    end
    
    fetchAPOD -->|"usa"| getNASADate
    fetchAPOD -->|"lógica de reintento"| fetchAPOD
    generateCosmicInsight --> Stage1
    generateCosmicInsight --> Stage2
    Stage1 -->|"alimenta"| Stage2
``` [6](#0-5) 

### Patrones en nasaService.ts

El servicio de NASA implementa varios patrones defensivos:

| Patrón | Implementación | Ubicación |
|---------|----------------|----------|
| **Consciente de zona horaria** | Convierte fechas a zona horaria `America/New_York` para coincidir con el horario de publicación de NASA | [7](#0-6)  |
| **Reintento automático** | Si el APOD de hoy devuelve 400/404, reintenta automáticamente con la fecha de ayer | [8](#0-7)  |
| **Manejo de límite de velocidad** | Detecta estado 429 y proporciona mensaje de error amigable | [9](#0-8)  |
| **Control de aborto** | Acepta `AbortSignal` para cancelar solicitudes en vuelo | [10](#0-9)  |

### Arquitectura de geminiService.ts

El servicio Gemini es el componente de mayor importancia (12.90) e implementa un sofisticado pipeline de IA de dos etapas:

1. **Etapa 1: Investigación** - Usa Google Search para reunir contexto científico y noticias recientes (2023-2025). Extrae metadatos de grounding con fuentes web. [11](#0-10) 

2. **Etapa 2: Traducción** - Traduce y formatea contenido al español con validación estricta de esquema JSON. Usa `temperature: 0.1` para evitar fugas de idioma. [12](#0-11) 

Esta separación asegura que la IA tenga acceso a información actual durante la investigación pero no alucine durante la traducción. [13](#0-12) 

## Sistema de Tipos y Contratos de Datos

La aplicación utiliza interfaces TypeScript para definir contratos de datos estrictos en todas las capas:

**Gráfico de Dependencias de Tipos**

```mermaid
graph TB
    NASA_APOD["NASA_APOD<br/>date, title, explanation<br/>url, hdurl, media_type<br/>copyright"]
    
    AI_Insight["AI_Insight<br/>translatedTitle, translatedExplanation<br/>reflection, scientificContext<br/>philosophicalPerspective<br/>suggestedReading, recentNews"]
    
    GroundingSource["GroundingSource<br/>title, uri"]
    
    FavoriteItem["FavoriteItem<br/>apod + insight"]
    
    AI_Insight -->|"contiene array de"| GroundingSource
    FavoriteItem -->|"compone"| NASA_APOD
    FavoriteItem -->|"compone"| AI_Insight
``` [14](#0-13) 

### Definiciones de Tipos Principales

| Tipo | Propósito | Fuente |
|------|---------|--------|
| `NASA_APOD` | Datos devueltos por NASA APOD API | [15](#0-14)  |
| `AI_Insight` | Salida estructurada del pipeline de dos etapas de Gemini | [16](#0-15)  |
| `GroundingSource` | Metadatos de fuentes web del grounding de Google Search | [17](#0-16)  |
| `FavoriteItem` | Elemento guardado por usuario que combina APOD e insight de IA | [18](#0-17)  |

Estos tipos fluyen a través de toda la aplicación:
- Los servicios devuelven `NASA_APOD` y `AI_Insight`
- Los hooks gestionan estos tipos con estados de carga
- Los componentes los reciben como props para renderizado
- `useFavorites` persiste `FavoriteItem[]` en localStorage

## Entrada de Aplicación y Bootstrap

El bootstrap de la aplicación sigue un patrón de inicialización React estándar con mejoras PWA:

**Secuencia de Bootstrap**

```mermaid
graph TB
    HTML["index.html<br/>metadatos PWA<br/>Import maps<br/>Tailwind CDN<br/>Google Fonts"]
    
    ImportMap["Import Map<br/>@google/genai via esm.sh<br/>react via esm.sh<br/>react-dom via esm.sh"]
    
    IndexTSX["index.tsx<br/>ReactDOM.createRoot()<br/>React.StrictMode"]
    
    AppTSX["App.tsx<br/>Componente raíz"]
    
    Root["div #root"]
    
    HTML -->|"define"| ImportMap
    HTML -->|"carga módulo"| IndexTSX
    IndexTSX -->|"renderiza en"| Root
    IndexTSX -->|"envuelve con StrictMode"| AppTSX
``` [19](#0-18) 

### Configuración de Import Map

La aplicación utiliza import maps nativos del navegador para cargar dependencias directamente desde CDN sin bundling durante el desarrollo:

```typescript
{
  "@google/genai": "https://esm.sh/@google/genai@^1.38.0",
  "react": "https://esm.sh/react@^19.2.3",
  "react-dom/": "https://esm.sh/react-dom@^19.2.3/"
}
```

Esta configuración se define en `index.html` y permite a la aplicación importar dependencias usando sintaxis estándar de npm mientras las sirve desde CDN compatible con ESM. [20](#0-19) 

## Patrón de Gestión de Estado

La aplicación utiliza hooks personalizados de React para encapsular toda la lógica con estado, manteniendo los componentes presentacionales:

**Responsabilidades de los Hooks**

| Hook | Estado Gestionado | Operaciones |
|------|---------------|------------|
| `useApodData` | Datos APOD, insights de IA, estados de carga, errores, fecha actual | `loadData(date, random)`, control de aborto |
| `useFavorites` | Array de favoritos sincronizado con localStorage | `toggleFavorite()`, `isFavorite()` |

El componente `App` actúa como capa de orquestación, coordinando entre estos hooks y pasando datos hacia abajo a componentes presentacionales. Este patrón mantiene la lógica de negocio aislada y los componentes reutilizables. [21](#0-20) 

## Decisiones Arquitectónicas Clave

### Procesamiento de IA No Bloqueante

La arquitectura prioriza la experiencia del usuario haciendo que la generación de insights de IA sea no bloqueante. La imagen APOD se muestra inmediatamente mientras el procesamiento de IA ocurre en segundo plano. Esto se logra mediante:

1. Estados de carga separados (`loading` vs `insightLoading`)
2. Llamadas API independientes en paralelo
3. Renderizado condicional basado en disponibilidad de datos [22](#0-21) 

### Pipeline de IA de Dos Etapas

`geminiService` implementa un pipeline de dos etapas donde la Etapa 1 permite investigación libre con Google Search, y la Etapa 2 restringe la traducción con validación estricta de esquema. Esta decisión arquitectónica

Wiki pages you might want to explore:
- [Architecture Overview (AbejorroDigital/adhara-explorador-de-la-nasa)](/wiki/AbejorroDigital/adhara-explorador-de-la-nasa#3)

### Citations

**File:** services/nasaService.ts (L12-22)
```typescript
const getNASADate = (offsetDays = 1): string => {
  const now = new Date();
  now.setDate(now.getDate() - offsetDays);
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
};
```

**File:** services/nasaService.ts (L24-33)
```typescript
export const fetchAPOD = async (date?: string, signal?: AbortSignal): Promise<NASA_APOD> => {
  // Si no hay fecha, usamos la fecha segura de NY.
  const requestDate = date || getNASADate();
  
  const url = new URL(NASA_API_BASE);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('date', requestDate);

  try {
    const response = await fetch(url.toString(), { signal });
```

**File:** services/nasaService.ts (L37-39)
```typescript
    if ((response.status === 400 || response.status === 404) && !date) {
      console.warn("Imagen de hoy no disponible, intentando ayer...");
      return fetchAPOD(getNASADate(1), signal);
```

**File:** services/nasaService.ts (L44-46)
```typescript
      if (response.status === 429) {
        throw new Error('Límite de API alcanzado (DEMO_KEY). Intenta de nuevo más tarde.');
      }
```

**File:** services/geminiService.ts (L5-25)
```typescript
  const researchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Thoroughly analyze this astronomical event for a scientific blog:
    Title: "${title}"
    Description: "${explanation}"
    Use Google Search to find scientific context and news from 2023-2025.`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const rawAnalysis = researchResponse.text;
  
  // Extraemos las noticias del Grounding de la primera llamada
  const news: any[] = [];
  const groundingChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        news.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });
  }
```

**File:** services/geminiService.ts (L30-56)
```typescript
  const finalResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Eres un traductor y divulgador científico de primer nivel. 
    Tu objetivo es transformar el análisis adjunto en un JSON perfecto en español.
    
    ANÁLISIS TÉCNICO: ${rawAnalysis}
    TÍTULO ORIGINAL: ${title}
    DESCRIPCIÓN ORIGINAL: ${explanation}
    
    INSTRUCCIÓN CRÍTICA: Escribe TODO en español. No dejes términos en inglés.`,
    config: {
      temperature: 0.1, // Casi nada de aleatoriedad para evitar fugas de idioma
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedTitle: { type: Type.STRING },
          translatedExplanation: { type: Type.STRING },
          reflection: { type: Type.STRING },
          scientificContext: { type: Type.STRING },
          philosophicalPerspective: { type: Type.STRING },
          suggestedReading: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["translatedTitle", "translatedExplanation", "reflection", "scientificContext", "philosophicalPerspective", "suggestedReading"]
      }
    }
  });
```
