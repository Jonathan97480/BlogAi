import { useEffect, useState } from 'react';

export default function useAdminExists() {
    const [adminExists, setAdminExists] = useState(true);
    useEffect(() => {
        fetch('/api/register-admin', { method: 'HEAD' })
            .then(res => setAdminExists(res.status === 403))
            .catch(() => setAdminExists(true));
    }, []);
    return adminExists;
}
