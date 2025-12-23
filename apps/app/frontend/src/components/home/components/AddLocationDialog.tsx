import { Component, createSignal, For } from 'solid-js';
import { useAuth } from '../../../lib/auth';
import type { Genre } from '../../../lib/types';
import { Dialog } from '../../ui/Dialog';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

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
            <Dialog isOpen={isOpen()} onClose={() => setIsOpen(false)} title="Add New Location">
                <form onSubmit={handleSubmit} class="space-y-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-300">Name</label>
                        <Input
                            value={name()}
                            onInput={(e) => setName(e.currentTarget.value)}
                            required
                            placeholder="Location name"
                        />
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-300">Description</label>
                        <Input
                            value={description()}
                            onInput={(e) => setDescription(e.currentTarget.value)}
                            placeholder="Optional description"
                        />
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-300">Genre</label>
                        <select
                            class="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white"
                            value={genreId()}
                            onChange={(e) => setGenreId(e.currentTarget.value)}
                            required
                        >
                            <option value="" disabled>Select a genre</option>
                            <For each={props.genres}>
                                {(genre) => <option value={genre.id}>{genre.name}</option>}
                            </For>
                        </select>
                    </div>

                    <div class="flex justify-end pt-4">
                        <Button type="submit" disabled={loading()}>
                            {loading() ? "Creating..." : "Create Location"}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    );
};
