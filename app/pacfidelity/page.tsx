import { FidelityBoard } from '@/components/fidelity-board';

export const metadata = { title: 'PAC Fidelity' };

export default function FidelityPage() {
  return (
    <div className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Community rewards</p>
        <h1>PAC Fidelity.</h1>
        <p>Community participation earns fidelity points and a place on this dedicated board.</p>
      </header>
      <FidelityBoard />
    </div>
  );
}
