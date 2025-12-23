import { Component, createSignal, For } from 'solid-js';
import { useAuth } from '../../../lib/auth';
import type { Genre, Location } from '../../../lib/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddItemDialogProps {
    genres: Genre[];
    locations: Location[];
    onSuccess: () => void;
}

export const AddItemDialog: Component<AddItemDialogProps> = (props) => {
    const { fetchWithAuth } = useAuth();
    const [isOpen, setIsOpen] = createSignal(false);
    const [name, setName] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [genreId, setGenreId] = createSignal("");
    const [locationId, setLocationId] = createSignal("");
    const [loading, setLoading] = createSignal(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!name() || !genreId()) return;

        setLoading(true);
        try {
            const payload: any = {
                name: name(),
                description: description(),
                genre_id: parseInt(genreId()),
            };

            if (locationId() && locationId() !== "unassigned") {
                payload.location_id = parseInt(locationId());
            }

            const res = await fetchWithAuth("/api/items", {
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
                setLocationId("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Add Item</Button>
            <Dialog isOpen={isOpen()} onClose={() => setIsOpen(false)} title="Add New Item">
                <form onSubmit={handleSubmit} class="space-y-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-300">Name</label>
                        <Input
                            value={name()}
                            onInput={(e) => setName(e.currentTarget.value)}
                            required
                            placeholder="Item name"
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

                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-300">Initial Location</label>
                        <select
                            class="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white"
                            value={locationId()}
                            onChange={(e) => setLocationId(e.currentTarget.value)}
                        >
                            <option value="unassigned">Unassigned</option>
                            <For each={props.locations}>
                                {(location) => <option value={location.id}>{location.name}</option>}
                            </For>
                        </select>
                    </div>

                    <div class="flex justify-end pt-4">
                        <Button type="submit" disabled={loading()}>
                            {loading() ? "Creating..." : "Create Item"}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    );
};
