import { useEffect, useState } from 'react';

export default function useAdminExists() {
    const [adminExists, setAdminExists] = useState(true);

    useEffect(() => {
        fetch('/api/register-admin/status')
            .then((res) => {
                if (!res.ok) throw new Error('status endpoint failed');
                return res.json();
            })
            .then((data) => setAdminExists(Boolean(data?.adminExists)))
            .catch(() => setAdminExists(true));
    }, []);

    return adminExists;
}
