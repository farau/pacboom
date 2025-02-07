import "bootstrap/dist/css/bootstrap.min.css";
import '../styles/style.css';
import BootstrapLoader from "@/components/BootstrapLoader";
import AppKit from '@/context'
import Head from "next/head";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <Head>
      <title>PacBoom</title>
      <link rel="shortcut icon" href="/icon.png" type="image/png" />
      </Head>
      <body className="antialiased">
        <BootstrapLoader /> {/* Charge Bootstrap JS côté client */}
        <AppKit>{children}</AppKit>
      </body>
    </html>
  );
}
