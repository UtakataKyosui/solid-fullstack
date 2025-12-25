import type { Component } from 'solid-js';
import { createResource, createSignal, createMemo, Show, For } from 'solid-js';
import { useAuth } from '../../lib/auth';
import type { Genre, Location, Item } from '../../lib/types';
import { UnassignedItems, LocationCard, ManageGenresDialog } from './components/stubs';
import { SearchBar } from './components/SearchBar';
import { AddItemDialog } from './components/AddItemDialog';
import { AddLocationDialog } from './components/AddLocationDialog';
import { css } from 'styled-system/css';
import { Stack, Box, Flex, Grid } from 'styled-system/jsx';

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

    const [genres] = createResource<Genre[]>(() => fetcher<Genre>("/api/genres"));
    const [locations, { refetch: refetchLocations }] = createResource<Location[]>(() => fetcher<Location>("/api/locations"));
    const [items, { refetch: refetchItems }] = createResource<Item[]>(() => fetcher<Item>("/api/items"));

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
        <Stack gap={{ base: '4', sm: '6' }}>
            <Box
                as="header"
                p={{ base: '3', sm: '4' }}
                bg="bg.subtle"
                rounded="xl"
                borderWidth="1px"
                borderColor="border.default"
            >
                <Stack gap="4">
                    <Flex justify="space-between" align="center">
                        <Box>
                            <h2 class={css({ fontSize: { base: 'lg', sm: 'xl' }, fontWeight: 'bold' })}>
                                Inventory Management
                            </h2>
                            <p class={css({ color: 'fg.muted', fontSize: 'sm' })}>
                                {(items() || []).length} items, {(locations() || []).length} locations
                            </p>
                        </Box>
                        <ManageGenresDialog />
                    </Flex>

                    <SearchBar
                        searchQuery={searchQuery()}
                        onSearchChange={setSearchQuery}
                        genres={genres() || []}
                        locations={locations() || []}
                        selectedGenre={genreFilter()}
                        selectedLocation={locationFilter()}
                        onGenreChange={setGenreFilter}
                        onLocationChange={setLocationFilter}
                    />
                </Stack>
            </Box>

            <Grid columns={{ base: 1, md: 2 }} gap={{ base: '3', sm: '4' }}>
                <AddItemDialog
                    genres={genres() || []}
                    locations={locations() || []}
                    onSuccess={refetchItems}
                />
                <AddLocationDialog
                    genres={genres() || []}
                    onSuccess={refetchLocations}
                />
            </Grid>

            <Show when={locationFilter() === "unassigned"}>
                <UnassignedItems items={filteredItems()} onRefetch={refetchItems} />
            </Show>

            <Show when={locationFilter() !== "unassigned"}>
                <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: '3', sm: '4' }}>
                    <For each={locations()} fallback={
                        <Box color="fg.muted" fontSize="sm">
                            No locations found. Create one to get started.
                        </Box>
                    }>
                        {(loc) => (
                            <LocationCard
                                location={loc}
                                items={(items() || []).filter(item => item.location_id === loc.id)}
                                onRefetch={refetchItems}
                            />
                        )}
                    </For>
                </Grid>
            </Show>
        </Stack>
    );
};

export default Home;
