// Passkey関連の型定義
// webauthn-rsの型は複雑なため、手動で定義

export interface RegisterStartResponse {
    challenge: {
        publicKey: PublicKeyCredentialCreationOptions;
    };
    state: string;
}

export interface LoginStartResponse {
    challenge: {
        publicKey: PublicKeyCredentialRequestOptions;
    };
    state: string;
}

// WebAuthn API標準型の拡張
// これらはブラウザのグローバル型として既に定義されているが、
// 明示的に再エクスポートして使いやすくする
// export type {
//     PublicKeyCredentialCreationOptions,
//     PublicKeyCredentialRequestOptions,
//     PublicKeyCredential,
//     AuthenticatorAttestationResponse,
//     AuthenticatorAssertionResponse,
// } from 'typescript';
