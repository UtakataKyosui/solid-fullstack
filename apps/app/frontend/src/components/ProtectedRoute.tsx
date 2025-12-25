import { type Component, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { useAuth } from '../lib/auth';
import type { RouteSectionProps } from '@solidjs/router';

const ProtectedRoute: Component<RouteSectionProps> = (props) => {
    const { user } = useAuth();

    return (
        <Show when={user()} fallback={<Navigate href="/login" />}>
            {props.children}
        </Show>
    );
};

export default ProtectedRoute;
