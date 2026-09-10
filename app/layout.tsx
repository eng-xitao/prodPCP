import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProdPCP | Cadastro de Cliente e Fornecedor",
  description: "ProdPCP - Planejamento e Controle da Produção",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
