import { useState, useEffect } from 'react';
import { storage } from '../../services/firebase';
import { ref, getBlob } from 'firebase/storage';

/**
 * StorageImage - A component that resolves Firebase Storage paths to displayable URLs.
 * Falls back to direct URL if the src starts with 'http'.
 */
const StorageImage = ({ src, alt, className, fallbackIcon: FallbackIcon }) => {
    const [resolvedUrl, setResolvedUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let objectUrl = '';
        const load = async () => {
            if (!src) {
                setLoading(false);
                return;
            }

            if (typeof src === 'string' && src.startsWith('http')) {
                setResolvedUrl(src);
                setLoading(false);
            } else {
                try {
                    // Try to fetch as a storage path
                    const blob = await getBlob(ref(storage, src));
                    objectUrl = URL.createObjectURL(blob);
                    setResolvedUrl(objectUrl);
                } catch (error) {
                    console.error('Error loading image from storage:', src, error);
                    // If it fails, maybe it's already a URL that doesn't start with http (unlikely)
                    // or just show nothing/fallback
                    setResolvedUrl('');
                } finally {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src]);

    if (loading) {
        return <div className={`animate-pulse bg-slate-100 ${className}`} />;
    }

    if (!resolvedUrl) {
        if (FallbackIcon) {
            return (
                <div className={`flex items-center justify-center bg-slate-50 ${className}`}>
                    <FallbackIcon className="h-1/2 w-1/2 text-slate-300" />
                </div>
            );
        }
        return <div className={`bg-slate-50 ${className}`} />;
    }

    return (
        <img
            src={resolvedUrl}
            alt={alt}
            className={className}
            onError={(e) => {
                e.target.onerror = null;
                // You could set a default placeholder here
            }}
        />
    );
};

export default StorageImage;
