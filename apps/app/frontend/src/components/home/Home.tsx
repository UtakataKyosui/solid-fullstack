import type { Component } from 'solid-js';
import { createResource, createSignal, createMemo, Show, For } from 'solid-js';
import { useAuth } from '../../lib/auth';
import type { Genre, Location, Item } from '../../lib/types';
import { UnassignedItems, LocationCard, ManageGenresDialog } from './components/stubs';
import { SearchBar } from './components/SearchBar';
import { AddItemDialog } from './components/AddItemDialog';
import { AddLocationDialog } from './components/AddLocationDialog';

const Home: Component = () => {
    const { fetchWithAuth } = useAuth();

    // Filters
    const [searchQuery, setSearchQuery] = createSignal("");
    const [genreFilter, setGenreFilter] = createSignal("");
    const [locationFilter, setLocationFilter] = createSignal("");

    async function fetcher<T>(url: string): Promise<T[]> {
        const res = await fetchWithAuth(url);
        if (!res.ok) return [];
        return res.json();
    }

    const [genres] = createResource<Genre[]>(() => "/api/genres/", fetcher);
    const [locations, { refetch: refetchLocations }] = createResource<Location[]>(() => "/api/locations/", fetcher);
    const [items, { refetch: refetchItems }] = createResource<Item[]>(() => "/api/items/", fetcher);

    const filteredItems = createMemo(() => {
        const _items = items() || [];
        const q = searchQuery().toLowerCase();
        const g = genreFilter();
        const l = locationFilter();

        return _items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
            const matchesGenre = !g || item.genre_id.toString() === g;
            const matchesLocation = !l || (l === "unassigned" ? !item.location_id : item.location_id?.toString() === l);
            return matchesSearch && matchesGenre && matchesLocation;
        });
    });

    return (
        <div class="space-y-6">
            <header class="flex flex-col gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold">Inventory Management</h2>
                        <p class="text-slate-400 text-sm">
                            {(items() || []).length} items, {(locations() || []).length} locations
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <ManageGenresDialog />
                        <AddLocationDialog
                            genres={genres() || []}
                            onSuccess={refetchLocations}
                        />
                        <AddItemDialog
                            genres={genres() || []}
                            locations={locations() || []}
                            onSuccess={refetchItems}
                        />
                    </div>
                </div>
                <SearchBar
                    searchQuery={searchQuery()}
                    setSearchQuery={setSearchQuery}
                    genreFilter={genreFilter()}
                    setGenreFilter={setGenreFilter}
                    locationFilter={locationFilter()}
                    setLocationFilter={setLocationFilter}
                    genres={genres() || []}
                    locations={locations() || []}
                />
            </header>

            <main class="space-y-6">
                <UnassignedItems items={filteredItems().filter(i => !i.location_id)} />

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <For each={locations()}>
                        {(location) => {
                            const locationItems = filteredItems().filter(i => i.location_id === location.id);

                            if (locationItems.length === 0 && (searchQuery() || genreFilter() || locationFilter())) {
                                return null;
                            }
                            return (
                                <LocationCard
                                    location={location}
                                    items={locationItems}
                                />
                            );
                        }}
                    </For>
                </div>
            </main>
        </div>
    );
};

export default Home;
