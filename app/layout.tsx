import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
export const metadata: Metadata={title:"Sabah Disaster Intelligence Portal",description:"Disaster monitoring and AI-assisted risk intelligence for Sabah"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ms"><body>{children}</body></html>}
