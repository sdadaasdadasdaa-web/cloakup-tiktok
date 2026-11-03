// language: JavaScript, file: app/layout.js, target: Next.js 14, Vercel
// *Layout raiz do projeto — base de toda a interface.

export const metadata = {
  title: 'Proteção de Tráfego — Disfarce para Bots',
  description: 'Proteção de tráfego inteligente — redireciona bots e desktop para um disfarce, mobile para a oferta',
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
