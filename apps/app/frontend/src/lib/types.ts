export type Genre = {
    id: number;
    name: string;
    color: string;
    user_id: number;
    created_at: string;
    updated_at: string;
};

export type Location = {
    id: number;
    name: string;
    description?: string;
    genre_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
};

export type Item = {
    id: number;
    name: string;
    description?: string;
    genre_id: number;
    location_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
};

export type Passkey = {
    id: number;
    name: string;
    created_at: string;
    last_used_at: string;
};
