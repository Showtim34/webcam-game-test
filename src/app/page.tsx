import Image from 'next/image'
import Navbar from "@/app/components/Navbar";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                    <a href="/game">Voir le jeu</a>
                </div>
            </main>
        </div>
    )
}
