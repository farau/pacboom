'use client';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from 'next/image';
import "@/styles/style.css";

export default function About() {

    return (
        <>
        <NavBar />
        <div className="container mt-5 text-center">
        <h1 className="text-center">Why PacBoom and what is it ?</h1><br/>
        <p>
            PacBoom is a decentralized application (dApp) designed to build an ecosystem centered around gamification.
            Its primary goal is to allow users to experience the blockchain through engaging and entertaining games.
        </p>
        <br/>
        <div className="table-responsive mt-4">
            <table className="table">
                <tbody>
                    <tr className="white-text">
                        <td>PacBoom contract address</td>
                        <td>0x17a51b837db44c390159218d30174ebeda2675f4</td>
                    </tr>
                    <tr className="white-text">
                        <td>PacBoom points operator address</td>
                        <td>0x6e93E6ddb36cB68c779664980143004F7494BEc8</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>

    <div className="container mt-2 mb-2">
        <h2 className="text-center">PacBoom join the <Image src="/img/blast_name.svg" alt="Blast name" width={150} height={150}/> party !</h2><br/>
        <p className="text-center">
            Support the Blast ecosystem and achieve the best score to receive PAC BOOM points.
        </p>
        <p className="text-center" style={{ color: "#FCFC03" }}>
            Score and earn PacBoom points by paying for 1 to 3 BLAST, and become eligible to receive Blast Gold, Blast Tokens, or other special prizes!
        </p>        
        <h2 className="text-center mt-5">Introducing PacBoom NFT </h2><br/>
        <div className="text-center mb-5">
            <Image src="/img/pacboom-nfts.gif" alt="PAC BOOM NFTs" width={150} height={150}/>
            <p>Buy a <i>refundable</i> NFT from PAC BOOM collection on <a href="https://blastr.xyz/pacboom">Blastr</a> to get a bonus on PAC BOOM game.</p>
            <p>The supply of the collection is 1800 NFTs characterized by different traits.</p>
            <p>You can get an additional bonus if you hold more than 5 NFTs.</p>    
        </div>

        <h2 className="text-center mt-5">Have more fun with PacBoom Army NFT !</h2><br/>
        <div className="text-center mb-5">
            <Image src="/img/pacboom-army.gif" alt="PAC BOOM Army NFTs" width={150} height={150}/>
            <p>Buy a <i>refundable</i> NFT from PAC BOOM Army collection on <a href="https://blastr.xyz/pacboom-armyera">Blastr</a> and unlock additional gameplay on PacBoom!</p>
            <p>The supply of the collection is 800 NFTs characterized by different traits.</p>
            <p>Traits with army gives you the ability to shoot your ennemies!</p>
            <p>Other traits may unlock new abilities in the future 👀</p>
            <p>You get a x2 bonus multiplier on your score when you play with a Nub.</p>
        </div>

    
        <h2 className="text-center mt-5">Introducing the Arena Mode !</h2><br/>
        <div className="text-center mb-5">
            <Image src="/img/konk.webp" alt="Konk boss" width={150} height={150} /> 
            <p>A new way to spend your PacBoom points and earn special prizes.</p>
        </div>

        <div className="container mt-4">
            <h3 className="text-center">Boss Statistics</h3>
            <table className="table table-bordered table-striped bg-dark">
                <thead>
                    <tr className="white-text">
                        <th>Statistic</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="white-text">
                        <td>Serial</td>
                        <td>The serial number that identifies the boss.</td>
                    </tr>
                    <tr className="white-text">
                        <td>Life</td>
                        <td>The remaining life of the boss.</td>
                    </tr>
                    <tr className="white-text">
                        <td>Prize</td>
                        <td>The prize associated with the boss. The prize will be awarded to the killer of the boss!</td>
                    </tr>
                    <tr className="white-text">
                        <td>Entry Fee</td>
                        <td>The cost in Blast tokens to attack the boss.</td>
                    </tr>
                    <tr className="white-text">
                        <td>Damage</td>
                        <td>The damage dealt by the boss in PacBoom points. This means that each time you attack the boss, your number of PB points will be decreased by this damage.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p>To attack the boss, you need to have a number of PacBoom points greater than the damage statistic; otherwise, you won't be able to attack it.</p>
        
        <h2 className="text-center mt-5">Artwork</h2><br/>
        <div className="text-center mb-5">
            <Image src="/img/artwork-pacboom.png" alt="PAC BOOM artwork" className="img-fluid rounded shadow" width={400} height={400} />
            <p>Explore the exciting world of PAC BOOM!</p>
        </div>
        

    </div>
        <Footer />
        </>
  );
}
