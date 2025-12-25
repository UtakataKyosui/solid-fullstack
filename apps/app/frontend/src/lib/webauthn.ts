// Utility functions for converting between Base64 and ArrayBuffer
// WebAuthn API expects ArrayBuffers, but the server sends Base64 strings

/**
 * Convert a Base64 URL-encoded string to an ArrayBuffer
 */
export function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
    // Add padding if needed
    const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray.buffer;
}

/**
 * Convert an ArrayBuffer to a Base64 URL-encoded string
 */
export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    const base64 = window.btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert server's PublicKeyCredentialCreationOptions to WebAuthn format
 * Converts Base64 strings to ArrayBuffers where needed
 */
export function convertCredentialCreationOptions(
    options: any
): PublicKeyCredentialCreationOptions {
    return {
        ...options,
        challenge: base64UrlToArrayBuffer(options.challenge),
        user: {
            ...options.user,
            id: base64UrlToArrayBuffer(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
            ...cred,
            id: base64UrlToArrayBuffer(cred.id),
        })),
    };
}

/**
 * Convert server's PublicKeyCredentialRequestOptions to WebAuthn format
 * Converts Base64 strings to ArrayBuffers where needed
 */
export function convertCredentialRequestOptions(
    options: any
): PublicKeyCredentialRequestOptions {
    return {
        ...options,
        challenge: base64UrlToArrayBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: base64UrlToArrayBuffer(cred.id),
        })),
    };
}
