import type { Component } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { useAuth } from '../../../lib/auth';
import type { Genre, Location } from '../../../lib/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { css } from 'styled-system/css';
import { Stack, Box } from 'styled-system/jsx';

interface AddItemDialogProps {
    genres: Genre[];
    locations: Location[];
    onSuccess: () => void;
}

export const AddItemDialog: Component<AddItemDialogProps> = (props) => {
    const { fetchWithAuth } = useAuth();
    const [isOpen, setIsOpen] = createSignal(false);
    const [loading, setLoading] = createSignal(false);

    const [name, setName] = createSignal('');
    const [description, setDescription] = createSignal('');
    const [genreId, setGenreId] = createSignal('');
    const [locationId, setLocationId] = createSignal('unassigned');

    const resetForm = () => {
        setName('');
        setDescription('');
        setGenreId('');
        setLocationId('unassigned');
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!name() || !genreId()) return;

        setLoading(true);
        try {
            const body = {
                name: name(),
                description: description() || null,
                genre_id: parseInt(genreId()),
                location_id: locationId() === 'unassigned' ? null : parseInt(locationId())
            };

            const res = await fetchWithAuth('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                resetForm();
                setIsOpen(false);
                props.onSuccess();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Item</Button>
            <Dialog.Root
                open={isOpen()}
                onOpenChange={(e) => setIsOpen(e.open)}
                closeOnInteractOutside={true}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Title>Add New Item</Dialog.Title>
                        <Dialog.Description>
                            Create a new item to track in your inventory
                        </Dialog.Description>

                        <form onSubmit={handleSubmit}>
                            <Stack gap="4">
                                <Box>
                                    <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                        Name
                                    </label>
                                    <Input
                                        value={name()}
                                        onInput={(e) => setName(e.currentTarget.value)}
                                        required
                                        placeholder="Item name"
                                    />
                                </Box>

                                <Box>
                                    <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                        Description
                                    </label>
                                    <Input
                                        value={description()}
                                        onInput={(e) => setDescription(e.currentTarget.value)}
                                        placeholder="Optional description"
                                    />
                                </Box>

                                <Box>
                                    <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                        Genre
                                    </label>
                                    <select
                                        class={css({
                                            w: 'full',
                                            h: '10',
                                            px: '3',
                                            rounded: 'md',
                                            bg: 'slate.950',
                                            borderWidth: '1px',
                                            borderColor: 'slate.800',
                                            fontSize: 'sm',
                                            color: 'white',
                                            _focus: { outlineColor: 'blue.500' }
                                        })}
                                        value={genreId()}
                                        onChange={(e) => setGenreId(e.currentTarget.value)}
                                        required
                                    >
                                        <option value="" disabled>Select a genre</option>
                                        <For each={props.genres}>
                                            {(genre) => <option value={genre.id}>{genre.name}</option>}
                                        </For>
                                    </select>
                                </Box>

                                <Box>
                                    <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                        Initial Location
                                    </label>
                                    <select
                                        class={css({
                                            w: 'full',
                                            h: '10',
                                            px: '3',
                                            rounded: 'md',
                                            bg: 'slate.950',
                                            borderWidth: '1px',
                                            borderColor: 'slate.800',
                                            fontSize: 'sm',
                                            color: 'white',
                                            _focus: { outlineColor: 'blue.500' }
                                        })}
                                        value={locationId()}
                                        onChange={(e) => setLocationId(e.currentTarget.value)}
                                    >
                                        <option value="unassigned">Unassigned</option>
                                        <For each={props.locations}>
                                            {(location) => <option value={location.id}>{location.name}</option>}
                                        </For>
                                    </select>
                                </Box>

                                <Box class={css({ display: 'flex', justifyContent: 'flex-end', gap: '2', pt: '4' })}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" loading={loading()}>
                                        {loading() ? "Creating..." : "Create Item"}
                                    </Button>
                                </Box>
                            </Stack>
                        </form>

                        <Dialog.CloseTrigger />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};
