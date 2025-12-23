import type { Component } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { useAuth } from '../../../lib/auth';
import type { Genre } from '../../../lib/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { css } from 'styled-system/css';
import { Stack, Box } from 'styled-system/jsx';

interface AddLocationDialogProps {
    genres: Genre[];
    onSuccess: () => void;
}

export const AddLocationDialog: Component<AddLocationDialogProps> = (props) => {
    const { fetchWithAuth } = useAuth();
    const [isOpen, setIsOpen] = createSignal(false);
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [genreId, setGenreId] = createSignal("");
    const [loading, setLoading] = createSignal(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!name() || !genreId()) return;

        setLoading(true);
        try {
            const payload = {
                name: name(),
                description: description(),
                genre_id: parseInt(genreId()),
            };

            const res = await fetchWithAuth("/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                props.onSuccess();
                setIsOpen(false);
                // Reset form
                setName("");
                setDescription("");
                setGenreId("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Location</Button>
            <Dialog.Root
                open={isOpen()}
                onOpenChange={(e) => setIsOpen(e.open)}
                closeOnInteractOutside={true}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Stack gap="4" p="6">
                            <Dialog.Title>Add New Location</Dialog.Title>
                            <Dialog.Description>
                                Create a new location for organizing your items
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
                                            placeholder="Location name"
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

                                    <Box class={css({ display: 'flex', justifyContent: 'flex-end', pt: '4' })}>
                                        <Button type="submit" loading={loading()}>
                                            {loading() ? "Creating..." : "Create Location"}
                                        </Button>
                                    </Box>
                                </Stack>
                            </form>

                            <button
                                onClick={() => setIsOpen(false)}
                                class={css({
                                    position: 'absolute',
                                    top: '4',
                                    right: '4',
                                    p: '2',
                                    color: 'slate.400',
                                    _hover: { color: 'white', bg: 'slate.800' },
                                    rounded: 'md',
                                    transition: 'colors',
                                    cursor: 'pointer'
                                })}
                                aria-label="Close dialog"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </button>
                        </Stack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};
