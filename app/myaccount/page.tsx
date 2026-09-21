import { AccountDashboard } from '@/components/account-dashboard';

export const metadata = { title: 'My account' };

export default function AccountPage() {
  return (
    <div className="content-page">
      <header className="content-hero">
        <p className="eyebrow">Player profile</p>
        <h1>Your command center.</h1>
        <p>Manage your wallet session, social identity, and PacNub game character from one place.</p>
      </header>
      <AccountDashboard />
    </div>
  );
}
