import type { Component } from 'solid-js';
import { createResource, createSignal, Show, For } from 'solid-js';
import { useAuth } from '../lib/auth';
import type { Location, Genre } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Plus } from 'lucide-solid';
import { addToast } from '@/components/ui/toast';
import { css } from 'styled-system/css';
import { Stack, Grid, Box, Flex } from 'styled-system/jsx';

const LocationList: Component = () => {
    const { fetchWithAuth } = useAuth();
    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [editingLocation, setEditingLocation] = createSignal<Location | null>(null);
    const [formData, setFormData] = createSignal({ name: '', description: '', genre_id: 0 });

    const [locations, { refetch: refetchLocations }] = createResource<Location[]>(async () => {
        const res = await fetchWithAuth('/api/locations');
        if (!res.ok) return [];
        return res.json();
    });

    const [genres] = createResource<Genre[]>(async () => {
        const res = await fetchWithAuth('/api/genres');
        if (!res.ok) return [];
        return res.json();
    });

    const openAddDialog = () => {
        setEditingLocation(null);
        setFormData({ name: '', description: '', genre_id: 0 });
        setDialogOpen(true);
    };

    const openEditDialog = (location: Location) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            description: location.description || '',
            genre_id: location.genre_id
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const data = formData();

        if (!data.name.trim()) {
            addToast('error', '場所名を入力してください');
            return;
        }

        if (!data.genre_id) {
            addToast('error', 'ジャンルを選択してください');
            return;
        }

        try {
            if (editingLocation()) {
                const res = await fetchWithAuth(`/api/locations/${editingLocation()!.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', '場所の更新に失敗しました');
                    return;
                }

                addToast('success', '場所を更新しました');
            } else {
                const res = await fetchWithAuth('/api/locations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', '場所の作成に失敗しました');
                    return;
                }

                addToast('success', '場所を作成しました');
            }

            setDialogOpen(false);
            refetchLocations();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('この場所を削除しますか?')) return;

        try {
            const res = await fetchWithAuth(`/api/locations/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                addToast('error', '場所の削除に失敗しました');
                return;
            }

            addToast('success', '場所を削除しました');
            refetchLocations();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    const getGenreName = (genre_id: number) => {
        const genre = genres()?.find(g => g.id === genre_id);
        return genre?.name || 'Unknown';
    };

    const getGenreColor = (genre_id: number) => {
        const genre = genres()?.find(g => g.id === genre_id);
        return genre?.color || '#gray';
    };

    return (
        <Stack gap={{ base: '4', sm: '6' }}>
            <Flex justify="space-between" align="center" gap="2">
                <h2 class={css({ fontSize: { base: 'xl', sm: '2xl' }, fontWeight: 'bold' })}>
                    場所管理
                </h2>
                <Button onClick={openAddDialog} size={{ base: 'sm', sm: 'md' }}>
                    <Plus size={18} />
                    <span class={css({ display: { base: 'none', sm: 'inline' } })}>新規</span>
                </Button>
            </Flex>

            <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: '3', sm: '4' }}>
                <For each={locations()} fallback={
                    <Box color="fg.muted">場所がありません</Box>
                }>
                    {(location) => (
                        <Box
                            p={{ base: '3', sm: '4' }}
                            bg="bg.subtle"
                            rounded="xl"
                            borderWidth="1px"
                            borderColor="border.default"
                            _hover={{ borderColor: 'border.muted' }}
                            transition="colors"
                        >
                            <Flex justify="space-between" mb="2" gap="2">
                                <h3 class={css({
                                    fontWeight: 'semibold',
                                    fontSize: { base: 'base', sm: 'lg' },
                                    color: 'fg.default',
                                    truncate: true,
                                    flex: '1'
                                })}>
                                    {location.name}
                                </h3>
                                <Flex gap={{ base: '1', sm: '2' }} flexShrink="0">
                                    <button
                                        onClick={() => openEditDialog(location)}
                                        class={css({
                                            p: { base: '1.5', sm: '2' },
                                            color: 'fg.muted',
                                            _hover: { color: 'blue.400', bg: 'bg.subtle' },
                                            rounded: 'md',
                                            transition: 'colors'
                                        })}
                                        title="編集"
                                    >
                                        <Edit2 size={14} class={css({ sm: { w: '4', h: '4' } })} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location.id)}
                                        class={css({
                                            p: { base: '1.5', sm: '2' },
                                            color: 'fg.muted',
                                            _hover: { color: 'red.400', bg: 'bg.subtle' },
                                            rounded: 'md',
                                            transition: 'colors'
                                        })}
                                        title="削除"
                                    >
                                        <Trash2 size={14} class={css({ sm: { w: '4', h: '4' } })} />
                                    </button>
                                </Flex>
                            </Flex>

                            <Show when={location.description}>
                                <p class={css({ fontSize: 'sm', color: 'fg.muted', mb: '2' })}>
                                    {location.description}
                                </p>
                            </Show>

                            <Flex align="center" gap="2">
                                <Box
                                    w="3"
                                    h="3"
                                    rounded="full"
                                    style={{ 'background-color': getGenreColor(location.genre_id) }}
                                />
                                <span class={css({ fontSize: 'xs', color: 'fg.muted' })}>
                                    {getGenreName(location.genre_id)}
                                </span>
                            </Flex>
                        </Box>
                    )}
                </For>
            </Grid>

            <Dialog.Root open={dialogOpen()} onOpenChange={(e) => setDialogOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Stack gap="4" p="6">
                            <Dialog.Title>
                                {editingLocation() ? '場所を編集' : '新規場所'}
                            </Dialog.Title>
                            <Dialog.Description>
                                場所情報を入力してください
                            </Dialog.Description>

                            <form onSubmit={handleSubmit}>
                                <Stack gap="4">
                                    <Box>
                                        <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                            場所名
                                        </label>
                                        <Input
                                            value={formData().name}
                                            onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                                            placeholder="例: 本棚A"
                                            required
                                        />
                                    </Box>

                                    <Box>
                                        <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                            説明
                                        </label>
                                        <Input
                                            value={formData().description}
                                            onInput={(e) => setFormData({ ...formData(), description: e.currentTarget.value })}
                                            placeholder="例: リビングの棚"
                                        />
                                    </Box>

                                    <Box>
                                        <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                            ジャンル
                                        </label>
                                        <select
                                            value={formData().genre_id}
                                            onChange={(e) => setFormData({ ...formData(), genre_id: parseInt(e.currentTarget.value) })}
                                            class={css({
                                                w: 'full',
                                                p: '2',
                                                bg: 'bg.default',
                                                border: '1px solid',
                                                borderColor: 'border.default',
                                                rounded: 'md',
                                                color: 'fg.default',
                                                _focus: { outlineColor: 'blue.500' }
                                            })}
                                            required
                                        >
                                            <option value="">選択してください</option>
                                            <For each={genres()}>
                                                {(genre) => (
                                                    <option value={genre.id}>{genre.name}</option>
                                                )}
                                            </For>
                                        </select>
                                    </Box>

                                    <Flex gap="3" justify="flex-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setDialogOpen(false)}
                                        >
                                            キャンセル
                                        </Button>
                                        <Button type="submit">
                                            {editingLocation() ? '更新' : '作成'}
                                        </Button>
                                    </Flex>
                                </Stack>
                            </form>

                            <Dialog.CloseTrigger />
                        </Stack>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Stack>
    );
};

export default LocationList;
