import type { Component } from 'solid-js';
import { createResource, createSignal, Show, For } from 'solid-js';
import { useAuth } from '../lib/auth';
import type { Genre } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Plus } from 'lucide-solid';
import { addToast } from '@/components/ui/toast';
import { css } from 'styled-system/css';
import { Stack, Grid, Box, Flex } from 'styled-system/jsx';

const GenreList: Component = () => {
    const { fetchWithAuth } = useAuth();
    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [editingGenre, setEditingGenre] = createSignal<Genre | null>(null);
    const [formData, setFormData] = createSignal({ name: '', color: '#000000' });

    const [genres, { refetch }] = createResource<Genre[]>(async () => {
        const res = await fetchWithAuth('/api/genres/');
        if (!res.ok) return [];
        return res.json();
    });

    const openAddDialog = () => {
        setEditingGenre(null);
        setFormData({ name: '', color: '#000000' });
        setDialogOpen(true);
    };

    const openEditDialog = (genre: Genre) => {
        setEditingGenre(genre);
        setFormData({ name: genre.name, color: genre.color });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const data = formData();

        if (!data.name.trim()) {
            addToast('error', 'ジャンル名を入力してください');
            return;
        }

        try {
            if (editingGenre()) {
                const res = await fetchWithAuth(`/api/genres/${editingGenre()!.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', 'ジャンルの更新に失敗しました');
                    return;
                }

                addToast('success', 'ジャンルを更新しました');
            } else {
                const res = await fetchWithAuth('/api/genres/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', 'ジャンルの作成に失敗しました');
                    return;
                }

                addToast('success', 'ジャンルを作成しました');
            }

            setDialogOpen(false);
            refetch();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('このジャンルを削除しますか?')) return;

        try {
            const res = await fetchWithAuth(`/api/genres/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                addToast('error', 'ジャンルの削除に失敗しました');
                return;
            }

            addToast('success', 'ジャンルを削除しました');
            refetch();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    return (
        <Stack gap={{ base: '4', sm: '6' }}>
            <Flex justify="space-between" align="center" gap="2">
                <h2 class={css({ fontSize: { base: 'xl', sm: '2xl' }, fontWeight: 'bold' })}>
                    ジャンル管理
                </h2>
                <Button onClick={openAddDialog} size={{ base: 'sm', sm: 'md' }}>
                    <Plus size={18} />
                    <span class={css({ display: { base: 'none', sm: 'inline' } })}>新規</span>
                </Button>
            </Flex>

            <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: '3', sm: '4' }}>
                <For each={genres()} fallback={
                    <Box color="slate.400">ジャンルがありません</Box>
                }>
                    {(genre) => (
                        <Box
                            p={{ base: '3', sm: '4' }}
                            bg="slate.800"
                            rounded="lg"
                            borderWidth="1px"
                            borderColor="slate.700"
                            _hover={{ borderColor: 'slate.600' }}
                            transition="colors"
                        >
                            <Flex justify="space-between" mb="2">
                                <Flex align="center" gap={{ base: '2', sm: '3' }} minW="0" flex="1">
                                    <Box
                                        w={{ base: '5', sm: '6' }}
                                        h={{ base: '5', sm: '6' }}
                                        rounded="md"
                                        flexShrink="0"
                                        style={{ 'background-color': genre.color }}
                                    />
                                    <h3 class={css({
                                        fontWeight: 'semibold',
                                        fontSize: { base: 'base', sm: 'lg' },
                                        truncate: true
                                    })}>
                                        {genre.name}
                                    </h3>
                                </Flex>
                                <Flex gap={{ base: '1', sm: '2' }} flexShrink="0">
                                    <button
                                        onClick={() => openEditDialog(genre)}
                                        class={css({
                                            p: { base: '1.5', sm: '2' },
                                            color: 'slate.400',
                                            _hover: { color: 'blue.400', bg: 'slate.700' },
                                            rounded: 'md',
                                            transition: 'colors'
                                        })}
                                        title="編集"
                                    >
                                        <Edit2 size={14} class={css({ sm: { w: '4', h: '4' } })} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(genre.id)}
                                        class={css({
                                            p: { base: '1.5', sm: '2' },
                                            color: 'slate.400',
                                            _hover: { color: 'red.400', bg: 'slate.700' },
                                            rounded: 'md',
                                            transition: 'colors'
                                        })}
                                        title="削除"
                                    >
                                        <Trash2 size={14} class={css({ sm: { w: '4', h: '4' } })} />
                                    </button>
                                </Flex>
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
                                {editingGenre() ? 'ジャンルを編集' : '新規ジャンル'}
                            </Dialog.Title>
                            <Dialog.Description>
                                ジャンル情報を入力してください
                            </Dialog.Description>

                            <form onSubmit={handleSubmit}>
                                <Stack gap="4">
                                    <Box>
                                        <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                            ジャンル名
                                        </label>
                                        <Input
                                            value={formData().name}
                                            onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                                            placeholder="例: SF"
                                            required
                                        />
                                    </Box>

                                    <Box>
                                        <label class={css({ display: 'block', mb: '2', fontSize: 'sm', fontWeight: 'medium' })}>
                                            カラー
                                        </label>
                                        <input
                                            type="color"
                                            value={formData().color}
                                            onInput={(e) => setFormData({ ...formData(), color: e.currentTarget.value })}
                                            class={css({ w: 'full', h: '10', rounded: 'md', cursor: 'pointer' })}
                                        />
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
                                            {editingGenre() ? '更新' : '作成'}
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

export default GenreList;
