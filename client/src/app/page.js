"use client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import GameCanvas from "@/components/GameCanvas";
import Image from "next/image";
import "../styles/style.css";

export default function Home() {
    return (
        <>
            <NavBar />

            <main className="container mt-4">
                <div className="row">
                    {/* Colonne gauche : Instructions du jeu */}
                    <div className="col-md-6 order-md-1 mt-3">
                        <h3>How to play?</h3>
                        <p>Connect your wallet, eat the enemies, and score high to earn PacBoom points!</p> 
                        <p>Choose wisely how to spend your PB points: attack the boss in the Arena section to claim the associated prize, or save your PB points to climb the leaderboard!</p>
                        <ul>
                            <li className="mb-3">
                                <Image src="/img/ghost.png" alt="Ghost" className="ennemiesPage" width={50} height={50} />
                                Ghost: Also known as a <a href="https://ghostblast.xyz/">memecoin</a> of the Blast ecosystem, the first to emerge from the Tornado Blast launcher. It aims to chase Pacman and earn gold! Eat it to <b>get 100 points.</b>
                            </li>
                            <li className="mb-3">
                                <Image src="/img/grinch.jpg" alt="Grinch" className="ennemiesPage" width={50} height={50} />
                                <b style={{ color: "red" }}>Grinch:</b> He is so jealous and wants to destroy Christmas! Don't touch him or you will die!
                            </li>
                            <li className="mb-3">
                                <Image src="/img/santa.png" alt="Santa Claus" className="ennemiesPage" width={50} height={50} />
                                <b style={{ color: "green" }}>Santa Claus:</b> Let Christmas come and welcome Santa Claus and his beautiful gifts! <br />
                                Eat it to get 500 points and the special ability to eat those <b>Grinch</b> spamming the map! But be careful, the ability doesn't last long!
                            </li>
                            <li className="mb-3">
                                <Image src="/img/gift.png" alt="Gift" className="ennemiesPage" width={50} height={50} />
                                Gift: Sometimes a gift can appear, just eat it and <b>get 300 points</b>!
                            </li>
                            <li className="mb-3">
                                <Image src="/img/reindeer.png" alt="Reindeer" className="ennemiesPage" width={50} height={50} />
                                Reindeer: They will slow you down if you try to eat them!
                            </li>
                            <li className="mb-3">
                                <Image src="/img/jenndefer.png" alt="Jenndefer" className="ennemiesPage" width={50} height={50} />
                                Jenndefer: She is a well-known influencer who often shares advice and tweets about the Blast ecosystem. Eat it to get 1000 points but you will become bigger, so take care of those Grinch! The ability doesn't last long.
                            </li>
                        </ul>

                        <h3 className="text-center mt-5">Controls</h3>
                        <p><b>Desktop:</b></p>
                        <ul>
                            <li>Arrows: to move Pacboom</li>
                            <li>Space: to speed up Pacboom OR shoot a bullet</li>
                        </ul>
                        <p><b>Smartphone:</b></p>
                        <ul>
                            <li>Slide your finger in the desired direction to move Pacboom</li>
                            <li>Keep pressing to speed up Pacboom OR tap on the screen to shoot a bullet</li>
                        </ul>
                    </div>

                    {/* Colonne droite : Le jeu */}
                    <div className="col-md-6 text-center">
                        {/* Composant GameCanvas si nécessaire */}
                        <GameCanvas />
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
