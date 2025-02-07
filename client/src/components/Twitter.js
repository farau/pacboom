import { useEffect, useState } from 'react';
import { useAppKitAccount } from "@reown/appkit/react";

export default function Twitter() {
    const { isConnected, address } = useAppKitAccount();
    const [twitterData, setTwitterData] = useState(null);

    useEffect(() => {
        if (isConnected) {
            fetch('/api/user/twitterInfos', { credentials: 'include' })
                .then(response => {
                    if (response.status === 204) {
                        setTwitterData(null)
                        return;
                    }
                    if (!response.ok) throw new Error('Erreur API');
                    return response.json();
                })
                .then(data => {
                    if (data && data[0]?.username && data[0]?.avatarurl) {
                        setTwitterData(data[0]);
                    } else {
                        setTwitterData(null);
                    }
                })
                .catch(error => console.error('Erreur Twitter:', error));
        } else {
            setTwitterData(null)
        }
    }, [isConnected, address]);

    return (
        <div>
            {twitterData ? (
                <div className="flex items-center gap-2">
                    <img src={twitterData.avatarurl} alt="Avatar" className="w-8 h-8 rounded-full" />
                    <span>{twitterData.username}</span>
                </div>
            ) : (
                <a className="nav-link" id="twitterLoginBtn" onClick={() => window.location.href = '/api/auth/twitter'}>Link your Twitter</a>
            )}
        </div>
    );
}
