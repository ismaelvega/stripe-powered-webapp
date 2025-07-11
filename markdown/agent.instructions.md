---
applyTo: '**'
---

## 1. Project Overview
- **Descripción**: Aplicación SaaS de verificación de identidad con autenticación, gestión de métodos de pago y notificaciones automáticas.
- **Tecnologías principales**:
  - Frontend: Next.js + TypeScript + Tailwind CSS (ShadCN)
  - Backend & Auth: Supabase Auth + Postgres
  - Pagos: Stripe (modo test)
  - Automatización de flujos: N8N
- **Arquitectura**:  
  1. Next.js como framework React SSR/SSG (con App Router).
    - SweetAlert para notificaciones.
  2. Supabase como BaaS (Auth + Postgres).  
  3. Webhooks a N8N tras cada login para disparar flujos.  
  4. Stripe Elements en UI para recolectar método de pago.

## 2. Build & Commands
```bash
# Instalar dependencias
pnpm install

# Desarrollo local
pnpm dev

# Construir para producción
pnpm build

# Deploy en Vercel
pnpm deploy      # script que ejecuta `vercel --prod`
```

## 3. Code Style
- **TypeScript**:  
  - Usar tipos y `interface` para props y respuestas de API.  
  - Evitar `any`; preferir genéricos y tipos específicos.  
- **Naming**:  
  - Componentes en PascalCase, hooks en camelCase (`useAuth`),  
  - Archivos `.tsx` para componentes React, `.ts` para utilidades.
- **CSS/Tailwind**:  
  - Clases utilitarias en orden “mobile-first”: `flex flex-col md:flex-row`.  
  - Extraer estilos comunes a componentes “UI” reutilizables (ShadCN).
  - Considar white-black theme
- **Error handling**:
  - Usar `try/catch` en llamadas a API y manejar errores de forma centralizada.  
  - Mostrar mensajes de error amigables al usuario.
- **Imports**:  
  - Orden: externals → hooks → components → utils → estilos.  
  - Usar alias `@/` para rutas absolutas (configurado en `tsconfig.json`).  


## 4. Security
- **Encriptación**:  
  - Variables sensibles en Supabase (JWT secret), claves de Stripe en `.env`.
- **Validaciones**:  
  - Sanitizar inputs de formularios y respuestas de API.  
  - Validación en frontend y reforzada en Supabase Functions si es necesario.  
- **Autorización**:  
  - Páginas protegidas en Next.js (`middleware.ts`) que verifiquen sesión en Supabase.  
- **CORS & Headers**:  
  - Configurar cabeceras de seguridad (Content-Security-Policy, X-Frame-Options).  

## 5. Configuration
```env
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
N8N_WEBHOOK_URL=
```
- **Ambientes**: `.env.local` (dev), `.env.production` (prod).
- **Git**: subir `.env.example` sólo; agregar `.env*` a `.gitignore`.
- **Vercel**: Variables configuradas en Settings → Environment Variables.

```

## 6. Responses
- Evita los emojis en los inserts de código y comentarios (en tus respuestas no hay problema). (permitidos: ✅, ❗️, ❌, ⚠️ y solamente cuando sea necesario)
- Tu tono será profesional, directo y claro.
- Usa un lenguaje técnico preciso, evitando jerga innecesaria.
- Todo el contenido en inserts será en inglés (código y comentarios).
- Sé breve en tus inserts de comentarios, pero asegúrate de que sean claros y útiles.


## 7. When task finalization
- Cuando termines una tarea, agregarás detalles de los cambios realizados en el archivo CHANGELOG.md ubicado en la carpeta Markdown.
- El formato del mensaje será:
```markdown
- [Fecha y hora] Descripción de los cambios realizados
- Justificación de los cambios realizados
```