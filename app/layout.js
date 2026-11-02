// language: JavaScript, file: app/layout.js, target: Next.js 14, Vercel
// *Layout raiz do projeto — serve como base para toda a interface do cloaker.

export const metadata = {
  title: 'Cloaker Genérico — Proteção de Oferta',
  description: 'Cloaker genérico estilo CloakUp — protege ofertas de bots e direciona leads qualificados',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
